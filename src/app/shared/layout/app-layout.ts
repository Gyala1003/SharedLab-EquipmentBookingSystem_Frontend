import { DatePipe, NgClass } from '@angular/common'
import { Component, OnInit, computed, inject, signal } from '@angular/core'
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router'
import { TranslatePipe, TranslateService } from '@ngx-translate/core'
import { catchError, forkJoin, of } from 'rxjs'
import { NotificationBadgeService } from '../../core/api/notification-badge.service'
import { SystemService } from '../../core/api/system.service'
import type { BookingResponse, UsageLogResponse } from '../../core/api/system.models'
import { WorkspaceService } from '../../core/api/workspace.service'
import { AuthStore } from '../../core/auth/auth.store'
import { LanguageSwitcherComponent } from '../ui/language-switcher'
import { IconComponent } from '../ui/icon'
import { ModalComponent } from '../ui/modal'
import { ToastService } from '../ui/toast.service'

interface NavItem {
  labelKey: string
  icon: string
  route: string
  roles?: readonly string[]
  badge?: 'notifications'
}

interface NavGroup {
  labelKey: string
  items: readonly NavItem[]
  roles?: readonly string[]
}

@Component({
  selector: 'app-layout',
  imports: [
    DatePipe,
    NgClass,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    IconComponent,
    ModalComponent,
    LanguageSwitcherComponent,
    TranslatePipe,
  ],
  template: `
    <div class="min-h-screen bg-[#f5f7fb] text-slate-900">
      @if (mobileOpen()) {
        <button
          type="button"
          class="fixed inset-0 z-30 bg-slate-950/45 backdrop-blur-sm lg:hidden"
          aria-label="Đóng menu"
          (click)="mobileOpen.set(false)"
        ></button>
      }

      <aside
        class="fixed inset-y-0 left-0 z-40 flex w-[292px] flex-col border-r border-cyan-100/90 bg-gradient-to-b from-[#f0fdfa] via-white to-[#f0f9ff] text-slate-800 shadow-2xl shadow-cyan-950/5 transition-transform duration-300 lg:translate-x-0"
        [ngClass]="mobileOpen() ? 'translate-x-0' : '-translate-x-full'"
      >
        <div class="flex h-20 shrink-0 items-center gap-3 border-b border-cyan-100/80 bg-white/60 px-5 backdrop-blur-md">
          <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 via-teal-400 to-sky-400 text-white shadow-lg shadow-cyan-500/25">
            <app-icon name="flask" [size]="24" />
          </div>
          <div class="min-w-0">
            <p class="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-700">{{ 'app.name' | translate }}</p>
            <p class="mt-1 truncate text-sm font-black text-slate-900">{{ 'app.tagline' | translate }}</p>
          </div>
          <button type="button" class="ml-auto rounded-xl p-2 text-slate-400 hover:bg-cyan-50 hover:text-cyan-700 lg:hidden" (click)="mobileOpen.set(false)">
            <app-icon name="x" [size]="20" />
          </button>
        </div>

        @if (store.isRequester()) {
          <div class="border-b border-cyan-100/80 px-4 py-4">
            <a
              routerLink="/app/bookings/new"
              class="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-600 via-teal-500 to-cyan-500 px-4 py-3 text-sm font-black text-white shadow-lg shadow-cyan-500/25 transition hover:-translate-y-0.5 hover:shadow-cyan-500/35"
              (click)="mobileOpen.set(false)"
            >
              <app-icon name="calendar-plus" [size]="18" /> {{ 'nav.items.quickBooking' | translate }}
            </a>
          </div>
        }

        <div class="min-h-0 flex-1 overflow-y-auto px-3 py-4 [scrollbar-width:thin] [scrollbar-color:rgba(6,182,212,.2)_transparent]">
          @for (group of visibleGroups(); track group.labelKey) {
            <div class="mb-5">
              <p class="px-3 text-[9px] font-black uppercase tracking-[0.22em] text-cyan-800/60">{{ group.labelKey | translate }}</p>
              <nav class="mt-2 space-y-1">
                @for (item of group.items; track item.route) {
                  <a
                    [routerLink]="item.route"
                    routerLinkActive="bg-gradient-to-r from-cyan-600 via-teal-500 to-cyan-500 !text-white shadow-md shadow-cyan-500/25 font-black [&_.icon-box]:bg-white/20 [&_.icon-box]:!text-white"
                    class="group flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-[13px] font-bold text-slate-600 transition hover:bg-cyan-50/90 hover:text-cyan-700"
                    (click)="mobileOpen.set(false)"
                  >
                    <span class="icon-box flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100/80 text-slate-500 transition group-hover:bg-cyan-100/80 group-hover:text-cyan-700">
                      <app-icon [name]="item.icon" [size]="17" />
                    </span>
                    <span class="min-w-0 flex-1 truncate">{{ item.labelKey | translate }}</span>
                    @if (item.badge === 'notifications' && badge.count() > 0) {
                      <span class="min-w-6 rounded-full bg-rose-500 px-1.5 py-0.5 text-center text-[9px] font-black text-white shadow-sm">
                        {{ badge.count() > 99 ? '99+' : badge.count() }}
                      </span>
                    }
                  </a>
                }
              </nav>
            </div>
          }
        </div>

        <div class="shrink-0 border-t border-cyan-100/80 p-3 bg-white/40 backdrop-blur-sm">
          @if (store.user(); as user) {
            <div class="rounded-[22px] border border-cyan-100 bg-white/90 p-3.5 shadow-md shadow-cyan-950/5 backdrop-blur-md">
              <a routerLink="/app/profile" class="flex items-center gap-3 rounded-xl transition hover:bg-cyan-50/60" (click)="mobileOpen.set(false)">
                <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 via-teal-400 to-sky-400 text-xs font-black text-white shadow-md shadow-cyan-500/20">
                  {{ initials(user.fullName) }}
                </div>
                <div class="min-w-0 flex-1">
                  <p class="truncate text-sm font-black text-slate-900">{{ user.fullName }}</p>
                  <p class="mt-0.5 truncate text-[10px] font-semibold text-slate-500">{{ 'roles.' + user.roleName | translate }}</p>
                </div>
                <app-icon name="chevron-right" [size]="15" class="text-slate-400" />
              </a>
              <div class="mt-3 flex items-center justify-between border-t border-cyan-100/80 pt-3">
                <span class="inline-flex items-center gap-2 text-[10px] font-bold text-teal-700">
                  <span class="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,.18)]"></span>
                  {{ 'header.connected' | translate }}
                </span>
                <button type="button" class="rounded-xl p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition" [attr.title]="'header.logout' | translate" (click)="logout()">
                  <app-icon name="logout" [size]="17" />
                </button>
              </div>
            </div>
          }
        </div>
      </aside>

      <div class="min-h-screen lg:pl-[292px]">
        <header class="sticky top-0 z-20 flex h-20 items-center gap-3 border-b border-slate-200/80 bg-white/88 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <button type="button" class="rounded-xl border border-slate-200 p-2.5 text-slate-600 shadow-sm hover:bg-slate-50 lg:hidden" (click)="mobileOpen.set(true)">
            <app-icon name="menu" [size]="20" />
          </button>
          <div class="min-w-0 flex-1">
            <p class="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">{{ 'app.workspace' | translate }}</p>
            <p class="mt-1 truncate text-sm font-bold text-slate-600">{{ 'header.workspaceSub' | translate }}</p>
          </div>
          
          <a
            routerLink="/app/calendar"
            class="hidden h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-xs font-black text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:text-indigo-600 sm:flex"
          >
            <app-icon name="calendar" [size]="18" /> {{ 'header.viewCalendar' | translate }}
          </a>

          <app-language-switcher variant="header" />

          <a
            routerLink="/app/notifications"
            class="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:text-indigo-600 hover:shadow-md"
            [attr.aria-label]="'header.notifications' | translate"
          >
            <app-icon name="bell" [size]="20" />
            @if (badge.count() > 0) {
              <span class="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-rose-500"></span>
            }
          </a>
          
          <a routerLink="/app/profile" class="hidden items-center gap-3 rounded-2xl px-2 py-1.5 transition hover:bg-slate-50 md:flex">
            @if (store.user(); as user) {
              <div class="text-right">
                <p class="text-sm font-black text-slate-800">{{ user.fullName }}</p>
                <p class="mt-0.5 text-[10px] font-bold text-slate-400">{{ 'roles.' + user.roleName | translate }}</p>
              </div>
              <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#e9e8ff] text-sm font-black text-indigo-700">
                {{ initials(user.fullName) }}
              </div>
            }
          </a>
        </header>

        <main class="mx-auto w-full max-w-[1580px] p-4 sm:p-6 lg:p-8"><router-outlet /></main>
      </div>

      <app-modal
        [open]="pendingCheckoutOpen()"
        [title]="'pendingCheckout.title' | translate"
        [subtitle]="'pendingCheckout.subtitle' | translate"
        (close)="pendingCheckoutOpen.set(false)"
      >
        @if (pendingBooking; as booking) {
          <div class="grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm">
            <div class="flex justify-between">
              <span class="text-slate-400">Booking</span>
              <span class="font-black text-slate-800">#BK-{{ booking.bookingId.toString().padStart(5, '0') }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">{{ 'pendingCheckout.endTime' | translate }}</span>
              <span class="font-bold text-slate-700">{{ booking.endTime | date: 'HH:mm dd/MM/yyyy' }}</span>
            </div>
          </div>
          <div class="mt-5 flex flex-wrap justify-end gap-2">
            <button class="btn-secondary" (click)="snoozePendingCheckout()">{{ 'pendingCheckout.continueUsing' | translate }}</button>
            <button class="btn-primary" (click)="confirmPendingCheckout()">
              <app-icon name="logout" [size]="16" /> {{ 'pendingCheckout.confirmCheckout' | translate }}
            </button>
          </div>
        }
      </app-modal>
    </div>
  `,
})
export class AppLayoutComponent implements OnInit {
  protected readonly store = inject(AuthStore)
  private readonly workspace = inject(WorkspaceService)
  protected readonly badge = inject(NotificationBadgeService)
  private readonly router = inject(Router)
  private readonly api = inject(SystemService)
  private readonly toast = inject(ToastService)
  protected readonly translate = inject(TranslateService)
  protected readonly mobileOpen = signal(false)
  protected readonly pendingCheckoutOpen = signal(false)
  protected pendingBooking: BookingResponse | null = null
  protected pendingLog: UsageLogResponse | null = null

