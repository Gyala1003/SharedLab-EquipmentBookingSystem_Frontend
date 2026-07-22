import { Component, OnInit, inject } from '@angular/core'
import { DatePipe } from '@angular/common'
import { RouterLink } from '@angular/router'
import { TranslatePipe } from '@ngx-translate/core'
import { BadgeComponent, BadgeTone } from '../../shared/ui/badge'
import { SpinnerComponent } from '../../shared/ui/spinner'
import { BookingsStore } from './bookings.store'

const STATUS_TONE: Record<string, BadgeTone> = {
  Approved: 'green',
  Pending: 'amber',
  Rejected: 'red',
  Cancelled: 'slate',
  Completed: 'green',
  NoShow: 'red',
}

@Component({
  selector: 'app-booking-waiting-list-page',
  imports: [RouterLink, DatePipe, TranslatePipe, BadgeComponent, SpinnerComponent],
  template: `
    <section class="flex flex-col gap-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 class="text-xl font-semibold text-slate-900">{{ 'waitingList.title' | translate }}</h1>
          <p class="text-sm text-slate-500">{{ 'waitingList.subtitle' | translate }}</p>
        </div>
        <span class="rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700">
          {{ store.pending().length }} {{ 'waitingList.pendingCount' | translate }}
        </span>
      </div>

      @if (store.status() === 'loading') {
        <div class="flex justify-center py-16"><app-spinner /></div>
      } @else if (sorted().length === 0) {
        <div class="rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center text-sm text-slate-500">
          {{ 'waitingList.empty' | translate }}
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
                <th class="px-4 py-3 text-right font-medium">{{ 'waitingList.actions' | translate }}</th>
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
                    <app-badge [tone]="STATUS_TONE[b.status] ?? 'slate'">
                      {{ 'bookingStatus.' + b.status | translate }}
                    </app-badge>
                  </td>
                  <td class="px-4 py-3 text-right">
                    @if (b.status === 'Pending') {
                      <button
                        class="mr-3 font-medium text-emerald-600 hover:underline"
                        (click)="store.approve(b.bookingId)"
                      >
                        {{ 'waitingList.approve' | translate }}
                      </button>
                      <button
                        class="font-medium text-red-600 hover:underline"
                        (click)="rejectBooking(b.bookingId)"
                      >
                        {{ 'waitingList.reject' | translate }}
                      </button>
                    } @else {
                      <a [routerLink]="['/bookings', b.bookingId]" class="text-slate-400 hover:text-brand-600">
                        {{ 'waitingList.view' | translate }}
                      </a>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </section>
  `,
})
export class BookingWaitingListPage implements OnInit {
  protected readonly store = inject(BookingsStore)
  protected readonly STATUS_TONE = STATUS_TONE

  protected sorted() {
    return [...this.store.items()].sort((a, b) => {
      if (a.status === 'Pending' && b.status !== 'Pending') return -1
      if (a.status !== 'Pending' && b.status === 'Pending') return 1
      return b.createdAt.localeCompare(a.createdAt)
    })
  }

  async ngOnInit(): Promise<void> {
    await this.store.loadAll()
  }

  async rejectBooking(id: number): Promise<void> {
    const reason = prompt('Lý do từ chối:')
    if (reason) {
      await this.store.reject(id, { reason })
    }
  }
}
