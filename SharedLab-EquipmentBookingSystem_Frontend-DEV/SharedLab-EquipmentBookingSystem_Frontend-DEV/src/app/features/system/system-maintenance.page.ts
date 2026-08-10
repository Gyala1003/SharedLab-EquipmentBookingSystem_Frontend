import { DatePipe } from '@angular/common'
import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core'
import { Router, RouterLink } from '@angular/router'
import { AuthStore } from '../../core/auth/auth.store'
import { LanguageStore } from '../../core/i18n/language.store'
import { TranslatePipe } from '../../core/i18n/translate.pipe'
import { SystemMaintenanceStore } from '../../core/system/system-maintenance.store'
import { IconComponent } from '../../shared/ui/icon'

@Component({
  selector: 'app-system-maintenance-page',
  imports: [DatePipe, RouterLink, IconComponent, TranslatePipe],
  template: `
    <div
      class="relative flex min-h-screen flex-col justify-between overflow-hidden bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-white"
    >
      <!-- Background Ambient Glow Effects -->
      <div
        class="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-cyan-600/20 blur-3xl"
      ></div>
      <div
        class="pointer-events-none absolute top-1/3 -right-40 h-96 w-96 rounded-full bg-teal-500/15 blur-3xl"
      ></div>
      <div
        class="pointer-events-none absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl"
      ></div>

      <!-- Top Header Navigation Bar -->
      <header
        class="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between p-6 sm:px-8"
      >
        <div class="flex items-center gap-3">
          <div
            class="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-600 to-teal-400 font-black text-slate-950 shadow-lg shadow-cyan-500/20"
          >
            <app-icon name="wrench" [size]="20" />
          </div>
          <span class="text-lg font-black tracking-tight text-white"
            >SHARED<span class="text-cyan-400">LAB</span></span
          >
        </div>

        <div class="flex items-center gap-3">
          <!-- Language Switcher -->
          <div class="flex items-center rounded-2xl border border-slate-800 bg-slate-900/80 p-1">
            <button
              type="button"
              class="rounded-xl px-3 py-1 text-xs font-bold transition"
              [class]="
                languageStore.lang() === 'vi'
                  ? 'bg-cyan-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              "
              (click)="languageStore.setLang('vi')"
            >
              VN
            </button>
            <button
              type="button"
              class="rounded-xl px-3 py-1 text-xs font-bold transition"
              [class]="
                languageStore.lang() === 'en'
                  ? 'bg-cyan-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              "
              (click)="languageStore.setLang('en')"
            >
              EN
            </button>
          </div>

          @if (store.isAuthenticated()) {
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
              (click)="handleLogout()"
            >
              <app-icon name="log-out" [size]="15" />
              <span>{{ 'nav.logout' | t }}</span>
            </button>
          }
        </div>
      </header>

      <!-- Main Maintenance Notice Body -->
      <main class="relative z-10 mx-auto my-auto w-full max-w-3xl p-6 sm:px-8">
        <div
          class="rounded-3xl border border-slate-800/80 bg-slate-900/90 p-6 shadow-2xl backdrop-blur-xl sm:p-10"
        >
          <!-- Animated Status Header Icon -->
          <div class="flex flex-col items-center text-center">
            <div
              class="relative flex h-20 w-20 items-center justify-center rounded-3xl border border-amber-500/30 bg-amber-500/10 text-amber-400 shadow-inner"
            >
              <span
                class="absolute inline-flex h-full w-full animate-ping rounded-3xl bg-amber-400/20 opacity-75"
              ></span>
              <app-icon name="wrench" [size]="36" />
            </div>

            <div
              class="mt-5 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-bold tracking-wider text-amber-300 uppercase"
            >
              <span class="h-2 w-2 animate-pulse rounded-full bg-amber-400"></span>
              {{
                languageStore.lang() === 'en'
                  ? 'System Under Maintenance'
                  : 'Thông báo bảo trì hệ thống'
              }}
            </div>

            <h1 class="mt-4 text-2xl font-black tracking-tight text-white sm:text-3xl">
              {{ languageStore.lang() === 'en' ? config().titleEn : config().title }}
            </h1>

            <p class="mt-2 max-w-xl text-sm leading-relaxed text-slate-400">
              {{ languageStore.lang() === 'en' ? config().subtitleEn : config().subtitle }}
            </p>
          </div>

          <!-- Time Window & Live Countdown Box -->
          <div
            class="mt-8 rounded-2xl border border-cyan-500/20 bg-gradient-to-b from-cyan-950/30 via-slate-900/60 to-slate-950/80 p-5 sm:p-6"
          >
            <div
              class="grid gap-4 border-b border-slate-800/80 pb-5 text-center sm:grid-cols-2 sm:text-left"
            >
              <div>
                <span class="text-xs font-bold tracking-wider text-slate-400 uppercase">
                  {{ languageStore.lang() === 'en' ? 'Scheduled Start' : 'Thời gian bắt đầu' }}
                </span>
                <p class="mt-1 text-base font-black text-white">
                  {{ config().startTime | date: 'HH:mm • dd/MM/yyyy' }}
                </p>
              </div>

              <div>
                <span class="text-xs font-bold tracking-wider text-cyan-400 uppercase">
                  {{
                    languageStore.lang() === 'en'
                      ? 'Estimated Completion'
                      : 'Thời gian dự kiến hoàn thành'
                  }}
                </span>
                <p class="mt-1 text-base font-black text-cyan-300">
                  {{ config().endTime | date: 'HH:mm • dd/MM/yyyy' }}
                </p>
              </div>
            </div>

            <!-- Countdown Timer Bar -->
            <div class="mt-4 flex flex-col items-center justify-between gap-3 text-xs sm:flex-row">
              <span class="font-medium text-slate-400">
                {{
                  languageStore.lang() === 'en'
                    ? 'Estimated Remaining Time:'
                    : 'Thời gian dự kiến còn lại:'
                }}
              </span>
              <div
                class="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-2 font-mono text-sm font-bold text-amber-300"
              >
                <app-icon name="clock" [size]="16" />
                <span>{{ countdownText() }}</span>
              </div>
            </div>
          </div>

          <!-- Scope / Details Info Box -->
          <div
            class="mt-6 space-y-3 rounded-2xl border border-slate-800 bg-slate-950/50 p-5 text-xs leading-relaxed text-slate-300"
          >
            <div class="flex items-start gap-3">
              <div
                class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-cyan-400"
              >
                <app-icon name="info" [size]="14" />
              </div>
              <div>
                <strong class="mb-0.5 block font-bold text-white">
                  {{
                    languageStore.lang() === 'en'
                      ? 'Maintenance Scope & Description:'
                      : 'Nội dung & Phạm vi bảo trì:'
                  }}
                </strong>
                <p class="text-slate-400">
                  {{
                    languageStore.lang() === 'en' ? config().descriptionEn : config().description
                  }}
                </p>
              </div>
            </div>
          </div>

          <!-- User Action Buttons -->
          <div class="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              type="button"
              class="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 px-6 text-xs font-bold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:brightness-110 active:scale-[0.98] sm:w-auto"
              (click)="checkStatus()"
            >
              <app-icon name="refresh-cw" [size]="16" />
              <span>{{
                languageStore.lang() === 'en'
                  ? 'Check Maintenance Status'
                  : 'Tải lại & Kiểm tra trạng thái'
              }}</span>
            </button>

            @if (store.isAdmin()) {
              <a
                routerLink="/app/admin/system-maintenance"
                class="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-950/40 px-6 text-xs font-bold text-cyan-300 transition hover:bg-cyan-900/50 sm:w-auto"
              >
                <app-icon name="settings" [size]="16" />
                <span>{{
                  languageStore.lang() === 'en'
                    ? 'Admin Maintenance Control'
                    : 'Quản lý bảo trì (Admin)'
                }}</span>
              </a>
            }
          </div>
        </div>
      </main>

      <!-- Footer Info -->
      <footer
        class="relative z-10 mx-auto w-full max-w-6xl p-6 text-center text-xs text-slate-600 sm:px-8"
      >
        &copy; 2026 SharedLab System Management. All rights reserved.
      </footer>
    </div>
  `,
})
export class SystemMaintenancePage implements OnInit, OnDestroy {
  protected readonly store = inject(AuthStore)
  protected readonly languageStore = inject(LanguageStore)
  protected readonly maintenanceStore = inject(SystemMaintenanceStore)
  private readonly router = inject(Router)

