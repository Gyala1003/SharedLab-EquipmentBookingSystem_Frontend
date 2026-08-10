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
    <main
      class="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f5f7fb] p-5 text-center"
    >
      <div
        class="absolute top-[15%] left-[10%] h-72 w-72 rounded-full bg-violet-200/60 blur-3xl"
      ></div>
      <div
        class="absolute right-[10%] bottom-[12%] h-80 w-80 rounded-full bg-cyan-200/60 blur-3xl"
      ></div>
      <section
        class="relative w-full max-w-lg rounded-[36px] border border-white bg-white/95 p-8 shadow-2xl shadow-slate-900/10 backdrop-blur-xl sm:p-12"
      >
        <div
          class="mx-auto flex h-24 w-24 items-center justify-center rounded-[30px] bg-gradient-to-br from-amber-100 to-orange-100 text-amber-600 shadow-inner"
        >
          <app-icon name="shield" [size]="44" />
        </div>
        <p class="mt-8 text-xs font-black tracking-[0.22em] text-amber-600 uppercase">
          HTTP 403 Forbidden
        </p>
        <h1 class="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
          Không có quyền truy cập
        </h1>
        <p class="mt-3 text-sm leading-relaxed text-slate-600">
          Tài nguyên hoặc lịch này thuộc phạm vi quản lý của Quản lý phòng Lab khác hoặc Admin. Bạn không có quyền truy cập hoặc chỉnh sửa bản ghi này.
        </p>

        <div class="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            class="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 text-sm font-bold text-white shadow-lg shadow-indigo-900/15 transition hover:bg-indigo-700"
            (click)="goCalendar()"
          >
            <app-icon name="calendar" [size]="18" />
            Về trang Lịch (Calendar)
          </button>
          <button
            type="button"
            class="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
            (click)="goBack()"
          >
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

  protected goCalendar(): void {
    this.errorState.clearError()
    void this.router.navigate(['/app/calendar'])
  }

  protected goHome(): void {
    this.errorState.clearError()
    void this.router.navigateByUrl(
      this.store.isAuthenticated() ? landingPath(this.store.role()) : '/login',
    )
  }

  protected goBack(): void {
    this.errorState.clearError()
    if (history.length > 1) {
      this.location.back()
    } else {
      this.goHome()
    }
  }
}
