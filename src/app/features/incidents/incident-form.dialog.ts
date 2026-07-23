import { Component, effect, input, output, inject } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { TranslatePipe } from '@ngx-translate/core'
import { ButtonComponent } from '../../shared/ui/button'
import { IconComponent } from '../../shared/ui/icon'
import { EquipmentsStore } from '../equipments/equipments.store'
import type { CreateIncidentInput, IncidentSeverity } from './incidents.types'

@Component({
  selector: 'app-incident-form-dialog',
  imports: [FormsModule, TranslatePipe, ButtonComponent, IconComponent],
  template: `
    @if (open()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
        <div class="w-full max-w-md rounded-xl bg-white p-5 shadow-xl max-h-[90vh] overflow-y-auto">
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-base font-semibold text-slate-900">
              {{ 'incidents.addTitle' | translate }}
            </h3>
            <button class="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors" (click)="close.emit()">
              <app-icon name="close" [size]="16" />
            </button>
          </div>

          <form class="flex flex-col gap-4" (ngSubmit)="submit()">
            <label class="flex flex-col gap-1 text-sm">
              {{ 'incidents.equipment' | translate }}
              <select
                [(ngModel)]="equipmentId"
                name="equipmentId"
                required
                class="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
              >
                <option [ngValue]="null" disabled>-- {{ 'booking.none' | translate }} --</option>
                @for (eq of equipmentsStore.items(); track eq.equipmentId) {
                  <option [ngValue]="eq.equipmentId">{{ eq.equipmentName }}</option>
                }
              </select>
            </label>

            <label class="flex flex-col gap-1 text-sm">
              {{ 'incidents.severity' | translate }}
              <select
                [(ngModel)]="severity"
                name="severity"
                required
                class="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
              >
                <option value="Low">{{ 'incidents.severityLow' | translate }}</option>
                <option value="Medium">{{ 'incidents.severityMedium' | translate }}</option>
                <option value="High">{{ 'incidents.severityHigh' | translate }}</option>
                <option value="Critical">{{ 'incidents.severityCritical' | translate }}</option>
              </select>
            </label>

            <label class="flex flex-col gap-1 text-sm">
              {{ 'incidents.description' | translate }}
              <textarea
                [(ngModel)]="description"
                name="description"
                rows="4"
                required
                class="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
              ></textarea>
            </label>

            <label class="flex flex-col gap-1 text-sm">
              {{ 'incidents.bookingId' | translate }}
              <input
                type="number"
                [(ngModel)]="bookingId"
                name="bookingId"
                class="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                placeholder="Optional"
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
export class IncidentFormDialog {
  readonly open = input(false)
  readonly submitting = input(false)
  readonly close = output<void>()
  readonly save = output<CreateIncidentInput>()

  readonly initialBookingId = input<number | null>(null)
  readonly initialEquipmentId = input<number | null>(null)

  protected readonly equipmentsStore = inject(EquipmentsStore)

  protected equipmentId: number | null = null
  protected severity: IncidentSeverity = 'Medium'
  protected description = ''
  protected bookingId: number | null = null

  constructor() {
    effect(() => {
      if (this.open()) {
        this.equipmentId = this.initialEquipmentId() ?? null
        this.severity = 'Medium'
        this.description = ''
        this.bookingId = this.initialBookingId() ?? null
        void this.equipmentsStore.ensureLoaded()
      }
    })
  }

  submit(): void {
    if (!this.equipmentId) return
    this.save.emit({
      equipmentId: this.equipmentId,
      severity: this.severity,
      description: this.description,
      bookingId: this.bookingId ?? undefined,
    })
  }
}
