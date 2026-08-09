import { DatePipe, NgClass } from '@angular/common'
import { Component, OnInit, computed, inject, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { Router, RouterLink } from '@angular/router'
import { catchError, EMPTY, forkJoin, of, timeout } from 'rxjs'
import type {
  BookingResponse,
  NotificationResponse,
  UserViolationSummaryResponse,
  WaitlistResponse,
} from '../../core/api/api.models'
import { SystemService } from '../../core/api/system.service'

import type {
  BookingDetailResponse,
  CalendarEventResponse,
  UsageLogResponse,
} from '../../core/api/system.models'
import { WorkspaceService } from '../../core/api/workspace.service'
import { AuthStore } from '../../core/auth/auth.store'
import { LanguageStore } from '../../core/i18n/language.store'
import { TranslatePipe } from '../../core/i18n/translate.pipe'
import { IconComponent } from '../../shared/ui/icon'
import { ModalComponent } from '../../shared/ui/modal'
import { StatusBadgeComponent } from '../../shared/ui/status-badge'
import { ToastService } from '../../shared/ui/toast.service'
import { labelOf, toDateInput, getCheckInWindowInfo } from '../../shared/utils/presentation'

interface ScheduleSlotEvent {
  roomName: string
  title: string
  timeStr: string
  dateKey: string
  rowIndex: number
  tone: 'emerald' | 'amber' | 'cyan' | 'indigo' | 'purple'
  bookingId?: number
  maintenanceId?: number
  sourceType?: 'Booking' | 'Maintenance' | 'Sample'
}

@Component({
  selector: 'app-requester-home-page',
  imports: [
    DatePipe,
    NgClass,
    FormsModule,
    RouterLink,
    IconComponent,
    ModalComponent,
    StatusBadgeComponent,
    TranslatePipe,
  ],
  template: `
    <section class="space-y-6">
      <!-- Top Header / Greeting -->
      <header class="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <div class="flex items-center gap-2 text-xs font-bold text-indigo-600">
            <span class="h-2 w-2 rounded-full bg-emerald-500"></span>
            {{ today | date: 'EEEE, dd/MM/yyyy' }}
          </div>
          <h1 class="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            {{ 'home.greeting' | t: { name: firstName() } }}
          </h1>
          <p class="mt-1 text-sm font-medium text-slate-500">{{ 'home.sub' | t }}</p>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <a
            routerLink="/app/bookings/new"
            class="inline-flex h-11 items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 px-5 text-xs font-black text-white shadow-lg shadow-indigo-500/25 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/35"
          >
            <span class="text-base leading-none font-bold">+</span>
            {{ 'home.quickBooking' | t }}
          </a>
        </div>
      </header>

      @if (loading()) {
        <div class="card-surface h-96 animate-pulse bg-slate-100"></div>
      } @else {
        <!-- Section: Lịch đặt của tôi (My Booking Calendar / Schedule Grid) -->
        <article class="card-surface overflow-hidden p-5 sm:p-6">
          <header class="flex flex-col gap-4 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div class="flex items-center gap-3">
              <div
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600"
              >
                <app-icon name="calendar" [size]="20" />
              </div>
              <h2 class="text-lg font-black text-slate-950">{{ 'home.mySchedule' | t }}</h2>
            </div>

            <div class="flex flex-wrap items-center gap-3">
              <!-- View mode pills -->
              <div class="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-bold">
                <button
                  type="button"
                  class="rounded-lg px-3 py-1.5 transition"
                  [ngClass]="
                    calendarMode() === 'Day'
                      ? 'bg-white text-indigo-700 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  "
                  (click)="setCalendarMode('Day')"
                >
                  {{ 'home.day' | t }}
                </button>
                <button
                  type="button"
                  class="rounded-lg px-3 py-1.5 transition"
                  [ngClass]="
                    calendarMode() === 'Week'
                      ? 'bg-white text-indigo-700 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  "
                  (click)="setCalendarMode('Week')"
                >
                  {{ 'home.week' | t }}
                </button>
              </div>

              <!-- Month Navigation -->
              <div
                class="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1 text-xs font-extrabold text-slate-700 shadow-sm"
              >
                <button
                  type="button"
                  class="p-1 text-slate-400 hover:text-indigo-600"
                  (click)="shiftFocus(-1)"
                >
                  <app-icon name="chevron-left" [size]="14" />
                </button>
                <span class="capitalize">{{ monthTitle() }}</span>
                <button
                  type="button"
                  class="p-1 text-slate-400 hover:text-indigo-600"
                  (click)="shiftFocus(1)"
                >
                  <app-icon name="chevron-right" [size]="14" />
                </button>
              </div>
            </div>
          </header>

          <!-- Calendar Table / Schedule Grid -->
          <div
            class="mt-2 [scrollbar-width:thin] overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-inner"
          >
            <table class="w-full table-fixed border-collapse text-left text-xs">
              <thead>
                <tr class="bg-[#1d4ed8] text-white">
                  <th
                    class="w-28 border-r border-blue-500/30 px-3 py-3 text-center font-extrabold whitespace-nowrap"
                  >
                    {{ 'home.timeSlot' | t }}
                  </th>
                  @for (col of calendarCols(); track col.key) {
                    <th
                      class="border-r border-blue-500/30 px-2 py-2.5 text-center font-bold whitespace-nowrap"
                    >
                      <div class="text-xs font-black">{{ col.dayName }}</div>
                      <div class="text-[11px] font-semibold opacity-90">{{ col.dateStr }}</div>
                    </th>
                  }
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 bg-white">
                <!-- Slot 1: 08:00 - 12:00 -->
                <tr class="h-24 hover:bg-slate-50/50">
                  <td
                    class="border-r border-slate-100 bg-slate-50/80 px-3 py-3 text-center text-[11px] font-black whitespace-nowrap text-slate-600"
                  >
                    08:00 - 12:00
                  </td>
                  @for (col of calendarCols(); track col.key; let cIdx = $index) {
                    <td
                      class="relative border-r border-slate-100 p-1.5 align-top transition hover:bg-indigo-50/30"
                    >
                      @for (evt of getSlotEvents(cIdx, 0); track evt.roomName + evt.timeStr) {
                        <div
                          class="cursor-pointer space-y-0.5 rounded-xl border p-2 text-[10px] shadow-sm transition hover:scale-[1.02]"
                          [ngClass]="{
                            'border-emerald-300 bg-emerald-50 text-emerald-950':
                              evt.tone === 'emerald',
                            'border-amber-300 bg-amber-50 text-amber-950': evt.tone === 'amber',
                            'border-cyan-300 bg-cyan-50 text-cyan-950': evt.tone === 'cyan',
                            'border-indigo-300 bg-indigo-50 text-indigo-950': evt.tone === 'indigo',
                            'border-purple-300 bg-purple-50 text-purple-950': evt.tone === 'purple',
                          }"
                          (click)="onScheduleEventClick(evt)"
                        >
                          <p class="truncate text-[11px] leading-tight font-black text-slate-900">
                            {{ evt.roomName | t }}
                          </p>
                          <p
                            class="truncate text-[10px] leading-tight font-bold text-indigo-900/90"
                          >
                            {{ formatEventTitle(evt.title) }}
                          </p>
                          <p class="text-[9px] leading-tight font-semibold opacity-75">
                            {{ evt.timeStr }}
                          </p>
                        </div>
                      }
                    </td>
                  }
                </tr>

                <!-- Slot 2: 13:00 - 17:00 -->
                <tr class="h-24 hover:bg-slate-50/50">
                  <td
                    class="border-r border-slate-100 bg-slate-50/80 px-3 py-3 text-center text-[11px] font-black whitespace-nowrap text-slate-600"
                  >
                    13:00 - 17:00
                  </td>
                  @for (col of calendarCols(); track col.key; let cIdx = $index) {
                    <td
                      class="relative border-r border-slate-100 p-1.5 align-top transition hover:bg-indigo-50/30"
                    >
                      @for (evt of getSlotEvents(cIdx, 1); track evt.roomName + evt.timeStr) {
                        <div
                          class="cursor-pointer space-y-0.5 rounded-xl border p-2 text-[10px] shadow-sm transition hover:scale-[1.02]"
                          [ngClass]="{
                            'border-emerald-300 bg-emerald-50 text-emerald-950':
                              evt.tone === 'emerald',
                            'border-amber-300 bg-amber-50 text-amber-950': evt.tone === 'amber',
                            'border-cyan-300 bg-cyan-50 text-cyan-950': evt.tone === 'cyan',
                            'border-indigo-300 bg-indigo-50 text-indigo-950': evt.tone === 'indigo',
                            'border-purple-300 bg-purple-50 text-purple-950': evt.tone === 'purple',
                          }"
                          (click)="onScheduleEventClick(evt)"
                        >
                          <p class="truncate text-[11px] leading-tight font-black text-slate-900">
                            {{ evt.roomName | t }}
                          </p>
                          <p
                            class="truncate text-[10px] leading-tight font-bold text-indigo-900/90"
                          >
                            {{ formatEventTitle(evt.title) }}
                          </p>
                          <p class="text-[9px] leading-tight font-semibold opacity-75">
                            {{ evt.timeStr }}
                          </p>
                        </div>
                      }
                    </td>
                  }
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Calendar Controls & Legend Footer -->
          <div class="mt-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <a
              routerLink="/app/calendar"
              class="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <span>{{ 'home.exportCalendar' | t }}</span>
              <app-icon name="chevron-right" [size]="14" />
            </a>

            <!-- Legend items -->
            <div
              class="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-bold text-slate-600"
            >
              <span class="font-medium text-slate-400">{{ 'home.colorLegend' | t }}</span>
              <span class="inline-flex items-center gap-1.5">
                <span class="h-3 w-3 rounded-md bg-emerald-500"></span>
                {{ 'home.legendMyBooking' | t }}
              </span>
              <span class="inline-flex items-center gap-1.5">
                <span class="h-3 w-3 rounded-md bg-sky-400"></span>
                {{ 'home.legendInternal' | t }}
              </span>
              <span class="inline-flex items-center gap-1.5">
                <span class="h-3 w-3 rounded-md bg-cyan-400"></span>
                {{ 'home.legendExternal' | t }}
              </span>
              <span class="inline-flex items-center gap-1.5">
                <span class="h-3 w-3 rounded-md bg-amber-400"></span>
                {{ 'home.legendMaintenance' | t }}
              </span>
              <span class="inline-flex items-center gap-1.5">
                <span class="h-3 w-3 rounded-md bg-rose-400"></span>
                {{ 'home.legendUnavailable' | t }}
              </span>
              <span class="inline-flex items-center gap-1.5">
                <span class="h-3 w-3 rounded-md bg-yellow-400"></span>
                {{ 'home.legendNotice' | t }}
              </span>
              <span class="inline-flex items-center gap-1.5">
                <span class="h-3 w-3 rounded-md bg-purple-500"></span>
                {{ 'home.legendWorkflow' | t }}
              </span>
              <span class="inline-flex items-center gap-1.5">
                <span class="h-3 w-3 rounded-md bg-blue-500"></span>
                {{ 'home.legendGroup' | t }}
              </span>
            </div>

            <a
              routerLink="/app/policy"
              class="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800"
            >
              <span>{{ 'home.viewDetailedGuide' | t }}</span>
              <app-icon name="arrow-right" [size]="14" />
            </a>
          </div>
        </article>
      }

      <!-- Modal Xem chi tiết Booking từ Lịch -->
      <app-modal
        [open]="detailOpen()"
        [title]="
          detailBooking()
            ? 'Booking #BK-' + detailBooking()!.bookingId.toString().padStart(5, '0')
            : ('bookings.detailTitle' | t)
        "
        subtitle="{{ 'bookings.detailSubtitle' | t }}"
        (close)="closeBookingDetail()"
      >
        @if (detailLoading()) {
          <div class="space-y-3 p-2">
            <div class="skeleton h-8 rounded-xl"></div>
            <div class="skeleton h-32 rounded-xl"></div>
            <div class="pt-2 text-center">
              <button
                type="button"
                class="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-xs font-bold text-amber-800 shadow-sm transition hover:bg-amber-100"
                (click)="cancelLoadingAndShowError()"
              >
                <app-icon name="alert" [size]="14" class="text-amber-600" /> Dừng chờ & Báo lỗi
                Backend
              </button>
            </div>
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
                (click)="closeBookingDetail()"
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
                            (click)="checkInItem(item.bookingItemId)"
                          >
                            <app-icon name="login" [size]="14" /> {{ 'bookings.checkinNow' | t }}
                          </button>
                        } @else if (logFor(item.bookingItemId); as log) {
                          @if (!log.actualCheckout) {
                            <button
                              type="button"
                              class="btn-primary bg-rose-600 px-3 py-1 text-xs hover:bg-rose-700"
                              (click)="checkOutLog(log.logId)"
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

      <!-- Modal Xem thông tin sự kiện khác / Sample event -->
      <app-modal
        [open]="eventInfoOpen()"
        [title]="selectedEventInfo()?.roomName || 'Thông tin lịch'"
        subtitle="Chi tiết thời gian & nội dung đăng ký"
        (close)="eventInfoOpen.set(false)"
      >
        @if (selectedEventInfo(); as info) {
          <div class="space-y-4 text-xs">
            <div class="space-y-2 rounded-2xl bg-slate-50 p-4">
              <div class="flex justify-between">
                <span class="text-slate-400">Địa điểm / Phòng:</span>
                <span class="font-black text-slate-800">{{ info.roomName }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400">Nội dung / Booking:</span>
                <span class="font-bold text-indigo-700">{{ info.title }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400">Khung giờ:</span>
                <span class="font-bold text-slate-700">{{ info.timeStr }}</span>
              </div>
            </div>
            <div class="flex justify-end pt-2">
              <button
                type="button"
                class="btn-secondary text-xs"
                (click)="eventInfoOpen.set(false)"
              >
                Đóng
              </button>
            </div>
          </div>
        }
      </app-modal>
    </section>
  `,
})
export class RequesterHomePage implements OnInit {
  private readonly workspace = inject(WorkspaceService)
  private readonly api = inject(SystemService)
  protected readonly store = inject(AuthStore)
  protected readonly languageStore = inject(LanguageStore)
  private readonly toast = inject(ToastService)
  protected readonly router = inject(Router)

  protected readonly detailOpen = signal(false)
  protected readonly detailLoading = signal(false)
  protected readonly detailAccessDenied = signal(false)
  protected readonly detailErrorMessage = signal('')
  protected readonly detailBooking = signal<BookingDetailResponse | null>(null)
  protected readonly detailLogs = signal<UsageLogResponse[]>([])
  protected readonly selectedEventInfo = signal<ScheduleSlotEvent | null>(null)
  protected readonly eventInfoOpen = signal(false)

  protected readonly today = new Date()
  protected readonly loading = signal(true)
  protected readonly bookings = signal<BookingResponse[]>([])
  protected readonly waitlists = signal<WaitlistResponse[]>([])
  protected readonly notifications = signal<NotificationResponse[]>([])
  protected readonly calendarEvents = signal<CalendarEventResponse[]>([])
  protected readonly unreadCount = signal(0)
  protected readonly calendarMode = signal<'Day' | 'Week'>('Week')
  protected readonly calendarFocus = signal(new Date())

  protected readonly violationSummary = signal<UserViolationSummaryResponse>({
    userId: 0,
    fullName: '',
    penaltyPoints: 0,
    userStatus: 'Active',
    restrictionUntil: null,
    activeViolationCount: 0,
    activePenaltyPoints: 0,
    activeViolations: [],
  })

  // Sample events strictly tied to specific dates in July 2026
  private readonly sampleScheduleEvents: ScheduleSlotEvent[] = [
    {
      roomName: 'Phòng LAB1 (Tầng 1)',
      title: 'My booking #0012',
      timeStr: '09:00 - 11:30',
      dateKey: '2026-07-02',
      rowIndex: 0,
      tone: 'emerald',
    },
    {
      roomName: 'Lab Điện tử (LAB-ELEC-01)',
      title: 'Maintenance Schedule',
      timeStr: '08:30 - 11:30',
      dateKey: '2026-07-07',
      rowIndex: 0,
      tone: 'amber',
    },
    {
      roomName: 'Lab Sinh học (LAB-BIO-01)',
      title: 'External Partner Lab',
      timeStr: '09:30 - 11:00',
      dateKey: '2026-07-10',
      rowIndex: 0,
      tone: 'cyan',
    },
    {
      roomName: 'Phòng Thực hành Mạng (LAB-NET-01)',
      title: 'Internal Lab Booking',
      timeStr: '14:00 - 16:30',
      dateKey: '2026-07-04',
      rowIndex: 1,
      tone: 'indigo',
    },
    {
      roomName: 'Phòng LAB1 (Tầng 1)',
      title: 'Workflow Booking',
      timeStr: '13:00 - 15:00',
      dateKey: '2026-07-09',
      rowIndex: 1,
      tone: 'purple',
    },
  ]

  // Dynamic column calculations based on active language and focus date
  protected readonly calendarCols = computed(() => {
    const lang = this.languageStore.lang()
    const focus = this.calendarFocus()
    const year = focus.getFullYear()
    const month = focus.getMonth()
    const mode = this.calendarMode()

    let startDate: Date
    let colCount = 7

    if (mode === 'Day') {
      startDate = new Date(year, month, focus.getDate())
      colCount = 1
    } else {
      // 7 ngày trong tuần từ Thứ Hai
      const dayOfWeek = (focus.getDay() + 6) % 7
      startDate = new Date(year, month, focus.getDate() - dayOfWeek)
      colCount = 7
    }

    return Array.from({ length: colCount }, (_, i) => {
      const d = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i)
      const dayOfWeek = d.getDay()
      const dateNum = d.getDate().toString().padStart(2, '0')
      const monthNum = (d.getMonth() + 1).toString().padStart(2, '0')

      let dayName = ''
      if (lang === 'en') {
        const names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        dayName = names[dayOfWeek]
      } else {
        const names = ['CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7']
        dayName = names[dayOfWeek]
      }

      const dateStr = `${dateNum}/${monthNum}`
      const dateKey = toDateInput(d)
      return { key: `col-${i}-${dateKey}`, dayName, dateStr, dateKey, date: d }
    })
  })

  protected readonly firstName = computed(() => {
    const parts = this.store.user()?.fullName.trim().split(/\s+/) ?? []
    return parts.at(-1) ?? 'bạn'
  })

  protected readonly monthTitle = computed(() => {
    const lang = this.languageStore.lang()
    const focus = this.calendarFocus()
    return new Intl.DateTimeFormat(lang === 'en' ? 'en-US' : 'vi-VN', {
      month: 'long',
      year: 'numeric',
    }).format(focus)
  })

  protected readonly upcomingBookings = computed(() =>
    this.bookings()
      .filter(
        (item) => item.status === 'Approved' && new Date(item.startTime).getTime() > Date.now(),
      )
      .sort((a, b) => +new Date(a.startTime) - +new Date(b.startTime)),
  )

  protected readonly displayUpcomingBookings = computed(() => {
    const list = this.upcomingBookings()
    const lang = this.languageStore.lang()
    return list.map((b) => ({
      id: b.bookingId,
      monthStr: new Date(b.startTime)
        .toLocaleString(lang === 'en' ? 'en-US' : 'vi-VN', { month: 'short' })
        .toUpperCase(),
      dayStr: new Date(b.startTime).getDate().toString().padStart(2, '0'),
      title:
        this.purposeLabel(b.purposeType) ||
        (lang === 'en' ? 'Research Project' : 'Dự án nghiên cứu'),
      timeStr: `${new Date(b.startTime).toLocaleTimeString(lang === 'en' ? 'en-US' : 'vi-VN', { hour: '2-digit', minute: '2-digit' })} - ${new Date(b.endTime).toLocaleTimeString(lang === 'en' ? 'en-US' : 'vi-VN', { hour: '2-digit', minute: '2-digit' })}, ${new Date(b.startTime).toLocaleDateString(lang === 'en' ? 'en-US' : 'vi-VN')}`,
    }))
  })

  protected readonly pendingBookings = computed(
    () => this.bookings().filter((item) => item.status === 'Pending').length,
  )

  protected readonly activeWaitlists = computed(() =>
    this.waitlists().filter((item) => ['Waiting', 'Notified'].includes(item.status)),
  )

  protected readonly recentNotifications = computed(() =>
    [...this.notifications()]
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
      .slice(0, 5),
  )

  protected readonly statusText = computed(() => {
    const status = this.store.user()?.status
    if (typeof status === 'string') return status
    return (
      ({ 1: 'Active', 2: 'Inactive', 3: 'Restricted', 4: 'Locked' } as Record<number, string>)[
        status ?? 1
      ] ?? 'Active'
    )
  })

  protected readonly healthScore = computed(() =>
    Math.max(
      0,
      100 -
        this.violationSummary().penaltyPoints * 5 -
        this.violationSummary().activeViolationCount * 5,
    ),
  )

  protected readonly displayHealthScore = computed(() => {
    return this.healthScore()
  })

  protected readonly healthRing = computed(
    () =>
      `conic-gradient(#10b981 0 ${this.displayHealthScore()}%, #e2e8f0 ${this.displayHealthScore()}% 100%)`,
  )

  protected readonly accountWarning = computed(() => {
    const isEn = this.languageStore.lang() === 'en'
    const status = this.statusText()
    if (status === 'Restricted') {
      const until = this.store.user()?.restrictionUntil
      if (isEn) {
        return until
          ? `Your account is restricted until ${new Date(until).toLocaleString('en-US')}. You may not be able to create new bookings.`
          : 'Your account is restricted. Please check your active violations.'
      }
      return until
        ? `Tài khoản đang bị hạn chế đến ${new Date(until).toLocaleString('vi-VN')}. Trong thời gian này bạn có thể không tạo được booking mới.`
        : 'Tài khoản đang bị hạn chế. Vui lòng xem các vi phạm đang hoạt động.'
    }
    if (status === 'Locked')
      return isEn
        ? 'Your account is locked. Please contact Admin for support.'
        : 'Tài khoản đã bị khóa. Hãy liên hệ Admin để được hỗ trợ.'
    if (status === 'Inactive')
      return isEn
        ? 'Your account is inactive. Please contact Admin.'
        : 'Tài khoản đang ngừng hoạt động. Hãy liên hệ Admin.'
    if (this.violationSummary().activeViolationCount > 0) {
      return isEn
        ? `You have ${this.violationSummary().activeViolationCount} active violation(s). Please review to avoid account restrictions.`
        : `Bạn đang có ${this.violationSummary().activeViolationCount} vi phạm hoạt động. Hãy kiểm tra để tránh bị hạn chế tài khoản.`
    }
    return null
  })

  protected readonly kpiCards = computed(() => {
    this.languageStore.lang()
    return [
      {
        label: this.languageStore.t('home.pendingApproval'),
        value: this.pendingBookings(),
        note: this.languageStore.t('home.pendingNote'),
        icon: 'clock',
        tone: 'amber',
      },
      {
        label: this.languageStore.t('home.upcomingBookings'),
        value: this.upcomingBookings().length,
        note: this.languageStore.t('home.approvedNote'),
        icon: 'calendar',
        tone: 'indigo',
      },
      {
        label: this.languageStore.t('home.activeWaitlist'),
        value: this.activeWaitlists().length,
        note: this.languageStore.t('home.waitlistNote'),
        icon: 'activity',
        tone: 'cyan',
      },
      {
        label: this.languageStore.t('home.unreadNotifications'),
        value: this.unreadCount(),
        note: this.languageStore.t('home.unreadNote'),
        icon: 'bell',
        tone: 'rose',
      },
    ]
  })

  ngOnInit(): void {
    const user = this.store.user()
    if (!user) {
      this.loading.set(false)
      return
    }

    const focus = this.calendarFocus()
    const from = new Date(focus.getFullYear(), focus.getMonth(), 1).toISOString()
    const to = new Date(focus.getFullYear(), focus.getMonth() + 1, 1).toISOString()

    this.workspace
      .bookingsByUser(user.userId)
      .pipe(catchError(() => of([])))
      .subscribe((res) => {
        this.bookings.set(res)
        this.loading.set(false)
      })

    this.workspace
      .waitlistsByUser(user.userId)
      .pipe(catchError(() => of([])))
      .subscribe((res) => this.waitlists.set(res))

    this.workspace
      .notifications(user.userId, 1, 10)
      .pipe(catchError(() => of([])))
      .subscribe((res) => this.notifications.set(res))

    this.workspace
      .unreadCount(user.userId)
      .pipe(catchError(() => of({ userId: user.userId, unreadCount: 0 })))
      .subscribe((res) => this.unreadCount.set(res.unreadCount))

    this.workspace
      .violationSummary(user.userId)
      .pipe(
        catchError(() =>
          of({
            userId: user.userId,
            fullName: user.fullName,
            penaltyPoints: user.penaltyPoints,
            userStatus: String(user.status),
            restrictionUntil: user.restrictionUntil,
            activeViolationCount: 0,
            activePenaltyPoints: 0,
            activeViolations: [],
          }),
        ),
      )
      .subscribe((res) => this.violationSummary.set(res))

    this.api
      .calendar(from, to)
      .pipe(catchError(() => of([])))
      .subscribe((res) => this.calendarEvents.set(res))
  }

  protected setCalendarMode(mode: 'Day' | 'Week'): void {
    this.calendarMode.set(mode)
  }

  protected shiftFocus(offset: number): void {
    const cur = this.calendarFocus()
    const mode = this.calendarMode()
    if (mode === 'Day') {
      const next = new Date(cur)
      next.setDate(cur.getDate() + offset)
      this.calendarFocus.set(next)
    } else {
      const next = new Date(cur)
      next.setDate(cur.getDate() + offset * 7)
      this.calendarFocus.set(next)
    }
    this.reloadCalendarData()
  }

  private reloadCalendarData(): void {
    const focus = this.calendarFocus()
    const from = new Date(focus.getFullYear(), focus.getMonth(), 1).toISOString()
    const to = new Date(focus.getFullYear(), focus.getMonth() + 1, 1).toISOString()
    this.api
      .calendar(from, to)
      .pipe(catchError(() => of([])))
      .subscribe((events) => {
        this.calendarEvents.set(events)
      })
  }

  protected getSlotEvents(colIndex: number, rowIndex: number): ScheduleSlotEvent[] {
    const col = this.calendarCols()[colIndex]
    if (!col) return []

    const targetDateKey = col.dateKey
    const events: ScheduleSlotEvent[] = []

    // 1. Real user bookings from database
    for (const b of this.bookings()) {
      if (b.status === 'Rejected' || b.status === 'Cancelled') continue

      const start = new Date(b.startTime)
      const end = new Date(b.endTime)
      const bDateKey = toDateInput(start)

      if (bDateKey === targetDateKey) {
        const startHour = start.getHours()
        const slotIndex = startHour < 12 ? 0 : 1

        if (slotIndex === rowIndex) {
          const timeStr = `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
          const tone: 'emerald' | 'amber' | 'cyan' | 'indigo' | 'purple' =
            b.purposeType === 'Internal'
              ? 'indigo'
              : b.purposeType === 'External'
                ? 'cyan'
                : b.purposeType === 'Workflow'
                  ? 'purple'
                  : 'emerald'

          const matchedEv = this.calendarEvents().find((ev) => ev.sourceId === b.bookingId)
          const isEn = this.languageStore.lang() === 'en'
          const roomName = matchedEv?.resources?.length
            ? matchedEv.resources[0].resourceName
            : isEn
              ? `Lab Room (Booking #${b.bookingId})`
              : `Phòng Lab (Booking #${b.bookingId})`

          events.push({
            roomName,
            title: `BK-#${b.bookingId.toString().padStart(4, '0')} · ${this.purposeLabel(b.purposeType)}`,
            timeStr,
            dateKey: targetDateKey,
            rowIndex,
            tone,
            bookingId: b.bookingId,
            sourceType: 'Booking',
          })
        }
      }
    }

    // 2. Real system calendar events (e.g., maintenance)
    // Filtered out other users' bookings as per requirement, keeping only Maintenance
    for (const ev of this.calendarEvents()) {
      if (ev.eventType === 'Booking') continue

      const start = new Date(ev.startTime)
      const end = new Date(ev.endTime)
      const evDateKey = toDateInput(start)

      if (evDateKey === targetDateKey) {
        const startHour = start.getHours()
        const slotIndex = startHour < 12 ? 0 : 1

        if (slotIndex === rowIndex) {
          const timeStr = `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
          const isMaintenance = ev.eventType === 'Maintenance'
          const exists = events.some((r) => r.timeStr === timeStr)

          if (!exists) {
            const isEn = this.languageStore.lang() === 'en'
            const roomName = ev.resources?.length
              ? ev.resources[0].resourceName
              : isEn
                ? 'Lab Room'
                : 'Phòng Lab'

            events.push({
              roomName,
              title: isMaintenance
                ? isEn
                  ? `Maintenance: ${ev.title}`
                  : `Bảo trì: ${ev.title}`
                : ev.title,
              timeStr,
              dateKey: targetDateKey,
              rowIndex,
              tone: isMaintenance ? 'amber' : 'indigo',
              bookingId: ev.eventType === 'Booking' ? ev.sourceId : undefined,
              maintenanceId: ev.eventType === 'Maintenance' ? ev.sourceId : undefined,
              sourceType: ev.eventType === 'Maintenance' ? 'Maintenance' : 'Booking',
            })
          }
        }
      }
    }

    // 3. Demo sample events ONLY if they strictly match the exact target dateKey!
    for (const sample of this.sampleScheduleEvents) {
      if (sample.dateKey === targetDateKey && sample.rowIndex === rowIndex) {
        const exists = events.some((e) => e.timeStr === sample.timeStr)
        if (!exists) {
          events.push(sample)
        }
      }
    }

    return events
  }

  protected formatEventTitle(title: string): string {
    if (!title) return ''
    const isEn = this.languageStore.lang() === 'en'
    return title
      .replace(/ResearchProject/gi, isEn ? 'Research Project' : 'Dự án nghiên cứu')
      .replace(/CoursePractice/gi, isEn ? 'Course Practice' : 'Thực hành môn học')
      .replace(/SelfStudy/gi, isEn ? 'Self-study' : 'Tự học')
      .replace(/Other/gi, isEn ? 'Other' : 'Khác')
      .replace(/Internal/gi, isEn ? 'Internal' : 'Nội bộ')
      .replace(/External/gi, isEn ? 'External' : 'Đối tác')
      .replace(/Workflow/gi, isEn ? 'Workflow' : 'Quy trình')
  }

  protected purposeLabel(value: string): string {
    return labelOf('purpose', value, this.languageStore.lang())
  }

  protected statusLabel(value: string): string {
    return labelOf('user', value, this.languageStore.lang())
  }

  protected waitlistStatusLabel(value: string): string {
    return labelOf('waitlist', value, this.languageStore.lang())
  }

  protected notificationTone(type: string): 'indigo' | 'emerald' | 'amber' | 'rose' {
    const normalized = type.toLowerCase()
    if (normalized.includes('approve') || normalized.includes('available')) return 'emerald'
    if (normalized.includes('reject') || normalized.includes('violation')) return 'rose'
    if (normalized.includes('reminder') || normalized.includes('maintenance')) return 'amber'
    return 'indigo'
  }

  protected notificationIcon(type: string): string {
    const tone = this.notificationTone(type)
    if (tone === 'emerald') return 'check'
    if (tone === 'rose') return 'alert'
    if (tone === 'amber') return 'clock'
    return 'bell'
  }

  protected onBookingClick(booking: { title: string; timeStr: string }): void {
    this.toast.info(booking.title, booking.timeStr)
  }

  protected currentBookingId = 0

  protected openBookingDetail(bookingId: number): void {
    this.currentBookingId = bookingId
    this.detailOpen.set(true)
    this.detailErrorMessage.set('')
    this.detailBooking.set(null)
    this.detailLogs.set([])

    // Pre-check permission for Requester role before making API call
    // If the booking does not belong to the user, display access denied & error reporting UI instantly (0ms delay)
    const isOwnBooking = this.bookings().some((b) => b.bookingId === bookingId)
    if (this.store.isRequester() && !isOwnBooking) {
      this.detailLoading.set(false)
      this.detailAccessDenied.set(true)
      this.detailErrorMessage.set('Bạn không có quyền xem booking này.')
      return
    }

    this.detailLoading.set(true)
    this.detailAccessDenied.set(false)

    this.api
      .booking(bookingId)
      .pipe(timeout(2500))
      .subscribe({
        next: (detail) => {
          this.detailBooking.set(detail)
          this.detailLoading.set(false)
          this.api
            .usageLogsByBooking(bookingId)
            .pipe(catchError(() => of([])))
            .subscribe((logs) => this.detailLogs.set(logs))
        },
        error: (err: any) => {
          this.detailLoading.set(false)
          this.detailBooking.set(null)
          this.detailAccessDenied.set(true)
          const msg =
            err?.message ||
            err?.error?.message ||
            err?.error?.detail ||
            (err?.name === 'TimeoutError'
              ? 'Máy chủ Backend đang tạm dừng hoặc xử lý lâu (Timeout 2.5s).'
              : 'Bạn không có quyền xem booking này.')
          this.detailErrorMessage.set(msg)
        },
      })
  }

  protected cancelLoadingAndShowError(): void {
    this.detailLoading.set(false)
    this.detailAccessDenied.set(true)
    this.detailErrorMessage.set('Bạn không có quyền xem booking này.')
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

  protected closeBookingDetail(): void {
    const user = this.store.user()
    if (user?.userId && this.detailAccessDenied()) {
      this.api
        .sendNotification({
          userId: user.userId,
          title: 'Phản hồi từ chối truy cập 403',
          message: `Người dùng ${user.fullName || user.username} đã quay lại trang sau khi xem thông báo không đủ quyền truy cập booking.`,
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

  protected logFor(bookingItemId: number): UsageLogResponse | undefined {
    return this.detailLogs().find((l) => l.bookingItemId === bookingItemId)
  }

  protected canCheckInNow(booking: BookingDetailResponse): boolean {
    if (booking.status !== 'Approved') return false
    return getCheckInWindowInfo(booking.startTime, booking.endTime).canCheckIn
  }

  protected checkUserRestricted(): boolean {
    const status = this.store.user()?.status
    if (status === 'Restricted' || status === 3) {
      this.toast.error(
        'Tài khoản đang bị hạn chế',
        'Tài khoản của bạn đang ở trạng thái Bị hạn chế do vi phạm điểm phạt. Không thể Check-in / Check-out.',
      )
      return true
    }
    return false
  }

  protected checkInItem(bookingItemId: number): void {
    if (this.checkUserRestricted()) return
    this.api.checkIn(bookingItemId).subscribe({
      next: () => {
        this.toast.success('Check-in thành công', 'Đã bắt đầu phiên sử dụng tài nguyên.')
        if (this.detailBooking()) {
          this.openBookingDetail(this.detailBooking()!.bookingId)
        }
      },
      error: (err: any) => {
        const msg =
          err?.error?.message ||
          (typeof err?.error === 'string' ? err.error : null) ||
          err?.message ||
          'Không thể check-in'
        this.toast.error('Không thể check-in', msg)
      },
    })
  }

  protected checkOutLog(logId: number): void {
    if (this.checkUserRestricted()) return
    if (
      !confirm(
        'Xác nhận trả phòng / check-out? (Nội quy: Nếu trễ quá thời gian kết thúc, hệ thống sẽ tự động ghi nhận sự cố Trả muộn và vi phạm)',
      )
    )
      return
    this.api.checkOut(logId).subscribe({
      next: () => {
        this.toast.success('Check-out thành công', 'Phiên sử dụng đã kết thúc.')
        if (this.detailBooking()) {
          this.openBookingDetail(this.detailBooking()!.bookingId)
        }
      },
      error: (err: any) => {
        const msg =
          err?.error?.message ||
          (typeof err?.error === 'string' ? err.error : null) ||
          err?.message ||
          'Không thể check-out'
        this.toast.error('Không thể check-out', msg)
      },
    })
  }

  protected confirmCancel(booking: BookingDetailResponse): void {
    if (!confirm('Bạn có chắc chắn muốn hủy booking này?')) return
    this.api.cancelBooking(booking.bookingId).subscribe({
      next: () => {
        this.toast.success('Đã hủy booking')
        this.detailOpen.set(false)
        this.ngOnInit()
      },
      error: () => this.toast.error('Không thể hủy booking'),
    })
  }

  protected openEventInfoModal(evt: ScheduleSlotEvent): void {
    this.selectedEventInfo.set(evt)
    this.eventInfoOpen.set(true)
  }

  protected onScheduleEventClick(evt: ScheduleSlotEvent): void {
    if (evt.bookingId) {
      this.openBookingDetail(evt.bookingId)
    } else if (evt.maintenanceId && (this.store.isAdmin() || this.store.isManager())) {
      void this.router.navigate(['/app/management/maintenances', evt.maintenanceId])
    } else {
      this.openEventInfoModal(evt)
    }
  }

  protected labelOf(domain: 'purpose' | 'resource', value: string, lang: 'vi' | 'en'): string {
    return labelOf(domain, value, lang)
  }
}
