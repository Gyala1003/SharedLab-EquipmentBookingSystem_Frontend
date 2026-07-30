import { Component, inject, signal } from '@angular/core'
import { Router, RouterLink } from '@angular/router'
import { AuthService } from '../../core/auth/auth.service'
import { AuthStore } from '../../core/auth/auth.store'
import { IconComponent } from '../../shared/ui/icon'
import { ToastService } from '../../shared/ui/toast.service'

@Component({
  selector: 'app-request-password-reset-page',
  imports: [RouterLink, IconComponent],
  template: `
    <section class="mx-auto max-w-3xl space-y-6">
      <a routerLink="/app/profile" class="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-indigo-600">
        <app-icon name="arrow-left" [size]="18" /> Quay lại Hồ sơ cá nhân
      </a>

      <article class="card-surface overflow-hidden">
        <div class="bg-gradient-to-r from-[#111a3a] via-indigo-950 to-violet-900 px-6 py-8 text-white sm:px-9">
          <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-cyan-300">
            <app-icon name="shield" [size]="28" />
          </div>
          <h1 class="mt-5 text-3xl font-bold tracking-[-0.035em]">Reset password</h1>
          <p class="mt-3 max-w-xl text-sm leading-6 text-white/65">
            Gửi yêu cầu nhận liên kết đặt lại mật khẩu an toàn đến email đăng ký tài khoản của bạn.
          </p>
        </div>

        <div class="p-6 sm:p-9">
          <div class="mb-6 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4 flex items-start gap-3">
            <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <app-icon name="mail" [size]="18" />
            </span>
            <div class="text-xs text-indigo-950">
              <p class="font-bold">Email nhận liên kết xác thực</p>
              <p class="mt-0.5 text-indigo-700/80">Liên kết tạo mật khẩu mới sẽ được gửi trực tiếp về địa chỉ email tài khoản của bạn: <strong class="font-bold text-indigo-950">{{ email() }}</strong></p>
            </div>
          </div>

          <form class="space-y-5" (submit)="sendResetEmail($event)">
            <div>
              <label class="field-label">Địa chỉ Email xác nhận *</label>
              <input class="input-shell bg-slate-50 text-slate-700 font-semibold" type="email" [value]="email()" readonly />
            </div>

            @if (sentSuccess()) {
              <div class="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 flex items-center gap-3">
                <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                  <app-icon name="check" [size]="16" />
                </span>
                <div>
                  <p class="font-bold text-sm">Đã gửi email thành công!</p>
                  <p class="mt-0.5">Vui lòng kiểm tra hộp thư (bao gồm cả thư rác/spam) của {{ email() }} để tạo mật khẩu mới.</p>
                </div>
              </div>
            }

            <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <a routerLink="/app/profile" class="btn-secondary">Hủy bỏ</a>
              <button type="submit" class="btn-primary" [disabled]="loading() || sentSuccess()">
                <app-icon name="send" [size]="16" />
                {{ loading() ? 'Đang gửi...' : 'Gửi liên kết đặt lại mật khẩu' }}
              </button>
            </div>
          </form>
        </div>
      </article>

      <p class="text-center text-xs leading-5 text-slate-400">
        Nếu bạn không còn truy cập được email này hoặc gặp sự cố, vui lòng liên hệ Quản trị viên hệ thống để được hỗ trợ cấp lại mật khẩu thủ công.
      </p>
    </section>
  `,
})
export class RequestPasswordResetPage {
  private readonly store = inject(AuthStore)
  private readonly authService = inject(AuthService)
  private readonly toast = inject(ToastService)
  private readonly router = inject(Router)

  protected readonly loading = signal(false)
  protected readonly sentSuccess = signal(false)
  protected readonly email = signal(this.store.user()?.email ?? '')

  protected sendResetEmail(event: Event): void {
    event.preventDefault()
    const userEmail = this.email()
    if (!userEmail) {
      this.toast.error('Không tìm thấy thông tin email tài khoản.')
      return
    }

    this.loading.set(true)
    const resetLink = `${window.location.origin}/reset-password`
    this.authService.forgotPassword(userEmail, resetLink).subscribe({
      next: () => {
        this.loading.set(false)
        this.sentSuccess.set(true)
        this.toast.success('Đã gửi email đặt lại mật khẩu', `Vui lòng kiểm tra hộp thư (${userEmail}) để nhận liên kết tạo mật khẩu mới.`)
      },
      error: (err: any) => {
        this.loading.set(false)
        const msg = err?.error?.message || err?.message || 'Không thể gửi yêu cầu đặt lại mật khẩu.'
        this.toast.error('Thao tác thất bại', msg)
      },
    })
  }
}
