import { Component, OnInit, inject, signal } from '@angular/core'
import { DatePipe } from '@angular/common'
import { ActivatedRoute, RouterLink } from '@angular/router'
import { TranslatePipe } from '@ngx-translate/core'
import { AuthStore } from '../../core/auth/auth.store'
import { BadgeComponent, BadgeTone } from '../../shared/ui/badge'
import { ButtonComponent } from '../../shared/ui/button'
import { IconComponent } from '../../shared/ui/icon'
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
  selector: 'app-booking-detail-page',
  imports: [RouterLink, DatePipe, TranslatePipe, BadgeComponent, ButtonComponent, IconComponent, SpinnerComponent],
  template: `
    @if (store.status() === 'loading') {
      <div class="flex justify-center py-16"><app-spinner /></div>
    } @else if (store.detail(); as b) {
      <section class="mx-auto flex max-w-2xl flex-col gap-5">
        <a routerLink="/bookings/history" class="flex w-fit items-center gap-1 text-sm text-slate-500 hover:text-brand-600">
          <app-icon name="back" [size]="14" />
          {{ 'bookingDetail.back' | translate }}
        </a>

        <div class="flex items-start justify-between gap-3">
          <div>
            <h1 class="text-xl font-semibold text-slate-900">{{ 'bookingDetail.bookingId' | translate }} #{{ b.bookingId }}</h1>
            <p class="text-sm text-slate-500">{{ 'bookingDetail.requestedBy' | translate }} {{ b.userName }}</p>
          </div>
          <app-badge [tone]="STATUS_TONE[b.status] ?? 'slate'">{{ 'bookingStatus.' + b.status | translate }}</app-badge>
        </div>

        <div class="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 text-sm">
          <div class="flex items-center justify-between">
            <span class="flex items-center gap-2 text-slate-500">
              <app-icon name="calendar" [size]="15" />{{ 'bookingDetail.time' | translate }}
            </span>
            <span class="font-medium text-slate-900">
              {{ b.startTime | date: 'dd/MM/yyyy HH:mm' }} – {{ b.endTime | date: 'HH:mm' }}
            </span>
          </div>
          <div class="flex items-center justify-between">
            <span class="flex items-center gap-2 text-slate-500">
              <app-icon name="clock" [size]="15" />{{ 'bookingDetail.createdAt' | translate }}
            </span>
            <span class="font-medium text-slate-900">{{ b.createdAt | date: 'dd/MM/yyyy HH:mm' }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-slate-500">{{ 'bookingDetail.purposeType' | translate }}</span>
            <span class="font-medium text-slate-900">{{ b.purposeType }}</span>
          </div>
          <div class="border-t border-slate-100 pt-3">
            <p class="mb-1 text-slate-500">{{ 'bookingDetail.purposeDescription' | translate }}</p>
            <p class="text-slate-900">{{ b.purposeDescription }}</p>
          </div>

          @if (b.items.length > 0) {
            <div class="border-t border-slate-100 pt-3">
              <p class="mb-2 text-xs font-medium text-slate-500 uppercase">{{ 'bookingDetail.resources' | translate }}</p>
              @for (item of b.items; track item.bookingItemId) {
                <div class="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 mb-1 text-sm">
                  <span class="rounded bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">
                    {{ item.resourceType }}
                  </span>
                  <span class="text-slate-900">
                    {{ item.labName ?? item.equipmentName }}
                  </span>
                  @if (item.note) {
                    <span class="text-slate-500">— {{ item.note }}</span>
                  }
                </div>
              }
            </div>
          }

          @if (b.rejectionReason) {
            <div class="rounded-lg bg-red-50 p-3">
              <p class="mb-1 text-xs font-medium text-red-500">{{ 'bookingDetail.rejectionReason' | translate }}</p>
              <p class="text-red-700">{{ b.rejectionReason }}</p>
            </div>
          }

          @if (b.approvedByName) {
            <div class="rounded-lg bg-green-50 p-3">
              <p class="mb-1 text-xs font-medium text-green-600">{{ 'bookingDetail.approvedBy' | translate }}</p>
              <p class="text-green-700">{{ b.approvedByName }} · {{ b.approvedAt | date: 'dd/MM/yyyy HH:mm' }}</p>
            </div>
          }
        </div>

        @if (authStore.isAdminOrManager() && b.status === 'Pending') {
          <div class="flex justify-end gap-2">
            <app-button variant="danger" (click)="rejectBooking(b.bookingId)">
              {{ 'waitingList.reject' | translate }}
            </app-button>
            <app-button (click)="store.approve(b.bookingId)">
              {{ 'waitingList.approve' | translate }}
            </app-button>
          </div>
        }
      </section>
    }
  `,
})
export class BookingDetailPage implements OnInit {
  protected readonly store = inject(BookingsStore)
  protected readonly authStore = inject(AuthStore)
  private readonly route = inject(ActivatedRoute)
  protected readonly STATUS_TONE = STATUS_TONE

  private readonly id = signal(Number(this.route.snapshot.paramMap.get('id') ?? '0'))

  async ngOnInit(): Promise<void> {
    await this.store.loadById(this.id())
  }

  async rejectBooking(id: number): Promise<void> {
    const reason = prompt('Lý do từ chối:')
    if (reason) {
      await this.store.reject(id, { reason })
    }
  }
}
