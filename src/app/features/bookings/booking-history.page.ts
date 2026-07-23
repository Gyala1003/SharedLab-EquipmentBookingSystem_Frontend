import { Component, OnInit, inject, signal } from '@angular/core'
import { DatePipe } from '@angular/common'
import { Router, RouterLink } from '@angular/router'
import { TranslatePipe } from '@ngx-translate/core'
import { AuthStore } from '../../core/auth/auth.store'
import { BadgeComponent, BadgeTone } from '../../shared/ui/badge'

import { IconComponent } from '../../shared/ui/icon'
import { SpinnerComponent } from '../../shared/ui/spinner'
import { BookingsStore } from './bookings.store'
import { BookingCalendarComponent } from './booking-calendar.component'
import { BookingRequestDialog } from './booking-request.dialog'
import { BookingResponse, CreateBookingRequest } from './bookings.types'
import { ButtonComponent } from '../../shared/ui/button'
import { ViolationsStore } from '../violations/violations.store'

const STATUS_TONE: Record<string, BadgeTone> = {
  Approved: 'green',
  Pending: 'amber',
  Rejected: 'red',
  Cancelled: 'slate',
  Completed: 'green',
  CheckedIn: 'green',
  NoShow: 'red',
}

@Component({
  selector: 'app-booking-history-page',
  imports: [RouterLink, DatePipe, TranslatePipe, BadgeComponent, IconComponent, SpinnerComponent, BookingCalendarComponent, BookingRequestDialog, ButtonComponent],
  template: `
    <section class="flex flex-col gap-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 class="text-xl font-semibold text-slate-900">{{ 'myBookings.title' | translate }}</h1>
          <p class="text-sm text-slate-500">{{ 'myBookings.subtitle' | translate }}</p>
        </div>

        <div class="flex items-center gap-3">
          @if (authStore.isRequester()) {
            <div class="flex items-center gap-2">
              <app-button 
                (click)="requestDialogOpen.set(true)"
                [disabled]="violationsStore.isUserLocked(authStore.user()?.userId ?? 0)"
              >
                <app-icon name="plus" [size]="16" />
                {{ 'booking.requestTitle' | translate }}
              </app-button>
              @if (violationsStore.isUserLocked(authStore.user()?.userId ?? 0)) {
                <span class="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded-md border border-red-200">
                  🚫 Tài khoản bị khoá đặt lịch do vi phạm nội quy!
                </span>
              }
            </div>
          }

          <!-- View toggle -->
          <div class="flex items-center rounded-lg border border-slate-200 bg-white p-0.5">
            <button
              class="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
              [class.bg-brand-500]="viewMode() === 'list'"
              [class.text-white]="viewMode() === 'list'"
              [class.text-slate-600]="viewMode() !== 'list'"
              (click)="viewMode.set('list')"
            >
              <app-icon name="catalog" [size]="14" />
              {{ 'myBookings.listView' | translate }}
            </button>
            <button
              class="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
              [class.bg-brand-500]="viewMode() === 'calendar'"
              [class.text-white]="viewMode() === 'calendar'"
              [class.text-slate-600]="viewMode() !== 'calendar'"
              (click)="viewMode.set('calendar')"
            >
              <app-icon name="calendar" [size]="14" />
              {{ 'myBookings.calendarView' | translate }}
            </button>
          </div>
        </div>
      </div>

      @if (store.status() === 'loading') {
        <div class="flex justify-center py-16"><app-spinner /></div>
      } @else if (viewMode() === 'calendar') {
        <!-- Calendar view -->
        <app-booking-calendar (bookingClick)="navigateToBooking($event)" />
      } @else {
        <!-- List view -->
        @if (sorted().length === 0) {
          <div class="rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center text-sm text-slate-500">
            {{ 'myBookings.empty' | translate }}
          </div>
        } @else {
          <div class="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <table class="w-full text-left text-sm">
              <thead class="bg-slate-50 text-slate-500">
                <tr>
                  <th class="px-4 py-3 font-medium">ID</th>
                  <th class="px-4 py-3 font-medium">{{ 'bookingDetail.purposeType' | translate }}</th>
                  <th class="px-4 py-3 font-medium">{{ 'history.time' | translate }}</th>
                  <th class="px-4 py-3 font-medium">{{ 'history.status' | translate }}</th>
                  <th class="px-4 py-3 font-medium text-right"></th>
                </tr>
              </thead>
              <tbody>
                @for (b of sorted(); track b.bookingId) {
                  <tr class="border-t border-slate-100">
                    <td class="px-4 py-3">
                      <a [routerLink]="['/bookings', b.bookingId]" class="font-medium text-brand-600 hover:underline">
                        #{{ b.bookingId }}
                      </a>
                    </td>
                    <td class="px-4 py-3 text-slate-600">{{ b.purposeType }}</td>
                    <td class="px-4 py-3 text-slate-600">
                      {{ b.startTime | date: 'dd/MM/yy HH:mm' }} – {{ b.endTime | date: 'HH:mm' }}
                    </td>
                    <td class="px-4 py-3">
                      <div class="flex flex-col gap-1 items-start">
                        <app-badge [tone]="STATUS_TONE[b.status] ?? 'slate'">
                          {{ 'bookingStatus.' + b.status | translate }}
                        </app-badge>
                        @if (b.status === 'Rejected') {
                          <span class="text-xs font-medium text-red-600">
                            Lý do từ chối: {{ b.rejectionReason || 'Yêu cầu không được Lab Manager chấp thuận' }}
                          </span>
                        }
                      </div>
                    </td>
                    <td class="px-4 py-3 text-right">
                      @if (canCheckIn(b)) {
                        <button
                          class="inline-flex items-center gap-1 rounded-md bg-brand-500 px-2 py-1 text-xs font-medium text-white hover:bg-brand-600 disabled:opacity-50"
                          [disabled]="store.mutating()"
                          (click)="store.checkIn(b.bookingId)"
                        >
                          <app-icon name="checkin" [size]="14" />
                          {{ 'bookingDetail.checkIn' | translate }}
                        </button>
                      }
                      @if (canCheckOut(b)) {
                        <button
                          class="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200 disabled:opacity-50"
                          [disabled]="store.mutating()"
                          (click)="store.checkOut(b.bookingId)"
                        >
                          <app-icon name="checkout" [size]="14" />
                          {{ 'bookingDetail.checkOut' | translate }}
                        </button>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      }
    </section>

    <app-booking-request-dialog
      [open]="requestDialogOpen()"
      [submitting]="store.mutating()"
      (close)="requestDialogOpen.set(false)"
      (save)="onCreateBooking($event)"
    />
  `,
})
export class BookingHistoryPage implements OnInit {
  protected readonly store = inject(BookingsStore)
  protected readonly authStore = inject(AuthStore)
  protected readonly violationsStore = inject(ViolationsStore)
  private readonly router = inject(Router)
  protected readonly STATUS_TONE = STATUS_TONE
  protected readonly viewMode = signal<'list' | 'calendar'>('list')
  protected readonly requestDialogOpen = signal(false)

  protected sorted() {
    const userId = this.authStore.user()?.userId
    return this.store.items()
      .filter((b) => b.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }

  canCheckIn(b: BookingResponse): boolean {
    return this.authStore.isRequester() && b.status === 'Approved'
  }

  canCheckOut(b: BookingResponse): boolean {
    return this.authStore.isRequester() && b.status === 'CheckedIn'
  }

  async ngOnInit(): Promise<void> {
    const user = this.authStore.user()
    if (user) {
      await this.store.loadByUserId(user.userId)
      await this.violationsStore.load()
    }
  }

  async onCreateBooking(request: CreateBookingRequest): Promise<void> {
    await this.store.create(request)
    this.requestDialogOpen.set(false)
  }

  navigateToBooking(bookingId: number): void {
    void this.router.navigate(['/bookings', bookingId])
  }
}
