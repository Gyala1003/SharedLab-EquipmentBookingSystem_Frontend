import { Component, OnInit, inject, signal } from '@angular/core'
import { ActivatedRoute, Router, RouterLink } from '@angular/router'
import { TranslatePipe } from '@ngx-translate/core'
import { AuthStore } from '../../core/auth/auth.store'
import { BadgeComponent, BadgeTone } from '../../shared/ui/badge'
import { ButtonComponent } from '../../shared/ui/button'
import { IconComponent } from '../../shared/ui/icon'
import { SpinnerComponent } from '../../shared/ui/spinner'
import { LabRoomsStore } from './lab-rooms.store'
import { BookingRequestDialog } from '../bookings/booking-request.dialog'
import { BookingsStore } from '../bookings/bookings.store'
import type { CreateBookingRequest } from '../bookings/bookings.types'

const STATUS_TONE: Record<string, BadgeTone> = {
  Available: 'green',
  Unavailable: 'red',
  Maintenance: 'amber',
  Inactive: 'slate',
}

@Component({
  selector: 'app-lab-room-detail-page',
  imports: [RouterLink, TranslatePipe, BadgeComponent, ButtonComponent, IconComponent, SpinnerComponent, BookingRequestDialog],
  template: `
    @if (store.status() === 'loading') {
      <div class="flex justify-center py-16"><app-spinner /></div>
    } @else if (store.selected(); as room) {
      <section class="mx-auto flex max-w-2xl flex-col gap-5">
        <a routerLink="/lab-rooms" class="flex w-fit items-center gap-1 text-sm text-slate-500 hover:text-brand-600">
          <app-icon name="back" [size]="14" />
          {{ 'labRooms.backToList' | translate }}
        </a>

        <div class="flex items-start justify-between gap-3">
          <div>
            <h1 class="text-xl font-semibold text-slate-900">{{ room.labName }}</h1>
            <p class="text-sm text-slate-500">{{ room.roomCode }}</p>
          </div>
          <div class="flex items-center gap-2">
            <app-badge [tone]="STATUS_TONE[room.status] ?? 'slate'">{{ room.status }}</app-badge>
            @if (authStore.isRequester() && room.status === 'Available') {
              <app-button (click)="dialogOpen.set(true)">
                <app-icon name="plus" [size]="16" />
                {{ 'booking.requestTitle' | translate }}
              </app-button>
            }
          </div>
        </div>

        <div class="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 text-sm">
          <div class="flex items-center justify-between">
            <span class="flex items-center gap-2 text-slate-500">
              <app-icon name="mapPin" [size]="15" />
              {{ 'labRooms.location' | translate }}
            </span>
            <span class="font-medium text-slate-900">{{ room.location }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="flex items-center gap-2 text-slate-500">
              <app-icon name="users" [size]="15" />
              {{ 'labRooms.capacity' | translate }}
            </span>
            <span class="font-medium text-slate-900">{{ room.capacity }} {{ 'labRooms.seats' | translate }}</span>
          </div>
          @if (room.managerName) {
            <div class="flex items-center justify-between">
              <span class="text-slate-500">{{ 'labRooms.manager' | translate }}</span>
              <span class="font-medium text-slate-900">{{ room.managerName }}</span>
            </div>
          }
          @if (room.description) {
            <div class="border-t border-slate-100 pt-3">
              <p class="mb-1 text-slate-500">{{ 'labRooms.description' | translate }}</p>
              <p class="text-slate-900">{{ room.description }}</p>
            </div>
          }
          @if (room.usageGuideline) {
            <div class="rounded-lg bg-slate-50 p-3">
              <p class="mb-1 text-xs font-medium text-slate-500">{{ 'labRooms.usageGuideline' | translate }}</p>
              <p class="text-slate-700">{{ room.usageGuideline }}</p>
            </div>
          }
        </div>

        @if (authStore.isAdmin()) {
          <div class="flex justify-end gap-2">
            <a [routerLink]="['/lab-rooms', room.labId, 'edit']">
              <app-button variant="secondary">{{ 'common.edit' | translate }}</app-button>
            </a>
            <app-button variant="danger" (click)="confirmDelete(room.labId)">
              {{ 'common.delete' | translate }}
            </app-button>
          </div>
        }
      </section>

      <app-booking-request-dialog
        [open]="dialogOpen()"
        [submitting]="bookingsStore.mutating()"
        (close)="dialogOpen.set(false)"
        (save)="onCreateBooking($event)"
      />
    }
  `,
})
export class LabRoomDetailPage implements OnInit {
  protected readonly store = inject(LabRoomsStore)
  protected readonly authStore = inject(AuthStore)
  protected readonly bookingsStore = inject(BookingsStore)
  private readonly route = inject(ActivatedRoute)
  private readonly router = inject(Router)
  protected readonly STATUS_TONE = STATUS_TONE

  protected readonly dialogOpen = signal(false)
  private readonly id = signal(Number(this.route.snapshot.paramMap.get('id') ?? '0'))

  async ngOnInit(): Promise<void> {
    await this.store.loadById(this.id())
  }

  async onCreateBooking(request: CreateBookingRequest): Promise<void> {
    await this.bookingsStore.create(request)
    this.dialogOpen.set(false)
    void this.router.navigate(['/bookings/history'])
  }

  async confirmDelete(id: number): Promise<void> {
    if (confirm('Bạn có chắc muốn xóa phòng lab này?')) {
      await this.store.remove(id)
      window.history.back()
    }
  }
}
