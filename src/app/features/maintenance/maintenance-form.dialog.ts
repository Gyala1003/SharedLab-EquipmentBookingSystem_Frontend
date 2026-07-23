import { Component, effect, input, output, inject } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { TranslatePipe } from '@ngx-translate/core'
import { ButtonComponent } from '../../shared/ui/button'
import { IconComponent } from '../../shared/ui/icon'
import { LabRoomsStore } from '../lab-rooms/lab-rooms.store'
import { EquipmentsStore } from '../equipments/equipments.store'
import type { CreateMaintenanceInput } from './maintenance.types'

@Component({
  selector: 'app-maintenance-form-dialog',
  imports: [FormsModule, TranslatePipe, ButtonComponent, IconComponent],
  template: `
    @if (open()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
        <div class="w-full max-w-md rounded-xl bg-white p-5 shadow-xl max-h-[90vh] overflow-y-auto">
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-base font-semibold text-slate-900">
              {{ 'maintenance.addTitle' | translate }}
            </h3>
            <button class="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors" (click)="close.emit()">
              <app-icon name="close" [size]="16" />
            </button>
          </div>

          <form class="flex flex-col gap-4" (ngSubmit)="submit()">
            <label class="flex flex-col gap-1 text-sm">
              {{ 'maintenance.titleField' | translate }}
              <input
                type="text"
                [(ngModel)]="title"
                name="title"
                required
                class="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
              />
            </label>

            <label class="flex flex-col gap-1 text-sm">
              {{ 'maintenance.description' | translate }}
              <textarea
                [(ngModel)]="description"
                name="description"
                rows="3"
                required
                class="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
              ></textarea>
            </label>

            <label class="flex flex-col gap-1 text-sm">
              {{ 'maintenance.labRoom' | translate }}
              <select
                [(ngModel)]="labId"
                name="labId"
                class="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
              >
                <option [ngValue]="null">-- {{ 'booking.none' | translate }} --</option>
                @for (room of labRoomsStore.items(); track room.labId) {
                  <option [ngValue]="room.labId">{{ room.labName }} ({{ room.roomCode }})</option>
                }
              </select>
            </label>

            <label class="flex flex-col gap-1 text-sm">
              {{ 'maintenance.equipment' | translate }}
              <select
                [(ngModel)]="equipmentId"
                name="equipmentId"
                class="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
              >
                <option [ngValue]="null">-- {{ 'booking.none' | translate }} --</option>
                @for (eq of equipmentsStore.items(); track eq.equipmentId) {
                  <option [ngValue]="eq.equipmentId">{{ eq.equipmentName }}</option>
                }
              </select>
            </label>

            <div class="grid grid-cols-2 gap-3">
              <label class="flex flex-col gap-1 text-sm">
                {{ 'maintenance.scheduledStart' | translate }}
                <input
                  type="datetime-local"
                  [(ngModel)]="scheduledStart"
                  name="scheduledStart"
                  required
                  class="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                />
              </label>
              <label class="flex flex-col gap-1 text-sm">
                {{ 'maintenance.scheduledEnd' | translate }}
                <input
                  type="datetime-local"
                  [(ngModel)]="scheduledEnd"
                  name="scheduledEnd"
                  required
                  class="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                />
              </label>
            </div>

            <label class="flex flex-col gap-1 text-sm">
              {{ 'maintenance.cost' | translate }}
              <input
                type="number"
                [(ngModel)]="cost"
                name="cost"
                min="0"
                class="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
              />
            </label>

            <div class="mt-2 flex justify-end gap-2">
              <app-button type="button" variant="ghost" (click)="close.emit()">
                {{ 'common.cancel' | translate }}
              </app-button>
              <app-button type="submit" [loading]="submitting()">
                {{ 'common.save' | translate }}
              </app-button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
})
export class MaintenanceFormDialog {
  readonly open = input(false)
  readonly submitting = input(false)
  readonly close = output<void>()
  readonly save = output<CreateMaintenanceInput>()

  protected readonly labRoomsStore = inject(LabRoomsStore)
  protected readonly equipmentsStore = inject(EquipmentsStore)

  protected title = ''
  protected description = ''
  protected labId: number | null = null
  protected equipmentId: number | null = null
  protected scheduledStart = ''
  protected scheduledEnd = ''
  protected cost: number | null = null

  constructor() {
    effect(() => {
      if (this.open()) {
        this.title = ''
        this.description = ''
        this.labId = null
        this.equipmentId = null
        this.scheduledStart = ''
        this.scheduledEnd = ''
        this.cost = null
        void this.labRoomsStore.ensureLoaded()
        void this.equipmentsStore.ensureLoaded()
      }
    })
  }

  submit(): void {
    this.save.emit({
      labId: this.labId ?? undefined,
      equipmentId: this.equipmentId ?? undefined,
      title: this.title,
      description: this.description,
      scheduledStart: new Date(this.scheduledStart).toISOString(),
      scheduledEnd: new Date(this.scheduledEnd).toISOString(),
      cost: this.cost ?? undefined,
    })
  }
}
