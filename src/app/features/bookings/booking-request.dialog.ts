import { Component, effect, input, output, inject, signal, computed } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { TranslatePipe } from '@ngx-translate/core'
import { ButtonComponent } from '../../shared/ui/button'
import { IconComponent } from '../../shared/ui/icon'
import { LabRoomsStore } from '../lab-rooms/lab-rooms.store'
import { EquipmentsStore } from '../equipments/equipments.store'
import { AuthStore } from '../../core/auth/auth.store'
import { ViolationsStore } from '../violations/violations.store'
import { MaintenanceStore } from '../maintenance/maintenance.store'
import { PoliciesStore } from '../policies/policies.store'
import type { BookingItemRequest, BookingPurposeType, CreateBookingRequest } from './bookings.types'
import type { Violation } from '../violations/violations.types'

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
            <button class="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors" (click)="close.emit()">
              <app-icon name="close" [size]="16" />
            </button>
          </div>

            <form class="flex flex-col gap-4" (ngSubmit)="onSubmit()">
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
                  [min]="minDateTime"
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
                  [min]="startTime || minDateTime"
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

            <!-- Validation Errors -->
            @if (timeValidationError()) {
              <div class="rounded-lg bg-amber-50 p-3 text-sm text-amber-700 mt-2">
                <app-icon name="alert" [size]="14" class="inline mr-1" />
                {{ timeValidationError() }}
              </div>
            }
            @if (userViolationsError()) {
              <div class="rounded-lg bg-red-50 p-3 text-sm text-red-700 mt-2">
                <app-icon name="alert" [size]="14" class="inline mr-1" />
                {{ userViolationsError() }}
              </div>
            }
            @if (maintenanceError()) {
              <div class="rounded-lg bg-amber-50 p-3 text-sm text-amber-700 mt-2">
                <app-icon name="alert" [size]="14" class="inline mr-1" />
                {{ maintenanceError() }}
              </div>
            }

            <div class="mt-2 flex justify-end gap-2">
              <app-button type="button" variant="ghost" (click)="close.emit()">
                {{ 'booking.cancel' | translate }}
              </app-button>
              <app-button type="submit" [loading]="submitting()" [disabled]="!!timeValidationError() || !!userViolationsError() || !!maintenanceError()">
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
  protected readonly authStore = inject(AuthStore)
  protected readonly violationsStore = inject(ViolationsStore)
  protected readonly maintenanceStore = inject(MaintenanceStore)
  protected readonly policiesStore = inject(PoliciesStore)

  protected purposeType: BookingPurposeType = 'CoursePractice'
  protected purposeDescription = ''
  protected startTime = ''
  protected endTime = ''
  protected minDateTime = ''
  protected selectedLabId: number | null = null
  protected selectedEquipmentId: number | null = null

  protected readonly timeValidationError = computed(() => {
    if (!this.startTime || !this.endTime) return null
    const now = Date.now()
    const start = new Date(this.startTime).getTime()
    const end = new Date(this.endTime).getTime()

    // 1. Không được đặt trong quá khứ
    if (start < now - 2 * 60 * 1000) {
      return 'Thời gian bắt đầu không được ở trong quá khứ.'
    }

    // 2. Thời gian kết thúc phải sau thời gian bắt đầu
    if (end <= start) {
      return 'Thời gian kết thúc phải sau thời gian bắt đầu.'
    }

    // 3. Phải đặt ít nhất 1 tiếng (60 phút)
    const durationMs = end - start
    if (durationMs < 60 * 60 * 1000) {
      return 'Thời gian đặt lịch phải có thời lượng tối thiểu là 1 tiếng.'
    }

    return null
  })

  protected readonly userViolationsError = computed(() => {
    const user = this.authStore.user()
    if (!user) return null
    const userViolations = this.violationsStore.items().filter((v: Violation) => v.userId === user.userId)
    const totalCount = userViolations.reduce((sum: number, v: Violation) => sum + (v.violationCount || 1), 0)
    const hasActiveManagerLock = userViolations.some((v: Violation) => v.actionTaken && v.actionTaken.includes('Khoá'))

    const policies = this.policiesStore.items().filter((p: any) => p.isActive)
    const matchedPolicy = policies.find((p: any) => p.labId === this.selectedLabId) ?? policies[0]
    
    const maxViolations = matchedPolicy?.maxViolations ?? 3
    const lockDays = matchedPolicy?.lockDurationDays ?? 7

    if (totalCount >= maxViolations || hasActiveManagerLock) {
      const latestViolation = [...userViolations].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0]
      const lockUntil = latestViolation 
        ? new Date(new Date(latestViolation.createdAt).getTime() + lockDays * 86400 * 1000)
        : new Date(Date.now() + lockDays * 86400 * 1000)

      if (new Date() < lockUntil || hasActiveManagerLock) {
        const lockUntilStr = lockUntil.toLocaleDateString('vi-VN')
        return `Tài khoản đã bị Lab Manager khoá quyền đặt lịch ${lockDays} ngày do vi phạm ${totalCount}/${maxViolations} lần (đến ngày ${lockUntilStr}).`
      }
    }
    return null
  })

  protected readonly maintenanceError = computed(() => {
    if (!this.startTime || !this.endTime) return null
    const start = new Date(this.startTime).getTime()
    const end = new Date(this.endTime).getTime()

    const activeMaintenances = this.maintenanceStore.items().filter((m) => m.status === 'Scheduled' || m.status === 'InProgress')
    
    for (const m of activeMaintenances) {
      const mStart = new Date(m.scheduledStart).getTime()
      const mEnd = new Date(m.scheduledEnd).getTime()

      // Check overlap
      if (start < mEnd && end > mStart) {
        if (this.selectedLabId && m.labId === this.selectedLabId) {
          return `Phòng Lab này đang trong lịch bảo trì (${m.scheduledStart} - ${m.scheduledEnd}). Vui lòng chọn thời gian khác.`
        }
        if (this.selectedEquipmentId && m.equipmentId === this.selectedEquipmentId) {
          return `Thiết bị này đang trong lịch bảo trì (${m.scheduledStart} - ${m.scheduledEnd}). Vui lòng chọn thời gian khác.`
        }
      }
    }
    return null
  })

  constructor() {
    effect(() => {
      if (this.open()) {
        const now = new Date()
        const defaultStart = new Date(now.getTime() + 10 * 60 * 1000)
        const defaultEnd = new Date(defaultStart.getTime() + 60 * 60 * 1000)

        this.minDateTime = this.formatDatetimeLocal(now)
        this.startTime = this.formatDatetimeLocal(defaultStart)
        this.endTime = this.formatDatetimeLocal(defaultEnd)

        this.purposeType = 'CoursePractice'
        this.purposeDescription = ''
        this.selectedLabId = null
        this.selectedEquipmentId = null
        void this.labRoomsStore.ensureLoaded()
        void this.equipmentsStore.ensureLoaded()
        void this.violationsStore.load()
        void this.maintenanceStore.load()
        void this.policiesStore.load()
      }
    })
  }

  private formatDatetimeLocal(d: Date): string {
    const pad = (n: number) => (n < 10 ? '0' + n : n)
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
  }

  protected onSubmit(): void {
    if (this.timeValidationError() || this.userViolationsError() || this.maintenanceError()) {
      return
    }

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
