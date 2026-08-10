import { DatePipe, NgClass } from '@angular/common'
import { Component, OnInit, computed, inject, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { Router, RouterLink } from '@angular/router'
import { SystemService } from '../../core/api/system.service'
import type {
  EquipmentResponse,
  LabRoomResponse,
  WaitlistResponse,
} from '../../core/api/system.models'
import { AuthStore } from '../../core/auth/auth.store'
import { LanguageStore } from '../../core/i18n/language.store'
import { TranslatePipe } from '../../core/i18n/translate.pipe'
import { DataStateComponent } from '../../shared/ui/data-state'
import { IconComponent } from '../../shared/ui/icon'
import { StatusBadgeComponent } from '../../shared/ui/status-badge'
import { ToastService } from '../../shared/ui/toast.service'
import { labelOf } from '../../shared/utils/presentation'

@Component({
  selector: 'app-my-waitlists-page',
  imports: [
    DatePipe,
    NgClass,
    FormsModule,
    RouterLink,
    IconComponent,
    StatusBadgeComponent,
    DataStateComponent,
    TranslatePipe,
  ],
  template: `
    <section class="space-y-6">
      <!-- Unified Header + Compact Stat Chips Bar (Strictly 1 Single Row, Zero Gap) -->
      <article class="card-surface space-y-4 p-5">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 class="text-2xl font-black tracking-tight text-slate-950">
              {{ 'waitlists.title' | t }}
            </h1>
            <p class="mt-1 text-xs font-medium text-slate-500">{{ 'waitlists.subtitle' | t }}</p>
          </div>
          <div>
            <a routerLink="/app/bookings/new" class="btn-primary flex items-center gap-2"
              ><app-icon name="plus" [size]="17" /> {{ 'sidebar.quickBooking' | t }}</a
            >
          </div>
        </div>

        <div class="border-t border-slate-100 pt-3">
          <!-- Strictly 1 Single Horizontal Row (overflow-x-auto, whitespace-nowrap, no line break) -->
          <div class="flex scrollbar-none items-center gap-2 overflow-x-auto pt-0.5 pb-1">
            @for (tab of tabs(); track tab.value) {
              <button
                type="button"
                class="flex shrink-0 items-center gap-2.5 rounded-xl border px-3.5 py-2 text-left whitespace-nowrap transition duration-150"
                [ngClass]="{
                  'border-violet-500 bg-violet-50/90 font-bold text-violet-900 shadow-2xs ring-2 ring-violet-500/20':
                    status === tab.value,
                  'border-slate-200/90 bg-slate-50/70 text-slate-700 hover:border-violet-300 hover:bg-white':
                    status !== tab.value,
                }"
                (click)="status = tab.value"
              >
                <span
                  class="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg text-[11px]"
                  [ngClass]="tab.bgTint"
                >
                  <app-icon [name]="tab.iconName" [size]="12" />
                </span>
                <span class="text-xs font-bold text-slate-600">{{ tab.label }}:</span>
                <span class="text-xs font-black" [class]="tab.className">{{
                  tab.value === '' ? items().length : count(tab.value)
                }}</span>
              </button>
            }
          </div>
        </div>
      </article>

      @if (loading()) {
        <div class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          @for (i of [1, 2, 3, 4, 5, 6]; track i) {
            <div class="card-surface p-5">
              <div class="skeleton h-5 w-2/3 rounded"></div>
              <div class="skeleton mt-4 h-24 rounded-2xl"></div>
            </div>
          }
        </div>
      } @else if (filtered().length === 0) {
        <app-data-state
          [title]="'waitlists.noWaitlists' | t"
          [message]="'waitlists.noWaitlistsMsg' | t"
          icon="clock"
        />
      } @else {
        <div class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          @for (item of filtered(); track item.waitlistId) {
            <article class="card-surface overflow-hidden">
              <div class="p-5">
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <p class="text-[10px] font-black tracking-[.16em] text-violet-500 uppercase">
                      Waitlist #{{ item.waitlistId }}
                    </p>
                    <h2 class="mt-2 text-lg font-black text-slate-950">
                      {{ resourceName(item) | t }}
                    </h2>
                  </div>
                  <app-status-badge [value]="item.status" domain="waitlist" />
                </div>
                <div class="mt-5 rounded-2xl bg-slate-50 p-4">
                  <p class="flex items-center gap-2 text-sm font-black text-slate-800">
                    <app-icon name="calendar" [size]="17" />
                    {{ item.requestedStart | date: 'HH:mm dd/MM/yyyy' }}
                  </p>
                  <p class="mt-2 pl-6 text-xs text-slate-400">
                    {{ 'common.to' | t }} {{ item.requestedEnd | date: 'HH:mm dd/MM/yyyy' }}
                  </p>
                </div>
                <div class="mt-4 flex items-center justify-between">
                  <span class="text-xs font-bold text-slate-400">{{
                    'waitlists.positionInQueue' | t
                  }}</span>
                  <span
                    class="flex h-10 min-w-10 items-center justify-center rounded-2xl bg-violet-50 px-3 font-black text-violet-700"
                    >#{{ item.queuePosition }}</span
                  >
                </div>
                @if (item.status === 'Notified') {
                  <div class="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                    <p class="text-xs font-black text-emerald-800">
                      {{ 'waitlists.remainingTime' | t }}
                    </p>
                    <p class="mt-2 text-2xl font-black text-emerald-700">{{ countdown(item) }}</p>
                    <p class="mt-1 text-[11px] text-emerald-700/70">
                      {{ 'waitlists.backendNote' | t }} {{ item.notifiedAt | date: 'HH:mm:ss' }}.
                    </p>
                  </div>
                }
              </div>
              <div class="flex gap-2 border-t border-slate-100 p-4">
                @if (item.status === 'Notified') {
                  <button class="btn-primary flex-1" (click)="bookNow(item)">
                    <app-icon name="calendar-plus" [size]="16" /> {{ 'sidebar.quickBooking' | t }}
                  </button>
                }
                @if (item.status === 'Waiting' || item.status === 'Notified') {
                  <button class="btn-secondary btn-danger" (click)="cancel(item)">
                    {{ 'common.cancel' | t }}
                  </button>
                }
              </div>
            </article>
          }
        </div>
      }
    </section>
  `,
})
export class MyWaitlistsPage implements OnInit {
  private readonly api = inject(SystemService)
  private readonly store = inject(AuthStore)
  protected readonly languageStore = inject(LanguageStore)
  private readonly router = inject(Router)
  private readonly toast = inject(ToastService)
  protected readonly items = signal<WaitlistResponse[]>([])
  protected readonly labs = signal<LabRoomResponse[]>([])
  protected readonly equipments = signal<EquipmentResponse[]>([])
  protected readonly loading = signal(true)
  protected status = ''
  protected readonly tabs = computed(() => [
    {
      value: '',
      label: this.languageStore.t('common.all'),
      className: 'text-slate-950',
      iconName: 'clock',
      bgTint: 'bg-slate-100 text-slate-700',
    },
    {
      value: 'Waiting',
      label: labelOf('waitlist', 'Waiting', this.languageStore.lang()),
      className: 'text-amber-600',
      iconName: 'clock',
      bgTint: 'bg-amber-100 text-amber-700',
    },
    {
      value: 'Notified',
      label: labelOf('waitlist', 'Notified', this.languageStore.lang()),
      className: 'text-emerald-600',
      iconName: 'send',
      bgTint: 'bg-emerald-100 text-emerald-700',
    },
    {
      value: 'Booked',
      label: labelOf('waitlist', 'Booked', this.languageStore.lang()),
      className: 'text-indigo-600',
      iconName: 'check',
      bgTint: 'bg-indigo-100 text-indigo-700',
    },
    {
      value: 'Cancelled',
      label: labelOf('waitlist', 'Cancelled', this.languageStore.lang()),
      className: 'text-slate-500',
      iconName: 'slash',
      bgTint: 'bg-slate-100 text-slate-600',
    },
    {
      value: 'Expired',
      label: labelOf('waitlist', 'Expired', this.languageStore.lang()),
      className: 'text-rose-600',
      iconName: 'alert',
      bgTint: 'bg-rose-100 text-rose-700',
    },
  ])
  protected readonly filtered = computed(() =>
    this.items()
      .filter((item) => !this.status || item.status === this.status)
      .sort((a, b) => +new Date(b.requestedStart) - +new Date(a.requestedStart)),
  )
  ngOnInit(): void {
    const userId = this.store.user()?.userId
    if (!userId) return
    this.api.labs().subscribe((labs) => this.labs.set(labs))
    this.api.equipments().subscribe((items) => this.equipments.set(items))
    this.api.waitlistsByUser(userId).subscribe({
      next: (items) => {
        this.items.set(items)
        this.loading.set(false)
      },
      error: () => {
        this.loading.set(false)
        this.toast.error('Không tải được hàng chờ')
      },
    })
  }
  protected count(status: string): number {
    return this.items().filter((item) => item.status === status).length
  }
  protected resourceName(item: WaitlistResponse): string {
    if (item.labId)
      return (
        this.labs().find((lab) => lab.labId === item.labId)?.labName ??
        `${this.languageStore.t('labs.labRoom')} #${item.labId}`
      )
    return (
      this.equipments().find((equipment) => equipment.equipmentId === item.equipmentId)
        ?.equipmentName ?? `${this.languageStore.t('equipments.title')} #${item.equipmentId}`
    )
  }
  protected countdown(item: WaitlistResponse): string {
    if (!item.notifiedAt) return '—'
    const remaining = Math.max(0, +new Date(item.notifiedAt) + 30 * 60_000 - Date.now())
    const minutes = Math.floor(remaining / 60_000)
    const seconds = Math.floor((remaining % 60_000) / 1000)
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }
  protected bookNow(item: WaitlistResponse): void {
    void this.router.navigate(['/app/bookings/new'], {
      queryParams: {
        labId: item.labId,
        equipmentId: item.equipmentId,
        start: item.requestedStart,
        end: item.requestedEnd,
        waitlistId: item.waitlistId,
      },
    })
  }
  protected cancel(item: WaitlistResponse): void {
    if (!confirm('Hủy lượt hàng chờ này?')) return
    this.api.cancelWaitlist(item.waitlistId).subscribe({
      next: () => {
        this.toast.success('Đã hủy hàng chờ')
        this.items.update((items) =>
          items.map((current) =>
            current.waitlistId === item.waitlistId ? { ...current, status: 'Cancelled' } : current,
          ),
        )
      },
      error: () => this.toast.error('Không thể hủy hàng chờ'),
    })
  }
}
