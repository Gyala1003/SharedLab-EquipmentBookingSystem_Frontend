import { Component, effect, input, output, inject } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { TranslatePipe } from '@ngx-translate/core'
import { ButtonComponent } from '../../shared/ui/button'
import { IconComponent } from '../../shared/ui/icon'
import { PoliciesStore } from '../policies/policies.store'
import type { CreateViolationInput } from './violations.types'

@Component({
  selector: 'app-violation-form-dialog',
  imports: [FormsModule, TranslatePipe, ButtonComponent, IconComponent],
  template: `
    @if (open()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
        <div class="w-full max-w-md rounded-xl bg-white p-5 shadow-xl max-h-[90vh] overflow-y-auto">
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-base font-semibold text-slate-900">
              {{ 'violations.addTitle' | translate }}
            </h3>
            <button class="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors" (click)="close.emit()">
              <app-icon name="close" [size]="16" />
            </button>
          </div>

          <form class="flex flex-col gap-4" (ngSubmit)="onSubmit()">
            <label class="flex flex-col gap-1 text-sm">
              {{ 'violations.userId' | translate }}
              <input
                type="number"
                [(ngModel)]="userId"
                name="userId"
                required
                class="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
              />
            </label>

            <label class="flex flex-col gap-1 text-sm">
              {{ 'violations.policy' | translate }}
              <select
                [(ngModel)]="policyId"
                name="policyId"
                required
                class="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
              >
                <option [ngValue]="null" disabled>-- {{ 'booking.none' | translate }} --</option>
                @for (p of policiesStore.items(); track p.policyId) {
                  @if (p.isActive) {
                    <option [ngValue]="p.policyId">{{ p.title }}</option>
                  }
                }
              </select>
            </label>

            <label class="flex flex-col gap-1 text-sm">
              {{ 'violations.description' | translate }}
              <textarea
                [(ngModel)]="description"
                name="description"
                rows="4"
                required
                class="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
              ></textarea>
            </label>

            <label class="flex flex-col gap-1 text-sm">
              {{ 'violations.bookingId' | translate }}
              <input
                type="number"
                [(ngModel)]="bookingId"
                name="bookingId"
                class="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                placeholder="Optional"
              />
            </label>

            @if (selectedPolicy(); as sp) {
              <div class="rounded-lg bg-amber-50 p-3 text-sm">
                <p class="mb-1 font-medium text-amber-800">{{ 'violations.policyInfo' | translate }}</p>
                <p class="text-amber-700">
                  {{ 'violations.maxViolationsInfo' | translate }}: {{ sp.maxViolations }} ·
                  {{ 'violations.lockDurationInfo' | translate }}: {{ sp.lockDurationDays }} {{ 'policies.days' | translate }}
                </p>
              </div>
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
export class ViolationFormDialog {
  readonly open = input(false)
  readonly submitting = input(false)
  readonly close = output<void>()
  readonly save = output<CreateViolationInput>()

  protected readonly policiesStore = inject(PoliciesStore)

  protected userId: number | null = null
  protected policyId: number | null = null
  protected description = ''
  protected bookingId: number | null = null

  constructor() {
    effect(() => {
      if (this.open()) {
        this.userId = null
        this.policyId = null
        this.description = ''
        this.bookingId = null
        void this.policiesStore.load()
      }
    })
  }

  protected selectedPolicy() {
    if (!this.policyId) return null
    return this.policiesStore.items().find((p) => p.policyId === this.policyId) ?? null
  }

  protected onSubmit(): void {
    if (!this.userId || !this.policyId) return
    this.save.emit({
      userId: this.userId,
      policyId: this.policyId,
      description: this.description,
      bookingId: this.bookingId ?? undefined,
    })
  }
}
