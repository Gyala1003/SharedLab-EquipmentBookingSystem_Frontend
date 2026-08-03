import { DatePipe, NgClass } from '@angular/common'
import { Component, OnInit, computed, inject, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { RouterLink } from '@angular/router'
import { SystemService } from '../../core/api/system.service'
import type { BookingResponse, UserManagementResponse, ViolationResponse } from '../../core/api/system.models'
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
  selector: 'app-violations-management-page',
  imports: [DatePipe, NgClass, FormsModule, RouterLink, PageHeaderComponent, IconComponent, ModalComponent, StatusBadgeComponent, DataStateComponent, TranslatePipe],
  template: `
    <section class="space-y-6">
      <app-page-header [title]="'manageViolations.title' | t" [subtitle]="'manageViolations.subtitle' | t">
        <button class="btn-primary" (click)="openCreate()"><app-icon name="plus" [size]="17" /> {{ 'manageViolations.createViolation' | t }}</button>
      </app-page-header>

      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        @for (tab of tabs(); track tab.value) {
          <button class="kpi-card text-left transition hover:-translate-y-1" (click)="status = tab.value">
            <p class="text-xs font-bold text-slate-400">{{ tab.label }}</p>
            <p class="mt-2 text-3xl font-black" [ngClass]="tab.className">{{ count(tab.value) }}</p>
          </button>
        }
      </div>

      <div class="filter-bar md:grid-cols-2 xl:grid-cols-[1.5fr_1fr_1fr_auto]">
        <div>
          <label class="field-label">{{ 'common.search' | t }}</label>
          <input class="input-shell" [(ngModel)]="keyword" [placeholder]="'manageViolations.searchPlaceholder' | t" />
        </div>
        <div>
          <label class="field-label">{{ 'manageViolations.violationType' | t }}</label>
          <select class="input-shell" [(ngModel)]="type">
            <option value="">{{ 'common.all' | t }}</option>
            @for (item of violationTypes(); track item.key) {
              <option [value]="item.key">{{ item.label }}</option>
            }
          </select>
        </div>
        <div>
          <label class="field-label">{{ 'common.status' | t }}</label>
          <select class="input-shell" [(ngModel)]="status">
            <option value="">{{ 'common.all' | t }}</option>
            <option value="Active">{{ 'manageViolations.active' | t }}</option>
            <option value="Resolved">{{ 'manageViolations.resolved' | t }}</option>
            <option value="Cancelled">{{ 'manageViolations.cancelled' | t }}</option>
          </select>
        </div>
        <div class="flex items-end">
          <button class="btn-secondary w-full" (click)="reset()"><app-icon name="refresh" [size]="17" /> {{ 'common.reset' | t }}</button>
        </div>
      </div>

      <article class="card-surface overflow-hidden">
        @if (loading()) {
          <div class="p-6"><div class="skeleton h-80 rounded-2xl"></div></div>
        } @else if (filtered().length === 0) {
          <div class="p-6"><app-data-state [title]="'common.noData' | t" [message]="'common.noData' | t" icon="shield" /></div>
        } @else {
          <div class="overflow-x-auto">
            <table class="table-shell">
              <thead>
                <tr>
                  <th>{{ 'manageViolations.title' | t }}</th>
                  <th>{{ 'nav.users' | t }}</th>
                  <th>Booking</th>
                  <th>{{ 'manageViolations.violationType' | t }}</th>
                  <th>{{ 'manageViolations.points' | t }}</th>
                  <th>{{ 'manageViolations.loggedAt' | t }}</th>
                  <th>{{ 'common.status' | t }}</th>
                  <th>{{ 'common.action' | t }}</th>
                </tr>
              </thead>
              <tbody>
                @for (item of filtered(); track item.violationId) {
                  <tr>
                    <td class="font-black text-slate-900">#VP-{{ item.violationId }}</td>
                    <td><span class="font-black text-violet-700">User #{{ item.userId }}</span></td>
                    <td><a [routerLink]="['/app/bookings', item.bookingId]" class="font-black text-indigo-700 hover:underline">#BK-{{ item.bookingId }}</a></td>
                    <td>{{ labelOf('violationType', item.violationType, languageStore.lang()) }}</td>
                    <td><span class="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-black text-rose-700">+{{ item.penaltyPointsAdded }}</span></td>
                    <td>{{ item.loggedAt | date: 'HH:mm dd/MM/yyyy' }}</td>
                    <td><app-status-badge [value]="item.status" domain="violation" /></td>
                    <td>
                      @if (item.status === 'Active') {
                        <div class="flex gap-2">
                          <button class="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700" title="Resolve" (click)="action(item, 'resolve')"><app-icon name="check" [size]="16" /></button>
                          <button class="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-700" title="Cancel" (click)="action(item, 'cancel')"><app-icon name="x" [size]="16" /></button>
                        </div>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </article>

      <!-- Modal Tạo Vi Phạm -->
      <app-modal [open]="createOpen()" [title]="'manageViolations.createViolation' | t" subtitle="Chọn booking từ danh sách hoặc nhập thủ công thông tin bên dưới." (close)="createOpen.set(false)">
        <form class="grid gap-5" (ngSubmit)="create()">

          <!-- Bước 1: Chọn nhanh từ Booking -->
          <div>
            <label class="field-label">Chọn nhanh từ Booking có sẵn</label>
            @if (loadingForm()) {
              <div class="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                <app-icon name="refresh" [size]="14" /> Đang tải danh sách booking...
              </div>
            } @else if (bookings().length > 0) {
              <select class="input-shell" (change)="onSelectBooking($event)">
                <option value="">-- Chọn một Booking để tự động điền --</option>
                @for (b of bookings(); track b.bookingId) {
                  <option [value]="b.bookingId">#BK-{{ b.bookingId }} · User #{{ b.userId }} · {{ b.startTime | date: 'dd/MM HH:mm' }} → {{ b.endTime | date: 'HH:mm' }} ({{ b.status }})</option>
                }
              </select>
              <p class="mt-1.5 text-xs text-slate-400">Chọn booking để tự động điền Booking ID và User ID bên dưới.</p>
            } @else {
              <p class="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Không tải được danh sách booking. Vui lòng nhập thủ công Booking ID và User ID bên dưới.
              </p>
            }
          </div>

          <div class="h-px bg-slate-100"></div>

          <!-- Bước 2: Nhập thông tin -->
          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label class="field-label">Booking ID *</label>
              <input
                class="input-shell"
                type="number"
                min="1"
                required
                [(ngModel)]="form.bookingId"
                name="bookingId"
                placeholder="VD: 12"
              />
            </div>
            <div>
              <label class="field-label">User ID *</label>
              <input
                class="input-shell"
                type="number"
                min="1"
                required
                [(ngModel)]="form.userId"
                name="userId"
                placeholder="VD: 5"
              />
              @if (selectedBookingInfo()) {
                <p class="mt-1.5 text-xs text-emerald-600 font-medium">✓ {{ selectedBookingInfo() }}</p>
              }
            </div>
          </div>

          <div>
            <label class="field-label">{{ 'manageViolations.violationType' | t }} *</label>
            <select class="input-shell" [(ngModel)]="form.violationType" name="violationType">
              @for (item of violationTypes(); track item.value) {
                <option [ngValue]="item.value">{{ item.label }}</option>
              }
            </select>
          </div>

          <div class="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <button type="button" class="btn-secondary" (click)="createOpen.set(false)">{{ 'common.cancel' | t }}</button>
            <button
              class="btn-primary"
              [disabled]="saving() || !form.userId || !form.bookingId"
            >
              @if (saving()) {
                <app-icon name="refresh" [size]="15" /> {{ 'common.saving' | t }}
              } @else {
                <app-icon name="plus" [size]="15" /> {{ 'manageViolations.createViolation' | t }}
              }
            </button>
          </div>
        </form>
      </app-modal>
    </section>
  `,
})
export class ViolationsManagementPage implements OnInit {
  private readonly api = inject(SystemService)
  private readonly toast = inject(ToastService)
  protected readonly languageStore = inject(LanguageStore)
  protected readonly items = signal<ViolationResponse[]>([])
  protected readonly users = signal<UserManagementResponse[]>([])
  protected readonly bookings = signal<BookingResponse[]>([])
  protected readonly loading = signal(true)
  protected readonly loadingForm = signal(false)
  protected readonly saving = signal(false)
  protected readonly createOpen = signal(false)
  protected keyword = ''
  protected status = ''
  protected type = ''
  protected form = { userId: null as number | null, bookingId: null as number | null, violationType: 1 }
  protected readonly selectedBookingInfo = signal<string | null>(null)
  protected readonly labelOf = labelOf

