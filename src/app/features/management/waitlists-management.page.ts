import { DatePipe, NgClass } from '@angular/common'
import { Component, OnInit, computed, inject, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { SystemService } from '../../core/api/system.service'
import type { EquipmentResponse, LabRoomResponse, WaitlistResponse } from '../../core/api/system.models'
import { LanguageStore } from '../../core/i18n/language.store'
import { TranslatePipe } from '../../core/i18n/translate.pipe'
import { DataStateComponent } from '../../shared/ui/data-state'
import { IconComponent } from '../../shared/ui/icon'
import { PageHeaderComponent } from '../../shared/ui/page-header'
import { StatusBadgeComponent } from '../../shared/ui/status-badge'
import { ToastService } from '../../shared/ui/toast.service'
import { toIso, toLocalDateTimeInput } from '../../shared/utils/presentation'

@Component({
  selector: 'app-waitlists-management-page',
  imports: [DatePipe, NgClass, FormsModule, IconComponent, StatusBadgeComponent, DataStateComponent, TranslatePipe],
  template: `
    <section class="space-y-6">
      <!-- Unified Header + Compact Stat Chips Bar (Strictly 1 Single Row, Zero Gap) -->
      <article class="card-surface p-5 space-y-4">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 class="text-2xl font-black tracking-tight text-slate-950">{{ 'manageWaitlists.title' | t }}</h1>
            <p class="mt-1 text-xs font-medium text-slate-500">{{ 'manageWaitlists.subtitle' | t }}</p>
          </div>
        </div>

        <div class="border-t border-slate-100 pt-3">
          <!-- Strictly 1 Single Horizontal Row (overflow-x-auto, whitespace-nowrap, no line break) -->
          <div class="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 scrollbar-none">
            @for (tab of tabs(); track tab.value) {
              <button
                type="button"
                class="flex shrink-0 items-center gap-2.5 rounded-xl border px-3.5 py-2 text-left transition duration-150 whitespace-nowrap"
                [ngClass]="{
                  'border-violet-500 bg-violet-50/90 text-violet-900 ring-2 ring-violet-500/20 shadow-2xs font-bold': status === tab.value,
                  'border-slate-200/90 bg-slate-50/70 hover:border-violet-300 hover:bg-white text-slate-700': status !== tab.value
                }"
                (click)="status = tab.value"
              >
                <span class="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg text-[11px]" [ngClass]="tab.bgTint">
                  <app-icon [name]="tab.iconName" [size]="12" />
                </span>
                <span class="text-xs font-bold text-slate-600">{{ tab.label }}:</span>
                <span class="text-xs font-black" [class]="tab.className">{{ count(tab.value) }}</span>
              </button>
            }
          </div>
        </div>
      </article>
      <div class="filter-bar md:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_1fr_auto]">
        <div>
          <label class="field-label">{{ 'nav.labs' | t }}</label>
          <select class="input-shell" [(ngModel)]="labId" (ngModelChange)="equipmentId = null">
            <option [ngValue]="null">{{ 'common.all' | t }}</option>
            @for (lab of labs(); track lab.labId) {
              <option [ngValue]="lab.labId">{{ lab.labName }}</option>
            }
          </select>
        </div>
        <div>
          <label class="field-label">{{ 'nav.equipment' | t }}</label>
          <select class="input-shell" [(ngModel)]="equipmentId">
            <option [ngValue]="null">{{ 'common.all' | t }}</option>
            @for (eq of equipmentOptions(); track eq.equipmentId) {
              <option [ngValue]="eq.equipmentId">{{ eq.equipmentName }}</option>
            }
          </select>
        </div>
        <div><label class="field-label">{{ 'common.from' | t }}</label><input class="input-shell" type="datetime-local" [(ngModel)]="requestedStart" /></div>
        <div><label class="field-label">{{ 'common.to' | t }}</label><input class="input-shell" type="datetime-local" [(ngModel)]="requestedEnd" /></div>
        <div class="flex items-end">
          <button class="btn-primary w-full" (click)="loadQueue()"><app-icon name="filter" [size]="17" /> {{ 'manageWaitlists.filterQueue' | t }}</button>
        </div>
      </div>
      <article class="card-surface overflow-hidden">
        <header class="flex items-center justify-between border-b border-slate-100 px-5 py-5">
          <div><h2 class="font-black text-slate-950">{{ 'manageWaitlists.title' | t }}</h2><p class="mt-1 text-xs text-slate-400">{{ filtered().length }} {{ 'common.records' | t }}</p></div>
          <div class="flex gap-2">
            <button class="btn-secondary" (click)="loadAll()"><app-icon name="refresh" [size]="16" /> {{ 'common.all' | t }}</button>
            <button class="btn-primary" [disabled]="!canNotify()" (click)="notifyNext()"><app-icon name="bell" [size]="16" /> {{ 'manageWaitlists.notifyNext' | t }}</button>
          </div>
        </header>
        @if (loading()) {
          <div class="p-6"><div class="skeleton h-80 rounded-2xl"></div></div>
        } @else if (filtered().length === 0) {
          <div class="p-6"><app-data-state [title]="'manageWaitlists.emptyTitle' | t" [message]="'manageWaitlists.emptySub' | t" icon="clock" /></div>
        } @else {
          <div class="overflow-x-auto">
            <table class="table-shell">
              <thead>
                <tr>
                  <th>{{ 'common.position' | t }}</th>
                  <th>{{ 'common.waitlist' | t }}</th>
                  <th>{{ 'common.resource' | t }}</th>
                  <th>{{ 'common.timeSlot' | t }}</th>
                  <th>{{ 'common.notifications' | t }}</th>
                  <th>{{ 'common.status' | t }}</th>
                  <th>{{ 'common.actions' | t }}</th>
                </tr>
              </thead>
              <tbody>
                @for (item of filtered(); track item.waitlistId) {
                  <tr>
                    <td><span class="flex h-10 min-w-10 items-center justify-center rounded-2xl bg-violet-50 px-3 font-black text-violet-700">#{{ item.queuePosition }}</span></td>
                    <td class="font-black text-slate-900">#WL-{{ item.waitlistId }}</td>
                    <td><p class="font-bold text-slate-800">{{ resourceName(item) }}</p></td>
                    <td><p class="font-bold text-slate-700">{{ item.requestedStart | date: 'HH:mm dd/MM' }}</p><p class="mt-1 text-xs text-slate-400">{{ item.requestedEnd | date: 'HH:mm dd/MM' }}</p></td>
                    <td>{{ item.notifiedAt ? (item.notifiedAt | date: 'HH:mm dd/MM/yyyy') : '—' }}</td>
                    <td><app-status-badge [value]="item.status" domain="waitlist" /></td>
                    <td>
                      <div class="flex gap-2">
                        @if (item.status === 'Waiting' || item.status === 'Notified') {
                          <button class="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-700" title="Hủy" (click)="cancel(item)"><app-icon name="x" [size]="16" /></button>
                        }
                        @if (item.status === 'Notified') {
                          <button class="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-amber-200 bg-amber-50 text-amber-700" title="Cho hết hạn" (click)="expire(item)"><app-icon name="clock" [size]="16" /></button>
                        }
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </article>
    </section>
  `,
})
export class WaitlistsManagementPage implements OnInit {
  private readonly api = inject(SystemService)
  private readonly toast = inject(ToastService)
  protected readonly languageStore = inject(LanguageStore)
  protected readonly items = signal<WaitlistResponse[]>([])
  protected readonly labs = signal<LabRoomResponse[]>([])
  protected readonly equipments = signal<EquipmentResponse[]>([])
  protected readonly loading = signal(true)
  protected status = ''
  protected labId: number | null = null
  protected equipmentId: number | null = null
  protected requestedStart = toLocalDateTimeInput(new Date(Date.now() + 24 * 60 * 60_000))
  protected requestedEnd = toLocalDateTimeInput(new Date(Date.now() + 26 * 60 * 60_000))

  protected readonly tabs = computed(() => [
    { value: '', label: this.languageStore.t('common.all'), className: 'text-slate-950', iconName: 'clock', bgTint: 'bg-slate-100 text-slate-700' },
    { value: 'Waiting', label: this.languageStore.lang() === 'en' ? 'Waiting' : 'Đang chờ', className: 'text-amber-600', iconName: 'clock', bgTint: 'bg-amber-100 text-amber-700' },
    { value: 'Notified', label: this.languageStore.lang() === 'en' ? 'Notified' : 'Đã thông báo', className: 'text-emerald-600', iconName: 'send', bgTint: 'bg-emerald-100 text-emerald-700' },
    { value: 'Booked', label: this.languageStore.lang() === 'en' ? 'Booked' : 'Đã booking', className: 'text-indigo-600', iconName: 'check', bgTint: 'bg-indigo-100 text-indigo-700' },
    { value: 'Expired', label: this.languageStore.lang() === 'en' ? 'Expired' : 'Hết hạn', className: 'text-rose-600', iconName: 'alert', bgTint: 'bg-rose-100 text-rose-700' },
  ])

  protected readonly equipmentOptions = computed(() => (this.labId ? this.equipments().filter((x) => x.labId === this.labId) : this.equipments()))
  protected readonly filtered = computed(() => this.items().filter((x) => !this.status || x.status === this.status).sort((a, b) => a.queuePosition - b.queuePosition))

  ngOnInit(): void {
    this.api.labs().subscribe((x) => this.labs.set(x))
    this.api.equipments().subscribe((x) => this.equipments.set(x))
    this.loadAll()
  }

  protected count(status: string): number {
    return status ? this.items().filter((x) => x.status === status).length : this.items().length
  }

  protected resourceName(item: WaitlistResponse): string {
    if (item.labId) return this.labs().find((x) => x.labId === item.labId)?.labName ?? `Phòng #${item.labId}`
    return this.equipments().find((x) => x.equipmentId === item.equipmentId)?.equipmentName ?? `Thiết bị #${item.equipmentId}`
  }

  protected canNotify(): boolean {
    return Boolean((this.labId || this.equipmentId) && this.requestedStart && this.requestedEnd)
  }

  protected loadAll(): void {
    this.loading.set(true)
    this.api.waitlists().subscribe({
      next: (x) => {
        this.items.set(x)
        this.loading.set(false)
      },
      error: () => {
        this.loading.set(false)
        this.toast.error('Không tải được hàng chờ')
      },
    })
  }

  protected loadQueue(): void {
    if (!this.requestedStart || !this.requestedEnd) {
      this.loadAll()
      return
    }
    this.loading.set(true)
    this.api.waitlistQueue({ labId: this.labId ?? undefined, equipmentId: this.equipmentId ?? undefined, requestedStart: toIso(this.requestedStart), requestedEnd: toIso(this.requestedEnd) }).subscribe({
      next: (x) => {
        this.items.set(x)
        this.loading.set(false)
      },
      error: () => {
        this.loading.set(false)
        this.toast.error('Không tải được queue')
      },
    })
  }

  protected notifyNext(): void {
    this.api.notifyNextWaitlist({ labId: this.labId, equipmentId: this.equipmentId, requestedStart: toIso(this.requestedStart), requestedEnd: toIso(this.requestedEnd) }).subscribe({
      next: () => {
        this.toast.success('Đã thông báo người tiếp theo')
        this.loadQueue()
      },
      error: () => this.toast.error('Không thể thông báo người tiếp theo'),
    })
  }

  protected cancel(item: WaitlistResponse): void {
    if (!confirm(`Hủy waitlist #${item.waitlistId}?`)) return
    this.api.cancelWaitlist(item.waitlistId).subscribe({
      next: () => {
        this.toast.success('Đã hủy waitlist')
        this.loadAll()
      },
      error: () => this.toast.error('Không thể hủy waitlist'),
    })
  }

  protected expire(item: WaitlistResponse): void {
    if (!confirm(`Cho hết hạn waitlist #${item.waitlistId}?`)) return
    this.api.expireWaitlist(item.waitlistId).subscribe({
      next: () => {
        this.toast.success('Đã cho hết hạn')
        this.loadAll()
      },
      error: () => this.toast.error('Không thể cho hết hạn'),
    })
  }
}
