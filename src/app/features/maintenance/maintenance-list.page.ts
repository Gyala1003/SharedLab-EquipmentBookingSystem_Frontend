import { Component, OnInit, inject, signal } from '@angular/core'
import { DatePipe, CurrencyPipe } from '@angular/common'
import { TranslatePipe } from '@ngx-translate/core'
import { BadgeComponent, BadgeTone } from '../../shared/ui/badge'
import { ButtonComponent } from '../../shared/ui/button'
import { IconComponent } from '../../shared/ui/icon'
import { SpinnerComponent } from '../../shared/ui/spinner'
import { MaintenanceStore } from './maintenance.store'
import { MaintenanceFormDialog } from './maintenance-form.dialog'
import type { CreateMaintenanceInput } from './maintenance.types'

const STATUS_TONE: Record<string, BadgeTone> = {
  Scheduled: 'amber',
  InProgress: 'amber',
  Completed: 'green',
  Cancelled: 'slate',
}

@Component({
  selector: 'app-maintenance-list-page',
  imports: [DatePipe, CurrencyPipe, TranslatePipe, BadgeComponent, ButtonComponent, IconComponent, SpinnerComponent, MaintenanceFormDialog],
  template: `
    <section class="flex flex-col gap-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 class="text-xl font-semibold text-slate-900">{{ 'maintenance.title' | translate }}</h1>
          <p class="text-sm text-slate-500">{{ 'maintenance.subtitle' | translate }}</p>
        </div>
        <app-button (click)="dialogOpen.set(true)">
          <app-icon name="plus" [size]="16" />
          {{ 'maintenance.add' | translate }}
        </app-button>
      </div>

      <!-- Summary cards -->
      <div class="grid grid-cols-3 gap-4">
        <div class="rounded-xl border border-slate-200 bg-white p-4">
          <p class="text-xs text-slate-500">{{ 'maintenance.activeSchedules' | translate }}</p>
          <p class="mt-1 text-2xl font-semibold text-amber-600">{{ store.activeCount() }}</p>
        </div>
        <div class="rounded-xl border border-slate-200 bg-white p-4">
          <p class="text-xs text-slate-500">{{ 'maintenance.completedSchedules' | translate }}</p>
          <p class="mt-1 text-2xl font-semibold text-emerald-600">{{ store.completedItems().length }}</p>
        </div>
        <div class="rounded-xl border border-brand-100 bg-brand-50 p-4">
          <p class="text-xs text-brand-700">{{ 'maintenance.totalCost' | translate }}</p>
          <p class="mt-1 text-2xl font-semibold text-brand-700">{{ store.totalCost() | currency: 'VND':'symbol':'1.0-0' }}</p>
        </div>
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
              {{ 'maintenance.empty' | translate }}
            </div>
          } @else {
            <div class="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <table class="w-full text-left text-sm">
                <thead class="bg-slate-50 text-slate-500">
                  <tr>
                    <th class="px-4 py-3 font-medium">{{ 'maintenance.titleField' | translate }}</th>
                    <th class="px-4 py-3 font-medium">{{ 'maintenance.target' | translate }}</th>
                    <th class="px-4 py-3 font-medium">{{ 'maintenance.schedule' | translate }}</th>
                    <th class="px-4 py-3 font-medium">{{ 'maintenance.cost' | translate }}</th>
                    <th class="px-4 py-3 font-medium">{{ 'maintenance.statusLabel' | translate }}</th>
                    <th class="px-4 py-3 text-right font-medium">{{ 'common.actions' | translate }}</th>
                  </tr>
                </thead>
                <tbody>
                  @for (m of sorted(); track m.maintenanceId) {
                    <tr class="border-t border-slate-100">
                      <td class="px-4 py-3">
                        <p class="font-medium text-slate-900">{{ m.title }}</p>
                        <p class="text-xs text-slate-500 line-clamp-1">{{ m.description }}</p>
                      </td>
                      <td class="px-4 py-3 text-slate-600">
                        @if (m.labName) {
                          <span class="rounded bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">Lab</span>
                          {{ m.labName }}
                        }
                        @if (m.equipmentName) {
                          <span class="rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">Equip</span>
                          {{ m.equipmentName }}
                        }
                      </td>
                      <td class="px-4 py-3 text-slate-600 text-xs">
                        {{ m.scheduledStart | date: 'dd/MM/yy HH:mm' }} –
                        {{ m.scheduledEnd | date: 'dd/MM/yy HH:mm' }}
                      </td>
                      <td class="px-4 py-3 text-slate-600">
                        @if (m.cost) {
                          {{ m.cost | currency: 'VND':'symbol':'1.0-0' }}
                        } @else {
                          <span class="text-slate-400">—</span>
                        }
                      </td>
                      <td class="px-4 py-3">
                        <app-badge [tone]="STATUS_TONE[m.status] ?? 'slate'">
                          {{ 'maintenance.status' + m.status | translate }}
                        </app-badge>
                      </td>
                      <td class="px-4 py-3 text-right">
                        @if (m.status === 'Scheduled') {
                          <button class="mr-2 font-medium text-amber-600 hover:underline text-xs"
                            (click)="startMaintenance(m.maintenanceId)">
                            {{ 'maintenance.start' | translate }}
                          </button>
                        }
                        @if (m.status === 'InProgress') {
                          <button class="mr-2 font-medium text-emerald-600 hover:underline text-xs"
                            (click)="completeMaintenance(m.maintenanceId)">
                            {{ 'maintenance.complete' | translate }}
                          </button>
                        }
                        @if (m.status === 'Scheduled' || m.status === 'InProgress') {
                          <button class="font-medium text-red-600 hover:underline text-xs"
                            (click)="confirmDelete(m.maintenanceId)">
                            {{ 'common.delete' | translate }}
                          </button>
                        }
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        }
      }
    </section>

    <app-maintenance-form-dialog
      [open]="dialogOpen()"
      [submitting]="store.mutating()"
      (close)="dialogOpen.set(false)"
      (save)="onSave($event)"
    />
  `,
})
export class MaintenanceListPage implements OnInit {
  protected readonly store = inject(MaintenanceStore)
  protected readonly STATUS_TONE = STATUS_TONE
  protected readonly dialogOpen = signal(false)

