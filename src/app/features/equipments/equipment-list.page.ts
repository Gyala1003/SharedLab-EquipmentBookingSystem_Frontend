import { Component, OnInit, inject, signal } from '@angular/core'
import { RouterLink } from '@angular/router'
import { TranslatePipe } from '@ngx-translate/core'
import { AuthStore } from '../../core/auth/auth.store'
import { BadgeComponent, BadgeTone } from '../../shared/ui/badge'
import { ButtonComponent } from '../../shared/ui/button'
import { IconComponent } from '../../shared/ui/icon'
import { SpinnerComponent } from '../../shared/ui/spinner'
import { EquipmentsStore } from './equipments.store'
import { EquipmentFormDialog } from './equipment-form.dialog'
import type { CreateEquipmentInput } from './equipments.types'

const STATUS_TONE: Record<string, BadgeTone> = {
  Available: 'green',
  InUse: 'amber',
  Maintenance: 'amber',
  Broken: 'red',
  Retired: 'slate',
}

@Component({
  selector: 'app-equipment-list-page',
  imports: [RouterLink, TranslatePipe, BadgeComponent, ButtonComponent, SpinnerComponent, IconComponent, EquipmentFormDialog],
  template: `
    <section class="flex flex-col gap-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 class="text-xl font-semibold text-slate-900">{{ 'equipments.title' | translate }}</h1>
          <p class="text-sm text-slate-500">{{ 'equipments.subtitle' | translate }}</p>
        </div>
        @if (authStore.isAdmin()) {
          <app-button (click)="openAddDialog()">
            <app-icon name="plus" [size]="16" />
            {{ 'equipments.add' | translate }}
          </app-button>
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
              {{ 'equipments.empty' | translate }}
            </div>
          } @else {
            <div class="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <table class="w-full text-left text-sm">
                <thead class="bg-slate-50 text-slate-500">
                  <tr>
                    <th class="px-4 py-3 font-medium">{{ 'equipments.name' | translate }}</th>
                    <th class="px-4 py-3 font-medium">{{ 'equipments.labId' | translate }}</th>
                    <th class="px-4 py-3 font-medium">{{ 'equipments.status' | translate }}</th>
                    @if (authStore.isAdmin()) {
                      <th class="px-4 py-3 text-right font-medium">{{ 'common.actions' | translate }}</th>
                    }
                  </tr>
                </thead>
                <tbody>
                  @for (eq of store.items(); track eq.equipmentId) {
                    <tr class="border-t border-slate-100">
                      <td class="px-4 py-3">
                        <a [routerLink]="['/equipments', eq.equipmentId]"
                          class="font-medium text-brand-600 hover:underline">
                          {{ eq.equipmentName }}
                        </a>
                      </td>
                      <td class="px-4 py-3 text-slate-600">Lab #{{ eq.labId }}</td>
                      <td class="px-4 py-3">
                        <app-badge [tone]="STATUS_TONE[eq.status] ?? 'slate'">
                          {{ eq.status }}
                        </app-badge>
                      </td>
                      @if (authStore.isAdmin()) {
                        <td class="px-4 py-3 text-right">
                          <button class="text-red-600 hover:underline" (click)="confirmDelete(eq.equipmentId)">
                            {{ 'common.delete' | translate }}
                          </button>
                        </td>
                      }
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        }
      }
    </section>

    <app-equipment-form-dialog
      [open]="dialogOpen()"
      [submitting]="store.mutating()"
      (close)="dialogOpen.set(false)"
      (save)="onSave($event)"
    />
  `,
})
export class EquipmentListPage implements OnInit {
  protected readonly store = inject(EquipmentsStore)
  protected readonly authStore = inject(AuthStore)
  protected readonly STATUS_TONE = STATUS_TONE
  protected readonly dialogOpen = signal(false)

  async ngOnInit(): Promise<void> {
    await this.store.load()
  }

  openAddDialog(): void {
    this.dialogOpen.set(true)
  }

  async onSave(input: CreateEquipmentInput): Promise<void> {
    await this.store.create(input)
    this.dialogOpen.set(false)
  }

  async confirmDelete(id: number): Promise<void> {
    if (confirm('Bạn có chắc muốn xóa thiết bị này?')) {
      await this.store.remove(id)
    }
  }
}
