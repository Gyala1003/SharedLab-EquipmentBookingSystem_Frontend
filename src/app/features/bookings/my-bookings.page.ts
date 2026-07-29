import { DatePipe, NgClass } from '@angular/common'
import { Component, OnInit, computed, inject, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { RouterLink } from '@angular/router'
import { SystemService } from '../../core/api/system.service'
import type { BookingResponse } from '../../core/api/system.models'
import { AuthStore } from '../../core/auth/auth.store'
import { LanguageStore } from '../../core/i18n/language.store'
import { TranslatePipe } from '../../core/i18n/translate.pipe'
import { DataStateComponent } from '../../shared/ui/data-state'
import { IconComponent } from '../../shared/ui/icon'
import { PageHeaderComponent } from '../../shared/ui/page-header'
import { StatusBadgeComponent } from '../../shared/ui/status-badge'
import { ToastService } from '../../shared/ui/toast.service'
import { labelOf } from '../../shared/utils/presentation'

@Component({
  selector: 'app-my-bookings-page',
  imports: [
    DatePipe,
    NgClass,
    FormsModule,
    RouterLink,
    PageHeaderComponent,
    IconComponent,
    StatusBadgeComponent,
    DataStateComponent,
    TranslatePipe,
  ],
  template: `
    <section class="space-y-6">
      <app-page-header [title]="'nav.myBooking' | t" [subtitle]="'bookings.mySubtitle' | t"
        ><a routerLink="/app/bookings/new" class="btn-primary"
          ><app-icon name="plus" [size]="17" /> {{ 'sidebar.quickBooking' | t }}</a
        ><a routerLink="/app/calendar" class="btn-secondary"
          ><app-icon name="calendar" [size]="17" /> {{ 'header.viewCalendar' | t }}</a
        ></app-page-header
      >
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div class="kpi-card">
          <p class="text-xs font-bold text-slate-400">{{ 'dashboard.totalBookings' | t }}</p>
          <p class="mt-2 text-3xl font-black text-slate-950">{{ bookings().length }}</p>
        </div>
        <div class="kpi-card">
          <p class="text-xs font-bold text-slate-400">{{ 'maintenances.scheduled' | t }}</p>
          <p class="mt-2 text-3xl font-black text-amber-600">{{ count('Pending') }}</p>
        </div>
        <div class="kpi-card">
          <p class="text-xs font-bold text-slate-400">{{ 'maintenances.completed' | t }}</p>
          <p class="mt-2 text-3xl font-black text-emerald-600">{{ count('Approved') }}</p>
        </div>
        <div class="kpi-card">
          <p class="text-xs font-bold text-slate-400">{{ 'maintenances.completed' | t }}</p>
          <p class="mt-2 text-3xl font-black text-indigo-600">{{ count('Completed') }}</p>
        </div>
      </div>
      <div class="card-surface overflow-hidden">
        <div
          class="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between"
        >
          <div class="flex gap-2 overflow-x-auto">
            @for (tab of tabs(); track tab.value) {
              <button
                class="shrink-0 rounded-xl px-3.5 py-2 text-xs font-black"
                [ngClass]="
                  status === tab.value
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                "
                (click)="status = tab.value"
              >
                {{ tab.label }}
                <span class="ml-1 opacity-70">{{
                  tab.value ? count(tab.value) : bookings().length
                }}</span>
              </button>
            }
          </div>
          <div class="relative sm:w-72">
            <span class="absolute top-3 left-3.5 text-slate-400"
              ><app-icon name="search" [size]="17" /></span
            ><input
              class="input-shell h-11 pl-10"
              [(ngModel)]="keyword"
              placeholder="{{ 'common.search' | t }}"
            />
          </div>
        </div>
        @if (loading()) {
          <div class="p-6"><div class="skeleton h-72 rounded-2xl"></div></div>
        } @else if (filtered().length === 0) {
          <div class="p-6">
            <app-data-state
              [title]="'common.noData' | t"
              [message]="'common.noData' | t"
              icon="calendar"
              ><a routerLink="/app/bookings/new" class="btn-primary mt-5">{{
                'sidebar.quickBooking' | t
              }}</a></app-data-state
            >
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="table-shell">
              <thead>
                <tr>
                  <th>{{ 'violations.booking' | t }}</th>
                  <th>{{ 'bookings.purpose' | t }}</th>
                  <th>{{ 'common.from' | t }}</th>
                  <th>{{ 'bookings.priority' | t }}</th>
                  <th>{{ 'common.status' | t }}</th>
                  <th>{{ 'bookings.createdAt' | t }}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                @for (booking of filtered(); track booking.bookingId) {
                  <tr>
                    <td>
                      <span class="font-black text-slate-900"
                        >#BK-{{ booking.bookingId.toString().padStart(5, '0') }}</span
                      >
                    </td>
                    <td>
                      <p class="font-bold text-slate-800">
                        {{ labelOf('purpose', booking.purposeType, languageStore.lang()) }}
                      </p>
                    </td>
                    <td>
                      <p class="font-bold text-slate-700">
                        {{ booking.startTime | date: 'HH:mm dd/MM/yyyy' }}
                      </p>
                      <p class="mt-1 text-xs text-slate-400">
                        {{ 'common.to' | t }} {{ booking.endTime | date: 'HH:mm dd/MM/yyyy' }}
                      </p>
                    </td>
                    <td>
                      <span
                        class="rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-black text-cyan-700"
                        >P{{ booking.priorityLevel ?? '—' }}</span
                      >
                    </td>
                    <td><app-status-badge [value]="booking.status" domain="booking" /></td>
                    <td>{{ booking.createdAt | date: 'dd/MM/yyyy' }}</td>
                    <td>
                      <a
                        [routerLink]="['/app/bookings', booking.bookingId]"
                        class="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:border-cyan-200 hover:text-cyan-700"
                        ><app-icon name="arrow-right" [size]="17"
                      /></a>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    </section>
  `,
})
export class MyBookingsPage implements OnInit {
  private readonly api = inject(SystemService)
  private readonly store = inject(AuthStore)
  protected readonly languageStore = inject(LanguageStore)
  private readonly toast = inject(ToastService)
  protected readonly bookings = signal<BookingResponse[]>([])
  protected readonly loading = signal(true)
  protected status = ''
  protected keyword = ''
  protected readonly tabs = computed(() => [
    { value: '', label: this.languageStore.t('common.all') },
    { value: 'Pending', label: labelOf('booking', 'Pending', this.languageStore.lang()) },
    { value: 'Approved', label: labelOf('booking', 'Approved', this.languageStore.lang()) },
    { value: 'Rejected', label: labelOf('booking', 'Rejected', this.languageStore.lang()) },
    { value: 'Cancelled', label: labelOf('booking', 'Cancelled', this.languageStore.lang()) },
    { value: 'Completed', label: labelOf('booking', 'Completed', this.languageStore.lang()) },
    { value: 'NoShow', label: labelOf('booking', 'NoShow', this.languageStore.lang()) },
  ])
  protected readonly filtered = computed(() => {
    const needle = this.keyword.trim().toLowerCase()
    return [...this.bookings()]
      .filter(
        (item) =>
          (!this.status || item.status === this.status) &&
          (!needle ||
            String(item.bookingId).includes(needle) ||
            labelOf('purpose', item.purposeType, this.languageStore.lang())
              .toLowerCase()
              .includes(needle)),
      )
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
  })
  protected readonly labelOf = labelOf
  ngOnInit(): void {
    const userId = this.store.user()?.userId
    if (!userId) return
    this.api.bookingsByUser(userId).subscribe({
      next: (items) => {
        this.bookings.set(items)
        this.loading.set(false)
      },
      error: () => {
        this.loading.set(false)
        this.toast.error('Không tải được booking của bạn')
      },
    })
  }
  protected count(status: string): number {
    return this.bookings().filter((item) => item.status === status).length
  }
}
