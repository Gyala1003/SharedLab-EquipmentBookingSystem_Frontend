import { Component, effect, input, output, inject, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { TranslatePipe } from '@ngx-translate/core'
import { ButtonComponent } from '../../shared/ui/button'
import { IconComponent } from '../../shared/ui/icon'
import { LabRoomsStore } from '../lab-rooms/lab-rooms.store'
import { EquipmentsStore } from '../equipments/equipments.store'
import type { BookingItemRequest, BookingPurposeType, CreateBookingRequest } from './bookings.types'

@Component({
  selector: 'app-booking-request-dialog',
  imports: [FormsModule, TranslatePipe, ButtonComponent, IconComponent],
  template: `
    @if (open()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
        <div class="w-full max-w-md rounded-xl bg-white p-5 shadow-xl max-h-[90vh] overflow-y-auto">
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-base font-semibold text-slate-900">
              {{ 'booking.requestTitle' | translate }}
            </h3>
            <button class="text-slate-400 hover:text-slate-600" (click)="close.emit()">
              <app-icon name="close" [size]="18" />
            </button>
          </div>

          <form class="flex flex-col gap-4" (ngSubmit)="submit()">
            <label class="flex flex-col gap-1 text-sm">
              {{ 'booking.purposeType' | translate }}
              <select
                [(ngModel)]="purposeType"
                name="purposeType"
                required
                class="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
              >
                <option value="ResearchProject">{{ 'purposeType.ResearchProject' | translate }}</option>
                <option value="CoursePractice">{{ 'purposeType.CoursePractice' | translate }}</option>
                <option value="SelfStudy">{{ 'purposeType.SelfStudy' | translate }}</option>
                <option value="Other">{{ 'purposeType.Other' | translate }}</option>
              </select>
            </label>

            <label class="flex flex-col gap-1 text-sm">
              {{ 'booking.purposeDescription' | translate }}
              <textarea
                [(ngModel)]="purposeDescription"
                name="purposeDescription"
                rows="3"
                required
                [placeholder]="'booking.reasonPlaceholder' | translate"
                class="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
              ></textarea>
            </label>

            <div class="grid grid-cols-2 gap-3">
              <label class="flex flex-col gap-1 text-sm">
                {{ 'booking.startTime' | translate }}
                <input
                  type="datetime-local"
                  [(ngModel)]="startTime"
                  name="startTime"
                  required
                  class="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                />
              </label>
              <label class="flex flex-col gap-1 text-sm">
                {{ 'booking.endTime' | translate }}
                <input
                  type="datetime-local"
                  [(ngModel)]="endTime"
                  name="endTime"
                  required
                  class="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                />
              </label>
            </div>

            <!-- Resource selection -->
            <div class="border-t border-slate-100 pt-3">
              <p class="mb-2 text-sm font-medium text-slate-700">{{ 'booking.selectResources' | translate }}</p>

              <label class="flex flex-col gap-1 text-sm mb-2">
                {{ 'booking.labRoom' | translate }}
                <select
                  [(ngModel)]="selectedLabId"
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
                {{ 'booking.equipment' | translate }}
                <select
                  [(ngModel)]="selectedEquipmentId"
                  name="equipmentId"
                  class="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                >
                  <option [ngValue]="null">-- {{ 'booking.none' | translate }} --</option>
                  @for (eq of equipmentsStore.items(); track eq.equipmentId) {
                    <option [ngValue]="eq.equipmentId">{{ eq.equipmentName }}</option>
                  }
                </select>
              </label>
            </div>

            <div class="mt-2 flex justify-end gap-2">
              <app-button type="button" variant="ghost" (click)="close.emit()">
                {{ 'booking.cancel' | translate }}
              </app-button>
              <app-button type="submit" [loading]="submitting()">
                {{ 'booking.submit' | translate }}
              </app-button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
})
export class BookingRequestDialog {
  readonly open = input(false)
  readonly submitting = input(false)
  readonly close = output<void>()
  readonly save = output<CreateBookingRequest>()

  protected readonly labRoomsStore = inject(LabRoomsStore)
  protected readonly equipmentsStore = inject(EquipmentsStore)

  protected purposeType: BookingPurposeType = 'CoursePractice'
  protected purposeDescription = ''
  protected startTime = ''
  protected endTime = ''
  protected selectedLabId: number | null = null
  protected selectedEquipmentId: number | null = null

  constructor() {
    effect(() => {
      if (this.open()) {
        this.purposeType = 'CoursePractice'
        this.purposeDescription = ''
        this.startTime = ''
        this.endTime = ''
        this.selectedLabId = null
        this.selectedEquipmentId = null
        void this.labRoomsStore.ensureLoaded()
        void this.equipmentsStore.ensureLoaded()
      }
    })
  }

  submit(): void {
    const items: BookingItemRequest[] = []
    if (this.selectedLabId) {
      items.push({ resourceType: 'LabRoom', labId: this.selectedLabId })
    }
    if (this.selectedEquipmentId) {
      items.push({ resourceType: 'Equipment', equipmentId: this.selectedEquipmentId })
    }
    this.save.emit({
      purposeType: this.purposeType,
      purposeDescription: this.purposeDescription,
      startTime: new Date(this.startTime).toISOString(),
      endTime: new Date(this.endTime).toISOString(),
      items,
    })
  }
}