  protected readonly tabs = computed(() => [
    { value: '', label: this.languageStore.t('common.all'), className: 'text-slate-950' },
    { value: 'Active', label: this.languageStore.t('manageViolations.active'), className: 'text-rose-600' },
    { value: 'Resolved', label: this.languageStore.t('manageViolations.resolved'), className: 'text-emerald-600' },
    { value: 'Cancelled', label: this.languageStore.t('manageViolations.cancelled'), className: 'text-slate-500' },
  ])

  protected readonly violationTypes = computed(() => {
    const isEn = this.languageStore.lang() === 'en'
    return [
      { value: 1, key: 'NoShow', label: isEn ? 'No Show' : 'Không đến' },
      { value: 2, key: 'LateCheckout', label: isEn ? 'Late Checkout' : 'Trả muộn' },
      { value: 3, key: 'DamageEquipment', label: isEn ? 'Damage Equipment' : 'Làm hỏng thiết bị' },
      { value: 4, key: 'MisuseEquipment', label: isEn ? 'Misuse Equipment' : 'Sử dụng sai' },
      { value: 5, key: 'UnauthorizedUse', label: isEn ? 'Unauthorized Use' : 'Sử dụng trái phép' },
    ]
  })

  protected readonly filtered = computed(() => {
    const n = this.keyword.trim()
    return this.items()
      .filter((x) => (!this.status || x.status === this.status) && (!this.type || x.violationType === this.type) && (!n || String(x.violationId).includes(n) || String(x.userId).includes(n) || String(x.bookingId).includes(n)))
      .sort((a, b) => +new Date(b.loggedAt) - +new Date(a.loggedAt))
  })

