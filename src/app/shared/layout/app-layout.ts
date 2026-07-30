import { DatePipe, NgClass } from '@angular/common'
import { Component, OnInit, computed, inject, signal } from '@angular/core'
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router'
import { catchError, forkJoin, of } from 'rxjs'
import { NotificationBadgeService } from '../../core/api/notification-badge.service'
import { SystemService } from '../../core/api/system.service'
import type { BookingResponse, UsageLogResponse } from '../../core/api/system.models'
import { WorkspaceService } from '../../core/api/workspace.service'
import { AuthStore } from '../../core/auth/auth.store'
import { LanguageStore } from '../../core/i18n/language.store'
import { TranslatePipe } from '../../core/i18n/translate.pipe'
import { HeaderComponent } from './header/header.component'
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
  standalone: true,
  imports: [
    DatePipe,
    NgClass,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    HeaderComponent,
    IconComponent,
    ModalComponent,
    TranslatePipe,
  ],
  template: `
    <div class="min-h-screen bg-slate-50 text-slate-900">
      <!-- Overlay Mobile -->
      @if (mobileOpen()) {
        <button
          type="button"
          class="fixed inset-0 z-30 bg-slate-950/30 backdrop-blur-sm lg:hidden"
          aria-label="{{ 'sidebar.closeMenu' | t }}"
          (click)="mobileOpen.set(false)"
        ></button>
      }

      <!-- Sidebar -->
      <aside
        class="fixed inset-y-0 left-0 z-40 flex w-[292px] flex-col border-r border-slate-200/80 bg-white shadow-xl shadow-slate-900/5 transition-transform duration-300 lg:translate-x-0"
        [ngClass]="mobileOpen() ? 'translate-x-0' : '-translate-x-full'"
      >
        <!-- Sidebar Brand Logo -->
        <div class="flex h-20 shrink-0 items-center gap-3 border-b border-slate-100 bg-white px-5">
          <div
            class="bg-brand-500 shadow-brand-500/25 flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-lg"
          >
            <app-icon name="flask" [size]="24" />
          </div>
          <div class="min-w-0">
            <p class="text-brand-600 text-[10px] font-black tracking-[0.24em] uppercase">
              {{ 'app.name' | t }}
            </p>
            <p class="mt-0.5 truncate text-sm font-black text-slate-900">{{ 'app.tagline' | t }}</p>
          </div>
          <button
            type="button"
            class="ml-auto rounded-xl p-2 text-slate-400 hover:bg-slate-100 lg:hidden"
            (click)="mobileOpen.set(false)"
          >
            <app-icon name="x" [size]="20" />
          </button>
        </div>

        <!-- Sidebar Quick CTA -->
        @if (store.isRequester()) {
          <div class="border-b border-slate-100 px-4 py-4">
            <a
              routerLink="/app/bookings/new"
              class="bg-brand-500 shadow-brand-500/25 hover:bg-brand-600 hover:shadow-brand-500/35 flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold text-white shadow-lg transition"
              (click)="mobileOpen.set(false)"
            >
              <app-icon name="calendar-plus" [size]="18" /> {{ 'sidebar.quickBooking' | t }}
            </a>
          </div>
        }

        <!-- Sidebar Nav Groups -->
        <div
          class="min-h-0 flex-1 [scrollbar-width:thin] [scrollbar-color:rgba(51,102,255,.2)_transparent] overflow-y-auto px-3 py-4"
        >
          @for (group of visibleGroups(); track group.labelKey) {
            <div class="mb-5">
              <p class="px-3 text-[9px] font-black tracking-[0.22em] text-slate-400 uppercase">
                {{ group.labelKey | t }}
              </p>
              <nav class="mt-2 space-y-1">
                @for (item of group.items; track item.route) {
                  <a
                    [routerLink]="item.route"
                    routerLinkActive="!bg-brand-500 !text-white shadow-md shadow-brand-500/20 font-bold [&_.icon-box]:!bg-white/20 [&_.icon-box]:!text-white"
                    [routerLinkActiveOptions]="{ exact: true }"
                    class="group hover:bg-brand-50/80 hover:text-brand-600 flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-[13px] font-medium text-slate-600 transition"
                    (click)="mobileOpen.set(false)"
                  >
                    <span
                      class="icon-box group-hover:bg-brand-100 group-hover:text-brand-600 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition"
                    >
                      <app-icon [name]="item.icon" [size]="17" />
                    </span>
                    <span class="min-w-0 flex-1 truncate">{{ item.labelKey | t }}</span>
                    @if (item.badge === 'notifications' && badge.count() > 0) {
                      <span
                        class="min-w-6 rounded-full bg-rose-500 px-1.5 py-0.5 text-center text-[9px] font-black text-white shadow-sm"
                      >
                        {{ badge.count() > 99 ? '99+' : badge.count() }}
                      </span>
                    }
                  </a>
                }
              </nav>
            </div>
          }
        </div>

        <!-- Sidebar User Footer -->
        <div class="shrink-0 border-t border-slate-100 bg-slate-50/50 p-3">
          @if (store.user(); as user) {
            <div class="rounded-[22px] border border-slate-200/80 bg-white p-3.5 shadow-sm">
              <a
                routerLink="/app/profile"
                class="flex items-center gap-3 rounded-xl transition hover:bg-slate-50"
                (click)="mobileOpen.set(false)"
              >
                <div
                  class="bg-brand-500 shadow-brand-500/20 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-xs font-black text-white shadow-md"
                >
                  {{ initials(user.fullName) }}
                </div>
                <div class="min-w-0 flex-1">
                  <p class="truncate text-sm font-bold text-slate-900">{{ user.fullName }}</p>
                  <p class="mt-0.5 truncate text-[10px] font-medium text-slate-500">
                    {{ 'roles.' + user.roleName | t }}
                  </p>
                </div>
                <app-icon name="chevron-right" [size]="15" class="text-slate-400" />
              </a>
              <div class="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                <span class="inline-flex items-center gap-2 text-[10px] font-bold text-emerald-600">
                  <span
                    class="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,.18)]"
                  ></span>
                  {{ 'sidebar.connected' | t }}
                </span>
                <button
                  type="button"
                  class="rounded-xl p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                  title="{{ 'sidebar.logout' | t }}"
                  (click)="logout()"
                >
                  <app-icon name="logout" [size]="17" />
                </button>
              </div>
            </div>
          }
        </div>
      </aside>

      <!-- Main Container & Header -->
      <div class="min-h-screen lg:pl-[292px]">
        <app-header (toggleSidebar)="mobileOpen.set(true)" />

        <main class="mx-auto w-full max-w-[1580px] p-4 sm:p-6 lg:p-8">
          <router-outlet />
        </main>
      </div>

      <!-- Pending Checkout Modal -->
      <app-modal
        [open]="pendingCheckoutOpen()"
        title="{{ 'checkout.modalTitle' | t }}"
        subtitle="{{ 'checkout.modalSubtitle' | t }}"
        (close)="pendingCheckoutOpen.set(false)"
      >
        @if (pendingBooking; as booking) {
          <div class="grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm">
            <div class="flex justify-between">
              <span class="text-slate-400">Booking</span>
              <span class="font-bold text-slate-800"
                >#BK-{{ booking.bookingId.toString().padStart(5, '0') }}</span
              >
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">{{ 'checkout.endTime' | t }}</span>
              <span class="font-bold text-slate-700">{{
                booking.endTime | date: 'HH:mm dd/MM/yyyy'
              }}</span>
            </div>
          </div>
          <div class="mt-5 flex flex-wrap justify-end gap-2">
            <button class="btn-secondary" (click)="snoozePendingCheckout()">
              {{ 'checkout.continue' | t }}
            </button>
            <button class="btn-primary" (click)="confirmPendingCheckout()">
              <app-icon name="logout" [size]="16" /> {{ 'checkout.confirm' | t }}
            </button>
          </div>
        }
      </app-modal>
    </div>
  `,
})
export class AppLayoutComponent implements OnInit {
  protected readonly store = inject(AuthStore)
  protected readonly languageStore = inject(LanguageStore)
  private readonly workspace = inject(WorkspaceService)
  protected readonly badge = inject(NotificationBadgeService)
  private readonly router = inject(Router)
  private readonly api = inject(SystemService)
  private readonly toast = inject(ToastService)

