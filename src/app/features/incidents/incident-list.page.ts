import { Component, OnInit, inject, signal } from '@angular/core'
import { DatePipe } from '@angular/common'
import { TranslatePipe } from '@ngx-translate/core'
import { BadgeComponent, BadgeTone } from '../../shared/ui/badge'
import { ButtonComponent } from '../../shared/ui/button'
import { IconComponent } from '../../shared/ui/icon'
import { SpinnerComponent } from '../../shared/ui/spinner'
import { IncidentsStore } from './incidents.store'
import { IncidentFormDialog } from './incident-form.dialog'
import type { CreateIncidentInput } from './incidents.types'

const SEVERITY_TONE: Record<string, BadgeTone> = {
  Low: 'slate',
  Medium: 'amber',
  High: 'red',
  Critical: 'red',
}

const STATUS_TONE: Record<string, BadgeTone> = {
  Open: 'red',
  InProgress: 'amber',
  Resolved: 'green',
  Closed: 'slate',
}

@Component({
  selector: 'app-incident-list-page',
  imports: [DatePipe, TranslatePipe, BadgeComponent, ButtonComponent, IconComponent, SpinnerComponent, IncidentFormDialog],
  template: `
    <section class="flex flex-col gap-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 class="text-xl font-semibold text-slate-900">{{ 'incidents.title' | translate }}</h1>
          <p class="text-sm text-slate-500">{{ 'incidents.subtitle' | translate }}</p>
        </div>
        <div class="flex items-center gap-3">
          <span class="rounded-full bg-red-50 px-3 py-1 text-sm font-medium text-red-700">
            {{ store.openCount() }} {{ 'incidents.openCount' | translate }}
          </span>
          <app-button (click)="dialogOpen.set(true)">
            <app-icon name="plus" [size]="16" />
            {{ 'incidents.add' | translate }}
          </app-button>
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
              {{ 'incidents.empty' | translate }}
            </div>
          } @else {
            <div class="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <table class="w-full text-left text-sm">
                <thead class="bg-slate-50 text-slate-500">
                  <tr>
                    <th class="px-4 py-3 font-medium">ID</th>
                    <th class="px-4 py-3 font-medium">{{ 'incidents.equipment' | translate }}</th>
                    <th class="px-4 py-3 font-medium">{{ 'incidents.description' | translate }}</th>
                    <th class="px-4 py-3 font-medium">{{ 'incidents.severity' | translate }}</th>
                    <th class="px-4 py-3 font-medium">{{ 'incidents.statusLabel' | translate }}</th>
                    <th class="px-4 py-3 font-medium">{{ 'incidents.reportedAt' | translate }}</th>
                    <th class="px-4 py-3 text-right font-medium">{{ 'common.actions' | translate }}</th>
                  </tr>
                </thead>
                <tbody>
                  @for (i of sorted(); track i.incidentId) {
                    <tr class="border-t border-slate-100">
                      <td class="px-4 py-3 font-medium text-slate-900">#{{ i.incidentId }}</td>
                      <td class="px-4 py-3 text-slate-600">{{ i.equipmentName }}</td>
                      <td class="px-4 py-3 text-slate-600 max-w-[200px] truncate">{{ i.description }}</td>
                      <td class="px-4 py-3">
                        <app-badge [tone]="SEVERITY_TONE[i.severity] ?? 'slate'">
                          {{ 'incidents.severity' + i.severity | translate }}
                        </app-badge>
                      </td>
                      <td class="px-4 py-3">
                        <app-badge [tone]="STATUS_TONE[i.status] ?? 'slate'">
                          {{ 'incidents.status' + i.status | translate }}
                        </app-badge>
                      </td>
                      <td class="px-4 py-3 text-slate-600">{{ i.reportedAt | date: 'dd/MM/yy HH:mm' }}</td>
                      <td class="px-4 py-3 text-right">
                        @if (i.status === 'Open') {
                          <button class="mr-2 font-medium text-amber-600 hover:underline"
                            (click)="store.update(i.incidentId, { status: 'InProgress' })">
                            {{ 'incidents.markInProgress' | translate }}
                          </button>
                        }
                        @if (i.status === 'Open' || i.status === 'InProgress') {
                          <button class="font-medium text-emerald-600 hover:underline"
                            (click)="resolveIncident(i.incidentId)">
                            {{ 'incidents.resolve' | translate }}
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

    <app-incident-form-dialog
      [open]="dialogOpen()"
      [submitting]="store.mutating()"
      (close)="dialogOpen.set(false)"
      (save)="onSave($event)"
    />
  `,
})
export class IncidentListPage implements OnInit {
  protected readonly store = inject(IncidentsStore)
  protected readonly SEVERITY_TONE = SEVERITY_TONE
  protected readonly STATUS_TONE = STATUS_TONE
  protected readonly dialogOpen = signal(false)

  protected sorted() {
    return [...this.store.items()].sort((a, b) => b.reportedAt.localeCompare(a.reportedAt))
  }

  async ngOnInit(): Promise<void> {
    await this.store.load()
  }

  async onSave(input: CreateIncidentInput): Promise<void> {
    await this.store.create(input)
    this.dialogOpen.set(false)
  }

  async resolveIncident(id: number): Promise<void> {
    const resolution = prompt('Ghi chú giải quyết:')
    if (resolution !== null) {
      await this.store.update(id, { status: 'Resolved', resolution })
    }
  }
}
