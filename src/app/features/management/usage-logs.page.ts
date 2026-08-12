import { DatePipe } from '@angular/common'
import { Component, OnInit, inject, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { RouterLink } from '@angular/router'
import { SystemService } from '../../core/api/system.service'
import type { UsageLogResponse } from '../../core/api/system.models'
import { DataStateComponent } from '../../shared/ui/data-state'
import { IconComponent } from '../../shared/ui/icon'
import { ModalComponent } from '../../shared/ui/modal'
import { PageHeaderComponent } from '../../shared/ui/page-header'
import { StatusBadgeComponent } from '../../shared/ui/status-badge'
import { ToastService } from '../../shared/ui/toast.service'
import { labelOf, toDateInput, toIso, toLocalDateTimeInput, getMaxPastDateInput, validateDateRange } from '../../shared/utils/presentation'
import { apiErrorMessage } from '../../core/http/api-error'
import { validateKeyword } from '../../shared/utils/search'

@Component({
  selector: 'app-usage-logs-page',
  imports: [
    DatePipe,
    FormsModule,
    RouterLink,
    PageHeaderComponent,
    IconComponent,
    ModalComponent,
    StatusBadgeComponent,
    DataStateComponent,
  ],
  template: `<section class="space-y-6">
    <app-page-header
      title="Nhật ký sử dụng"
      subtitle="Theo dõi check-in, check-out và tình trạng sự cố của từng BookingItem."
      ><a routerLink="/app/management/incidents" class="btn-primary"
        ><app-icon name="alert" [size]="17" /> Duyệt sự cố</a
      ></app-page-header
    >
    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div class="kpi-card">
        <p class="text-xs font-bold text-slate-400">Tổng lượt dùng</p>
        <p class="mt-2 text-3xl font-black text-slate-950">{{ items().length }}</p>
      </div>
      <div class="kpi-card">
        <p class="text-xs font-bold text-slate-400">Đang sử dụng</p>
        <p class="mt-2 text-3xl font-black text-amber-600">{{ activeCount() }}</p>
      </div>
      <div class="kpi-card">
        <p class="text-xs font-bold text-slate-400">Đã checkout</p>
        <p class="mt-2 text-3xl font-black text-emerald-600">{{ completedCount() }}</p>
      </div>
      <div class="kpi-card">
        <p class="text-xs font-bold text-slate-400">Có sự cố</p>
        <p class="mt-2 text-3xl font-black text-rose-600">{{ incidentCount() }}</p>
      </div>
    </div>
    <div class="filter-bar md:grid-cols-2 xl:grid-cols-[1.4fr_1fr_1fr_1fr_1fr_auto]">
      <div>
        <label class="field-label">Tìm theo Log / BookingItem</label>
        <div class="relative flex items-center">
          <span
            class="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-slate-400"
          >
            <app-icon name="search" [size]="18" />
          </span>
          <input
            type="search"
            class="input-shell search-input pr-10 !pl-11"
            maxlength="100"
            [(ngModel)]="keyword"
            placeholder="Mã log, mã booking..."
          />
          @if (keyword) {
            <button
              type="button"
              class="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-700"
              aria-label="Xóa từ khóa"
              (click)="keyword = ''"
            >
              <app-icon name="x" [size]="16" />
            </button>
          }
        </div>
      </div>
      <div>
        <label class="field-label">Trạng thái sử dụng</label
        ><select class="input-shell" [(ngModel)]="usageStatus">
          <option value="">Tất cả</option>
          <option value="active">Chưa checkout</option>
          <option value="completed">Đã checkout</option>
        </select>
      </div>
      <div>
        <label class="field-label">Duyệt sự cố</label
        ><select class="input-shell" [(ngModel)]="reviewStatus">
          <option value="">Tất cả</option>
          <option value="Pending">Chờ duyệt</option>
          <option value="Confirmed">Đã xác nhận</option>
          <option value="Rejected">Đã từ chối</option>
        </select>
      </div>
      <div>
        <label class="field-label">Từ ngày</label
        ><input
          class="input-shell"
          type="date"
          min="2000-01-01"
          [max]="maxPastDate"
          [(ngModel)]="from"
          (change)="onDateChange()"
        />
      </div>
      <div>
        <label class="field-label">Đến ngày</label
        ><input
          class="input-shell"
          type="date"
          min="2000-01-01"
          [max]="maxPastDate"
          [(ngModel)]="to"
          (change)="onDateChange()"
        />
      </div>
      <div class="flex items-end">
        <button class="btn-secondary w-full" (click)="reset()">
          <app-icon name="refresh" [size]="17" /> Đặt lại
        </button>
      </div>
    </div>
    <article class="card-surface overflow-hidden">
      <header class="flex items-center justify-between border-b border-slate-100 px-5 py-5">
        <div>
          <h2 class="font-black text-slate-950">Danh sách UsageLog</h2>
          <p class="mt-1 text-xs text-slate-400">{{ filtered().length }} bản ghi</p>
        </div>
        <button class="btn-secondary" (click)="load()">
          <app-icon name="refresh" [size]="16" /> Làm mới
        </button>
      </header>
      @if (loading()) {
        <div class="p-6"><div class="skeleton h-80 rounded-2xl"></div></div>
      } @else if (filtered().length === 0) {
        <div class="p-6">
          <app-data-state
            title="Không tìm thấy dữ liệu phù hợp"
            message="Chưa có dữ liệu check-in/check-out phù hợp."
            icon="activity"
          />
        </div>
      } @else {
        <div class="overflow-x-auto">
          <table class="table-shell">
            <thead>
              <tr>
                <th>Log</th>
                <th>BookingItem</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Sự cố</th>
                <th>Duyệt</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              @for (item of filtered(); track item.logId) {
                <tr>
                  <td class="font-black text-slate-900">#UL-{{ item.logId }}</td>
                  <td class="font-bold text-slate-700">#BI-{{ item.bookingItemId }}</td>
                  <td>{{ item.actualCheckin | date: 'HH:mm dd/MM/yyyy' }}</td>
                  <td>
                    @if (item.actualCheckout) {
                      <span class="font-bold text-emerald-700">{{
                        item.actualCheckout | date: 'HH:mm dd/MM/yyyy'
                      }}</span>
                    } @else {
                      <span
                        class="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-black text-amber-700"
                        >Đang sử dụng</span
                      >
                    }
                  </td>
                  <td>
                    <p class="font-bold text-slate-700">
                      {{ labelOf('incidentType', item.incidentStatus) }}
                    </p>
                    @if (item.incidentDescription) {
                      <p class="mt-1 max-w-60 truncate text-xs text-slate-400">
                        {{ item.incidentDescription }}
                      </p>
                    }
                  </td>
                  <td>
                    <app-status-badge [value]="item.incidentReviewStatus" domain="incident" />
                  </td>
                  <td>
                    <div class="flex gap-2">
                      @if (!item.actualCheckout) {
                        <button class="btn-secondary h-9 min-h-9 px-3" (click)="openCheckout(item)">
                          Checkout
                        </button>
                      }
                      @if (item.incidentReviewStatus === 'Pending') {
                        <a
                          routerLink="/app/management/incidents"
                          class="btn-secondary h-9 min-h-9 px-3"
                          >Duyệt</a
                        >
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
    <app-modal
      [open]="checkoutOpen()"
      title="Check-out thay người dùng"
      subtitle="Để trống thời gian để sử dụng thời điểm hiện tại."
      (close)="checkoutOpen.set(false)"
      ><label class="field-label">Thời gian checkout lịch sử</label
      ><input
        class="input-shell"
        type="datetime-local"
        [min]="selectedCheckin"
        [max]="currentDateTime()"
        [(ngModel)]="checkoutTime"
      />
      <p class="mt-3 text-xs leading-5 text-slate-400">
        Chỉ nhập thời gian lịch sử khi cần sửa dữ liệu. Luồng bình thường nên để trống.
      </p>
      <div class="mt-5 flex justify-end gap-2">
        <button class="btn-secondary" (click)="checkoutOpen.set(false)">Hủy</button
        ><button class="btn-primary" (click)="checkout()">Xác nhận checkout</button>
      </div></app-modal
    >
  </section>`,
})
export class UsageLogsPage implements OnInit {
  private readonly api = inject(SystemService)
  private readonly toast = inject(ToastService)
  protected readonly items = signal<UsageLogResponse[]>([])
  protected readonly loading = signal(true)
  protected readonly checkoutOpen = signal(false)
  protected keyword = ''
  protected usageStatus = ''
  protected reviewStatus = ''
  protected from = ''
  protected to = ''
  protected checkoutTime = ''
  private selectedId = 0
  protected selectedCheckin = ''
  protected readonly labelOf = labelOf
  protected maxPastDate = getMaxPastDateInput()
  protected onDateChange(): void {
    if (this.from || this.to) {
      const validation = validateDateRange({
        from: this.from,
        to: this.to,
        maxYear: new Date().getFullYear(),
      })
      if (!validation.valid && validation.error) {
        this.toast.error('Khoảng ngày không hợp lệ', validation.error)
      }
    }
  }

  protected filtered(): UsageLogResponse[] {
    const dateVal = validateDateRange({
      from: this.from,
      to: this.to,
      maxYear: new Date().getFullYear(),
    })
    if (!dateVal.valid) return []

    const kv = validateKeyword(this.keyword)
    const needle = kv.valid ? kv.trimmed : ''
    return this.items()
      .filter((item) => {
        const itemDate = toDateInput(new Date(item.actualCheckin))
        const matchesNeedle =
          !needle ||
          String(item.logId).includes(needle) ||
          String(item.bookingItemId).includes(needle)
        const matchesUsage =
          !this.usageStatus ||
          (this.usageStatus === 'active' ? !item.actualCheckout : !!item.actualCheckout)
        const matchesReview = !this.reviewStatus || item.incidentReviewStatus === this.reviewStatus
        const matchesFrom = !this.from || itemDate >= this.from
        const matchesTo = !this.to || itemDate <= this.to

        return matchesNeedle && matchesUsage && matchesReview && matchesFrom && matchesTo
      })
      .sort((a, b) => +new Date(b.actualCheckin) - +new Date(a.actualCheckin))
  }
  ngOnInit(): void {
    this.load()
  }
  protected activeCount(): number {
    return this.items().filter((x) => !x.actualCheckout).length
  }
  protected completedCount(): number {
    return this.items().filter((x) => !!x.actualCheckout).length
  }
  protected incidentCount(): number {
    return this.items().filter((x) => x.incidentStatus !== 'None').length
  }
  protected reset(): void {
    this.keyword = ''
    this.usageStatus = ''
    this.reviewStatus = ''
    this.from = ''
    this.to = ''
  }
  protected openCheckout(item: UsageLogResponse): void {
    this.selectedId = item.logId
    this.selectedCheckin = toLocalDateTimeInput(item.actualCheckin)
    this.checkoutTime = ''
    this.checkoutOpen.set(true)
  }

  protected currentDateTime(): string {
    return toLocalDateTimeInput(new Date())
  }
  protected checkout(): void {
    if (this.checkoutTime) {
      const checkout = +new Date(this.checkoutTime)
      const checkin = +new Date(this.selectedCheckin)
      if (!Number.isFinite(checkout) || checkout < checkin || checkout > Date.now()) {
        this.toast.info('Thời gian checkout phải sau check-in và không được ở tương lai')
        return
      }
    }
    this.api
      .checkOut(this.selectedId, this.checkoutTime ? toIso(this.checkoutTime) : null)
      .subscribe({
        next: () => {
          this.checkoutOpen.set(false)
          this.toast.success('Đã checkout tài nguyên')
          this.load()
        },
        error: (err: unknown) => this.toast.error('Không thể checkout', apiErrorMessage(err)),
      })
  }
  protected load(): void {
    this.loading.set(true)
    this.api.usageLogs().subscribe({
      next: (x) => {
        this.items.set(x)
        this.loading.set(false)
      },
      error: (err: unknown) => {
        this.loading.set(false)
        this.toast.error('Không tải được Nhật ký sử dụng', apiErrorMessage(err))
      },
    })
  }
}