  private readonly groups: readonly NavGroup[] = [
    {
      labelKey: 'nav.groups.overview',
      items: [
        { labelKey: 'nav.items.home', icon: 'home', route: '/app/home', roles: ['Requester'] },
        { labelKey: 'nav.items.dashboard', icon: 'dashboard', route: '/app/dashboard', roles: ['Admin', 'LabManager'] },
        { labelKey: 'nav.items.calendar', icon: 'calendar', route: '/app/calendar' },
      ],
    },
    {
      labelKey: 'nav.groups.resources',
      items: [
        { labelKey: 'nav.items.labs', icon: 'building', route: '/app/labs' },
        { labelKey: 'nav.items.equipments', icon: 'microscope', route: '/app/equipments' },
        { labelKey: 'nav.items.maintenances', icon: 'wrench', route: '/app/management/maintenances' },
      ],
    },
    {
      labelKey: 'nav.groups.personal',
      items: [
        { labelKey: 'nav.items.violations', icon: 'alert', route: '/app/violations/my' },
        { labelKey: 'nav.items.notifications', icon: 'bell', route: '/app/notifications', badge: 'notifications' },
        { labelKey: 'nav.items.profile', icon: 'user', route: '/app/profile' },
      ],
    },
    {
      labelKey: 'nav.groups.systemAdmin',
      roles: ['Admin'],
      items: [
        { labelKey: 'nav.items.users', icon: 'users', route: '/app/admin/users' },
        { labelKey: 'nav.items.departments', icon: 'building', route: '/app/admin/departments' },
        { labelKey: 'nav.items.sendNotification', icon: 'send', route: '/app/admin/notifications/send' },
      ],
    },
  ]

