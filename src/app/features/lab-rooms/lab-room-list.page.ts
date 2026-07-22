import { Component, OnInit, inject } from '@angular/core'
import { RouterLink } from '@angular/router'
import { TranslatePipe } from '@ngx-translate/core'
import { AuthStore } from '../../core/auth/auth.store'
import { BadgeComponent, BadgeTone } from '../../shared/ui/badge'
import { ButtonComponent } from '../../shared/ui/button'
import { CardComponent } from '../../shared/ui/card'
import { IconComponent } from '../../shared/ui/icon'
import { SpinnerComponent } from '../../shared/ui/spinner'
import { LabRoomsStore } from './lab-rooms.store'

const STATUS_TONE: Record<string, BadgeTone> = {
  Available: 'green',
  Unavailable: 'red',
  Maintenance: 'amber',
  Inactive: 'slate',
}

@Component({
  selector: 'app-lab-room-list-page',
  imports: [RouterLink, TranslatePipe, BadgeComponent, ButtonComponent, IconComponent, SpinnerComponent],
  template: `
    <section class="flex flex-col gap-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 class="text-xl font-semibold text-slate-900">{{ 'labRooms.title' | translate }}</h1>
          <p class="text-sm text-slate-500">{{ 'labRooms.subtitle' | translate }}</p>
        </div>
        @if (authStore.isAdmin()) {
          <a routerLink="/lab-rooms/new">
            <app-button>
              <span class="flex items-center gap-2">
                <app-icon name="plus" [size]="16" />
                {{ 'labRooms.add' | translate }}
              </span>
            </app-button>
          </a>
        }
      </div>

      @switch (store.status()) {
        @case ('loading') {
          <div class="flex justify-center py-16"><app-spinner /></div>
        }
        @case ('error') {
          <div class="flex flex-col items-center gap-3 p-8">
            <p class="text-red-600">{{ 'common.error' | translate }}</p>
            <app-button variant="secondary" (click)="store.load()">
              {{ 'common.retry' | translate }}
            </app-button>
          </div>
        }
        @default {
          @if (store.isEmpty()) {
            <div class="rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center text-sm text-slate-500">
              {{ 'labRooms.empty' | translate }}
            </div>
          } @else {
            <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              @for (room of store.items(); track room.labId) {
                <a
                  [routerLink]="['/lab-rooms', room.labId]"
                  class="group flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md"
                >
                  <div class="flex items-start justify-between gap-2">
                    <div class="min-w-0">
                      <p class="truncate text-sm font-semibold text-slate-900 group-hover:text-brand-600">
                        {{ room.labName }}
                      </p>
                      <p class="text-xs text-slate-500">{{ room.roomCode }}</p>
                    </div>
                    <app-badge [tone]="STATUS_TONE[room.status] ?? 'slate'">
                      {{ room.status }}
                    </app-badge>
                  </div>
                  <div class="flex items-center gap-4 text-xs text-slate-500">
                    <span class="flex items-center gap-1">
                      <app-icon name="mapPin" [size]="13" />
                      {{ room.location }}
                    </span>
                    <span class="flex items-center gap-1">
                      <app-icon name="users" [size]="13" />
                      {{ room.capacity }} {{ 'labRooms.seats' | translate }}
                    </span>
                  </div>
                </a>
              }
            </div>
          }
        }
      }
    </section>
  `,
})
export class LabRoomListPage implements OnInit {
  protected readonly store = inject(LabRoomsStore)
  protected readonly authStore = inject(AuthStore)
  protected readonly STATUS_TONE = STATUS_TONE

  async ngOnInit(): Promise<void> {
    await this.store.load()
  }
}