  ngOnInit(): void {
    this.load()
  }

  protected count(status: string): number {
    return status ? this.items().filter((x) => x.status === status).length : this.items().length
  }

  protected reset(): void {
    this.keyword = ''
    this.status = ''
    this.type = ''
  }

  protected openCreate(): void {
    this.form = { userId: null, bookingId: null, violationType: 1 }
    this.selectedBookingInfo.set(null)
    this.createOpen.set(true)

    // Tải danh sách booking mỗi khi mở modal (refresh data)
    this.loadingForm.set(true)
    this.bookings.set([])
    this.api.bookings().subscribe({
      next: (x) => {
        this.bookings.set(x)
        this.loadingForm.set(false)
      },
      error: () => {
        this.loadingForm.set(false)
      },
    })
  }

  protected onSelectBooking(event: Event): void {
    const select = event.target as HTMLSelectElement
    const bookingId = Number(select.value)
    if (bookingId) {
      const b = this.bookings().find((item) => item.bookingId === bookingId)
      if (b) {
        this.form.bookingId = b.bookingId
        this.form.userId = b.userId
        this.selectedBookingInfo.set(`Đã chọn Booking #BK-${b.bookingId} — User #${b.userId}`)
      }
    } else {
      this.form.bookingId = null
      this.form.userId = null
      this.selectedBookingInfo.set(null)
    }
  }

  protected create(): void {
    if (!this.form.userId || !this.form.bookingId) {
      this.toast.info('Hãy nhập đủ Booking ID và User ID')
      return
    }
    this.saving.set(true)
    this.api.createViolation({ userId: this.form.userId, bookingId: this.form.bookingId, violationType: this.form.violationType }).subscribe({
      next: () => {
        this.saving.set(false)
        this.createOpen.set(false)
        this.toast.success('Đã tạo vi phạm thành công')
        this.load()
      },
      error: (err) => {
        this.saving.set(false)
        const detail = err?.error?.message || err?.message || 'Vui lòng kiểm tra lại Booking ID và User ID.'
        this.toast.error('Tạo vi phạm thất bại', detail)
      },
    })
  }

  protected action(item: ViolationResponse, action: 'resolve' | 'cancel'): void {
    if (!confirm(`${action === 'resolve' ? 'Xử lý' : 'Hủy'} vi phạm #${item.violationId}?`)) return
    const req = action === 'resolve' ? this.api.resolveViolation(item.violationId) : this.api.cancelViolation(item.violationId)
    req.subscribe({
      next: () => {
        this.toast.success('Đã cập nhật vi phạm')
        this.load()
      },
      error: () => this.toast.error('Không thể cập nhật vi phạm'),
    })
  }

  private load(): void {
    this.loading.set(true)
    this.api.violations().subscribe({
      next: (x) => {
        this.items.set(x)
        this.loading.set(false)
      },
      error: () => {
        this.loading.set(false)
        this.toast.error('Không tải được vi phạm')
      },
    })
  }
}