  protected readonly visibleGroups = computed(() => {
    const role = this.store.role()
    return this.groups
      .filter((group) => !group.roles || group.roles.includes(role))
      .map((group) => ({ ...group, items: group.items.filter((item) => !item.roles || item.roles.includes(role)) }))
      .filter((group) => group.items.length > 0)
  })

  ngOnInit(): void {
    const user = this.store.user()
    if (!user) return
    this.workspace
      .unreadCount(user.userId)
      .pipe(catchError(() => of({ userId: user.userId, unreadCount: 0 })))
      .subscribe((response) => this.badge.set(response.unreadCount))
    if (this.store.isRequester()) this.detectPendingCheckout(user.userId)
  }

  protected initials(name: string): string {
    return name
      .trim()
      .split(/\s+/)
      .slice(-2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('')
  }

  protected async logout(): Promise<void> {
    await this.store.logout()
    void this.router.navigate(['/login'])
  }

  private detectPendingCheckout(userId: number): void {
    const now = Date.now()
    this.api.bookingsByUser(userId).subscribe((bookings) => {
      const candidates = bookings
        .filter((b) => b.status === 'Approved' && +new Date(b.endTime) < now)
        .sort((a, b) => +new Date(b.endTime) - +new Date(a.endTime))
        .slice(0, 3)
      if (!candidates.length) return
      forkJoin(candidates.map((b) => this.api.usageLogsByBooking(b.bookingId))).subscribe((logsList) => {
        for (let i = 0; i < candidates.length; i++) {
          const booking = candidates[i]
          const pendingLog = logsList[i].find((log) => log.actualCheckin && !log.actualCheckout)
          if (!pendingLog) continue
          const deadline = +new Date(booking.endTime) + 15 * 60_000
          if (now <= deadline) continue
          const snoozeKey = `pending-checkout-snooze-${pendingLog.logId}`
          const snoozedAt = sessionStorage.getItem(snoozeKey)
          if (snoozedAt && now - Number(snoozedAt) <= 10 * 60_000) continue
          this.pendingBooking = booking
          this.pendingLog = pendingLog
          this.pendingCheckoutOpen.set(true)
          break
        }
      })
    })
  }

  protected snoozePendingCheckout(): void {
    const log = this.pendingLog
    if (log) sessionStorage.setItem(`pending-checkout-snooze-${log.logId}`, String(Date.now()))
    this.pendingCheckoutOpen.set(false)
  }

  protected confirmPendingCheckout(): void {
    const booking = this.pendingBooking
    const log = this.pendingLog
    if (!booking || !log) return
    const actualCheckoutIso = new Date().toISOString()
    this.pendingCheckoutOpen.set(false)
    this.api.checkOut(log.logId, actualCheckoutIso).subscribe({
      next: () => {
        this.toast.success(this.translate.instant('pendingCheckout.checkoutSuccess') || 'Check-out thành công')
        this.checkLateAndReportViolation(booking, actualCheckoutIso)
      },
      error: () => this.toast.error(this.translate.instant('common.error') || 'Không thể check-out'),
    })
  }

  private checkLateAndReportViolation(booking: BookingResponse, actualCheckoutIso: string): void {
    const deadline = +new Date(booking.endTime) + 15 * 60_000
    if (+new Date(actualCheckoutIso) <= deadline) return
    this.api.createViolation({ userId: booking.userId, bookingId: booking.bookingId, violationType: 2 }).subscribe({
      next: () => {},
      error: () => {},
    })
  }
}
