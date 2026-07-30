import { DatePipe } from '@angular/common'
import { Component, OnInit, computed, inject, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { RouterLink } from '@angular/router'
import { SystemService } from '../../core/api/system.service'
import type { BookingDetailResponse, BookingResponse } from '../../core/api/system.models'
import { LanguageStore } from '../../core/i18n/language.store'
import { TranslatePipe } from '../../core/i18n/translate.pipe'
import { DataStateComponent } from '../../shared/ui/data-state'
import { IconComponent } from '../../shared/ui/icon'
import { ModalComponent } from '../../shared/ui/modal'
import { PageHeaderComponent } from '../../shared/ui/page-header'
import { StatusBadgeComponent } from '../../shared/ui/status-badge'
import { ToastService } from '../../shared/ui/toast.service'
import { labelOf, toDateInput } from '../../shared/utils/presentation'

@Component({
  selector: 'app-bookings-management-page',
  imports: [DatePipe, FormsModule, RouterLink, PageHeaderComponent, IconComponent, ModalComponent, StatusBadgeComponent, DataStateComponent, TranslatePipe],
  template: `
    <section class="space-y-6">
      <app-page-header [title]="'manageBookings.title' | t" [subtitle]="'manageBookings.subtitle' | t">
        <a routerLink="/app/management/bookings/pending" class="btn-primary"><app-icon name="clock" [size]="17" /> {{ 'nav.pendingBookings' | t }}</a>
        <a routerLink="/app/calendar" class="btn-secondary"><app-icon name="calendar" [size]="17" /> {{ 'header.viewCalendar' | t }}</a>
      </app-page-header>

      <!-- KPI Cards -->
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        @for (card of cards(); track card.status) {
          <button type="button" class="kpi-card text-left transition hover:-translate-y-1" [class.ring-2]="status === card.status" [class.ring-violet-400]="status === card.status" (click)="status = card.status">
            <p class="text-[10px] font-black uppercase tracking-[.14em] text-slate-400">{{ card.label }}</p>
            <p class="mt-2 text-3xl font-black" [class]="card.className">{{ card.count }}</p>
          </button>
        }
      </div>

      <!-- Filters -->
      <div class="filter-bar md:grid-cols-2 xl:grid-cols-[1.5fr_1fr_1fr_1fr_auto_auto]">
        <div>
          <label class="field-label">{{ 'common.search' | t }}</label>
          <input class="input-shell" [(ngModel)]="keyword" [placeholder]="'manageBookings.searchPlaceholder' | t" />
        </div>
        <div>
          <label class="field-label">{{ 'common.status' | t }}</label>
          <select class="input-shell" [(ngModel)]="status">
            <option value="">{{ 'common.all' | t }}</option>
            @for (tab of statuses(); track tab.value) { <option [value]="tab.value">{{ tab.label }}</option> }
          </select>
        </div>
        <div><label class="field-label">{{ 'common.from' | t }}</label><input class="input-shell" type="date" [(ngModel)]="from" /></div>
        <div><label class="field-label">{{ 'common.to' | t }}</label><input class="input-shell" type="date" [(ngModel)]="to" /></div>
        <div class="flex items-end"><button class="btn-secondary w-full" (click)="reset()"><app-icon name="refresh" [size]="17" /> {{ 'common.reset' | t }}</button></div>
        <div class="flex items-end"><button class="btn-primary w-full" (click)="load()"><app-icon name="refresh" [size]="17" /> {{ 'common.refresh' | t }}</button></div>
      </div>

      <!-- Table -->
      <article class="card-surface overflow-hidden">
        <header class="flex items-center justify-between border-b border-slate-100 px-5 py-5">
          <div><h2 class="font-black text-slate-950">{{ 'manageBookings.title' | t }}</h2><p class="mt-1 text-xs text-slate-400">{{ filtered().length }} {{ 'common.records' | t }}</p></div>
        </header>
        @if (loading()) {
          <div class="p-6"><div class="skeleton h-80 rounded-2xl"></div></div>
        } @else if (filtered().length === 0) {
          <div class="p-6"><app-data-state [title]="'common.noData' | t" [message]="'common.noData' | t" icon="calendar" /></div>
        } @else {
          <div class="overflow-x-auto">
            <table class="table-shell">
              <thead>
                <tr>
                  <th>Booking</th>
                  <th>{{ 'nav.users' | t }}</th>
                  <th>{{ 'common.purpose' | t }}</th>
                  <th>{{ 'common.from' | t }}</th>
                  <th>{{ 'common.priority' | t }}</th>
                  <th>{{ 'common.status' | t }}</th>
                  <th>{{ 'common.action' | t }}</th>
                </tr>
              </thead>
              <tbody>
                @for (item of filtered(); track item.bookingId) {
                  <tr>
                    <td>
                      <button class="font-black text-cyan-700 hover:text-cyan-900" (click)="openDetail(item)">#BK-{{ item.bookingId.toString().padStart(5,'0') }}</button>
                      <p class="mt-1 text-xs text-slate-400">{{ item.createdAt | date:'dd/MM/yyyy' }}</p>
                    </td>
                    <td><p class="font-bold text-slate-800">User #{{ item.userId }}</p></td>
                    <td>{{ labelOf('purpose', item.purposeType, languageStore.lang()) }}</td>
                    <td><p class="font-bold text-slate-700">{{ item.startTime | date:'HH:mm dd/MM' }}</p><p class="mt-1 text-xs text-slate-400">{{ item.endTime | date:'HH:mm dd/MM' }}</p></td>
                    <td><span class="rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-black text-cyan-700">P{{ item.priorityLevel ?? '—' }}</span></td>
                    <td><app-status-badge [value]="item.status" domain="booking" /></td>
                    <td>
                      <div class="flex items-center gap-1.5">
                        <button class="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-black text-slate-700 hover:bg-slate-50" (click)="openDetail(item)">
                          <app-icon name="eye" [size]="15" /> Chi tiết
                        </button>
                        @if (item.status === 'Pending') {
                          <button class="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100" title="Duyệt" (click)="quickAction(item,'approve')"><app-icon name="check" [size]="16" /></button>
                          <button class="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100" title="Từ chối" (click)="openReject(item)"><app-icon name="x" [size]="16" /></button>
                        }
                        @if (item.status === 'Approved') {
                          <button class="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100" title="Hoàn thành" (click)="quickAction(item,'complete')"><app-icon name="check" [size]="16" /></button>
                          <button class="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100" title="NoShow" (click)="quickAction(item,'no-show')"><app-icon name="alert" [size]="16" /></button>
                          <button class="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100" title="Hủy booking" (click)="quickAction(item,'cancel')"><app-icon name="x" [size]="16" /></button>
                        }
                        @if (item.status === 'Pending' || item.status === 'Approved') {
                          <!-- cancel already in Approved section, Pending has reject -->
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

    <!-- Modal Từ chối booking -->
    <app-modal [open]="rejectOpen()" title="Từ chối booking" subtitle="Nhập lý do từ chối để người dùng biết." (close)="rejectOpen.set(false)">
      <div class="grid gap-4">
        <div>
          <label class="field-label">Lý do từ chối *</label>
          <textarea class="textarea-shell" [(ngModel)]="rejectReason" placeholder="Khung giờ này thiết bị đang bảo trì, vui lòng chọn khung giờ khác..."></textarea>
        </div>
        <div class="flex justify-end gap-2">
          <button type="button" class="btn-secondary" (click)="rejectOpen.set(false)">Hủy</button>
          <button class="btn-primary bg-rose-600 hover:bg-rose-700" [disabled]="actioning()" (click)="confirmReject()">{{ actioning() ? 'Đang gửi...' : 'Xác nhận từ chối' }}</button>
        </div>
      </div>
    </app-modal>

    <!-- Modal Chi tiết booking -->
    <app-modal [open]="detailOpen()" [title]="detailBooking() ? '#BK-' + detailBooking()!.bookingId.toString().padStart(5,'0') : 'Chi tiết'" subtitle="Thông tin đầy đủ của booking." (close)="detailOpen.set(false)">
      @if (detailLoading()) {
        <div class="space-y-3"><div class="skeleton h-8 rounded-xl"></div><div class="skeleton h-20 rounded-xl"></div><div class="skeleton h-12 rounded-xl"></div></div>
      } @else if (detailBooking()) {
        <div class="grid gap-4">
          <div class="grid gap-3 rounded-2xl bg-slate-50 p-4 sm:grid-cols-2">
            <div><p class="text-[10px] font-black uppercase tracking-[.14em] text-slate-400">Người đặt</p><p class="mt-1 font-black text-slate-900">{{ detailBooking()!.userName || 'User #' + detailBooking()!.userId }}</p></div>
            <div><p class="text-[10px] font-black uppercase tracking-[.14em] text-slate-400">Trạng thái</p><div class="mt-1"><app-status-badge [value]="detailBooking()!.status" domain="booking" /></div></div>
            <div><p class="text-[10px] font-black uppercase tracking-[.14em] text-slate-400">Mục đích</p><p class="mt-1 font-bold text-slate-800">{{ labelOf('purpose', detailBooking()!.purposeType, languageStore.lang()) }}</p></div>
            <div><p class="text-[10px] font-black uppercase tracking-[.14em] text-slate-400">Ưu tiên</p><p class="mt-1 font-bold text-slate-800">P{{ detailBooking()!.priorityLevel ?? '—' }}</p></div>
            <div><p class="text-[10px] font-black uppercase tracking-[.14em] text-slate-400">Bắt đầu</p><p class="mt-1 font-bold text-slate-800">{{ detailBooking()!.startTime | date:'HH:mm dd/MM/yyyy' }}</p></div>
            <div><p class="text-[10px] font-black uppercase tracking-[.14em] text-slate-400">Kết thúc</p><p class="mt-1 font-bold text-slate-800">{{ detailBooking()!.endTime | date:'HH:mm dd/MM/yyyy' }}</p></div>
            @if (detailBooking()!.purposeDescription) {
              <div class="sm:col-span-2"><p class="text-[10px] font-black uppercase tracking-[.14em] text-slate-400">Mô tả mục đích</p><p class="mt-1 text-sm text-slate-700">{{ detailBooking()!.purposeDescription }}</p></div>
            }
            @if (detailBooking()!.rejectionReason) {
              <div class="sm:col-span-2 rounded-xl border border-rose-200 bg-rose-50 p-3"><p class="text-[10px] font-black uppercase tracking-[.14em] text-rose-500">Lý do từ chối</p><p class="mt-1 text-sm text-rose-800">{{ detailBooking()!.rejectionReason }}</p></div>
            }
          </div>
          @if (detailBooking()!.items && detailBooking()!.items.length > 0) {
            <div>
              <p class="mb-2 text-xs font-black uppercase tracking-[.14em] text-slate-400">Tài nguyên đặt</p>
              <div class="divide-y divide-slate-100 rounded-2xl border border-slate-100 bg-white">
                @for (item of detailBooking()!.items; track item.bookingItemId) {
                  <div class="flex items-center gap-3 px-4 py-3">
                    <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600"><app-icon [name]="item.resourceType === 'Lab' ? 'building' : 'microscope'" [size]="18" /></div>
                    <div class="flex-1">
                      <p class="text-sm font-black text-slate-900">{{ item.labName || item.equipmentName || ('Tài nguyên #' + (item.labId || item.equipmentId)) }}</p>
                      <p class="text-xs text-slate-400">{{ item.resourceType }}{{ item.note ? ' · ' + item.note : '' }}</p>
                    </div>
                  </div>
                }
              </div>
            </div>
          }
          <!-- Action buttons in detail modal -->
          <div class="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
            <a [routerLink]="['/app/bookings', detailBooking()!.bookingId]" class="btn-secondary flex-1"><app-icon name="arrow-right" [size]="16" /> Xem trang đầy đủ</a>
            @if (detailBooking()!.status === 'Pending') {
              <button class="btn-primary bg-emerald-600 hover:bg-emerald-700" [disabled]="actioning()" (click)="quickAction(detailBooking()!,'approve')"><app-icon name="check" [size]="16" /> Duyệt</button>
              <button class="btn-primary bg-rose-600 hover:bg-rose-700" [disabled]="actioning()" (click)="openReject(detailBooking()!)"><app-icon name="x" [size]="16" /> Từ chối</button>
            }
            @if (detailBooking()!.status === 'Approved') {
              <button class="btn-primary bg-emerald-600 hover:bg-emerald-700" [disabled]="actioning()" (click)="quickAction(detailBooking()!,'complete')"><app-icon name="check" [size]="16" /> Hoàn thành</button>
              <button class="btn-secondary" [disabled]="actioning()" (click)="quickAction(detailBooking()!,'no-show')"><app-icon name="alert" [size]="16" /> NoShow</button>
              <button class="btn-secondary btn-danger" [disabled]="actioning()" (click)="quickAction(detailBooking()!,'cancel')"><app-icon name="x" [size]="16" /> Hủy</button>
            }
          </div>
        </div>
      }
    </app-modal>
  `,
})
export class BookingsManagementPage implements OnInit {
  private readonly api = inject(SystemService)
  private readonly toast = inject(ToastService)
  protected readonly languageStore = inject(LanguageStore)
  protected readonly items = signal<BookingResponse[]>([])
  protected readonly loading = signal(true)
  protected readonly actioning = signal(false)
  protected readonly rejectOpen = signal(false)
  protected readonly detailOpen = signal(false)
  protected readonly detailLoading = signal(false)
  protected readonly detailBooking = signal<BookingDetailResponse | null>(null)
  protected rejectTarget: BookingResponse | null = null
  protected rejectReason = ''
  protected keyword = ''
  protected status = ''
  protected from = ''
  protected to = ''
  protected readonly labelOf = labelOf
  protected readonly statuses = computed(() => [
    { value: 'Pending', label: labelOf('booking', 'Pending', this.languageStore.lang()) },
    { value: 'Approved', label: labelOf('booking', 'Approved', this.languageStore.lang()) },
    { value: 'Rejected', label: labelOf('booking', 'Rejected', this.languageStore.lang()) },
    { value: 'Cancelled', label: labelOf('booking', 'Cancelled', this.languageStore.lang()) },
    { value: 'Completed', label: labelOf('booking', 'Completed', this.languageStore.lang()) },
    { value: 'NoShow', label: labelOf('booking', 'NoShow', this.languageStore.lang()) }
  ])
  protected readonly filtered = computed(() => {
    const needle = this.keyword.trim().toLowerCase()
    return [...this.items()].filter((item) => {
      const date = toDateInput(new Date(item.startTime))
      return (!this.status || item.status === this.status) &&
        (!this.from || date >= this.from) &&
        (!this.to || date <= this.to) &&
        (!needle || String(item.bookingId).includes(needle) || String(item.userId).includes(needle) ||
          labelOf('purpose', item.purposeType, this.languageStore.lang()).toLowerCase().includes(needle))
    }).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
  })
  protected readonly cards = computed(() => [
    { status: '', label: this.languageStore.t('dashboard.totalBookings'), count: this.items().length, className: 'text-slate-950' },
    ...this.statuses().map((item, index) => ({
      status: item.value,
      label: item.label,
      count: this.items().filter((booking) => booking.status === item.value).length,
      className: ['text-amber-600', 'text-emerald-600', 'text-rose-600', 'text-slate-500', 'text-cyan-600', 'text-rose-600'][index]
    }))
  ])

  ngOnInit(): void { this.load() }

  protected load(): void {
    this.loading.set(true)
    this.api.bookings().subscribe({
      next: (items) => { this.items.set(items); this.loading.set(false) },
      error: () => { this.loading.set(false); this.toast.error('Không tải được danh sách booking') }
    })
  }

  protected reset(): void { this.keyword = ''; this.status = ''; this.from = ''; this.to = '' }

  protected openDetail(item: BookingResponse): void {
    this.detailBooking.set(null)
    this.detailLoading.set(true)
    this.detailOpen.set(true)
    this.api.booking(item.bookingId).subscribe({
      next: (detail) => { this.detailBooking.set(detail); this.detailLoading.set(false) },
      error: () => { this.detailLoading.set(false); this.toast.error('Không tải được chi tiết booking') }
    })
  }

  protected openReject(item: BookingResponse): void {
    this.rejectTarget = item
    this.rejectReason = ''
    this.rejectOpen.set(true)
  }

  protected confirmReject(): void {
    if (!this.rejectTarget || !this.rejectReason.trim()) { this.toast.info('Hãy nhập lý do từ chối'); return }
    this.actioning.set(true)
    this.api.rejectBooking(this.rejectTarget.bookingId, this.rejectReason.trim()).subscribe({
      next: () => {
        this.actioning.set(false); this.rejectOpen.set(false)
        if (this.detailBooking()?.bookingId === this.rejectTarget?.bookingId) this.detailOpen.set(false)
        this.toast.success('Đã từ chối booking'); this.load()
      },
      error: () => { this.actioning.set(false); this.toast.error('Không thể từ chối booking') }
    })
  }

  protected quickAction(item: BookingResponse, actionType: 'approve' | 'complete' | 'no-show' | 'cancel'): void {
    const labels: Record<string, string> = { approve: 'duyệt', complete: 'hoàn thành', 'no-show': 'NoShow', cancel: 'hủy' }
    if (!confirm(`Xác nhận ${labels[actionType]} booking #${item.bookingId}?`)) return
    this.actioning.set(true)
    const req = actionType === 'approve' ? this.api.approveBooking(item.bookingId)
      : actionType === 'complete' ? this.api.completeBooking(item.bookingId)
      : actionType === 'no-show' ? this.api.noShowBooking(item.bookingId)
      : this.api.cancelBooking(item.bookingId)
    req.subscribe({
      next: () => {
        this.actioning.set(false)
        this.toast.success('Đã cập nhật booking')
        if (this.detailBooking()?.bookingId === item.bookingId) {
          this.openDetail(item)
        }
        this.load()
      },
      error: () => { this.actioning.set(false); this.toast.error('Không thể cập nhật booking') }
    })
  }
}
