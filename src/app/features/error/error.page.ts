import { DatePipe, Location } from '@angular/common'
import { Component, inject } from '@angular/core'
import { RouterLink } from '@angular/router'
import { ErrorStateService } from '../../core/http/error-state.service'
import { IconComponent } from '../../shared/ui/icon'

@Component({
  selector: 'app-error-page',
  standalone: true,
  imports: [DatePipe, RouterLink, IconComponent],
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
              {{ err()?.statusText || 'Lỗi hệ thống Backend' }} (HTTP {{ err()?.status || 500 }})
            </span>
            <h1 class="mt-1 text-2xl font-black tracking-tight text-slate-950">Phát hiện sự cố kết nối BE</h1>
          </div>
        </div>

        <!-- Main Error Body -->
        <div class="mt-6 space-y-4">
          <div class="rounded-2xl border border-rose-200/80 bg-gradient-to-br from-rose-50/80 to-amber-50/50 p-5">
            <p class="text-xs font-black uppercase tracking-wider text-rose-800/80">Thông tin lỗi chi tiết từ Backend:</p>
            <p class="mt-2 text-sm font-extrabold text-rose-950 leading-6 whitespace-pre-line">
              {{ err()?.message || 'Không thể thực thi yêu cầu do sự cố phát sinh tại phía Máy chủ Backend.' }}
            </p>
          </div>

          @if (err()?.url) {
            <div class="rounded-xl border border-slate-150 bg-slate-50 p-3.5 text-xs text-slate-600 space-y-1">
              <div class="flex justify-between items-center flex-wrap gap-2">
                <span class="font-bold text-slate-400">Endpoint API phát sinh lỗi:</span>
                <span class="font-mono text-[11px] text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200 break-all">{{ err()?.url }}</span>
              </div>
              @if (err()?.timestamp) {
                <div class="flex justify-between items-center pt-1">
                  <span class="font-bold text-slate-400">Thời gian ghi nhận:</span>
                  <span class="font-semibold text-slate-600">{{ err()?.timestamp | date:'HH:mm:ss dd/MM/yyyy' }}</span>
                </div>
              }
            </div>
          }
        </div>

        <!-- Instructions -->
        <div class="mt-6 rounded-2xl bg-blue-50/70 border border-blue-150 p-4 text-xs leading-5 text-blue-900">
          <p class="font-black text-blue-950 flex items-center gap-1.5 mb-1">
            <app-icon name="sparkles" [size]="15" class="text-blue-600" />
            Hướng dẫn xử lý an toàn:
          </p>
          <p>
            Ứng dụng của bạn <strong>không bị sập</strong>. Bạn chỉ cần nhấn nút <strong>"Quay lại trang trước"</strong> bên dưới để trở về màn hình làm việc trước đó và tiếp tục sử dụng bình thường (tránh thực hiện lại thao tác gây lỗi trên cho đến khi BE được xử lý).
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
  protected readonly err = this.errorState.currentError

  goBack(): void {
    this.errorState.clearError()
    this.location.back()
  }

  reload(): void {
    window.location.reload()
  }
}