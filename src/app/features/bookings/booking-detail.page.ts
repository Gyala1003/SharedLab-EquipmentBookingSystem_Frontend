import { DatePipe, NgClass } from '@angular/common'
import { Component, OnInit, computed, inject, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { ActivatedRoute, Router, RouterLink } from '@angular/router'
import { forkJoin } from 'rxjs'
import { SystemService } from '../../core/api/system.service'
import type {
  BookingDetailResponse,
  BookingItemResponse,
  UsageLogResponse,
  ViolationResponse,
} from '../../core/api/system.models'
import { AuthStore } from '../../core/auth/auth.store'
import { DataStateComponent } from '../../shared/ui/data-state'
import { IconComponent } from '../../shared/ui/icon'
import { ModalComponent } from '../../shared/ui/modal'
import { PageHeaderComponent } from '../../shared/ui/page-header'
import { StatusBadgeComponent } from '../../shared/ui/status-badge'
import { ToastService } from '../../shared/ui/toast.service'
import { labelOf } from '../../shared/utils/presentation'

@Component({
  selector: 'app-booking-detail-page',
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
  ],
  template: `
    <section class="space-y-6">
      @if (loading()) {
        <div class="card-surface p-7">
          <div class="skeleton h-8 w-1/3 rounded"></div>
          <div class="skeleton mt-5 h-80 rounded-3xl"></div>
        </div>
      } @else if (!booking()) {
        <app-data-state
          title="Không tìm thấy booking"
          message="Booking không tồn tại hoặc nằm ngoài phạm vi quyền của bạn."
          icon="calendar"
          ><a routerLink="/app/bookings/my" class="btn-primary mt-5"
            >Về danh sách</a
          ></app-data-state
        >
      } @else {
        <app-page-header
          [title]="'Booking #BK-' + booking()!.bookingId.toString().padStart(5, '0')"
          [subtitle]="
            labelOf('purpose', booking()!.purposeType) +
            ' · Tạo lúc ' +
            (booking()!.createdAt | date: 'HH:mm dd/MM/yyyy')
          "
        >
          @if (canApprove()) {
            <button class="btn-primary" (click)="action('approve')">
              <app-icon name="check" [size]="17" /> Duyệt</button
            ><button class="btn-secondary btn-danger" (click)="rejectOpen.set(true)">
              <app-icon name="x" [size]="17" /> Từ chối
            </button>
          }
          @if (canCancel()) {
            <button class="btn-secondary btn-danger" (click)="action('cancel')">
              <app-icon name="x" [size]="17" /> Hủy booking
            </button>
          }
        </app-page-header>

        <div class="grid gap-6 xl:grid-cols-[1fr_360px]">
          <div class="space-y-6">
            <article class="card-surface p-5 sm:p-7">
              <div class="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p class="text-[10px] font-black tracking-[.16em] text-slate-400 uppercase">
                    Trạng thái hiện tại
                  </p>
                  <div class="mt-2">
                    <app-status-badge [value]="booking()!.status" domain="booking" />
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <div class="rounded-2xl bg-violet-50 px-4 py-3 text-center">
                    <p class="text-[10px] font-black text-violet-500 uppercase">Ưu tiên</p>
                    <p class="mt-1 text-xl font-black text-violet-800">
                      P{{ booking()!.priorityLevel ?? '—' }}
                    </p>
                  </div>
                  <div class="rounded-2xl bg-cyan-50 px-4 py-3 text-center">
                    <p class="text-[10px] font-black text-cyan-500 uppercase">Tài nguyên</p>
                    <p class="mt-1 text-xl font-black text-cyan-800">
                      {{ booking()!.items.length }}
                    </p>
                  </div>
                  <div
                    class="col-span-2 rounded-2xl bg-slate-50 px-4 py-3 text-center sm:col-span-1"
                  >
                    <p class="text-[10px] font-black text-slate-400 uppercase">Thời lượng</p>
                    <p class="mt-1 text-xl font-black text-slate-800">{{ durationHours() }}h</p>
                  </div>
                </div>
              </div>
              <div class="mt-6 grid gap-4 sm:grid-cols-2">
                <div class="rounded-2xl border border-slate-200 p-5">
                  <p class="text-xs font-black text-slate-400">Bắt đầu</p>
                  <p class="mt-2 text-lg font-black text-slate-900">
                    {{ booking()!.startTime | date: 'HH:mm' }}
                  </p>
                  <p class="mt-1 text-sm text-slate-500">
                    {{ booking()!.startTime | date: 'EEEE, dd/MM/yyyy' }}
                  </p>
                </div>
                <div class="rounded-2xl border border-slate-200 p-5">
                  <p class="text-xs font-black text-slate-400">Kết thúc</p>
                  <p class="mt-2 text-lg font-black text-slate-900">
                    {{ booking()!.endTime | date: 'HH:mm' }}
                  </p>
                  <p class="mt-1 text-sm text-slate-500">
                    {{ booking()!.endTime | date: 'EEEE, dd/MM/yyyy' }}
                  </p>
                </div>
              </div>
              <div class="mt-5 rounded-2xl bg-slate-50 p-5">
                <p class="text-xs font-black text-slate-700">Mô tả mục đích</p>
                <p class="mt-2 text-sm leading-7 whitespace-pre-line text-slate-500">
                  {{ booking()!.purposeDescription || 'Không có mô tả.' }}
                </p>
              </div>
              @if (booking()!.rejectionReason) {
                <div class="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-5">
                  <p class="text-xs font-black text-rose-800">Lý do từ chối</p>
                  <p class="mt-2 text-sm leading-6 text-rose-700">
                    {{ booking()!.rejectionReason }}
                  </p>
                </div>
              }
            </article>

            <article class="card-surface overflow-hidden">
              <header class="border-b border-slate-100 px-5 py-5 sm:px-6">
                <h2 class="text-lg font-black text-slate-950">Tài nguyên trong booking</h2>
                <p class="mt-1 text-xs text-slate-400">
                  Check-in, check-out và báo sự cố theo từng BookingItem
                </p>
              </header>
              <div class="divide-y divide-slate-100">
                @for (item of booking()!.items; track item.bookingItemId) {
                  <div class="p-5 sm:p-6">
                    <div class="flex flex-col gap-4 sm:flex-row sm:items-center">
                      <div
                        class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
                        [ngClass]="
                          item.resourceType === 'LabRoom'
                            ? 'bg-violet-50 text-violet-600'
                            : 'bg-cyan-50 text-cyan-600'
                        "
                      >
                        <app-icon
                          [name]="item.resourceType === 'LabRoom' ? 'building' : 'microscope'"
                          [size]="22"
                        />
                      </div>
                      <div class="min-w-0 flex-1">
                        <p class="font-black text-slate-900">
                          {{
                            item.labName ||
                              item.equipmentName ||
                              'Tài nguyên #' + item.bookingItemId
                          }}
                        </p>
                        <p class="mt-1 text-xs text-slate-400">
                          {{ labelOf('resource', item.resourceType) }} · Item #{{
                            item.bookingItemId
                          }}
                        </p>
                        <p class="mt-2 text-sm text-slate-500">
                          {{ item.note || 'Không có ghi chú.' }}
                        </p>
                      </div>
                      <div class="flex flex-wrap items-center gap-2">
                        @if (!logFor(item.bookingItemId) && canCheckIn()) {
                          <button class="btn-primary" (click)="openCheckIn(item)">
                            <app-icon name="login" [size]="16" /> Check-in
                          </button>
                        }
                        @if (isMissedNoShow(item.bookingItemId)) {
                          <span
                            class="rounded-full bg-rose-50 px-3 py-2 text-xs font-black text-rose-700"
                            >Đã quá giờ, không check-in — booking sẽ được ghi nhận Không đến</span
                          >
                        }
                        @if (logFor(item.bookingItemId); as log) {
                          @if (!log.actualCheckout) {
                            <button class="btn-primary" (click)="openCheckOut(log)">
                              <app-icon name="logout" [size]="16" /> Check-out</button
                            ><button class="btn-secondary" (click)="openIncident(log)">
                              <app-icon name="alert" [size]="16" /> Báo sự cố
                            </button>
                          } @else {
                            <span
                              class="rounded-full bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700"
                              >Đã hoàn tất</span
                            >
                            @if (log.incidentStatus === 'None' || !log.incidentStatus) {
                              <button class="btn-secondary" (click)="openIncident(log)">
                                <app-icon name="alert" [size]="16" /> Báo sự cố sau dùng
                              </button>
                            }
                          }
                        }
                      </div>
                    </div>
                    @if (logFor(item.bookingItemId); as log) {
                      <div class="mt-4 grid gap-3 rounded-2xl bg-slate-50 p-4 sm:grid-cols-3">
                        <div>
                          <p class="text-[10px] font-black text-slate-400 uppercase">Check-in</p>
                          <p class="mt-1 text-xs font-bold text-slate-700">
                            {{ log.actualCheckin | date: 'HH:mm dd/MM/yyyy' }}
                          </p>
                        </div>
                        <div>
                          <p class="text-[10px] font-black text-slate-400 uppercase">Check-out</p>
                          <p class="mt-1 text-xs font-bold text-slate-700">
                            {{
                              log.actualCheckout
                                ? (log.actualCheckout | date: 'HH:mm dd/MM/yyyy')
                                : 'Chưa checkout'
                            }}
                          </p>
                        </div>
                        <div>
                          <p class="text-[10px] font-black text-slate-400 uppercase">Sự cố</p>
                          <p class="mt-1 text-xs font-bold text-slate-700">
                            {{ labelOf('incidentType', log.incidentStatus) }} ·
                            {{ labelOf('incident', log.incidentReviewStatus) }}
                          </p>
                        </div>
                      </div>
                    }
                  </div>
                }
              </div>
            </article>

            @if (violations().length) {
              <article class="card-surface overflow-hidden">
                <header class="border-b border-slate-100 px-5 py-5">
                  <h2 class="font-black text-slate-950">Vi phạm liên quan</h2>
                </header>
                <div class="divide-y divide-slate-100">
                  @for (item of violations(); track item.violationId) {
                    <div class="flex items-center gap-4 px-5 py-4">
                      <div
                        class="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50 text-rose-600"
                      >
                        <app-icon name="alert" [size]="18" />
                      </div>
                      <div class="min-w-0 flex-1">
                        <p class="font-black text-slate-800">
                          {{ labelOf('violationType', item.violationType) }}
                        </p>
                        <p class="mt-1 text-xs text-slate-400">
                          {{ item.loggedAt | date: 'HH:mm dd/MM/yyyy' }} · +{{
                            item.penaltyPointsAdded
                          }}
                          điểm
                        </p>
                      </div>
                      <app-status-badge [value]="item.status" domain="violation" />
                    </div>
                  }
                </div>
              </article>
            }
          </div>

          <aside class="space-y-5">
            <article class="card-surface p-5">
              <p class="text-xs font-black tracking-[.15em] text-violet-500 uppercase">Người đặt</p>
              <div class="mt-4 flex items-center gap-3">
                <div
                  class="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 font-black text-violet-700"
                >
                  {{ initials(booking()!.userName || 'U') }}
                </div>
                <div>
                  <p class="font-black text-slate-900">
                    {{ booking()!.userName || 'User #' + booking()!.userId }}
                  </p>
                  <p class="mt-1 text-xs text-slate-400">User ID {{ booking()!.userId }}</p>
                </div>
              </div>
            </article>
            <article class="card-surface p-5">
              <p class="text-xs font-black tracking-[.15em] text-slate-400 uppercase">Xét duyệt</p>
              <div class="mt-4 space-y-4">
                <div>
                  <p class="text-xs text-slate-400">Người duyệt</p>
                  <p class="mt-1 font-bold text-slate-800">
                    {{ booking()!.approvedByName || 'Chưa duyệt' }}
                  </p>
                </div>
                <div class="h-px bg-slate-100"></div>
                <div>
                  <p class="text-xs text-slate-400">Thời gian duyệt</p>
                  <p class="mt-1 font-bold text-slate-800">
                    {{
                      booking()!.approvedAt
                        ? (booking()!.approvedAt | date: 'HH:mm dd/MM/yyyy')
                        : '—'
                    }}
                  </p>
                </div>
              </div>
            </article>
            @if (canManageConcluded()) {
              <article class="rounded-[24px] border border-indigo-200 bg-indigo-50 p-5">
                <p class="font-black text-indigo-900">Hoàn tất nghiệp vụ</p>
                <p class="mt-2 text-sm leading-6 text-indigo-800/70">
                  Chỉ dùng sau khi thời gian booking kết thúc và kiểm tra usage log.
                </p>
                <div class="mt-4 grid gap-2">
                  <button class="btn-primary" (click)="action('complete')">
                    <app-icon name="check" [size]="16" /> Đánh dấu hoàn thành</button
                  ><button class="btn-secondary btn-danger" (click)="action('no-show')">
                    <app-icon name="alert" [size]="16" /> Đánh dấu NoShow
                  </button>
                </div>
              </article>
            }
          </aside>
        </div>

        <app-modal
          [open]="rejectOpen()"
          title="Từ chối booking"
          subtitle="Lý do sẽ được lưu và gửi thông báo cho người đặt."
          (close)="rejectOpen.set(false)"
          ><label class="field-label">Lý do từ chối *</label
          ><textarea
            class="textarea-shell"
            [(ngModel)]="rejectionReason"
            placeholder="Nêu rõ lý do để người dùng có thể điều chỉnh..."
          ></textarea>
          <div class="mt-5 flex justify-end gap-2">
            <button class="btn-secondary" (click)="rejectOpen.set(false)">Hủy</button
            ><button class="btn-primary" [disabled]="!rejectionReason.trim()" (click)="reject()">
              Xác nhận từ chối
            </button>
          </div></app-modal
        >
        <app-modal
          [open]="incidentOpen()"
          title="Báo sự cố sử dụng"
          subtitle="Sự cố sẽ chờ Admin/LabManager xác nhận nếu cần."
          (close)="incidentOpen.set(false)"
          ><div class="grid gap-4">
            <div>
              <label class="field-label">Loại sự cố</label
              ><select class="input-shell" [(ngModel)]="incidentStatus">
                <option [ngValue]="2">Báo hư hỏng</option>
                <option [ngValue]="3">Trả muộn</option>
                <option [ngValue]="4">Thiếu thiết bị</option>
                <option [ngValue]="5">Khác</option>
              </select>
            </div>
            <div>
              <label class="field-label">Thiết bị bị ảnh hưởng (ID)</label
              ><input
                class="input-shell"
                type="number"
                [(ngModel)]="affectedEquipmentId"
                placeholder="Để trống nếu không xác định"
              />
            </div>
            <div>
              <label class="field-label">Mô tả chi tiết</label
              ><textarea class="textarea-shell" [(ngModel)]="incidentDescription"></textarea>
            </div>
            <div class="flex justify-end gap-2">
              <button class="btn-secondary" (click)="incidentOpen.set(false)">Hủy</button
              ><button
                class="btn-primary"
                [disabled]="!incidentDescription.trim()"
                (click)="reportIncident()"
              >
                Gửi báo cáo
              </button>
            </div>
          </div></app-modal
        >
        <app-modal
          [open]="checkInOpen()"
          title="Điểm danh vào phòng lab"
          subtitle="Xác nhận thông tin trước khi check-in."
          (close)="checkInOpen.set(false)"
        >
          @if (checkInItem; as item) {
            <div class="grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm">
              <div class="flex justify-between">
                <span class="text-slate-400">Người điểm danh</span
                ><span class="font-black text-slate-800">{{ store.user()?.fullName }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400">Tài khoản</span
                ><span class="font-bold text-slate-700"
                  >{{ store.user()?.username }} · {{ store.user()?.email }}</span
                >
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400">Khoa/phòng ban</span
                ><span class="font-bold text-slate-700">{{ store.user()?.departmentName }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400">Phòng lab / tài nguyên</span
                ><span class="font-bold text-slate-700">{{
                  item.labName || item.equipmentName
                }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400">Thời gian</span
                ><span class="font-bold text-slate-700">{{
                  checkInTime | date: 'HH:mm dd/MM/yyyy'
                }}</span>
              </div>
            </div>
            <div class="mt-5 flex justify-end gap-2">
              <button class="btn-secondary" (click)="checkInOpen.set(false)">Hủy</button
              ><button class="btn-primary" (click)="confirmCheckIn()">
                <app-icon name="login" [size]="16" /> Xác nhận điểm danh
              </button>
            </div>
          }
        </app-modal>
        <app-modal
          [open]="checkOutOpen()"
          title="Điểm danh ra khỏi phòng lab"
          subtitle="Xác nhận trước khi kết thúc phiên sử dụng."
          (close)="checkOutOpen.set(false)"
        >
          @if (checkOutLog; as log) {
            <div class="grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm">
              <div class="flex justify-between">
                <span class="text-slate-400">Người dùng</span
                ><span class="font-black text-slate-800">{{ store.user()?.fullName }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400">Giờ check-in</span
                ><span class="font-bold text-slate-700">{{
                  log.actualCheckin | date: 'HH:mm dd/MM/yyyy'
                }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400">Giờ kết thúc booking</span
                ><span class="font-bold text-slate-700">{{
                  booking()!.endTime | date: 'HH:mm dd/MM/yyyy'
                }}</span>
              </div>
            </div>
            @if (checkoutLateMinutes() > 0) {
              <p class="mt-3 text-sm font-black text-rose-600">
                Bạn đang trễ quá {{ checkoutLateMinutes() }} phút so với giờ kết thúc, hệ thống sẽ
                ghi nhận 1 vi phạm khi xác nhận.
              </p>
            }
            <div class="mt-5 flex flex-wrap justify-end gap-2">
              <button class="btn-secondary" (click)="continueUsing()">Tiếp tục sử dụng</button
              ><button class="btn-primary" (click)="confirmCheckout()">
                <app-icon name="logout" [size]="16" /> Đăng ký hoàn tất (Checkout)
              </button>
            </div>
          }
        </app-modal>
      }
    </section>
  `,
})
export class BookingDetailPage implements OnInit {
  private readonly api = inject(SystemService)
  private readonly route = inject(ActivatedRoute)
  private readonly router = inject(Router)
  private readonly toast = inject(ToastService)
  protected readonly store = inject(AuthStore)
  protected readonly booking = signal<BookingDetailResponse | null>(null)
  protected readonly logs = signal<UsageLogResponse[]>([])
  protected readonly violations = signal<ViolationResponse[]>([])
  protected readonly loading = signal(true)
  protected readonly rejectOpen = signal(false)
  protected readonly incidentOpen = signal(false)
  protected readonly checkInOpen = signal(false)
  protected readonly checkOutOpen = signal(false)
  protected rejectionReason = ''
  protected incidentStatus = 2
  protected incidentDescription = ''
  protected affectedEquipmentId: number | null = null
  protected readonly labelOf = labelOf
  private id = 0
  private incidentLogId = 0
  protected checkInItem: BookingItemResponse | null = null
  protected checkInTime = ''
  protected checkOutLog: UsageLogResponse | null = null
  private noShowChecked = false
  protected readonly durationHours = computed(() => {
    const item = this.booking()
    return item
      ? Math.round((+new Date(item.endTime) - +new Date(item.startTime)) / 360000) / 10
      : 0
  })

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('bookingId'))
    this.load()
  }
  // Quyền duyệt/từ chối booking chuyển hẳn cho LabManager theo yêu cầu nghiệp vụ mới, Admin không còn thao tác này
  protected canApprove(): boolean {
    return Boolean(this.store.isManager() && this.booking()?.status === 'Pending')
  }
  protected canCancel(): boolean {
    const item = this.booking()
    return Boolean(
      item &&
      ['Pending', 'Approved'].includes(item.status) &&
      (item.userId === this.store.user()?.userId || this.store.isAdmin() || this.store.isManager()),
    )
  }
  protected canCheckIn(): boolean {
    const item = this.booking()
    if (!item || item.status !== 'Approved') return false
    const now = Date.now()
    return now >= +new Date(item.startTime) - 15 * 60_000 && now <= +new Date(item.endTime)
  }
  protected canManageConcluded(): boolean {
    return Boolean(
      (this.store.isAdmin() || this.store.isManager()) && this.booking()?.status === 'Approved',
    )
  }
  protected isMissedNoShow(itemId: number): boolean {
    const item = this.booking()
    if (!item || item.status !== 'Approved') return false
    return Date.now() > +new Date(item.endTime) && !this.logFor(itemId)
  }
  protected checkoutLateMinutes(): number {
    const item = this.booking()
    if (!item) return 0
    const deadline = +new Date(item.endTime) + 15 * 60_000
    return Math.max(0, Math.round((Date.now() - deadline) / 60_000))
  }
  protected logFor(itemId: number): UsageLogResponse | undefined {
    return this.logs().find((log) => log.bookingItemId === itemId)
  }
  protected initials(name: string): string {
    return name
      .trim()
      .split(/\s+/)
      .slice(-2)
      .map((x) => x[0]?.toUpperCase() ?? '')
      .join('')
  }
  protected action(action: 'approve' | 'cancel' | 'complete' | 'no-show'): void {
    if (!confirm(`Xác nhận thao tác ${action} booking #${this.id}?`)) return
    const request =
      action === 'approve'
        ? this.api.approveBooking(this.id)
        : action === 'cancel'
          ? this.api.cancelBooking(this.id)
          : action === 'complete'
            ? this.api.completeBooking(this.id)
            : this.api.noShowBooking(this.id)
    request.subscribe({
      next: () => {
        this.toast.success('Đã cập nhật booking')
        this.load()
      },
      error: () => this.toast.error('Không thể cập nhật booking'),
    })
  }
  protected reject(): void {
    this.api.rejectBooking(this.id, this.rejectionReason.trim()).subscribe({
      next: () => {
        this.rejectOpen.set(false)
        this.toast.success('Đã từ chối booking')
        this.load()
      },
      error: () => this.toast.error('Không thể từ chối booking'),
    })
  }
  protected checkIn(itemId: number): void {
    this.api.checkIn(itemId).subscribe({
      next: () => {
        this.toast.success('Check-in thành công')
        this.load()
      },
      error: () =>
        this.toast.error('Không thể check-in', 'Kiểm tra khung giờ và trạng thái booking.'),
    })
  }
  protected checkOut(logId: number): void {
    if (!confirm('Xác nhận check-out tài nguyên này?')) return
    this.api.checkOut(logId).subscribe({
      next: () => {
        this.toast.success('Check-out thành công')
        this.load()
      },
      error: () => this.toast.error('Không thể check-out'),
    })
  }
  protected openCheckIn(item: BookingItemResponse): void {
    this.checkInItem = item
    this.checkInTime = new Date().toISOString()
    this.checkInOpen.set(true)
  }
  protected confirmCheckIn(): void {
    const item = this.checkInItem
    if (!item) return
    this.checkInOpen.set(false)
    this.checkIn(item.bookingItemId)
  }
  protected openCheckOut(log: UsageLogResponse): void {
    this.checkOutLog = log
    this.checkOutOpen.set(true)
  }
  protected confirmCheckout(): void {
    const log = this.checkOutLog
    const item = this.booking()
    if (!log || !item) return
    const actualCheckoutIso = new Date().toISOString()
    this.checkOutOpen.set(false)
    this.api.checkOut(log.logId, actualCheckoutIso).subscribe({
      next: () => {
        this.toast.success('Check-out thành công')
        this.checkLateAndReportViolation(item, actualCheckoutIso)
        this.load()
      },
      error: () => this.toast.error('Không thể check-out'),
    })
  }
  protected continueUsing(): void {
    this.checkOutOpen.set(false)
  }
  private checkLateAndReportViolation(
    booking: BookingDetailResponse,
    actualCheckoutIso: string,
  ): void {
    const deadline = +new Date(booking.endTime) + 15 * 60_000
    if (+new Date(actualCheckoutIso) <= deadline) return
    this.api
      .createViolation({ userId: booking.userId, bookingId: booking.bookingId, violationType: 2 })
      .subscribe({
        next: () =>
          this.toast.info(
            'Đã ghi nhận vi phạm trả phòng muộn (tạm thời tính ở Frontend, sẽ điều chỉnh khi Backend hỗ trợ)',
          ),
        error: () => {},
      })
  }
  private markNoShowIfMissed(): void {
    if (this.noShowChecked) return
    const item = this.booking()
    if (!item || item.status !== 'Approved') return
    const hasMissed = item.items.some((bi) => this.isMissedNoShow(bi.bookingItemId))
    if (!hasMissed) return
    this.noShowChecked = true
    this.api.noShowBooking(this.id).subscribe({
      next: () => {
        this.toast.info('Booking đã được đánh dấu Không đến do quá giờ mà chưa check-in')
        this.load()
      },
      error: () =>
        console.warn(
          'Không thể tự động đánh dấu NoShow, có thể do phân quyền — cần LabManager xử lý thủ công',
        ),
    })
  }
  protected openIncident(log: UsageLogResponse): void {
    this.incidentLogId = log.logId
    this.incidentStatus = 2
    this.incidentDescription = ''
    this.affectedEquipmentId = null
    this.incidentOpen.set(true)
  }
  protected reportIncident(): void {
    this.api
      .reportIncident(this.incidentLogId, {
        incidentStatus: this.incidentStatus,
        incidentDescription: this.incidentDescription.trim(),
        affectedEquipmentId: this.affectedEquipmentId,
      })
      .subscribe({
        next: () => {
          this.incidentOpen.set(false)
          this.toast.success('Đã gửi báo cáo sự cố')
          this.load()
        },
        error: () => this.toast.error('Không thể gửi báo cáo sự cố'),
      })
  }
  private load(): void {
    this.loading.set(true)
    forkJoin({
      booking: this.api.booking(this.id),
      logs: this.api.usageLogsByBooking(this.id),
      violations: this.api.violationsByBooking(this.id),
    }).subscribe({
      next: ({ booking, logs, violations }) => {
        this.booking.set(booking)
        this.logs.set(logs)
        this.violations.set(violations)
        this.loading.set(false)
        this.markNoShowIfMissed()
      },
      error: () => {
        this.booking.set(null)
        this.loading.set(false)
      },
    })
  }
}