  protected readonly mobileOpen = signal(false)
  protected readonly pendingCheckoutOpen = signal(false)
  protected pendingBooking: BookingResponse | null = null
  protected pendingLog: UsageLogResponse | null = null

  private readonly groups: readonly NavGroup[] = [
    {
      labelKey: 'nav.groups.overview',
      items: [
        { labelKey: 'nav.items.home', icon: 'home', route: '/app/home', roles: ['Requester'] },
        {
          labelKey: 'nav.items.dashboard',
          icon: 'dashboard',
          route: '/app/dashboard',
          roles: ['Admin'],
        },
        { labelKey: 'nav.items.calendar', icon: 'calendar', route: '/app/calendar' },
      ],
    },
    {
      labelKey: 'nav.groups.resources',
      items: [
        { labelKey: 'nav.items.labs', icon: 'building', route: '/app/labs' },
        { labelKey: 'nav.items.equipments', icon: 'microscope', route: '/app/equipments' },
        {
          labelKey: 'nav.items.maintenances',
          icon: 'wrench',
          route: '/app/management/maintenances',
        },
        { labelKey: 'nav.items.policy', icon: 'file-text', route: '/app/policy' },
      ],
    },
    {
      labelKey: 'nav.groups.management',
      roles: ['LabManager'],
      items: [
        {
          labelKey: 'nav.items.pendingBookings',
          icon: 'check-circle',
          route: '/app/management/bookings/pending',
        },
        {
          labelKey: 'nav.items.manageBookings',
          icon: 'calendar',
          route: '/app/management/bookings',
        },
        {
          labelKey: 'nav.items.incidents',
          icon: 'alert',
          route: '/app/management/incidents',
        },
        {
          labelKey: 'nav.items.manageWaitlists',
          icon: 'users',
          route: '/app/management/waitlists',
        },
        {
          labelKey: 'nav.items.manageViolations',
          icon: 'shield',
          route: '/app/management/violations',
        },
      ],
    },
    {
      labelKey: 'nav.groups.personal',
      items: [
        {
          labelKey: 'nav.items.myBookings',
          icon: 'calendar',
          route: '/app/bookings/my',
          roles: ['Requester'],
        },
        {
          labelKey: 'nav.items.myWaitlist',
          icon: 'clock',
          route: '/app/waitlists/my',
          roles: ['Requester'],
        },
        {
          labelKey: 'nav.items.violations',
          icon: 'alert',
          route: '/app/violations/my',
          roles: ['Requester'],
        },
      ],
    },
    {
      labelKey: 'nav.groups.systemAdmin',
      roles: ['Admin'],
      items: [
        { labelKey: 'nav.items.users', icon: 'users', route: '/app/admin/users' },
        { labelKey: 'nav.items.departments', icon: 'building', route: '/app/admin/departments' },
      ],
    },
  ]

  protected readonly visibleGroups = computed(() => {
    this.languageStore.lang()
    const role = this.store.role()
    return this.groups
      .filter((group) => !group.roles || group.roles.includes(role))
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => !item.roles || item.roles.includes(role)),
      }))
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

  protected roleLabel(role: string): string {
    return this.languageStore.t('roles.' + role)
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
      forkJoin(candidates.map((b) => this.api.usageLogsByBooking(b.bookingId))).subscribe(
        (logsList) => {
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
        },
      )
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
        this.toast.success(
          this.languageStore.t('pendingCheckout.checkoutSuccess') || 'Check-out thành công',
        )
        this.checkLateAndReportViolation(booking, actualCheckoutIso)
      },
      error: () => this.toast.error(this.languageStore.t('common.error') || 'Không thể check-out'),
    })
  }

  private checkLateAndReportViolation(booking: BookingResponse, actualCheckoutIso: string): void {
    const deadline = +new Date(booking.endTime) + 15 * 60_000
    if (+new Date(actualCheckoutIso) <= deadline) return
    this.api
      .createViolation({ userId: booking.userId, bookingId: booking.bookingId, violationType: 2 })
      .subscribe({
        next: () => {},
        error: () => {},
      })
  }
}