  protected readonly config = computed(() => this.maintenanceStore.config())
  protected readonly remainingSeconds = signal<number>(0)

  private timerRef?: number

  protected readonly countdownText = computed(() => {
    const sec = this.remainingSeconds()
    if (sec <= 0) {
      return this.languageStore.lang() === 'en' ? 'Completing soon...' : 'Sắp hoàn thành...'
    }
    const hours = Math.floor(sec / 3600)
    const mins = Math.floor((sec % 3600) / 60)
    const secs = sec % 60

    const pad = (n: number) => n.toString().padStart(2, '0')
    if (hours > 0) {
      return `${pad(hours)}:${pad(mins)}:${pad(secs)}`
    }
    return `${pad(mins)}:${pad(secs)}`
  })

  ngOnInit(): void {
    this.updateRemaining()
    this.timerRef = window.setInterval(() => this.updateRemaining(), 1000)
  }

  ngOnDestroy(): void {
    if (this.timerRef) {
      clearInterval(this.timerRef)
    }
  }

  private updateRemaining(): void {
    const endTime = new Date(this.config().endTime).getTime()
    const now = Date.now()
    const diff = Math.max(0, Math.floor((endTime - now) / 1000))
    this.remainingSeconds.set(diff)
  }

  protected checkStatus(): void {
    if (!this.maintenanceStore.isMaintenanceActive()) {
      void this.router.navigate(['/app/home'])
    } else {
      window.location.reload()
    }
  }

  protected async handleLogout(): Promise<void> {
    await this.store.logout()
    void this.router.navigate(['/login'])
  }
}
