import { Component, OnInit, inject } from '@angular/core'
import { DatePipe } from '@angular/common'
import { RouterLink } from '@angular/router'
import { TranslatePipe } from '@ngx-translate/core'
import { AuthStore } from '../../core/auth/auth.store'
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
  selector: 'app-booking-history-page',
  imports: [RouterLink, DatePipe, TranslatePipe, BadgeComponent, SpinnerComponent],
  template: `
    <section class="flex flex-col gap-4">
      <div>
        <h1 class="text-xl font-semibold text-slate-900">{{ 'history.title' | translate }}</h1>
        <p class="text-sm text-slate-500">{{ 'history.subtitle' | translate }}</p>
      </div>

      @if (store.status() === 'loading') {
        <div class="flex justify-center py-16"><app-spinner /></div>
      } @else if (sorted().length === 0) {
        <div class="rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center text-sm text-slate-500">
          {{ 'history.empty' | translate }}
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
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </section>
  `,
})
export class BookingHistoryPage implements OnInit {
  protected readonly store = inject(BookingsStore)
  private readonly authStore = inject(AuthStore)
  protected readonly STATUS_TONE = STATUS_TONE

  protected sorted() {
    return [...this.store.items()].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }

  async ngOnInit(): Promise<void> {
    const user = this.authStore.user()
    if (user) {
      await this.store.loadByUserId(user.userId)
    }
  }
}
