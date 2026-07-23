import { Component, OnInit, inject } from '@angular/core'
import { DatePipe } from '@angular/common'
import { RouterLink } from '@angular/router'
import { TranslatePipe } from '@ngx-translate/core'
import { AuthStore } from '../../core/auth/auth.store'
import { LabRoomsStore } from '../lab-rooms/lab-rooms.store'
import { EquipmentsStore } from '../equipments/equipments.store'
import { BookingsStore } from '../bookings/bookings.store'
import { BadgeComponent, BadgeTone } from '../../shared/ui/badge'
import { IconComponent } from '../../shared/ui/icon'

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
  selector: 'app-home-page',
  imports: [RouterLink, DatePipe, TranslatePipe, BadgeComponent, IconComponent],
  template: `
    <section class="flex flex-col gap-5">
      <div>
        <h1 class="text-xl font-semibold text-slate-900">{{ 'home.title' | translate }}</h1>
        <p class="text-sm text-slate-500">{{ 'home.subtitle' | translate }}</p>
      </div>

      <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div class="rounded-xl border border-slate-200 bg-white p-4">
          <p class="text-xs text-slate-500">{{ 'home.totalLabRooms' | translate }}</p>
          <p class="mt-1 text-2xl font-semibold text-slate-900">{{ labRoomsStore.items().length }}</p>
        </div>
        <div class="rounded-xl border border-slate-200 bg-white p-4">
          <p class="text-xs text-slate-500">{{ 'home.totalEquipments' | translate }}</p>
          <p class="mt-1 text-2xl font-semibold text-slate-900">{{ equipmentsStore.items().length }}</p>
        </div>
        <div class="rounded-xl border border-slate-200 bg-white p-4">
          <p class="text-xs text-slate-500">{{ 'home.available' | translate }}</p>
          <p class="mt-1 text-2xl font-semibold text-emerald-600">
            {{ labRoomsStore.availableCount() + equipmentsStore.availableCount() }}
          </p>
        </div>
        <div class="rounded-xl border border-brand-100 bg-brand-50 p-4">
          <p class="text-xs text-brand-700">{{ 'home.pendingBookings' | translate }}</p>
          <p class="mt-1 text-2xl font-semibold text-brand-700">{{ bookingsStore.pending().length }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <!-- Recent bookings (not for Admin) -->
        @if (!authStore.isAdmin()) {
          <div class="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-2">
            <div class="mb-3 flex items-center justify-between">
              <h3 class="text-sm font-semibold text-slate-900">{{ 'home.recentBookings' | translate }}</h3>
              <a routerLink="/bookings/history" class="text-sm text-brand-600 hover:underline">
                {{ 'home.viewAll' | translate }}
              </a>
            </div>

            @if (recentBookings().length === 0) {
              <p class="py-8 text-center text-sm text-slate-500">{{ 'home.noBookings' | translate }}</p>
            } @else {
              <div class="flex flex-col divide-y divide-slate-100">
                @for (b of recentBookings(); track b.bookingId) {
                  <a
                    [routerLink]="['/bookings', b.bookingId]"
                    class="flex items-center justify-between gap-3 py-3 hover:bg-slate-50"
                  >
                    <div class="min-w-0">
                      <p class="truncate text-sm font-medium text-slate-900">#{{ b.bookingId }} · {{ b.purposeType }}</p>
                      <p class="truncate text-xs text-slate-500">
                        {{ b.startTime | date: 'dd/MM HH:mm' }} – {{ b.endTime | date: 'HH:mm' }}
                      </p>
                    </div>
                    <app-badge [tone]="STATUS_TONE[b.status] ?? 'slate'">
                      {{ 'bookingStatus.' + b.status | translate }}
                    </app-badge>
                  </a>
                }
              </div>
            }
          </div>
        }

        <!-- Admin: stats panel instead of bookings -->
        @if (authStore.isAdmin()) {
          <div class="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-2">
            <h3 class="mb-3 text-sm font-semibold text-slate-900">{{ 'nav.adminSection' | translate }}</h3>
            <p class="py-8 text-center text-sm text-slate-500">{{ 'home.subtitle' | translate }}</p>
          </div>
        }

        <!-- Quick actions sidebar -->
        <div class="flex flex-col gap-3">
          <!-- Common actions -->
          <a
            routerLink="/lab-rooms"
            class="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 hover:bg-slate-50"
          >
            <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <app-icon name="catalog" [size]="18" />
            </div>
            <div>
              <p class="text-sm font-medium text-slate-900">{{ 'home.browseLabRooms' | translate }}</p>
              <p class="text-xs text-slate-500">{{ 'home.browseLabRoomsHint' | translate }}</p>
            </div>
          </a>
          <a
            routerLink="/equipments"
            class="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 hover:bg-slate-50"
          >
            <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <app-icon name="equipment" [size]="18" />
            </div>
            <div>
              <p class="text-sm font-medium text-slate-900">{{ 'home.browseEquipments' | translate }}</p>
              <p class="text-xs text-slate-500">{{ 'home.browseEquipmentsHint' | translate }}</p>
            </div>
          </a>

          <!-- Requester: My Bookings -->
          @if (!authStore.isAdmin()) {
            <a
              routerLink="/bookings/history"
              class="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 hover:bg-slate-50"
            >
              <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <app-icon name="bookings" [size]="18" />
              </div>
              <div>
                <p class="text-sm font-medium text-slate-900">{{ 'home.myBookings' | translate }}</p>
                <p class="text-xs text-slate-500">{{ 'home.myBookingsHint' | translate }}</p>
              </div>
            </a>
          }

          <!-- Lab Manager quick actions -->
          @if (authStore.isLabManager()) {
            <a
              routerLink="/manager/approvals"
              class="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 hover:bg-slate-50"
            >
              <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <app-icon name="clock" [size]="18" />
              </div>
              <div>
                <p class="text-sm font-medium text-slate-900">{{ 'home.reviewRequests' | translate }}</p>
                <p class="text-xs text-slate-500">{{ 'home.reviewRequestsHint' | translate }}</p>
              </div>
            </a>
            <a
              routerLink="/manager/incidents"
              class="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 hover:bg-slate-50"
            >
              <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600">
                <app-icon name="alert" [size]="18" />
              </div>
              <div>
                <p class="text-sm font-medium text-slate-900">{{ 'home.manageIncidents' | translate }}</p>
                <p class="text-xs text-slate-500">{{ 'home.manageIncidentsHint' | translate }}</p>
              </div>
            </a>
            <a
              routerLink="/manager/maintenance"
              class="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 hover:bg-slate-50"
            >
              <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <app-icon name="maintenance" [size]="18" />
              </div>
              <div>
                <p class="text-sm font-medium text-slate-900">{{ 'home.manageMaintenance' | translate }}</p>
                <p class="text-xs text-slate-500">{{ 'home.manageMaintenanceHint' | translate }}</p>
              </div>
            </a>
          }

          <!-- Admin quick actions -->
          @if (authStore.isAdmin()) {
            <a
              routerLink="/admin/policies"
              class="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 hover:bg-slate-50"
            >
              <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <app-icon name="shield" [size]="18" />
              </div>
              <div>
                <p class="text-sm font-medium text-slate-900">{{ 'home.managePolicies' | translate }}</p>
                <p class="text-xs text-slate-500">{{ 'home.managePoliciesHint' | translate }}</p>
              </div>
            </a>
          }
        </div>
      </div>
    </section>
  `,
})
export class HomePage implements OnInit {
  protected readonly authStore = inject(AuthStore)
  protected readonly labRoomsStore = inject(LabRoomsStore)
  protected readonly equipmentsStore = inject(EquipmentsStore)
  protected readonly bookingsStore = inject(BookingsStore)
  protected readonly STATUS_TONE = STATUS_TONE

  protected recentBookings() {
    return [...this.bookingsStore.items()]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 6)
  }

  async ngOnInit(): Promise<void> {
    const user = this.authStore.user()
    await Promise.all([
      this.labRoomsStore.ensureLoaded(),
      this.equipmentsStore.ensureLoaded(),
      user && !this.authStore.isAdmin() ? this.bookingsStore.loadByUserId(user.userId) : Promise.resolve(),
    ])
  }
}
