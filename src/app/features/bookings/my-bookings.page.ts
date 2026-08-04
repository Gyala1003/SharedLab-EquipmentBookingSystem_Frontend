import { DatePipe, NgClass } from '@angular/common'
import { Component, OnInit, computed, inject, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { RouterLink } from '@angular/router'
import { forkJoin, of } from 'rxjs'
import { catchError } from 'rxjs/operators'
import { SystemService } from '../../core/api/system.service'
import type { BookingDetailResponse, BookingItemResponse, BookingResponse, UsageLogResponse } from '../../core/api/system.models'
import { AuthStore } from '../../core/auth/auth.store'
import { LanguageStore } from '../../core/i18n/language.store'
import { TranslatePipe } from '../../core/i18n/translate.pipe'
import { DataStateComponent } from '../../shared/ui/data-state'
import { IconComponent } from '../../shared/ui/icon'
import { ModalComponent } from '../../shared/ui/modal'
import { PageHeaderComponent } from '../../shared/ui/page-header'
import { StatusBadgeComponent } from '../../shared/ui/status-badge'
import { ToastService } from '../../shared/ui/toast.service'
import { labelOf, getCheckInWindowInfo } from '../../shared/utils/presentation'

@Component({
  selector: 'app-my-bookings-page',
  imports: [
    DatePipe,
    NgClass,
    FormsModule,
    RouterLink,
    PageHeaderComponent,
    IconComponent,
    ModalComponent,
    StatusBadgeComponent,
    DataStateComponent,
    TranslatePipe,
  ],
  template: `
    <section class="space-y-6">
      <app-page-header [title]="'nav.items.myBookings' | t" [subtitle]="'bookings.mySubtitle' | t">
        <a routerLink="/app/bookings/new" class="btn-primary"><app-icon name="plus" [size]="17" /> {{ 'sidebar.quickBooking' | t }}</a>
        <a routerLink="/app/calendar" class="btn-secondary"><app-icon name="calendar" [size]="17" /> {{ 'header.viewCalendar' | t }}</a>
      </app-page-header>

      <!-- KPI cards (Tương tác click để lọc nhanh) -->
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <button
          type="button"
          class="kpi-card text-left transition hover:-translate-y-1"
          [class.ring-2]="activeStatus() === ''"
          [class.ring-violet-400]="activeStatus() === ''"
          (click)="setStatus('')"
        >
          <p class="text-xs font-bold text-slate-400">{{ 'dashboard.totalBookings' | t }}</p>
          <p class="mt-2 text-3xl font-black text-slate-950">{{ bookings().length }}</p>
        </button>

        <button
          type="button"
          class="kpi-card text-left transition hover:-translate-y-1"
          [class.ring-2]="activeStatus() === 'Pending'"
          [class.ring-amber-400]="activeStatus() === 'Pending'"
          (click)="setStatus('Pending')"
        >
          <p class="text-xs font-bold text-slate-400">{{ 'common.pending' | t }}</p>
          <p class="mt-2 text-3xl font-black text-amber-600">{{ count('Pending') }}</p>
        </button>

        <button
          type="button"
          class="kpi-card text-left transition hover:-translate-y-1"
          [class.ring-2]="activeStatus() === 'Approved'"
          [class.ring-emerald-400]="activeStatus() === 'Approved'"
          (click)="setStatus('Approved')"
        >
          <p class="text-xs font-bold text-slate-400">{{ 'common.approved' | t }}</p>
          <p class="mt-2 text-3xl font-black text-emerald-600">{{ count('Approved') }}</p>
        </button>

        <button
          type="button"
          class="kpi-card text-left transition hover:-translate-y-1"
          [class.ring-2]="activeStatus() === 'Completed'"
          [class.ring-indigo-400]="activeStatus() === 'Completed'"
          (click)="setStatus('Completed')"
        >
          <p class="text-xs font-bold text-slate-400">{{ 'common.completed' | t }}</p>
          <p class="mt-2 text-3xl font-black text-indigo-600">{{ count('Completed') }}</p>
        </button>
      </div>

      <!-- Surface chứa filter tabs và bảng -->
      <div class="card-surface overflow-hidden">
        <!-- Filter bar -->
        <div class="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex gap-2 overflow-x-auto">
            @for (tab of tabs(); track tab.value) {
              <button
                type="button"
                class="shrink-0 rounded-xl px-3.5 py-2 text-xs font-black transition"
                [ngClass]="activeStatus() === tab.value ? 'bg-cyan-600 text-white shadow-sm' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'"
                (click)="setStatus(tab.value)"
              >
                {{ tab.label }}
                <span class="ml-1 opacity-70">{{ tab.value === '' ? bookings().length : count(tab.value) }}</span>
              </button>
            }
          </div>

          <div class="relative sm:w-80">
            <span class="absolute left-3.5 top-3 text-slate-400"><app-icon name="search" [size]="17" /></span>
            <input
              class="input-shell h-11 pl-10"
              [ngModel]="keyword()"
              (ngModelChange)="keyword.set($event)"
              placeholder="{{ 'bookings.searchPlaceholder' | t }}"
            />
          </div>
        </div>

        @if (loading()) {
          <div class="p-6"><div class="skeleton h-72 rounded-2xl"></div></div>
        } @else if (filtered().length === 0) {
          <div class="p-6">
            <app-data-state [title]="'common.noData' | t" message="Không tìm thấy yêu cầu booking phù hợp với bộ lọc hiện tại." icon="calendar">
              <a routerLink="/app/bookings/new" class="btn-primary mt-5">{{ 'sidebar.quickBooking' | t }}</a>
            </app-data-state>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="table-shell">
              <thead>
                <tr>
                  <th>{{ 'bookings.bookingCode' | t }}</th>
                  <th>{{ 'bookings.resource' | t }}</th>
                  <th>{{ 'bookings.purpose' | t }}</th>
                  <th>{{ 'bookings.usageTime' | t }}</th>
                  <th>{{ 'bookings.priority' | t }}</th>
                  <th>{{ 'common.status' | t }}</th>
                  <th>{{ 'bookings.checkinStatus' | t }}</th>
                  <th class="text-right">{{ 'common.actions' | t }}</th>
                </tr>
              </thead>
              <tbody>
                @for (booking of filtered(); track booking.bookingId) {
                  <tr>
                    <!-- Mã Booking -->
                    <td>
                      <button
                        type="button"
                        class="font-black text-cyan-700 hover:text-cyan-900 hover:underline"
                        (click)="openDetail(booking)"
                      >
                        #BK-{{ booking.bookingId.toString().padStart(5, '0') }}
                      </button>
                      <p class="mt-0.5 text-[11px] text-slate-400">{{ booking.createdAt | date: 'dd/MM/yyyy' }}</p>
                    </td>

                    <!-- Tài nguyên đặt (Phòng lab / Thiết bị) -->
                    <td>
                      @if (resourceSummary(booking.bookingId); as summary) {
                        <div class="flex items-center gap-2">
                          <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                            <app-icon [name]="summary.icon" [size]="14" />
                          </span>
                          <span class="font-bold text-slate-900 line-clamp-1" [title]="summary.name | t">{{ summary.name | t }}</span>
                        </div>
                      } @else {
                        <span class="text-xs text-slate-400">Đang tải...</span>
                      }
                    </td>

                    <!-- Mục đích -->
                    <td>
                      <p class="font-bold text-slate-800">{{ labelOf('purpose', booking.purposeType, languageStore.lang()) }}</p>
                    </td>

                    <!-- Thời gian -->
                    <td>
                      <p class="font-bold text-slate-700">{{ booking.startTime | date: 'HH:mm dd/MM/yyyy' }}</p>
                      <p class="mt-0.5 text-xs text-slate-400">{{ 'common.to' | t }} {{ booking.endTime | date: 'HH:mm dd/MM/yyyy' }}</p>
                    </td>

                    <!-- Mức ưu tiên -->
                    <td>
                      <span class="rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-black text-cyan-700">P{{ booking.priorityLevel ?? '—' }}</span>
                    </td>

                    <!-- Trạng thái -->
                    <td>
                      <app-status-badge [value]="booking.status" domain="booking" />
                    </td>

                    <!-- Check-in / Check-out status -->
                    <td>
                      @if (booking.status === 'Approved') {
                        @if (checkedInLog(booking.bookingId); as log) {
                          @if (!log.actualCheckout) {
                            <div class="flex flex-col gap-1">
                              <span class="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-700">
                                <app-icon name="check" [size]="12" /> {{ 'bookings.checkedInAt' | t: { time: (log.actualCheckin | date: 'HH:mm') ?? '' } }}
                              </span>
                              <button
                                type="button"
                                class="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 hover:underline"
                                (click)="openDetail(booking)"
                              >
                                <app-icon name="logout" [size]="11" /> {{ 'bookings.checkoutNow' | t }} →
                              </button>
                            </div>
                          } @else {
                            <span class="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black text-slate-600">
                              <app-icon name="check" [size]="12" /> {{ 'bookings.checkedOut' | t }}
                            </span>
                          }
                        } @else {
                          @if (canCheckInNow(booking)) {
                            <button
                              type="button"
                              class="inline-flex items-center gap-1 rounded-lg border border-cyan-200 bg-cyan-50 px-2.5 py-1 text-[10px] font-black text-cyan-700 transition hover:bg-cyan-100"
                              (click)="openDetail(booking)"
                            >
                              <app-icon name="login" [size]="12" /> {{ 'bookings.checkinNow' | t }}
                            </button>
                          } @else if (isUpcoming(booking)) {
                            <span class="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-bold text-slate-400">
                              <app-icon name="clock" [size]="12" /> {{ 'bookings.notStartedYet' | t }}
                            </span>
                          } @else {
                            <span class="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-bold text-rose-600">
                              <app-icon name="alert" [size]="12" /> {{ 'bookings.overdue' | t }}
                            </span>
                          }
                        }
                      } @else if (booking.status === 'Pending') {
                        <span class="text-xs text-amber-600 font-bold">{{ 'bookings.awaitingApproval' | t }}</span>
                      } @else {
                        <span class="text-xs text-slate-400">—</span>
                      }
                    </td>

                    <!-- Hành động -->
                    <td class="text-right">
                      <div class="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          class="btn-secondary py-1.5 px-3 text-xs"
                          (click)="openDetail(booking)"
                        >
                          <app-icon name="eye" [size]="15" /> {{ 'common.detail' | t }}
                        </button>
                        @if (booking.status === 'Pending' || booking.status === 'Approved') {
                          <button
                            type="button"
                            class="btn-secondary btn-danger py-1.5 px-2.5 text-xs"
                            title="Hủy booking này"
                            (click)="confirmCancel(booking)"
                          >
                            <app-icon name="x" [size]="15" /> {{ 'common.cancel' | t }}
                          </button>
                        }
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>

      <!-- Modal Xem chi tiết booking -->
      <app-modal
        [open]="detailOpen()"
        [title]="detailBooking() ? 'Booking #BK-' + detailBooking()!.bookingId.toString().padStart(5, '0') : ('bookings.detailTitle' | t)"
        subtitle="{{ 'bookings.detailSubtitle' | t }}"
        (close)="detailOpen.set(false)"
      >
        @if (detailLoading()) {
          <div class="space-y-3"><div class="skeleton h-8 rounded-xl"></div><div class="skeleton h-32 rounded-xl"></div></div>
        } @else if (detailBooking(); as detail) {
          <div class="space-y-5">
            <!-- Thẻ thông tin tổng quan -->
            <div class="grid gap-3 rounded-2xl bg-slate-50 p-4 text-xs sm:grid-cols-2">
              <div>
                <span class="text-slate-400">{{ 'common.status' | t }}:</span>
                <div class="mt-1"><app-status-badge [value]="detail.status" domain="booking" /></div>
              </div>
              <div>
                <span class="text-slate-400">{{ 'bookings.priorityLevel' | t }}:</span>
                <p class="mt-1 font-bold text-slate-800">P{{ detail.priorityLevel ?? '—' }}</p>
              </div>
              <div>
                <span class="text-slate-400">{{ 'bookings.startTime' | t }}:</span>
                <p class="mt-1 font-bold text-slate-800">{{ detail.startTime | date: 'HH:mm dd/MM/yyyy' }}</p>
              </div>
              <div>
                <span class="text-slate-400">{{ 'bookings.endTime' | t }}:</span>
                <p class="mt-1 font-bold text-slate-800">{{ detail.endTime | date: 'HH:mm dd/MM/yyyy' }}</p>
              </div>
              <div class="sm:col-span-2">
                <span class="text-slate-400">{{ 'bookings.purposeDesc' | t }}:</span>
                <p class="mt-1 font-bold text-slate-800">{{ labelOf('purpose', detail.purposeType, languageStore.lang()) }}</p>
                @if (detail.purposeDescription) {
                  <p class="mt-1 text-slate-600 whitespace-pre-line">{{ detail.purposeDescription }}</p>
                }
              </div>
              @if (detail.rejectionReason) {
                <div class="sm:col-span-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-rose-800">
                  <p class="font-bold">{{ 'bookings.rejectionReason' | t }}:</p>
                  <p class="mt-1">{{ detail.rejectionReason }}</p>
                </div>
              }
            </div>

            <!-- Danh sách tài nguyên -->
            <div>
              <p class="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">{{ 'bookings.registeredResources' | t }}</p>
              <div class="space-y-2">
                @for (item of detail.items; track item.bookingItemId) {
                  <div class="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 text-xs">
                    <div class="flex items-center gap-3">
                      <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                        <app-icon [name]="item.resourceType === 'LabRoom' ? 'building' : 'microscope'" [size]="16" />
                      </span>
                      <div>
                        <p class="font-black text-slate-900">{{ (item.labName || item.equipmentName || ('Tài nguyên #' + item.bookingItemId)) | t }}</p>
                        <p class="text-[10px] text-slate-400">{{ labelOf('resource', item.resourceType, languageStore.lang()) }} {{ item.note ? ' · ' + item.note : '' }}</p>
                      </div>
                    </div>

                    <!-- Thao tác Check-in / Check-out trực tiếp trong Modal -->
                    <div>
                      @if (detail.status === 'Approved') {
                        @if (!logFor(item.bookingItemId)) {
                          <button
                            type="button"
                            class="btn-primary py-1 px-3 text-xs"
                            [disabled]="!canCheckInNow(detail)"
                            (click)="checkInItem(item.bookingItemId)"
                          >
                            <app-icon name="login" [size]="14" /> {{ 'bookings.checkinNow' | t }}
                          </button>
                        } @else if (logFor(item.bookingItemId); as log) {
                          @if (!log.actualCheckout) {
                            <button
                              type="button"
                              class="btn-primary py-1 px-3 text-xs bg-rose-600 hover:bg-rose-700"
                              (click)="checkOutLog(log.logId)"
                            >
                              <app-icon name="logout" [size]="14" /> Check-out
                            </button>
                          } @else {
                            <span class="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">{{ 'bookings.checkedOut' | t }}</span>
                          }
                        }
                      }
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- Nút liên kết đến trang chi tiết đầy đủ -->
            <div class="flex justify-between items-center border-t border-slate-100 pt-4">
              <a [routerLink]="['/app/bookings', detail.bookingId]" class="btn-secondary text-xs" (click)="detailOpen.set(false)">
                <app-icon name="arrow-right" [size]="15" /> {{ 'bookings.openFullDetail' | t }}
              </a>

              @if (detail.status === 'Pending' || detail.status === 'Approved') {
                <button type="button" class="btn-secondary btn-danger text-xs" (click)="confirmCancel(detail)">
                  <app-icon name="x" [size]="15" /> {{ 'bookings.cancelThisBooking' | t }}
                </button>
              }
            </div>
          </div>
        }
      </app-modal>
    </section>
  `,
})
export class MyBookingsPage implements OnInit {
  private readonly api = inject(SystemService)
  private readonly store = inject(AuthStore)
  protected readonly languageStore = inject(LanguageStore)
  private readonly toast = inject(ToastService)

  protected readonly bookings = signal<BookingResponse[]>([])
  protected readonly detailsMap = signal(new Map<number, BookingDetailResponse>())
  protected readonly allLogs = signal<UsageLogResponse[]>([])
  protected readonly loading = signal(true)

  protected readonly activeStatus = signal('')
  protected readonly keyword = signal('')

  // Modal State
  protected readonly detailOpen = signal(false)
  protected readonly detailLoading = signal(false)
  protected readonly detailBooking = signal<BookingDetailResponse | null>(null)

  protected readonly tabs = computed(() => [
    { value: '', label: this.languageStore.t('common.all') },
    { value: 'Pending', label: labelOf('booking', 'Pending', this.languageStore.lang()) },
    { value: 'Approved', label: labelOf('booking', 'Approved', this.languageStore.lang()) },
    { value: 'Rejected', label: labelOf('booking', 'Rejected', this.languageStore.lang()) },
    { value: 'Cancelled', label: labelOf('booking', 'Cancelled', this.languageStore.lang()) },
    { value: 'Completed', label: labelOf('booking', 'Completed', this.languageStore.lang()) },
    { value: 'NoShow', label: labelOf('booking', 'NoShow', this.languageStore.lang()) },
  ])

  protected readonly filtered = computed(() => {
    const needle = this.keyword().trim().toLowerCase()
    const status = this.activeStatus()
    const map = this.detailsMap()

    return [...this.bookings()]
      .filter((item) => {
        const matchesStatus = !status || item.status === status
        if (!matchesStatus) return false

        if (!needle) return true

        const codeStr = `bk-${item.bookingId.toString().padStart(5, '0')}`.toLowerCase()
        const idStr = String(item.bookingId)
        const purposeStr = labelOf('purpose', item.purposeType, this.languageStore.lang()).toLowerCase()
        const statusStr = labelOf('booking', item.status, this.languageStore.lang()).toLowerCase()

        // Tìm thêm theo tên tài nguyên
        const detail = map.get(item.bookingId)
        const resourceMatch = detail?.items.some((i) =>
          (i.labName || '').toLowerCase().includes(needle) || (i.equipmentName || '').toLowerCase().includes(needle)
        )

        return codeStr.includes(needle) || idStr.includes(needle) || purposeStr.includes(needle) || statusStr.includes(needle) || Boolean(resourceMatch)
      })
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
  })

  protected readonly labelOf = labelOf

  ngOnInit(): void {
    this.loadData()
  }

  protected loadData(): void {
    const userId = this.store.user()?.userId
    if (!userId) return
    this.loading.set(true)
    this.api.bookingsByUser(userId).subscribe({
      next: (items) => {
        this.bookings.set(items)
        this.loading.set(false)
        this.loadDetailsAndLogs(items)
      },
      error: () => {
        this.loading.set(false)
        this.toast.error('Không tải được danh sách booking của bạn')
      },
    })
  }

  protected setStatus(val: string): void {
    this.activeStatus.set(val)
  }

  protected count(status: string): number {
    return this.bookings().filter((item) => item.status === status).length
  }

  protected resourceSummary(bookingId: number): { name: string; icon: string } | null {
    const detail = this.detailsMap().get(bookingId)
    if (!detail || !detail.items || detail.items.length === 0) return null
    const first = detail.items[0]
    const name = first.labName || first.equipmentName || `Tài nguyên #${first.bookingItemId}`
    const icon = first.resourceType === 'LabRoom' ? 'building' : 'microscope'
    const extraCount = detail.items.length - 1
    return {
      name: extraCount > 0 ? `${name} (+${extraCount})` : name,
      icon,
    }
  }

  protected checkedInLog(bookingId: number): UsageLogResponse | undefined {
    return this.allLogs().find((log) => this.bookingItemMap.get(log.bookingItemId) === bookingId)
  }

  protected logFor(bookingItemId: number): UsageLogResponse | undefined {
    return this.allLogs().find((log) => log.bookingItemId === bookingItemId)
  }

  protected canCheckInNow(booking: BookingResponse | BookingDetailResponse): boolean {
    if (booking.status !== 'Approved') return false
    return getCheckInWindowInfo(booking.startTime, booking.endTime).canCheckIn
  }

  protected isUpcoming(booking: BookingResponse | BookingDetailResponse): boolean {
    return getCheckInWindowInfo(booking.startTime, booking.endTime).isTooEarly
  }

  protected checkUserRestricted(): boolean {
    const userStatus = this.store.user()?.status
    if (userStatus === 'Restricted' || userStatus === 3) {
      this.toast.error('Tài khoản đang bị hạn chế', 'Tài khoản của bạn đang ở trạng thái Bị hạn chế do có điểm vi phạm. Không thể thực hiện điểm danh Check-in / Check-out.')
      return true
    }
    return false
  }

  protected openDetail(booking: BookingResponse | BookingDetailResponse): void {
    this.detailBooking.set(null)
    this.detailLoading.set(true)
    this.detailOpen.set(true)

    this.api.booking(booking.bookingId).subscribe({
      next: (detail) => {
        this.detailBooking.set(detail)
        this.detailLoading.set(false)
      },
      error: () => {
        this.detailLoading.set(false)
        this.toast.error('Không tải được chi tiết booking')
      },
    })
  }

  protected confirmCancel(booking: BookingResponse | BookingDetailResponse): void {
    if (!confirm(`Xác nhận hủy yêu cầu booking #BK-${booking.bookingId.toString().padStart(5, '0')}?`)) return
    this.api.cancelBooking(booking.bookingId).subscribe({
      next: () => {
        this.toast.success('Đã hủy booking thành công')
        this.detailOpen.set(false)
        this.loadData()
      },
      error: () => this.toast.error('Không thể hủy booking'),
    })
  }

  protected checkInItem(bookingItemId: number): void {
    if (this.checkUserRestricted()) return
    this.api.checkIn(bookingItemId).subscribe({
      next: () => {
        this.toast.success('Check-in thành công', 'Đã ghi nhận thời gian bắt đầu sử dụng tài nguyên.')
        this.loadData()
        if (this.detailBooking()) {
          this.openDetail(this.detailBooking()!)
        }
      },
      error: (err: any) => {
        const msg = err?.error?.message || (typeof err?.error === 'string' ? err.error : null) || err?.message || 'Không thể điểm danh Check-in. Kiểm tra khung giờ và trạng thái tài nguyên.'
        this.toast.error('Không thể check-in', msg)
      },
    })
  }

  protected checkInBooking(bookingId: number): void {
    if (this.checkUserRestricted()) return
    this.api.checkInBooking(bookingId).subscribe({
      next: () => {
        this.toast.success('Check-in toàn bộ thành công', 'Đã điểm danh tất cả tài nguyên trong booking.')
        this.loadData()
        if (this.detailBooking()) {
          this.openDetail(this.detailBooking()!)
        }
      },
      error: (err: any) => {
        const msg = err?.error?.message || (typeof err?.error === 'string' ? err.error : null) || err?.message || 'Không thể check-in toàn bộ booking.'
        this.toast.error('Không thể check-in', msg)
      },
    })
  }

  protected checkOutLog(logId: number): void {
    if (this.checkUserRestricted()) return
    if (!confirm('Xác nhận trả phòng / check-out tài nguyên này? (Nội quy: Nếu trễ quá thời gian kết thúc, hệ thống sẽ tự động ghi nhận sự cố Trả muộn và vi phạm)')) return
    this.api.checkOut(logId).subscribe({
      next: () => {
        this.toast.success('Check-out thành công', 'Phiên sử dụng đã kết thúc.')
        this.loadData()
        if (this.detailBooking()) {
          this.openDetail(this.detailBooking()!)
        }
      },
      error: (err: any) => {
        const msg = err?.error?.message || (typeof err?.error === 'string' ? err.error : null) || err?.message || 'Không thể check-out.'
        this.toast.error('Không thể check-out', msg)
      },
    })
  }

  protected checkOutBooking(bookingId: number): void {
    if (this.checkUserRestricted()) return
    if (!confirm('Xác nhận checkout toàn bộ booking này?')) return
    this.api.checkOutBooking(bookingId).subscribe({
      next: () => {
        this.toast.success('Check-out toàn bộ thành công', 'Tất cả tài nguyên đã được giải phóng.')
        this.loadData()
        if (this.detailBooking()) {
          this.openDetail(this.detailBooking()!)
        }
      },
      error: (err: any) => {
        const msg = err?.error?.message || (typeof err?.error === 'string' ? err.error : null) || err?.message || 'Không thể checkout toàn bộ booking.'
        this.toast.error('Không thể check-out', msg)
      },
    })
  }

  private bookingItemMap = new Map<number, number>()

  private loadDetailsAndLogs(items: BookingResponse[]): void {
    if (items.length === 0) return

    // Tải thông tin chi tiết từng booking để lấy danh sách items (Tên phòng lab / thiết bị)
    const detailReqs = items.map((b) =>
      this.api.booking(b.bookingId).pipe(catchError(() => of(null)))
    )

    forkJoin(detailReqs).subscribe({
      next: (details) => {
        const map = new Map<number, BookingDetailResponse>()
        details.forEach((d) => {
          if (d) {
            map.set(d.bookingId, d)
            d.items.forEach((item) => this.bookingItemMap.set(item.bookingItemId, d.bookingId))
          }
        })
        this.detailsMap.set(map)

        // Load logs cho các booking Approved
        const approved = items.filter((b) => b.status === 'Approved')
        if (approved.length > 0) {
          const logReqs = approved.map((b) =>
            this.api.usageLogsByBooking(b.bookingId).pipe(catchError(() => of([])))
          )
          forkJoin(logReqs).subscribe({
            next: (logsList) => {
              this.allLogs.set(logsList.flat())
            },
          })
        }
      },
    })
  }
}
