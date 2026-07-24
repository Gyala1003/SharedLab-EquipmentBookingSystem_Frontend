import { Component, inject, signal } from '@angular/core'
import { firstValueFrom } from 'rxjs'
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'
import { RouterLink } from '@angular/router'
import { TranslatePipe } from '@ngx-translate/core'
import { AuthService } from '../../core/auth/auth.service'
import { ApiError } from '../../core/http/api-error'
import { LogoComponent } from '../../shared/ui/logo/logo.component'

type ForgotErrorKind = 'tooManyRequests' | 'generic' | null

@Component({
  selector: 'app-forgot-password-page',
  imports: [ReactiveFormsModule, RouterLink, TranslatePipe, LogoComponent],
  templateUrl: './forgot-password.page.html',
})
export class ForgotPasswordPage {
  private readonly fb = inject(FormBuilder)
  private readonly authService = inject(AuthService)

  protected readonly status = signal<'idle' | 'loading' | 'success'>('idle')
  protected readonly errorKind = signal<ForgotErrorKind>(null)

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
  })

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched()
      return
    }

    this.status.set('loading')
    this.errorKind.set(null)

    const email = this.form.controls.email.value
    const resetLink = `${window.location.origin}/auth/reset-password`;

    try {
      await firstValueFrom(this.authService.forgotPassword(email, resetLink));
      this.status.set('success')
    } catch (e) {
      this.status.set('idle')
      this.errorKind.set(e instanceof ApiError && e.status === 429 ? 'tooManyRequests' : 'generic')
    }
  }
}