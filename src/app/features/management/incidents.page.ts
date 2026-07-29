import { DatePipe, NgClass } from '@angular/common'
import { Component, OnInit, computed, inject, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { SystemService } from '../../core/api/system.service'
import type { UsageLogResponse } from '../../core/api/system.models'
import { LanguageStore } from '../../core/i18n/language.store'
import { TranslatePipe } from '../../core/i18n/translate.pipe'
import { DataStateComponent } from '../../shared/ui/data-state'
import { IconComponent } from '../../shared/ui/icon'
import { ModalComponent } from '../../shared/ui/modal'
import { PageHeaderComponent } from '../../shared/ui/page-header'
import { StatusBadgeComponent } from '../../shared/ui/status-badge'
import { ToastService } from '../../shared/ui/toast.service'
import { labelOf } from '../../shared/utils/presentation'

@Component({
  selector: 'app-incidents-page',
  imports: [
    DatePipe,
    NgClass,
    FormsModule,
    PageHeaderComponent,
    IconComponent,
    ModalComponent,
    StatusBadgeComponent,
    DataStateComponent,
    TranslatePipe,
  ],
  template: `
    <section class="space-y-6">
      <app-page-header [title]="'incidents.title' | t" [subtitle]="'incidents.subtitle' | t" />
      <div class="filter-bar md:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_auto]">
        <div>
          <label class="field-label">{{ 'common.from' | t }}</label
          ><input class="input-shell" type="date" [(ngModel)]="from" />
        </div>
        <div>
          <label class="field-label">{{ 'common.to' | t }}</label
          ><input class="input-shell" type="date" [(ngModel)]="to" />
        </div>
        <div>
          <label class="field-label">{{ 'common.status' | t }}</label>
          <select class="input-shell" [(ngModel)]="status">
            <option value="">{{ 'common.all' | t }}</option>
            <option value="Pending">{{ 'incidents.pending' | t }}</option>
            <option value="Confirmed">{{ 'incidents.confirmed' | t }}</option>
            <option value="Rejected">{{ 'incidents.rejected' | t }}</option>
          </select>
        </div>
        <div class="flex items-end">
          <button class="btn-primary w-full" (click)="load()">
            <app-icon name="filter" [size]="17" /> {{ 'common.apply' | t }}
          </button>
        </div>
      </div>
      <div class="grid gap-4 sm:grid-cols-3">
        <div class="kpi-card">
          <p class="text-xs font-bold text-slate-400">{{ 'incidents.pending' | t }}</p>
          <p class="mt-2 text-3xl font-black text-amber-600">{{ count('Pending') }}</p>
        </div>
        <div class="kpi-card">
          <p class="text-xs font-bold text-slate-400">{{ 'incidents.confirmed' | t }}</p>
          <p class="mt-2 text-3xl font-black text-emerald-600">{{ count('Confirmed') }}</p>
        </div>
        <div class="kpi-card">
          <p class="text-xs font-bold text-slate-400">{{ 'incidents.rejected' | t }}</p>
          <p class="mt-2 text-3xl font-black text-rose-600">{{ count('Rejected') }}</p>
        </div>
      </div>
      @if (loading()) {
        <div class="card-surface p-6"><div class="skeleton h-96 rounded-2xl"></div></div>
      } @else if (filtered().length === 0) {
        <app-data-state
          [title]="'incidents.noIncidentsTitle' | t"
          [message]="'incidents.noIncidentsSub' | t"
          icon="shield"
        />
      } @else {
        <div class="grid gap-5 lg:grid-cols-2">
          @for (item of filtered(); track item.logId) {
            <article class="card-surface p-5 sm:p-6">
              <div class="flex items-start justify-between gap-4">
                <div
                  class="flex h-12 w-12 items-center justify-center rounded-2xl"
                  [ngClass]="
                    item.incidentReviewStatus === 'Pending'
                      ? 'bg-amber-50 text-amber-600'
                      : item.incidentReviewStatus === 'Confirmed'
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-rose-50 text-rose-600'
                  "
                >
                  <app-icon name="alert" [size]="22" />
                </div>
                <app-status-badge [value]="item.incidentReviewStatus" domain="incident" />
              </div>
              <p class="mt-5 text-lg font-black text-slate-950">
                {{ labelOf('incidentType', item.incidentStatus, languageStore.lang()) }}
              </p>
              <p class="mt-1 text-xs text-slate-400">
                UsageLog #{{ item.logId }} · BookingItem #{{ item.bookingItemId }}
              </p>
              <p class="mt-4 min-h-12 text-sm leading-6 text-slate-600">
                {{ item.incidentDescription || ('common.noData' | t) }}
              </p>
              <div class="mt-4 rounded-2xl bg-slate-50 p-4">
                <div class="flex items-center justify-between text-xs">
                  <span class="text-slate-400">Thiết bị ảnh hưởng</span>
                  <strong class="text-slate-700">{{
                    item.affectedEquipmentId ? '#' + item.affectedEquipmentId : '—'
                  }}</strong>
                </div>
                <div class="mt-3 flex items-center justify-between text-xs">
                  <span class="text-slate-400">Check-in</span>
                  <strong class="text-slate-700">{{
                    item.actualCheckin | date: 'HH:mm dd/MM/yyyy'
                  }}</strong>
                </div>
              </div>
              @if (item.incidentReviewNote) {
                <div class="mt-4 rounded-2xl border border-slate-200 p-4">
                  <p class="text-[10px] font-black text-slate-400 uppercase">Ghi chú xét duyệt</p>
                  <p class="mt-2 text-sm text-slate-600">{{ item.incidentReviewNote }}</p>
                </div>
              }
              @if (item.incidentReviewStatus === 'Pending') {
                <div class="mt-5 flex gap-2">
                  <button
                    class="btn-secondary btn-danger flex-1"
                    (click)="openReview(item, 'reject')"
                  >
                    <app-icon name="x" [size]="16" /> {{ 'incidents.reject' | t }}
                  </button>
                  <button class="btn-primary flex-1" (click)="openReview(item, 'confirm')">
                    <app-icon name="check" [size]="16" /> {{ 'incidents.confirm' | t }}
                  </button>
                </div>
              }
            </article>
          }
        </div>
      }
      <app-modal
        [open]="reviewOpen()"
        [title]="reviewAction === 'confirm' ? ('incidents.confirm' | t) : ('incidents.reject' | t)"
        [subtitle]="selected() ? 'UsageLog #' + selected()!.logId : ''"
        (close)="reviewOpen.set(false)"
      >
        @if (reviewAction === 'confirm') {
          <div
            class="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800"
          >
            <strong>Warning:</strong> confirmed incidents may generate automatic violations and
            penalty points.
          </div>
        }
        <label class="field-label">Ghi chú xét duyệt</label>
        <textarea
          class="textarea-shell"
          [(ngModel)]="reviewNote"
          placeholder="Kết quả kiểm tra, bằng chứng hoặc hướng xử lý..."
        ></textarea>
        <div class="mt-5 flex justify-end gap-2">
          <button class="btn-secondary" (click)="reviewOpen.set(false)">
            {{ 'common.cancel' | t }}
          </button>
          <button class="btn-primary" (click)="review()">{{ 'common.apply' | t }}</button>
        </div>
      </app-modal>
    </section>
  `,
})
export class IncidentsPage implements OnInit {
  private readonly api = inject(SystemService)
  private readonly toast = inject(ToastService)
  protected readonly languageStore = inject(LanguageStore)
  protected readonly items = signal<UsageLogResponse[]>([])
  protected readonly loading = signal(true)
  protected readonly reviewOpen = signal(false)
  protected readonly selected = signal<UsageLogResponse | null>(null)
  protected from = ''
  protected to = ''
  protected status = 'Pending'
  protected reviewAction: 'confirm' | 'reject' = 'confirm'
  protected reviewNote = ''
  protected readonly labelOf = labelOf
  protected readonly filtered = computed(() =>
    this.items().filter((x) => !this.status || x.incidentReviewStatus === this.status),
  )

  ngOnInit(): void {
    const now = new Date()
    const start = new Date()
    start.setDate(start.getDate() - 30)
    this.from = start.toISOString().slice(0, 10)
    this.to = now.toISOString().slice(0, 10)
    this.load()
  }

  protected count(status: string): number {
    return this.items().filter((x) => x.incidentReviewStatus === status).length
  }

  protected openReview(item: UsageLogResponse, action: 'confirm' | 'reject'): void {
    this.selected.set(item)
    this.reviewAction = action
    this.reviewNote = ''
    this.reviewOpen.set(true)
  }

  protected review(): void {
    const item = this.selected()
    if (!item) return
    this.api.reviewIncident(item.logId, this.reviewAction, this.reviewNote || null).subscribe({
      next: () => {
        this.reviewOpen.set(false)
        this.toast.success(
          this.reviewAction === 'confirm' ? 'Đã xác nhận sự cố' : 'Đã từ chối sự cố',
        )
        this.load()
      },
      error: () => this.toast.error('Không thể xét duyệt sự cố'),
    })
  }

  protected load(): void {
    this.loading.set(true)
    const from = this.from ? new Date(this.from + 'T00:00:00').toISOString() : undefined
    const to = this.to ? new Date(this.to + 'T23:59:59').toISOString() : undefined
    this.api.incidentLogs(from, to).subscribe({
      next: (x) => {
        this.items.set(x)
        this.loading.set(false)
      },
      error: () => {
        this.loading.set(false)
        this.toast.error('Không tải được danh sách sự cố')
      },
    })
  }
}
