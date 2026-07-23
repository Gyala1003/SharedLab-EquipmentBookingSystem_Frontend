import { Component, effect, input, output, inject, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { TranslatePipe } from '@ngx-translate/core'
import { ButtonComponent } from '../../shared/ui/button'
import { IconComponent } from '../../shared/ui/icon'
import { LabRoomsStore } from '../lab-rooms/lab-rooms.store'
import type { CreateEquipmentInput } from './equipments.types'

@Component({
  selector: 'app-equipment-form-dialog',
  imports: [FormsModule, TranslatePipe, ButtonComponent, IconComponent],
  template: `
    @if (open()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
        <div class="w-full max-w-md rounded-xl bg-white p-5 shadow-xl max-h-[90vh] overflow-y-auto">
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-base font-semibold text-slate-900">
              {{ 'equipments.addTitle' | translate }}
            </h3>
            <button class="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors" (click)="close.emit()">
              <app-icon name="close" [size]="16" />
            </button>
          </div>

          <form class="flex flex-col gap-4" (ngSubmit)="submit()">
            <label class="flex flex-col gap-1 text-sm">
              {{ 'equipments.name' | translate }}
              <input
                type="text"
                [(ngModel)]="equipmentName"
                name="equipmentName"
                required
                class="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
              />
            </label>

            <label class="flex flex-col gap-1 text-sm">
              {{ 'equipments.labId' | translate }}
              <select
                [(ngModel)]="labId"
                name="labId"
                required
                class="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
              >
                <option [ngValue]="null" disabled>-- {{ 'booking.none' | translate }} --</option>
                @for (room of labRoomsStore.items(); track room.labId) {
                  <option [ngValue]="room.labId">{{ room.labName }} ({{ room.roomCode }})</option>
                }
              </select>
            </label>

            <label class="flex flex-col gap-1 text-sm">
              {{ 'equipments.modelSpecs' | translate }}
              <input
                type="text"
                [(ngModel)]="modelSpecs"
                name="modelSpecs"
                class="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
              />
            </label>

            <label class="flex flex-col gap-1 text-sm">
              {{ 'equipments.imageUrl' | translate }}
              <input
                type="url"
                [(ngModel)]="imageUrl"
                name="imageUrl"
                class="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
              />
            </label>

            <label class="flex flex-col gap-1 text-sm">
              {{ 'equipments.usageGuideline' | translate }}
              <textarea
                [(ngModel)]="usageGuideline"
                name="usageGuideline"
                rows="3"
                class="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
              ></textarea>
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
export class EquipmentFormDialog {
  readonly open = input(false)
  readonly submitting = input(false)
  readonly close = output<void>()
  readonly save = output<CreateEquipmentInput>()

  protected readonly labRoomsStore = inject(LabRoomsStore)

  protected equipmentName = ''
  protected labId: number | null = null
  protected modelSpecs = ''
  protected imageUrl = ''
  protected usageGuideline = ''

  constructor() {
    effect(() => {
      if (this.open()) {
        this.equipmentName = ''
        this.labId = null
        this.modelSpecs = ''
        this.imageUrl = ''
        this.usageGuideline = ''
        void this.labRoomsStore.ensureLoaded()
      }
    })
  }

  submit(): void {
    if (!this.labId) return
    this.save.emit({
      labId: this.labId,
      equipmentName: this.equipmentName,
      modelSpecs: this.modelSpecs || undefined,
      imageUrl: this.imageUrl || undefined,
      usageGuideline: this.usageGuideline || undefined,
    })
  }
}
