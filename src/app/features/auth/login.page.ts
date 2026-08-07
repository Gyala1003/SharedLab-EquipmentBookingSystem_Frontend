import { Component, ElementRef, ViewChild, inject, signal } from '@angular/core'
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'
import { ActivatedRoute, Router, RouterLink } from '@angular/router'
import { AuthStore } from '../../core/auth/auth.store'
import type { LoginPayload } from '../../core/auth/auth.types'
import { landingPath } from '../../core/auth/auth.guard'
import { ApiError } from '../../core/http/api-error'
import { TranslatePipe } from '../../core/i18n/translate.pipe'

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
  private readonly route = inject(ActivatedRoute)

  @ViewChild('passwordInput') private readonly passwordInput?: ElementRef<HTMLInputElement>

  protected readonly showPassword = signal(false)
  protected readonly rememberMe = signal(false)
  protected readonly errorKind = signal<LoginErrorKind>(null)
  protected readonly showSuccess = signal(false)
  protected readonly submitCooldownUntil = signal<number | null>(null)

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.maxLength(100)]],
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
    if (control.hasError('required')) return 'auth.validation.identifierRequired'
    if (control.hasError('maxlength')) return 'auth.validation.identifierInvalid'
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
    // Prevent duplicate/parallel submits from the client side
    if (this.store.status() === 'loading') return

    const cooldown = this.submitCooldownUntil()
    if (cooldown && Date.now() < cooldown) return

    if (this.form.invalid) {
      this.form.markAllAsTouched()
      return
    }

    this.errorKind.set(null)
    this.showSuccess.set(false)

    const identifier = this.form.controls.email.getRawValue().trim()
    const isEmail = identifier.includes('@')
    const payload: LoginPayload = {
      // Send only the relevant field so BE contract is respected.
      // If identifier contains '@', treat as email; otherwise as username.
      email: isEmail ? identifier : undefined,
      username: !isEmail ? identifier : undefined,
      password: this.form.controls.password.getRawValue(),
    }

    let destination = '/'

    try {
      const user = await this.store.login(payload, this.rememberMe())
      this.showSuccess.set(true)

      const redirect = this.route.snapshot.queryParamMap.get('redirect')
      const role = user?.roleName ?? ''
      destination = this.normalizeRedirect(redirect, role)
    } catch (e) {
      // Nếu lỗi thật sự từ API Login, reset lại showSuccess
      this.showSuccess.set(false)

      // short cooldown to avoid rapid retry flooding the backend
      this.submitCooldownUntil.set(Date.now() + 3000)

      if (e instanceof ApiError && (e.status === 401 || e.status === 400)) {
        this.errorKind.set('invalidCredentials')
      } else {
        this.errorKind.set('serverError')
      }
      this.form.controls.password.reset('')
      queueMicrotask(() => this.passwordInput?.nativeElement.focus())
      return
    }

    // Chuyển hướng ngay khi đã login thành công.
    const success = await this.router.navigateByUrl(destination, { replaceUrl: true })
    const currentUrl = this.router.url

    if (!success || currentUrl !== destination) {
      window.location.href = destination
    }
  }

  private normalizeRedirect(redirect: string | null, role: string): string {
    const target = redirect?.trim() ?? ''
    if (
      !target ||
      target === '/' ||
      target === '/app/home' ||
      target === '/login' ||
      target === '/app/login'
    ) {
      return landingPath(role)
    }
    // Chỉ chấp nhận path nội bộ bắt đầu bằng /app/ — chặn open redirect dạng //domain.com
    if (/^\/[^/\\]/.test(target) && target.startsWith('/app/')) {
      return target
    }
    return landingPath(role)
  }
}
