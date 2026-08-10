import { DatePipe } from '@angular/common'
import { Component, OnInit, computed, inject, signal } from '@angular/core'
import { ActivatedRoute, Router, RouterLink } from '@angular/router'
import { SystemService } from '../../core/api/system.service'
import type {
  EquipmentResponse,
  LabRoomResponse,
  MaintenanceDetailResponse,
} from '../../core/api/system.models'
import { AuthStore } from '../../core/auth/auth.store'
import { IconComponent } from '../../shared/ui/icon'
import { PageHeaderComponent } from '../../shared/ui/page-header'
import { StatusBadgeComponent } from '../../shared/ui/status-badge'
import { ToastService } from '../../shared/ui/toast.service'
import { ConfirmDialogService } from '../../shared/ui/confirm-dialog'
import { formatMoney, labelOf } from '../../shared/utils/presentation'
import { TranslatePipe } from '../../core/i18n/translate.pipe'

@Component({
  selector: 'app-maintenance-detail-page',
  imports: [
    DatePipe,
    RouterLink,
    PageHeaderComponent,
    IconComponent,
    StatusBadgeComponent,
    TranslatePipe,
  ],
  template: `<section class="space-y-6">
    @if (loading()) {
      <div class="card-surface p-7">
        <div class="skeleton h-8 w-1/3 rounded"></div>
        <div class="skeleton mt-5 h-80 rounded-3xl"></div>
      </div>
    } @else if (accessDenied() || !item()) {
      <div
        class="mx-auto my-8 max-w-xl space-y-5 rounded-[28px] border border-amber-200 bg-amber-50/90 p-8 text-center shadow-lg backdrop-blur-sm sm:p-10"
      >
        <div
          class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 text-amber-700 shadow-inner"
        >
          <app-icon name="shield" [size]="32" />
        </div>

        <div>
          <span
            class="inline-block rounded-full bg-amber-200/60 px-3 py-1 text-[11px] font-black tracking-wider text-amber-900 uppercase"
          >
            HTTP 403 Forbidden
          </span>
          <h3 class="mt-2 text-2xl font-black text-slate-950 sm:text-3xl">
            {{ 'common.accessDeniedTitle' | t }}
          </h3>
          <p class="mt-2 text-sm text-slate-600">
            {{ 'common.accessDeniedSubtitle' | t }}
          </p>
        </div>

        <div class="flex flex-wrap justify-center gap-3 pt-2">
          <a
            routerLink="/app/calendar"
            class="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-700"
          >
            <app-icon name="calendar" [size]="15" /> {{ 'calendar.backToCalendar' | t }}
          </a>

          <a
            routerLink="/app/management/maintenances"
            class="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <app-icon name="arrow-left" [size]="15" /> {{ 'maintenanceDetail.backToList' | t }}
          </a>
        </div>
      </div>
    } @else {
      <app-page-header
        [title]="('maintenanceDetail.titlePrefix' | t) + ' #MT-' + item()!.maintenanceId.toString().padStart(4, '0')"
        [subtitle]="resourceName() + ' · ' + (labelOf('recurrence', item()!.recurrenceType) | t)"
      >
        @if (canManage() && item()!.status === 'Scheduled') {
          <a
            [routerLink]="['/app/management/maintenances', item()!.maintenanceId, 'edit']"
            class="btn-secondary"
            ><app-icon name="edit" [size]="17" /> {{ 'maintenanceDetail.edit' | t }}</a
          ><button class="btn-primary" (click)="action('start')">
            <app-icon name="play" [size]="17" /> {{ 'maintenanceDetail.start' | t }}
          </button>
        }
        @if (canManage() && item()!.status === 'InProgress') {
          <button class="btn-primary" (click)="action('complete')">
            <app-icon name="check" [size]="17" /> {{ 'maintenanceDetail.complete' | t }}
          </button>
        }
      </app-page-header>
      <div class="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div class="space-y-6">
          <article class="card-surface p-6 sm:p-7">
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="text-xs font-black tracking-[.16em] text-amber-500 uppercase">
                  {{ 'maintenanceDetail.infoTitle' | t }}
                </p>
                <h2 class="mt-2 text-2xl font-black text-slate-950">{{ resourceName() }}</h2>
              </div>
              <app-status-badge [value]="item()!.status" domain="maintenance" />
            </div>
            <div class="mt-6 grid gap-4 sm:grid-cols-2">
              <div class="rounded-2xl bg-slate-50 p-5">
                <p class="text-[10px] font-black text-slate-400 uppercase">{{ 'maintenanceForm.startTime' | t }}</p>
                <p class="mt-2 font-black text-slate-900">
                  {{ item()!.startTime | date: 'HH:mm dd/MM/yyyy' }}
                </p>
              </div>
              <div class="rounded-2xl bg-slate-50 p-5">
                <p class="text-[10px] font-black text-slate-400 uppercase">{{ 'maintenanceForm.endTime' | t }}</p>
                <p class="mt-2 font-black text-slate-900">
                  {{ item()!.endTime | date: 'HH:mm dd/MM/yyyy' }}
                </p>
              </div>
              <div class="rounded-2xl bg-slate-50 p-5">
                <p class="text-[10px] font-black text-slate-400 uppercase">{{ 'maintenanceDetail.duration' | t }}</p>
                <p class="mt-2 font-black text-slate-900">{{ duration() }} {{ 'maintenanceDetail.hours' | t }}</p>
              </div>
              <div class="rounded-2xl bg-slate-50 p-5">
                <p class="text-[10px] font-black text-slate-400 uppercase">{{ 'maintenanceForm.cost' | t }}</p>
                <p class="mt-2 font-black text-slate-900">
                  {{ formatMoney(item()!.maintenanceCost) }}
                </p>
              </div>
            </div>
            <div class="mt-5 rounded-2xl border border-slate-200 p-5">
              <p class="text-xs font-black text-slate-700">{{ 'maintenanceForm.notes' | t }}</p>
              <p class="mt-2 text-sm leading-7 whitespace-pre-line text-slate-500">
                {{ item()!.notes || ('maintenanceDetail.noNotes' | t) }}
              </p>
            </div>
          </article>
          <article class="card-surface p-6">
            <h2 class="font-black text-slate-950">{{ 'maintenanceDetail.recurrenceConfig' | t }}</h2>
            <div class="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <p class="text-xs text-slate-400">{{ 'maintenanceForm.recurrenceType' | t }}</p>
                <p class="mt-1 font-black text-slate-800">
                  {{ labelOf('recurrence', item()!.recurrenceType) | t }}
                </p>
              </div>
              <div>
                <p class="text-xs text-slate-400">{{ 'maintenanceForm.recurrenceInterval' | t }}</p>
                <p class="mt-1 font-black text-slate-800">{{ item()!.recurrenceInterval }}</p>
              </div>
              <div>
                <p class="text-xs text-slate-400">{{ 'maintenanceForm.recurrenceEndDate' | t }}</p>
                <p class="mt-1 font-black text-slate-800">
                  {{
                    item()!.recurrenceEndDate
                      ? (item()!.recurrenceEndDate | date: 'dd/MM/yyyy HH:mm')
                      : '—'
                  }}
                </p>
              </div>
              <div>
                <p class="text-xs text-slate-400">Parent ID</p>
                <p class="mt-1 font-black text-slate-800">
                  {{ item()!.parentMaintenanceId ?? '—' }}
                </p>
              </div>
            </div>
          </article>
        </div>
        <aside class="space-y-5">
          <article class="card-surface p-5">
            <p class="text-xs font-black tracking-[.16em] text-violet-500 uppercase">
              {{ 'maintenanceDetail.creator' | t }}
            </p>
            <div class="mt-3.5 flex items-center gap-3">
              <div
                class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-sm font-black text-white shadow-md shadow-violet-500/20"
              >
                {{
                  (
                    item()!.createdByName ||
                    item()!.createdByFullName ||
                    item()!.createdUserFullName ||
                    'U'
                  )
                    .charAt(0)
                    .toUpperCase()
                }}
              </div>
              <div class="min-w-0">
                <p class="truncate text-base font-black text-slate-900">
                  {{
                    item()!.createdByName ||
                    item()!.createdByFullName ||
                    item()!.createdUserFullName ||
                    'User #' + item()!.createdById
                  }}
                </p>
                @if (item()!.createdUserEmail || item()!.createdByEmail) {
                  <p class="truncate text-xs font-medium text-slate-400">
                    {{ item()!.createdUserEmail || item()!.createdByEmail }}
                  </p>
                } @else {
                  <p class="text-xs font-medium text-slate-400">ID: #{{ item()!.createdById }}</p>
                }
              </div>
            </div>
          </article>
          @if (canManage() && ['Scheduled', 'InProgress'].includes(item()!.status)) {
            <article class="rounded-[24px] border border-rose-200 bg-rose-50 p-5">
              <p class="font-black text-rose-900">{{ 'maintenanceDetail.cancelTitle' | t }}</p>
              <p class="mt-2 text-sm leading-6 text-rose-800/75">
                {{ 'maintenanceDetail.cancelDesc' | t }}
              </p>
              <div class="mt-4 grid gap-2">
                <button class="btn-secondary btn-danger" (click)="action('cancel')">
                  {{ 'maintenanceDetail.cancelSingle' | t }}
                </button>
                @if (item()!.recurrenceType !== 'None' && !item()!.recurrenceStopped) {
                  <button class="btn-secondary btn-danger" (click)="action('cancel-series')">
                    {{ 'maintenanceDetail.cancelSeries' | t }}
                  </button>
                }
              </div>
            </article>
          }
        </aside>
      </div>
    }
  </section>`,
})
export class MaintenanceDetailPage implements OnInit {
  private readonly api = inject(SystemService)
  private readonly route = inject(ActivatedRoute)
  private readonly router = inject(Router)
  private readonly toast = inject(ToastService)
  private readonly store = inject(AuthStore)
  private readonly confirmDialog = inject(ConfirmDialogService)
  protected readonly item = signal<MaintenanceDetailResponse | null>(null)
  protected readonly labs = signal<LabRoomResponse[]>([])
  protected readonly equipments = signal<EquipmentResponse[]>([])
  protected readonly loading = signal(true)
  protected readonly accessDenied = signal(false)
  protected readonly errorMessage = signal('')
  protected readonly labelOf = labelOf
  protected readonly formatMoney = formatMoney
  private id = 0
  protected readonly canManage = computed(() => this.store.isManager())
  protected readonly resourceName = computed(() => {
    const item = this.item()
    if (!item) return ''
    if (item.labId)
      return this.labs().find((x) => x.labId === item.labId)?.labName ?? `Phòng #${item.labId}`
    return (
      this.equipments().find((x) => x.equipmentId === item.equipmentId)?.equipmentName ??
      `Thiết bị #${item.equipmentId}`
    )
  })
  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'))
    this.api.labs().subscribe((x) => this.labs.set(x))
    this.api.equipments().subscribe((x) => this.equipments.set(x))
    this.load()
  }
  protected duration(): number {
    const x = this.item()
    return x ? Math.round((+new Date(x.endTime) - +new Date(x.startTime)) / 360000) / 10 : 0
  }
  protected async action(action: 'start' | 'complete' | 'cancel' | 'cancel-series'): Promise<void> {
    const actionText =
      action === 'start' ? 'bắt đầu' : action === 'complete' ? 'hoàn thành' : 'hủy'
    const confirmed = await this.confirmDialog.confirm({
      title: 'Xác nhận lịch bảo trì',
      message: `Xác nhận ${actionText} lịch bảo trì #${this.id}?`,
      variant: action.includes('cancel') ? 'danger' : 'primary',
      confirmText: action === 'start' ? 'Bắt đầu' : action === 'complete' ? 'Hoàn thành' : 'Hủy lịch',
    })
    if (!confirmed) return
    const request =
      action === 'start'
        ? this.api.startMaintenance(this.id)
        : action === 'complete'
          ? this.api.completeMaintenance(this.id)
          : action === 'cancel'
            ? this.api.cancelMaintenance(this.id)
            : this.api.cancelMaintenanceSeries(this.id)
    request.subscribe({
      next: () => {
        this.toast.success('Đã cập nhật lịch bảo trì')
        this.load()
      },
      error: () => this.toast.error('Không thể cập nhật lịch bảo trì'),
    })
  }
  private load(): void {
    this.loading.set(true)
    this.accessDenied.set(false)
    this.errorMessage.set('')
    this.api.maintenance(this.id).subscribe({
      next: (x) => {
        this.item.set(x)
        this.loading.set(false)
      },
      error: (err: any) => {
        this.loading.set(false)
        this.item.set(null)
        this.accessDenied.set(true)
        const msg =
          err?.error?.message ||
          err?.error?.detail ||
          err?.message ||
          '🔒 Bạn không có quyền quản lý phòng Lab chứa lịch bảo trì này.'
        this.errorMessage.set(msg)
      },
    })
  }
}
