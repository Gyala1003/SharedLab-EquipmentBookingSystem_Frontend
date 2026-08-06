import { DatePipe, NgClass } from '@angular/common'
import { Component, OnInit, computed, inject, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { RouterLink } from '@angular/router'
import { SystemService } from '../../core/api/system.service'
import type { EquipmentResponse, LabRoomResponse, MaintenanceResponse } from '../../core/api/system.models'
import { AuthStore } from '../../core/auth/auth.store'
import { LanguageStore } from '../../core/i18n/language.store'
import { TranslatePipe } from '../../core/i18n/translate.pipe'
import { DataStateComponent } from '../../shared/ui/data-state'
import { IconComponent } from '../../shared/ui/icon'
import { PageHeaderComponent } from '../../shared/ui/page-header'
import { StatusBadgeComponent } from '../../shared/ui/status-badge'
import { ToastService } from '../../shared/ui/toast.service'
import { labelOf, toDateInput } from '../../shared/utils/presentation'

@Component({
  selector: 'app-maintenances-page',
  imports: [DatePipe, NgClass, FormsModule, RouterLink, IconComponent, StatusBadgeComponent, DataStateComponent, TranslatePipe],
  template: `
    <section class="space-y-6">
      <!-- Unified Header + Compact Stat Chips Bar (Strictly 1 Single Row, Zero Gap) -->
      <article class="card-surface p-5 space-y-4">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 class="text-2xl font-black tracking-tight text-slate-950">{{ canManage() ? ('maintenances.title' | t) : ('nav.maintenanceSchedule' | t) }}</h1>
            <p class="mt-1 text-xs font-medium text-slate-500">{{ 'maintenances.subtitle' | t }}</p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            @if (canManage()) {
              <a routerLink="/app/management/maintenances/new" class="btn-primary flex items-center gap-2"><app-icon name="plus" [size]="17" /> {{ 'maintenances.createSchedule' | t }}</a>
            }
            <a routerLink="/app/calendar" class="btn-secondary flex items-center gap-2"><app-icon name="calendar" [size]="17" /> {{ 'header.viewCalendar' | t }}</a>
          </div>
        </div>

        <div class="border-t border-slate-100 pt-3">
          <!-- Strictly 1 Single Horizontal Row (overflow-x-auto, whitespace-nowrap, no line break) -->
          <div class="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 scrollbar-none">
            @for (card of cards(); track card.status) {
              <button
                type="button"
                class="flex shrink-0 items-center gap-2.5 rounded-xl border px-3.5 py-2 text-left transition duration-150 whitespace-nowrap"
                [ngClass]="{
                  'border-violet-500 bg-violet-50/90 text-violet-900 ring-2 ring-violet-500/20 shadow-2xs font-bold': status === card.status,
                  'border-slate-200/90 bg-slate-50/70 hover:border-violet-300 hover:bg-white text-slate-700': status !== card.status
                }"
                (click)="status = card.status"
              >
                <span class="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg text-[11px]" [ngClass]="card.bgTint">
                  <app-icon [name]="card.iconName" [size]="12" />
                </span>
                <span class="text-xs font-bold text-slate-600">{{ card.label }}:</span>
                <span class="text-xs font-black" [class]="card.className">{{ card.count }}</span>
              </button>
            }
          </div>
        </div>
      </article>

      <div class="filter-bar md:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_1fr_auto]">
        <div>
          <label class="field-label">{{ 'maintenances.labFilter' | t }}</label>
          <select class="input-shell" [(ngModel)]="labId">
            <option [ngValue]="null">{{ 'maintenances.allLabs' | t }}</option>
            @for (lab of labs(); track lab.labId) {
              <option [ngValue]="lab.labId">{{ lab.labName | t }}</option>
            }
          </select>
        </div>
        <div>
          <label class="field-label">{{ 'maintenances.equipmentFilter' | t }}</label>
          <select class="input-shell" [(ngModel)]="equipmentId">
            <option [ngValue]="null">{{ 'maintenances.allEquipment' | t }}</option>
            @for (eq of filteredEquipmentOptions(); track eq.equipmentId) {
              <option [ngValue]="eq.equipmentId">{{ eq.equipmentName | t }}</option>
            }
          </select>
        </div>
        <div>
          <label class="field-label">{{ 'common.status' | t }}</label>
          <select class="input-shell" [(ngModel)]="status">
            <option value="">{{ 'common.all' | t }}</option>
            <option value="Scheduled">{{ 'maintenances.scheduled' | t }}</option>
            <option value="InProgress">{{ 'maintenances.inProgress' | t }}</option>
            <option value="Completed">{{ 'maintenances.completed' | t }}</option>
            <option value="Cancelled">{{ 'common.cancelled' | t }}</option>
          </select>
        </div>
        <div>
          <label class="field-label">{{ 'common.from' | t }}</label>
          <input class="input-shell" type="date" [(ngModel)]="from" />
        </div>
        <div class="flex items-end">
          <button class="btn-secondary w-full" (click)="reset()"><app-icon name="refresh" [size]="17" /> {{ 'common.reset' | t }}</button>
        </div>
      </div>

      <article class="card-surface overflow-hidden">
        <header class="flex items-center justify-between border-b border-slate-100 px-5 py-5">
          <div>
            <h2 class="font-black text-slate-950">{{ 'maintenances.title' | t }}</h2>
            <p class="mt-1 text-xs text-slate-400">{{ filtered().length }} {{ 'common.records' | t }}</p>
          </div>
          <div class="inline-flex rounded-2xl bg-slate-100 p-1">
            <button class="rounded-xl px-3 py-2 text-xs font-black" [ngClass]="view() === 'table' ? 'bg-white text-cyan-700 shadow-sm' : 'text-slate-500'" (click)="view.set('table')">{{ 'common.tableView' | t }}</button>
            <button class="rounded-xl px-3 py-2 text-xs font-black" [ngClass]="view() === 'cards' ? 'bg-white text-cyan-700 shadow-sm' : 'text-slate-500'" (click)="view.set('cards')">{{ 'common.cardView' | t }}</button>
          </div>
        </header>

        @if (loading()) {
          <div class="p-6"><div class="skeleton h-80 rounded-2xl"></div></div>
        } @else if (filtered().length === 0) {
          <div class="p-6"><app-data-state [title]="'common.noData' | t" [message]="'common.noData' | t" icon="wrench" /></div>
        } @else if (view() === 'table') {
          <div class="overflow-x-auto">
            <table class="table-shell">
              <thead>
                <tr>
                  <th>{{ 'common.code' | t }}</th>
                  <th>{{ 'dashboard.resource' | t }}</th>
                  <th>{{ 'common.from' | t }}</th>
                  <th>{{ 'common.status' | t }}</th>
                  <th>{{ 'maintenances.recurring' | t }}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                @for (item of filtered(); track item.maintenanceId) {
                  <tr>
                    <td class="font-black text-slate-900">#MT-{{ item.maintenanceId.toString().padStart(4, '0') }}</td>
                    <td>
                      <p class="font-bold text-slate-800">{{ resourceName(item) | t }}</p>
                      <p class="mt-1 text-xs text-slate-400">{{ item.labId ? ('nav.items.labs' | t) : ('nav.items.equipments' | t) }}</p>
                    </td>
                    <td>
                      <p class="font-bold text-slate-700">{{ item.startTime | date: 'HH:mm dd/MM/yyyy' }}</p>
                      <p class="mt-1 text-xs text-slate-400">{{ item.endTime | date: 'HH:mm dd/MM/yyyy' }}</p>
                    </td>
                    <td><app-status-badge [value]="item.status" domain="maintenance" /></td>
                    <td>{{ labelOf('recurrence', item.recurrenceType, languageStore.lang()) }} @if (item.recurrenceInterval > 1) { · {{ item.recurrenceInterval }} }</td>
                    <td><a [routerLink]="['/app/management/maintenances', item.maintenanceId]" class="btn-secondary h-9 min-h-9 px-3">{{ 'common.details' | t }}</a></td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        } @else {
          <div class="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
            @for (item of filtered(); track item.maintenanceId) {
              <a [routerLink]="['/app/management/maintenances', item.maintenanceId]" class="rounded-[24px] border border-slate-200 p-5 transition hover:-translate-y-1 hover:border-cyan-200 hover:shadow-lg">
                <div class="flex items-start justify-between">
                  <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600"><app-icon name="wrench" [size]="22" /></div>
                  <app-status-badge [value]="item.status" domain="maintenance" />
                </div>
                <p class="mt-5 text-lg font-black text-slate-950">{{ resourceName(item) | t }}</p>
                <p class="mt-2 text-xs text-slate-400">#MT-{{ item.maintenanceId }} · {{ labelOf('recurrence', item.recurrenceType, languageStore.lang()) }}</p>
                <div class="mt-4 rounded-2xl bg-slate-50 p-4">
                  <p class="text-sm font-black text-slate-700">{{ item.startTime | date: 'HH:mm dd/MM/yyyy' }}</p>
                  <p class="mt-1 text-xs text-slate-400">{{ 'common.to' | t }} {{ item.endTime | date: 'HH:mm dd/MM/yyyy' }}</p>
                </div>
              </a>
            }
          </div>
        }
      </article>
    </section>
  `,
})
export class MaintenancesPage implements OnInit {
  private readonly api = inject(SystemService)
  private readonly toast = inject(ToastService)
  protected readonly store = inject(AuthStore)
  protected readonly languageStore = inject(LanguageStore)
  protected readonly items = signal<MaintenanceResponse[]>([])
  protected readonly labs = signal<LabRoomResponse[]>([])
  protected readonly equipments = signal<EquipmentResponse[]>([])
  protected readonly loading = signal(true)
  protected readonly view = signal<'table' | 'cards'>('table')
  protected labId: number | null = null
  protected equipmentId: number | null = null
  protected status = ''
  protected from = ''
  protected readonly labelOf = labelOf
  protected readonly canManage = computed(() => this.store.isManager())
  protected readonly filteredEquipmentOptions = computed(() => (this.labId ? this.equipments().filter((x) => x.labId === this.labId) : this.equipments()))
  protected readonly filtered = computed(() =>
    this.items()
      .filter(
        (item) =>
          (!this.labId || item.labId === this.labId || this.equipments().some((eq) => eq.equipmentId === item.equipmentId && eq.labId === this.labId)) &&
          (!this.equipmentId || item.equipmentId === this.equipmentId) &&
          (!this.status || item.status === this.status) &&
          (!this.from || toDateInput(new Date(item.startTime)) >= this.from),
      )
      .sort((a, b) => +new Date(b.startTime) - +new Date(a.startTime)),
  )

  protected readonly cards = computed(() => [
    { status: '', label: this.languageStore.t('maintenances.totalSchedules'), count: this.items().length, className: 'text-slate-950', iconName: 'wrench', bgTint: 'bg-slate-100 text-slate-700' },
    { status: 'Scheduled', label: this.languageStore.t('maintenances.scheduled'), count: this.count('Scheduled'), className: 'text-amber-600', iconName: 'clock', bgTint: 'bg-amber-100 text-amber-700' },
    { status: 'InProgress', label: this.languageStore.t('maintenances.inProgress'), count: this.count('InProgress'), className: 'text-indigo-600', iconName: 'refresh', bgTint: 'bg-indigo-100 text-indigo-700' },
    { status: 'Completed', label: this.languageStore.t('maintenances.completed'), count: this.count('Completed'), className: 'text-emerald-600', iconName: 'check', bgTint: 'bg-emerald-100 text-emerald-700' },
  ])

  ngOnInit(): void {
    this.api.labs().subscribe((x) => this.labs.set(x))
    this.api.equipments().subscribe((x) => this.equipments.set(x))
    this.load()
  }

  protected load(): void {
    this.loading.set(true)
    this.api.maintenances().subscribe({
      next: (x) => {
        this.items.set(x)
        this.loading.set(false)
      },
      error: () => {
        this.loading.set(false)
        this.toast.error('Không tải được lịch bảo trì')
      },
    })
  }

  protected count(status: string): number {
    return this.items().filter((x) => x.status === status).length
  }

  protected resourceName(item: MaintenanceResponse): string {
    if (item.labId) return this.labs().find((x) => x.labId === item.labId)?.labName ?? `Phòng #${item.labId}`
    return this.equipments().find((x) => x.equipmentId === item.equipmentId)?.equipmentName ?? `Thiết bị #${item.equipmentId}`
  }

  protected reset(): void {
    this.labId = null
    this.equipmentId = null
    this.status = ''
    this.from = ''
  }
}
