import { Component, ElementRef, ViewChild, inject, signal } from '@angular/core'
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'
import { Router, RouterLink } from '@angular/router'
import { TranslatePipe } from '@ngx-translate/core'
import { AuthStore } from '../../core/auth/auth.store'
import { ApiError } from '../../core/http/api-error'

type LoginErrorKind = 'invalidCredentials' | 'serverError' | null

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule, RouterLink, TranslatePipe],
  templateUrl: './login.page.html',
})
export class LoginPage {
  protected readonly store = inject(AuthStore)
  private readonly fb = inject(FormBuilder)
  private readonly router = inject(Router)

  @ViewChild('passwordInput') private readonly passwordInput?: ElementRef<HTMLInputElement>

  protected readonly showPassword = signal(false)
  protected readonly rememberMe = signal(false)
  protected readonly errorKind = signal<LoginErrorKind>(null)
  protected readonly showSuccess = signal(false)

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  })

  togglePasswordVisibility(): void {
    this.showPassword.update((value) => !value)
  }

  toggleRememberMe(): void {
    this.rememberMe.update((value) => !value)
  }

  protected emailErrorKey(): string | null {
    const control = this.form.controls.email
    if (!control.touched || control.valid) return null
    if (control.hasError('required')) return 'auth.validation.emailRequired'
    if (control.hasError('email') || control.hasError('maxlength')) return 'auth.validation.emailInvalid'
    return null
  }

  protected passwordErrorKey(): string | null {
    const control = this.form.controls.password
    if (!control.touched || control.valid) return null
    if (control.hasError('required')) return 'auth.validation.passwordRequired'
    if (control.hasError('minlength')) return 'auth.validation.passwordMinLength'
    return null
  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched()
      return
    }

    this.errorKind.set(null)
    this.showSuccess.set(false)

    try {
      await this.store.login(this.form.getRawValue())
      this.showSuccess.set(true)
      setTimeout(() => {
        void this.router.navigateByUrl('/dashboard')
      }, 1000)
    } catch (e) {
      if (e instanceof ApiError && (e.status === 401 || e.status === 400)) {
        this.errorKind.set('invalidCredentials')
      } else {
        this.errorKind.set('serverError')
      }
      this.form.controls.password.reset('')
      queueMicrotask(() => this.passwordInput?.nativeElement.focus())
    }
  }
}