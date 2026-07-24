import { Component, computed, inject, signal } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { firstValueFrom } from 'rxjs'
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'
import { ActivatedRoute, Router, RouterLink } from '@angular/router'
import { TranslatePipe } from '@ngx-translate/core'
import { AuthService } from '../../core/auth/auth.service'
import { ApiError } from '../../core/http/api-error'
import { LogoComponent } from '../../shared/ui/logo/logo.component'
import {
  createResetPasswordPolicy,
  passwordMatchValidator,
  type PasswordRuleKey,
} from '../../core/auth/fluent-password.validator'

type ResetErrorKind = 'invalidToken' | 'tooManyRequests' | 'generic' | null

@Component({
  selector: 'app-reset-password-page',
  imports: [ReactiveFormsModule, RouterLink, TranslatePipe, LogoComponent],
  templateUrl: './reset-password.page.html',
})
export class ResetPasswordPage {
  private readonly route = inject(ActivatedRoute)
  private readonly router = inject(Router)
  private readonly fb = inject(FormBuilder)
  private readonly authService = inject(AuthService)

  private readonly passwordPolicy = createResetPasswordPolicy()

  protected readonly token = this.route.snapshot.queryParamMap.get('token')
  protected readonly email = this.route.snapshot.queryParamMap.get('email')
  protected readonly linkInvalid = !this.token || !this.email

  protected readonly showNewPassword = signal(false)
  protected readonly showConfirmPassword = signal(false)
  protected readonly status = signal<'idle' | 'loading' | 'success'>('idle')
  protected readonly errorKind = signal<ResetErrorKind>(null)
  protected readonly errorDetail = signal<string | null>(null)

  protected readonly form = this.fb.nonNullable.group(
    {
      newPassword: ['', [Validators.required, this.passwordPolicy.toValidatorFn()]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: passwordMatchValidator('newPassword', 'confirmPassword') },
  )

  private readonly newPasswordValue = toSignal(this.form.controls.newPassword.valueChanges, {
    initialValue: '',
  })

  protected readonly checklist = computed<Record<PasswordRuleKey, boolean>>(() =>
    this.passwordPolicy.evaluate(this.newPasswordValue() ?? ''),
  )

  protected readonly ruleOrder: PasswordRuleKey[] = ['minLength', 'uppercase', 'lowercase', 'digit', 'special']

  toggleNewPassword(): void {
    this.showNewPassword.update((v) => !v)
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword.update((v) => !v)
  }

  async submit(): Promise<void> {
    if (this.form.invalid || !this.token || !this.email) {
      this.form.markAllAsTouched()
      return
    }

    this.status.set('loading')
    this.errorKind.set(null)
    this.errorDetail.set(null)

    try {
      await firstValueFrom(
        this.authService.resetPassword({
          email: this.email,
          token: this.token,
          newPassword: this.form.controls.newPassword.value,
        }),
      )
      this.status.set('success')
      setTimeout(() => {
        void this.router.navigateByUrl('/auth/login')
      }, 1000)
    } catch (e) {
      this.status.set('idle')
      if (e instanceof ApiError && e.status === 429) {
        this.errorKind.set('tooManyRequests')
      } else if (e instanceof ApiError && e.status === 400) {
        this.errorKind.set('invalidToken')
        this.errorDetail.set(e.message)
      } else {
        this.errorKind.set('generic')
        this.errorDetail.set(e instanceof Error ? e.message : null)
      }
    }
  }
}