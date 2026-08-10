import { DatePipe, NgClass } from '@angular/common'
import { Component, OnInit, computed, inject, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { RouterLink } from '@angular/router'
import { EMPTY, from, of, timeout } from 'rxjs'
import { catchError, mergeMap, toArray } from 'rxjs/operators'
import { SystemService } from '../../core/api/system.service'
import type {
  BookingDetailResponse,
  BookingItemResponse,
  BookingResponse,
  UsageLogResponse,
} from '../../core/api/system.models'
import { AuthStore } from '../../core/auth/auth.store'
import { LanguageStore } from '../../core/i18n/language.store'
import { TranslatePipe } from '../../core/i18n/translate.pipe'
import { DataStateComponent } from '../../shared/ui/data-state'
import { IconComponent } from '../../shared/ui/icon'
import { ModalComponent } from '../../shared/ui/modal'
import { PageHeaderComponent } from '../../shared/ui/page-header'
import { StatusBadgeComponent } from '../../shared/ui/status-badge'
import { ToastService } from '../../shared/ui/toast.service'
import { ConfirmDialogService } from '../../shared/ui/confirm-dialog'
import { labelOf, getCheckInWindowInfo } from '../../shared/utils/presentation'

@Component({
  selector: 'app-my-bookings-page',
  imports: [
    DatePipe,
    NgClass,
    FormsModule,
    RouterLink,
    IconComponent,
    ModalComponent,
    StatusBadgeComponent,
    DataStateComponent,
    TranslatePipe,
  ],
  template: `
    <section class="space-y-6">
      <!-- Unified Header + Compact Stat Chips Bar (Strictly 1 Single Row, Zero Gap) -->
      <article class="card-surface space-y-4 p-5">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 class="text-2xl font-black tracking-tight text-slate-950">
              {{ 'nav.items.myBookings' | t }}
            </h1>
            <p class="mt-1 text-xs font-medium text-slate-500">{{ 'bookings.mySubtitle' | t }}</p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <a routerLink="/app/bookings/new" class="btn-primary flex items-center gap-2"
              ><app-icon name="plus" [size]="17" /> {{ 'sidebar.quickBooking' | t }}</a
            >
            <a routerLink="/app/calendar" class="btn-secondary flex items-center gap-2"
              ><app-icon name="calendar" [size]="17" /> {{ 'header.viewCalendar' | t }}</a
            >
          </div>
        </div>

        <div class="border-t border-slate-100 pt-3">
          <!-- Strictly 1 Single Horizontal Row (overflow-x-auto, whitespace-nowrap, no line break) -->
          <div class="flex scrollbar-none items-center gap-2 overflow-x-auto pt-0.5 pb-1">
            @for (tab of tabs(); track tab.value) {
              <button
                type="button"
                class="flex shrink-0 items-center gap-2.5 rounded-xl border px-3.5 py-2 text-left whitespace-nowrap transition duration-150"
                [ngClass]="{
                  'border-violet-500 bg-violet-50/90 font-bold text-violet-900 shadow-2xs ring-2 ring-violet-500/20':
                    activeStatus() === tab.value,
                  'border-slate-200/90 bg-slate-50/70 text-slate-700 hover:border-violet-300 hover:bg-white':
                    activeStatus() !== tab.value,
                }"
                (click)="setStatus(tab.value)"
              >
                <span
                  class="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg text-[11px]"
                  [ngClass]="tab.bgTint"
                >
                  <app-icon [name]="tab.iconName" [size]="12" />
                </span>
                <span class="text-xs font-bold text-slate-600">{{ tab.label }}:</span>
                <span class="text-xs font-black" [class]="tab.className">{{
                  tab.value === '' ? bookings().length : count(tab.value)
                }}</span>
              </button>
            }
          </div>
        </div>
      </article>

      <!-- Surface chứa bảng -->
      <div class="card-surface overflow-hidden">
        <!-- Search bar -->
        <div
          class="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-end"
        >
          <div class="relative w-full sm:w-80">
            <span class="absolute top-3 left-3.5 text-slate-400"
              ><app-icon name="search" [size]="17"
            /></span>
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
            <app-data-state
              [title]="'common.noData' | t"
              message="Không tìm thấy yêu cầu booking phù hợp với bộ lọc hiện tại."
              icon="calendar"
            >
              <a routerLink="/app/bookings/new" class="btn-primary mt-5">{{
                'sidebar.quickBooking' | t
              }}</a>
            </app-data-state>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="table-shell">
              <thead>
                <tr>
                  <th>{{ 'bookings.requester' | t }}</th>
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
                    <!-- Người đăng ký (Full Name) & Mã Booking -->
                    <td>
                      <button
                        type="button"
                        class="block text-left font-black text-slate-900 hover:text-cyan-700 hover:underline"
                        (click)="openDetail(booking)"
                      >
                        {{ requesterName(booking) }}
                      </button>
                      <p class="mt-0.5 text-[11px] font-semibold text-slate-400">
                        #BK-{{ booking.bookingId.toString().padStart(5, '0') }} ·
                        {{ booking.createdAt | date: 'dd/MM/yyyy' }}
                      </p>
                    </td>

                    <!-- Tài nguyên đặt (Phòng lab / Thiết bị) -->
                    <td>
                      @if (resourceSummary(booking.bookingId); as summary) {
                        <div class="flex items-center gap-2">
                          <span
                            class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600"
                          >
                            <app-icon [name]="summary.icon" [size]="14" />
                          </span>
                          <span
                            class="line-clamp-1 font-bold text-slate-900"
                            [title]="summary.name | t"
                            >{{ summary.name | t }}</span
                          >
                        </div>
                      } @else {
                        <span class="text-xs text-slate-400">Đang tải...</span>
                      }
                    </td>

                    <!-- Mục đích -->
                    <td>
                      <p class="font-bold text-slate-800">
                        {{ labelOf('purpose', booking.purposeType, languageStore.lang()) }}
                      </p>
                    </td>

                    <!-- Thời gian -->
                    <td>
                      <p class="font-bold text-slate-700">
                        {{ booking.startTime | date: 'HH:mm dd/MM/yyyy' }}
                      </p>
                      <p class="mt-0.5 text-xs text-slate-400">
                        {{ 'common.to' | t }} {{ booking.endTime | date: 'HH:mm dd/MM/yyyy' }}
                      </p>
                    </td>

                    <!-- Mức ưu tiên -->
                    <td>
                      <span
                        class="rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-black text-cyan-700"
                        >P{{ booking.priorityLevel ?? '—' }}</span
                      >
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
                              <span
                                class="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-700"
                              >
                                <app-icon name="check" [size]="12" />
                                {{
                                  'bookings.checkedInAt'
                                    | t: { time: (log.actualCheckin | date: 'HH:mm') ?? '' }
                                }}
                              </span>
                              <button
                                type="button"
                                class="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 hover:underline"
                                (click)="checkOutBooking(booking.bookingId)"
                              >
                                <app-icon name="logout" [size]="11" />
                                Check-out toàn bộ →
                              </button>
                            </div>
                          } @else {
                            <span
                              class="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black text-slate-600"
                            >
                              <app-icon name="check" [size]="12" /> {{ 'bookings.checkedOut' | t }}
                            </span>
                          }
                        } @else {
                          @if (canCheckInNow(booking)) {
                            <button
                              type="button"
                              class="inline-flex items-center gap-1 rounded-lg border border-cyan-200 bg-cyan-50 px-2.5 py-1 text-[10px] font-black text-cyan-700 transition hover:bg-cyan-100"
                              (click)="checkInBooking(booking.bookingId)"
                            >
                              <app-icon name="login" [size]="12" /> Check-in toàn bộ
                            </button>
                          } @else if (isUpcoming(booking)) {
                            <span
                              class="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-bold text-slate-400"
                            >
                              <app-icon name="clock" [size]="12" />
                              {{ 'bookings.notStartedYet' | t }}
                            </span>
                          } @else {
                            <span
                              class="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-bold text-rose-600"
                            >
                              <app-icon name="alert" [size]="12" /> {{ 'bookings.overdue' | t }}
                            </span>
                          }
                        }
                      } @else if (booking.status === 'Pending') {
                        <span class="text-xs font-bold text-amber-600">{{
                          'bookings.awaitingApproval' | t
                        }}</span>
                      } @else {
                        <span class="text-xs text-slate-400">—</span>
                      }
                    </td>

                    <!-- Hành động -->
                    <td class="text-right">
                      <div class="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          class="btn-secondary px-3 py-1.5 text-xs"
                          (click)="openDetail(booking)"
                        >
                          <app-icon name="eye" [size]="15" /> {{ 'common.detail' | t }}
                        </button>
                        @if (booking.status === 'Pending' || booking.status === 'Approved') {
                          <button
                            type="button"
                            class="btn-secondary btn-danger px-2.5 py-1.5 text-xs"
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
        [title]="
          detailBooking()
            ? 'Booking #BK-' + detailBooking()!.bookingId.toString().padStart(5, '0')
            : ('bookings.detailTitle' | t)
        "
        subtitle="{{ 'bookings.detailSubtitle' | t }}"
        (close)="closeDetail()"
      >
        @if (detailLoading()) {
          <div class="space-y-3">
            <div class="skeleton h-8 rounded-xl"></div>
            <div class="skeleton h-32 rounded-xl"></div>
          </div>
        } @else if (detailAccessDenied()) {
          <div
            class="space-y-4 rounded-2xl border border-amber-200 bg-amber-50/90 p-6 text-center shadow-sm"
          >
            <div
              class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 text-amber-700 shadow-inner"
            >
              <app-icon name="shield" [size]="28" />
            </div>
            <div>
              <span
                class="inline-flex items-center gap-1 rounded-full bg-amber-200/80 px-3 py-0.5 text-[11px] font-black text-amber-900"
              >
                Phát hiện ngoại lệ Backend (BE Exception)
              </span>
              <h3 class="mt-1 text-lg font-black text-slate-950">Không có quyền xem chi tiết</h3>
            </div>

            <div
              class="space-y-1.5 rounded-xl border border-amber-200 bg-white/90 p-4 text-left text-xs text-slate-800 shadow-sm"
            >
              <span class="flex items-center gap-1.5 font-black text-amber-900">
                <app-icon name="alert" [size]="15" class="text-amber-600" />
                Ghi chú thông báo ngoại lệ từ Backend:
              </span>
              <p
                class="rounded-lg border border-amber-200/60 bg-amber-100/60 p-2.5 font-mono text-xs leading-relaxed font-bold whitespace-pre-line text-amber-950"
              >
                {{ detailErrorMessage() || 'Bạn không có quyền xem booking này.' }}
              </p>
            </div>

            <p class="mx-auto max-w-md text-xs leading-relaxed text-slate-500">
              Hệ thống đã nhận diện được ngoại lệ từ BE. Bạn có thể nhấn
              <strong>"Gửi báo lỗi về Backend"</strong> để cập nhật Data hoặc nhấn
              <strong>"Quay lại trang"</strong> để mở khóa ứng dụng và tiếp tục công việc.
            </p>

            <div class="flex flex-wrap justify-center gap-2 pt-2">
              <button
                type="button"
                class="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-2.5 text-xs font-black text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-700"
                (click)="sendErrorReportToBE()"
              >
                <app-icon name="send" [size]="15" /> Gửi báo lỗi đến Data (BE)
              </button>
              <button
                type="button"
                class="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-black text-slate-700 shadow-sm transition hover:bg-slate-50"
                (click)="closeDetail()"
              >
                <app-icon name="arrow-left" [size]="15" /> Quay lại trang tiếp tục
              </button>
            </div>
          </div>
        } @else if (detailBooking(); as detail) {
          <div class="space-y-5">
            <!-- Thẻ thông tin tổng quan -->
            <div class="grid gap-3 rounded-2xl bg-slate-50 p-4 text-xs sm:grid-cols-2">
              <div>
                <span class="text-slate-400">{{ 'common.status' | t }}:</span>
                <div class="mt-1">
                  <app-status-badge [value]="detail.status" domain="booking" />
                </div>
              </div>
              <div>
                <span class="text-slate-400">{{ 'bookings.priorityLevel' | t }}:</span>
                <p class="mt-1 font-bold text-slate-800">P{{ detail.priorityLevel ?? '—' }}</p>
              </div>
              <div>
                <span class="text-slate-400">{{ 'bookings.startTime' | t }}:</span>
                <p class="mt-1 font-bold text-slate-800">
                  {{ detail.startTime | date: 'HH:mm dd/MM/yyyy' }}
                </p>
              </div>
              <div>
                <span class="text-slate-400">{{ 'bookings.endTime' | t }}:</span>
                <p class="mt-1 font-bold text-slate-800">
                  {{ detail.endTime | date: 'HH:mm dd/MM/yyyy' }}
                </p>
              </div>
              <div class="sm:col-span-2">
                <span class="text-slate-400">{{ 'bookings.purposeDesc' | t }}:</span>
                <p class="mt-1 font-bold text-slate-800">
                  {{ labelOf('purpose', detail.purposeType, languageStore.lang()) }}
                </p>
                @if (detail.purposeDescription) {
                  <p class="mt-1 whitespace-pre-line text-slate-600">
                    {{ detail.purposeDescription }}
                  </p>
                }
              </div>
              @if (detail.rejectionReason) {
                <div
                  class="rounded-xl border border-rose-200 bg-rose-50 p-3 text-rose-800 sm:col-span-2"
                >
                  <p class="font-bold">{{ 'bookings.rejectionReason' | t }}:</p>
                  <p class="mt-1">{{ detail.rejectionReason }}</p>
                </div>
              }
            </div>

            @if (detail.status === 'Approved') {
              <div class="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-cyan-200 bg-cyan-50/70 p-4">
                <div>
                  <p class="font-black text-cyan-950">Điểm danh Check-in / Check-out toàn booking</p>
                  <p class="text-xs text-cyan-800">Điểm danh tự động cho tất cả phòng lab và thiết bị trong booking này.</p>
                </div>
                <div class="flex items-center gap-2">
                  @if (canCheckInNow(detail)) {
                    <button
                      type="button"
                      class="btn-primary flex items-center gap-2"
                      (click)="checkInBooking(detail.bookingId)"
                    >
                      <app-icon name="login" [size]="16" /> Check-in toàn bộ
                    </button>
                  }
                  <button
                    type="button"
                    class="btn-primary bg-rose-600 flex items-center gap-2 hover:bg-rose-700 font-black"
                    (click)="checkOutBooking(detail.bookingId)"
                  >
                    <app-icon name="logout" [size]="16" /> Check-out toàn bộ
                  </button>
                </div>
              </div>
            }

            <!-- Danh sách tài nguyên -->
            <div>
              <p class="mb-2 text-xs font-black tracking-wider text-slate-400 uppercase">
                {{ 'bookings.registeredResources' | t }}
              </p>
              <div class="space-y-2">
                @for (item of detail.items; track item.bookingItemId) {
                  <div
                    class="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 text-xs"
                  >
                    <div class="flex items-center gap-3">
                      <span
                        class="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-violet-600"
                      >
                        <app-icon
                          [name]="item.resourceType === 'LabRoom' ? 'building' : 'microscope'"
                          [size]="16"
                        />
                      </span>
                      <div>
                        <p class="font-black text-slate-900">
                          {{
                            item.labName ||
                              item.equipmentName ||
                              'Tài nguyên #' + item.bookingItemId | t
                          }}
                        </p>
                        <p class="text-[10px] text-slate-400">
                          {{ labelOf('resource', item.resourceType, languageStore.lang()) }}
                          {{ item.note ? ' · ' + item.note : '' }}
                        </p>
                      </div>
                    </div>

                    <!-- Thao tác Check-in / Check-out trực tiếp trong Modal -->
                    <div>
                      @if (detail.status === 'Approved') {
                        @if (!logFor(item.bookingItemId)) {
                          <button
                            type="button"
                            class="btn-primary px-3 py-1 text-xs"
                            [disabled]="!canCheckInNow(detail)"
                            (click)="checkInBooking(detail.bookingId)"
                          >
                            <app-icon name="login" [size]="14" /> {{ 'bookings.checkinNow' | t }}
                          </button>
                        } @else if (logFor(item.bookingItemId); as log) {
                          @if (!log.actualCheckout) {
                            <button
                              type="button"
                              class="btn-primary bg-rose-600 px-3 py-1 text-xs hover:bg-rose-700"
                              (click)="checkOutBooking(detail.bookingId)"
                            >
                              <app-icon name="logout" [size]="14" /> Check-out
                            </button>
                          } @else {
                            <span
                              class="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700"
                              >{{ 'bookings.checkedOut' | t }}</span
                            >
                          }
                        }
                      }
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- Nút liên kết đến trang chi tiết đầy đủ -->
            <div class="flex items-center justify-between border-t border-slate-100 pt-4">
              <a
                [routerLink]="['/app/bookings', detail.bookingId]"
                class="btn-secondary text-xs"
                (click)="detailOpen.set(false)"
              >
                <app-icon name="arrow-right" [size]="15" /> {{ 'bookings.openFullDetail' | t }}
              </a>

              @if (detail.status === 'Pending' || detail.status === 'Approved') {
                <button
                  type="button"
                  class="btn-secondary btn-danger text-xs"
                  (click)="confirmCancel(detail)"
                >
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
  private readonly confirmDialog = inject(ConfirmDialogService)

  protected readonly bookings = signal<BookingResponse[]>([])
  protected readonly detailsMap = signal(new Map<number, BookingDetailResponse>())
  protected readonly allLogs = signal<UsageLogResponse[]>([])
  protected readonly loading = signal(true)

  protected readonly activeStatus = signal('')
  protected readonly keyword = signal('')

  // Modal State
  protected readonly detailOpen = signal(false)
  protected readonly detailLoading = signal(false)
  protected readonly detailAccessDenied = signal(false)
  protected readonly detailErrorMessage = signal('')
  protected readonly detailBooking = signal<BookingDetailResponse | null>(null)

  protected readonly tabs = computed(() => [
    {
      value: '',
      label: this.languageStore.t('common.all'),
      className: 'text-slate-950',
      iconName: 'calendar',
      bgTint: 'bg-slate-100 text-slate-700',
    },
    {
      value: 'Pending',
      label: labelOf('booking', 'Pending', this.languageStore.lang()),
      className: 'text-amber-600',
      iconName: 'clock',
      bgTint: 'bg-amber-100 text-amber-700',
    },
    {
      value: 'Approved',
      label: labelOf('booking', 'Approved', this.languageStore.lang()),
      className: 'text-emerald-600',
      iconName: 'check',
      bgTint: 'bg-emerald-100 text-emerald-700',
    },
    {
      value: 'Rejected',
      label: labelOf('booking', 'Rejected', this.languageStore.lang()),
      className: 'text-rose-600',
      iconName: 'close',
      bgTint: 'bg-rose-100 text-rose-700',
    },
    {
      value: 'Cancelled',
      label: labelOf('booking', 'Cancelled', this.languageStore.lang()),
      className: 'text-slate-500',
      iconName: 'slash',
      bgTint: 'bg-slate-100 text-slate-600',
    },
    {
      value: 'Completed',
      label: labelOf('booking', 'Completed', this.languageStore.lang()),
      className: 'text-indigo-600',
      iconName: 'check',
      bgTint: 'bg-indigo-100 text-indigo-700',
    },
    {
      value: 'NoShow',
      label: labelOf('booking', 'NoShow', this.languageStore.lang()),
      className: 'text-rose-500',
      iconName: 'alert',
      bgTint: 'bg-rose-100 text-rose-600',
    },
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
        const purposeStr = labelOf(
          'purpose',
          item.purposeType,
          this.languageStore.lang(),
        ).toLowerCase()
        const statusStr = labelOf('booking', item.status, this.languageStore.lang()).toLowerCase()

        // Tìm thêm theo tên tài nguyên
        const detail = map.get(item.bookingId)
        const resourceMatch = detail?.items.some(
          (i) =>
            (i.labName || '').toLowerCase().includes(needle) ||
            (i.equipmentName || '').toLowerCase().includes(needle),
        )

        return (
          codeStr.includes(needle) ||
          idStr.includes(needle) ||
          purposeStr.includes(needle) ||
          statusStr.includes(needle) ||
          Boolean(resourceMatch)
        )
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

  protected requesterName(booking: BookingResponse): string {
    return booking.userName || this.store.user()?.fullName || `User #${booking.userId}`
  }

  protected checkUserRestricted(): boolean {
    const userStatus = this.store.user()?.status
    if (userStatus === 'Restricted' || userStatus === 3) {
      this.toast.error(
        'Tài khoản đang bị hạn chế',
        'Tài khoản của bạn đang ở trạng thái Bị hạn chế do có điểm vi phạm. Không thể thực hiện điểm danh Check-in / Check-out.',
      )
      return true
    }
    return false
  }

  protected currentBookingId = 0

  protected openDetail(booking: BookingResponse | BookingDetailResponse): void {
    this.currentBookingId = booking.bookingId
    this.detailAccessDenied.set(false)
    this.detailErrorMessage.set('')
    this.detailOpen.set(true)

    // Nếu đã có thông tin chi tiết trong cache detailsMap, sử dụng ngay lập tức
    const cached = this.detailsMap().get(booking.bookingId)
    if (cached) {
      this.detailBooking.set(cached)
      this.detailLoading.set(false)
      return
    }

    this.detailBooking.set(null)
    this.detailLoading.set(true)

    this.api
      .booking(booking.bookingId)
      .pipe(timeout(10000))
      .subscribe({
        next: (detail) => {
          this.detailBooking.set(detail)
          this.detailLoading.set(false)
          if (detail) {
            this.detailsMap.update((map) => new Map(map).set(detail.bookingId, detail))
          }
        },
        error: (err: any) => {
          this.detailLoading.set(false)
          this.detailAccessDenied.set(true)
          const msg =
            err?.message ||
            err?.error?.message ||
            err?.error?.detail ||
            (err?.name === 'TimeoutError'
              ? 'Máy chủ Backend đang xử lý lâu hoặc tạm dừng (Timeout 10s).'
              : 'Tài khoản không đủ thẩm quyền để truy cập thông tin booking này từ Backend.')
          this.detailErrorMessage.set(msg)
        },
      })
  }

  protected sendErrorReportToBE(): void {
    const user = this.store.user()
    if (!user?.userId) return
    const errorMsg = this.detailErrorMessage() || 'Ngoại lệ phân quyền xem chi tiết booking từ BE'
    this.api
      .sendNotification({
        userId: user.userId,
        title: 'Báo cáo lỗi & Đồng bộ Data Backend',
        message: `[Báo lỗi FE/BE Data] Khách hàng ${user.fullName || user.username} (User ID ${user.userId}) báo cáo ngoại lệ tại Booking #${this.currentBookingId || ''}: ${errorMsg}`,
        notificationType: 1,
      })
      .pipe(catchError(() => EMPTY))
      .subscribe({
        next: () => {
          this.toast.success(
            'Đã gửi thông tin báo lỗi về Backend (Data)!',
            'Bạn có thể tiếp tục thao tác bình thường.',
          )
        },
        error: () => {
          this.toast.info('Đã hoàn tất phản hồi về Backend.', 'Ứng dụng đã sẵn sàng tiếp tục.')
        },
      })
  }

  protected closeDetail(): void {
    const user = this.store.user()
    if (user?.userId && this.detailAccessDenied()) {
      this.api
        .sendNotification({
          userId: user.userId,
          title: 'Phản hồi từ chối truy cập booking',
          message: `Người dùng ${user.fullName || user.username} đã quay lại trang sau khi xem thông báo từ chối truy cập booking.`,
          notificationType: 1,
        })
        .pipe(catchError(() => EMPTY))
        .subscribe()
    }
    this.detailOpen.set(false)
    this.detailLoading.set(false)
    this.detailAccessDenied.set(false)
    this.detailErrorMessage.set('')
    this.detailBooking.set(null)
  }

  protected async confirmCancel(booking: BookingResponse | BookingDetailResponse): Promise<void> {
    const code = `#BK-${booking.bookingId.toString().padStart(5, '0')}`
    const confirmed = await this.confirmDialog.confirm({
      title: 'Hủy yêu cầu Booking',
      message: `Xác nhận hủy yêu cầu booking ${code}?`,
      variant: 'danger',
      confirmText: 'Hủy Booking',
    })
    if (!confirmed) return
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
        this.toast.success(
          'Check-in thành công',
          'Đã ghi nhận thời gian bắt đầu sử dụng tài nguyên.',
        )
        this.loadData()
        if (this.detailBooking()) {
          this.openDetail(this.detailBooking()!)
        }
      },
      error: (err: any) => {
        const msg =
          err?.error?.message ||
          (typeof err?.error === 'string' ? err.error : null) ||
          err?.message ||
          'Không thể điểm danh Check-in. Kiểm tra khung giờ và trạng thái tài nguyên.'
        this.toast.error('Không thể check-in', msg)
      },
    })
  }

  protected checkInBooking(bookingId: number): void {
    if (this.checkUserRestricted()) return
    this.api.checkInBooking(bookingId).subscribe({
      next: () => {
        this.toast.success(
          'Check-in toàn bộ thành công',
          'Đã điểm danh tất cả tài nguyên trong booking.',
        )
        this.loadData()
        if (this.detailBooking()) {
          this.openDetail(this.detailBooking()!)
        }
      },
      error: (err: any) => {
        const msg =
          err?.error?.message ||
          (typeof err?.error === 'string' ? err.error : null) ||
          err?.message ||
          'Không thể check-in toàn bộ booking.'
        this.toast.error('Không thể check-in', msg)
      },
    })
  }

  protected async checkOutLog(logId: number): Promise<void> {
    if (this.checkUserRestricted()) return
    const confirmed = await this.confirmDialog.confirm({
      title: 'Xác nhận Check-out',
      message: 'Xác nhận trả phòng / check-out tài nguyên này? (Nội quy: Nếu trễ quá thời gian kết thúc, hệ thống sẽ tự động ghi nhận sự cố Trả muộn và vi phạm)',
      variant: 'warning',
      confirmText: 'Check-out',
    })
    if (!confirmed) return
    this.api.checkOut(logId).subscribe({
      next: () => {
        this.toast.success('Check-out thành công', 'Phiên sử dụng đã kết thúc.')
        this.loadData()
        if (this.detailBooking()) {
          this.openDetail(this.detailBooking()!)
        }
      },
      error: (err: any) => {
        const msg =
          err?.error?.message ||
          (typeof err?.error === 'string' ? err.error : null) ||
          err?.message ||
          'Không thể check-out.'
        this.toast.error('Không thể check-out', msg)
      },
    })
  }

  protected async checkOutBooking(bookingId: number): Promise<void> {
    if (this.checkUserRestricted()) return
    const confirmed = await this.confirmDialog.confirm({
      title: 'Xác nhận Check-out Toàn bộ',
      message: 'Xác nhận checkout toàn bộ booking này?',
      variant: 'warning',
      confirmText: 'Check-out Toàn bộ',
    })
    if (!confirmed) return
    this.api.checkOutBooking(bookingId).subscribe({
      next: () => {
        this.toast.success('Check-out toàn bộ thành công', 'Tất cả tài nguyên đã được giải phóng.')
        this.loadData()
        if (this.detailBooking()) {
          this.openDetail(this.detailBooking()!)
        }
      },
      error: (err: any) => {
        const msg =
          err?.error?.message ||
          (typeof err?.error === 'string' ? err.error : null) ||
          err?.message ||
          'Không thể checkout toàn bộ booking.'
        this.toast.error('Không thể check-out', msg)
      },
    })
  }

  private bookingItemMap = new Map<number, number>()

  private loadDetailsAndLogs(items: BookingResponse[]): void {
    if (items.length === 0) return

    // Tải thông tin chi tiết từng booking để lấy danh sách items (Tên phòng lab / thiết bị)
    const detailReqs = items.map((b) =>
      this.api.booking(b.bookingId).pipe(catchError(() => of(null))),
    )

    from(detailReqs)
      .pipe(
        mergeMap((req) => req, 3),
        toArray(),
      )
      .subscribe({
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
              this.api.usageLogsByBooking(b.bookingId).pipe(catchError(() => of([]))),
            )
            from(logReqs)
              .pipe(
                mergeMap((req) => req, 3),
                toArray(),
              )
              .subscribe({
                next: (logsList) => {
                  this.allLogs.set(logsList.flat())
                },
              })
          }
        },
      })
  }
}