  protected sorted() {
    return [...this.store.items()].sort((a, b) => b.scheduledStart.localeCompare(a.scheduledStart))
  }

  async ngOnInit(): Promise<void> {
    await this.store.load()
  }

  async onSave(input: CreateMaintenanceInput): Promise<void> {
    await this.store.create(input)
    this.dialogOpen.set(false)
  }

  async startMaintenance(id: number): Promise<void> {
    const m = this.store.items().find((i) => i.maintenanceId === id)
    if (m) {
      await this.store.update(id, {
        title: m.title,
        description: m.description,
        scheduledStart: m.scheduledStart,
        scheduledEnd: m.scheduledEnd,
        cost: m.cost,
        status: 'InProgress',
      })
    }
  }

  async completeMaintenance(id: number): Promise<void> {
    const m = this.store.items().find((i) => i.maintenanceId === id)
    if (m) {
      const costStr = prompt('Chi phí phát sinh (nếu có):', String(m.cost || 0))
      await this.store.update(id, {
        title: m.title,
        description: m.description,
        scheduledStart: m.scheduledStart,
        scheduledEnd: m.scheduledEnd,
        cost: costStr ? Number(costStr) : m.cost,
        status: 'Completed',
        actualEnd: new Date().toISOString(),
      })
    }
  }

  async confirmDelete(id: number): Promise<void> {
    if (confirm('Bạn có chắc muốn xóa lịch bảo trì này?')) {
      await this.store.remove(id)
    }
  }
}
