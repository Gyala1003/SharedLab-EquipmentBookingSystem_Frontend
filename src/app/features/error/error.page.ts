import { DatePipe, Location } from '@angular/common'
import { Component, inject } from '@angular/core'
import { RouterLink } from '@angular/router'
import { catchError, EMPTY } from 'rxjs'
import { SystemService } from '../../core/api/system.service'
import { AuthStore } from '../../core/auth/auth.store'
import { ErrorStateService } from '../../core/http/error-state.service'
import { IconComponent } from '../../shared/ui/icon'

@Component({
  selector: 'app-error-page',
  standalone: true,
  imports: [RouterLink, IconComponent],
  template: `
    <section class="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div class="w-full max-w-xl rounded-[28px] border border-rose-200 bg-white p-6 shadow-2xl shadow-rose-950/5 sm:p-8">
        <!-- Icon & Status -->
        <div class="flex items-center gap-4 border-b border-slate-100 pb-5">
          <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 shadow-sm">
            <app-icon name="alert" [size]="28" />
          </div>
          <div>
            <span class="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-3 py-1 text-xs font-black text-rose-800">
              <span class="h-2 w-2 rounded-full bg-rose-500 animate-ping"></span>
              Error
            </span>
            <h1 class="mt-1 text-2xl font-black tracking-tight text-slate-950">Lỗi kết nối</h1>
          </div>
        </div>

        <!-- Main Error Body -->
        <div class="mt-6">
          <div class="rounded-2xl border border-rose-200/80 bg-gradient-to-br from-rose-50/80 to-amber-50/50 p-5">
            <p class="text-sm font-extrabold text-rose-950 leading-6 whitespace-pre-line">
              {{ cleanErrorMessage }}
            </p>
          </div>
        </div>

        <!-- Instructions -->
        <div class="mt-6 rounded-2xl bg-blue-50/70 border border-blue-150 p-4 text-xs leading-5 text-blue-900">
          <p class="font-black text-blue-950 flex items-center gap-1.5 mb-1">
            <app-icon name="sparkles" [size]="15" class="text-blue-600" />
            Hướng dẫn xử lý an toàn:
          </p>
          <p>
            Ứng dụng của bạn <strong>không bị sập</strong>. Bạn chỉ cần nhấn nút <strong>"Quay lại trang trước"</strong> bên dưới để trở về màn hình làm việc trước đó, gửi phản hồi cho BE và tiếp tục sử dụng bình thường.
          </p>
        </div>

        <!-- Action Buttons -->
        <div class="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
          <button
            type="button"
            (click)="goBack()"
            class="flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-700 hover:shadow-blue-600/40"
          >
            <app-icon name="arrow-left" [size]="18" /> Quay lại trang trước
          </button>

          <div class="flex items-center gap-2">
            <button
              type="button"
              (click)="reload()"
              class="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 shadow-sm"
            >
              <app-icon name="refresh" [size]="16" /> Thử lại
            </button>

            <a
              routerLink="/app/dashboard"
              class="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 shadow-sm"
            >
              <app-icon name="home" [size]="16" /> Trang chủ
            </a>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class ErrorPage {
  private readonly location = inject(Location)
  private readonly errorState = inject(ErrorStateService)
  private readonly store = inject(AuthStore)
  private readonly systemApi = inject(SystemService)

  protected readonly err = this.errorState.currentError

  protected get cleanErrorMessage(): string {
    const raw = this.err()?.message || ''
    if (!raw || raw.includes('Http failure response')) {
      return 'Lỗi kết nối hoặc xử lý dữ liệu từ hệ thống Backend. Vui lòng thử lại sau.'
    }
    return raw
  }

  goBack(): void {
    const user = this.store.user()
    if (user?.userId) {
      this.systemApi
        .sendNotification({
          userId: user.userId,
          title: 'Xác nhận phản hồi lỗi Backend',
          message: `Người dùng ${user.fullName || user.username} đã quay lại trang từ màn hình báo lỗi (${this.err()?.url || 'API'}).`,
          notificationType: 1,
        })
        .pipe(catchError(() => EMPTY))
        .subscribe()
    }
    this.errorState.clearError()
    this.location.back()
  }

  reload(): void {
    window.location.reload()
  }
}