import { Component, effect, input, output, inject, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { TranslatePipe } from '@ngx-translate/core'
import { ButtonComponent } from '../../shared/ui/button'
import { IconComponent } from '../../shared/ui/icon'
import { LabRoomsStore } from '../lab-rooms/lab-rooms.store'
import type { CreatePolicyInput, Policy, UpdatePolicyInput } from './policies.types'

@Component({
  selector: 'app-policy-form-dialog',
  imports: [FormsModule, TranslatePipe, ButtonComponent, IconComponent],
  template: `
    @if (open()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
        <div class="w-full max-w-md rounded-xl bg-white p-5 shadow-xl max-h-[90vh] overflow-y-auto">
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-base font-semibold text-slate-900">
              {{ (editingPolicy() ? 'policies.editTitle' : 'policies.addTitle') | translate }}
            </h3>
            <button class="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors" (click)="close.emit()">
              <app-icon name="close" [size]="16" />
            </button>
          </div>

          <form class="flex flex-col gap-4" (ngSubmit)="submit()">
            <label class="flex flex-col gap-1 text-sm">
              {{ 'policies.name' | translate }}
              <input
                type="text"
                [(ngModel)]="title"
                name="title"
                required
                class="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
              />
            </label>

            <label class="flex flex-col gap-1 text-sm">
              {{ 'policies.description' | translate }}
              <textarea
                [(ngModel)]="description"
                name="description"
                rows="3"
                required
                class="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
              ></textarea>
            </label>

            <label class="flex flex-col gap-1 text-sm">
              {{ 'policies.labScope' | translate }}
              <select
                [(ngModel)]="labId"
                name="labId"
                class="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
              >
                <option [ngValue]="null">-- {{ 'policies.allLabs' | translate }} --</option>
                @for (room of labRoomsStore.items(); track room.labId) {
                  <option [ngValue]="room.labId">{{ room.labName }} ({{ room.roomCode }})</option>
                }
              </select>
            </label>

            <div class="grid grid-cols-2 gap-3">
              <label class="flex flex-col gap-1 text-sm">
                {{ 'policies.maxViolations' | translate }}
                <input
                  type="number"
                  [(ngModel)]="maxViolations"
                  name="maxViolations"
                  min="1"
                  required
                  class="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                />
              </label>
              <label class="flex flex-col gap-1 text-sm">
                {{ 'policies.lockDuration' | translate }}
                <input
                  type="number"
                  [(ngModel)]="lockDurationDays"
                  name="lockDurationDays"
                  min="1"
                  required
                  class="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                />
              </label>
            </div>

            @if (editingPolicy()) {
              <label class="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  [(ngModel)]="isActive"
                  name="isActive"
                  class="rounded border-slate-300"
                />
                {{ 'policies.active' | translate }}
              </label>
            }

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
export class PolicyFormDialog {
  readonly open = input(false)
  readonly editingPolicy = input<Policy | null>(null)
  readonly submitting = input(false)
  readonly close = output<void>()
  readonly save = output<CreatePolicyInput | UpdatePolicyInput>()

  protected readonly labRoomsStore = inject(LabRoomsStore)

  protected title = ''
  protected description = ''
  protected labId: number | null = null
  protected maxViolations = 3
  protected lockDurationDays = 7
  protected isActive = true

  constructor() {
    effect(() => {
      if (this.open()) {
        const p = this.editingPolicy()
        if (p) {
          this.title = p.title
          this.description = p.description
          this.labId = p.labId
          this.maxViolations = p.maxViolations
          this.lockDurationDays = p.lockDurationDays
          this.isActive = p.isActive
        } else {
          this.title = ''
          this.description = ''
          this.labId = null
          this.maxViolations = 3
          this.lockDurationDays = 7
          this.isActive = true
        }
        void this.labRoomsStore.ensureLoaded()
      }
    })
  }

  submit(): void {
    const editing = this.editingPolicy()
    if (editing) {
      this.save.emit({
        labId: this.labId ?? undefined,
        title: this.title,
        description: this.description,
        maxViolations: this.maxViolations,
        lockDurationDays: this.lockDurationDays,
        isActive: this.isActive,
      } as UpdatePolicyInput)
    } else {
      this.save.emit({
        labId: this.labId ?? undefined,
        title: this.title,
        description: this.description,
        maxViolations: this.maxViolations,
        lockDurationDays: this.lockDurationDays,
      } as CreatePolicyInput)
    }
  }
}
