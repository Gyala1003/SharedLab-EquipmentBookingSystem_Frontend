import { Component, inject } from '@angular/core'
import { Location } from '@angular/common'
import { Router } from '@angular/router'
import { catchError, EMPTY } from 'rxjs'
import { AuthStore } from '../../core/auth/auth.store'
import { landingPath } from '../../core/auth/auth.guard'
import { ErrorStateService } from '../../core/http/error-state.service'
import { SystemService } from '../../core/api/system.service'
import { ToastService } from '../../shared/ui/toast.service'
import { IconComponent } from '../../shared/ui/icon'

@Component({
  selector: 'app-forbidden-page',
  imports: [IconComponent],
  template: `
    <main class="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f5f7fb] p-5 text-center">
      <div class="absolute left-[10%] top-[15%] h-72 w-72 rounded-full bg-violet-200/60 blur-3xl"></div>
      <div class="absolute bottom-[12%] right-[10%] h-80 w-80 rounded-full bg-cyan-200/60 blur-3xl"></div>
      <section class="relative w-full max-w-2xl rounded-[36px] border border-white bg-white/90 p-8 shadow-2xl shadow-slate-900/10 backdrop-blur-xl sm:p-14">
        <div class="mx-auto flex h-24 w-24 items-center justify-center rounded-[30px] bg-gradient-to-br from-amber-100 to-orange-100 text-amber-600 shadow-inner">
          <app-icon name="shield" [size]="44" />
        </div>
        <p class="mt-8 text-sm font-bold uppercase tracking-[0.22em] text-amber-600">
          Lỗi {{ err()?.status || 403 }} - Truy cập bị từ chối
        </p>
        <h1 class="mt-3 text-3xl font-bold tracking-[-0.04em] text-slate-950 sm:text-4xl">
          Không có quyền truy cập
        </h1>

        <!-- Backend Error Note -->
        <div class="mt-6 rounded-2xl border border-amber-200 bg-amber-50/80 p-5 text-left text-xs leading-6 text-amber-900">
          <p class="font-extrabold uppercase tracking-wider text-amber-800 flex items-center gap-1.5 mb-1">
            <app-icon name="alert" [size]="16" class="text-amber-600" />
            Ghi chú ngoại lệ chi tiết từ Backend (BE):
          </p>
          <p class="mt-1 text-sm font-bold text-amber-950 whitespace-pre-line bg-amber-100/60 p-2.5 rounded-lg border border-amber-200/60 font-mono text-xs">
            {{ err()?.message || 'Trang này hoặc thao tác này chỉ dành cho một số vai trò nhất định. Bạn không có quyền xem booking này.' }}
          </p>
          @if (err()?.url) {
            <div class="mt-3 border-t border-amber-200/60 pt-2 text-[11px] font-mono text-amber-800/90 break-all">
              <span class="font-sans font-semibold text-amber-900">Endpoint API:</span> {{ err()?.url }}
            </div>
          }
        </div>

        <p class="mx-auto mt-5 max-w-lg text-xs leading-6 text-slate-500">
          Nhấn nút <strong>"Gửi báo lỗi về BE"</strong> để cập nhật dữ liệu phản hồi, hoặc nhấn <strong>"Quay lại trang trước"</strong> để tiếp tục sử dụng ứng dụng bình thường.
        </p>

        <div class="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button type="button" class="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 text-sm font-bold text-white shadow-lg shadow-indigo-900/15 hover:bg-indigo-700 transition" (click)="sendReport()">
            <app-icon name="send" [size]="18" />
            Gửi báo lỗi về BE (Data)
          </button>
          <button type="button" class="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 text-sm font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition" (click)="goBack()">
            <app-icon name="arrow-left" [size]="18" />
            Quay lại trang trước
          </button>
        </div>
      </section>
    </main>
  `,
})
export class ForbiddenPage {
  private readonly router = inject(Router)
  private readonly location = inject(Location)
  private readonly store = inject(AuthStore)
  private readonly errorState = inject(ErrorStateService)
  private readonly systemApi = inject(SystemService)
  private readonly toast = inject(ToastService)

  protected readonly err = this.errorState.currentError

  protected goHome(): void {
    this.errorState.clearError()
    void this.router.navigateByUrl(this.store.isAuthenticated() ? landingPath(this.store.role()) : '/login')
  }

  protected sendReport(): void {
    const user = this.store.user()
    if (!user?.userId) return
    if (this.store.isAdmin()) {
      this.systemApi
        .sendNotification({
          userId: user.userId,
          title: 'Báo cáo ngoại lệ BE (Data)',
          message: `[Báo lỗi Data] Người dùng ${user.fullName || user.username} báo cáo ngoại lệ tại endpoint: ${this.err()?.url || 'N/A'}. Nội dung: ${this.err()?.message || ''}`,
          notificationType: 1,
        })
        .pipe(catchError(() => EMPTY))
        .subscribe()
    }
    this.toast.success('Đã nhận phản hồi báo lỗi!')
  }

  protected goBack(): void {
    const user = this.store.user()
    if (user?.userId && this.store.isAdmin()) {
      this.systemApi
        .sendNotification({
          userId: user.userId,
          title: 'Xác nhận phản hồi Lỗi 403',
          message: `Người dùng ${user.fullName || user.username} đã quay lại trang sau khi nhận thông báo từ chối truy cập 403 (${this.err()?.url || 'API/Page'}).`,
          notificationType: 1,
        })
        .pipe(catchError(() => EMPTY))
        .subscribe()
    }

    this.errorState.clearError()
    if (history.length > 1) {
      this.location.back()
    } else {
      this.goHome()
    }
  }
}
