import { DatePipe, NgClass } from '@angular/common'
import { Component, OnInit, computed, inject, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { RouterLink } from '@angular/router'
import { SystemService } from '../../core/api/system.service'
import type { UserManagementResponse, ViolationResponse } from '../../core/api/system.models'
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
      <app-page-header
        [title]="'manageViolations.title' | t"
        [subtitle]="'manageViolations.subtitle' | t"
      >
        <button class="btn-primary" (click)="openCreate()">
          <app-icon name="plus" [size]="17" /> {{ 'manageViolations.createViolation' | t }}
        </button>
      </app-page-header>

      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        @for (tab of tabs(); track tab.value) {
          <button
            class="kpi-card text-left transition hover:-translate-y-1"
            (click)="status = tab.value"
          >
            <p class="text-xs font-bold text-slate-400">{{ tab.label }}</p>
            <p class="mt-2 text-3xl font-black" [ngClass]="tab.className">{{ count(tab.value) }}</p>
          </button>
        }
      </div>

      <div class="filter-bar md:grid-cols-2 xl:grid-cols-[1.5fr_1fr_1fr_auto]">
        <div>
          <label class="field-label">{{ 'common.search' | t }}</label>
          <input
            class="input-shell"
            [(ngModel)]="keyword"
            [placeholder]="'manageViolations.searchPlaceholder' | t"
          />
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
          <button class="btn-secondary w-full" (click)="reset()">
            <app-icon name="refresh" [size]="17" /> {{ 'common.reset' | t }}
          </button>
        </div>
      </div>

      <article class="card-surface overflow-hidden">
        @if (loading()) {
          <div class="p-6"><div class="skeleton h-80 rounded-2xl"></div></div>
        } @else if (filtered().length === 0) {
          <div class="p-6">
            <app-data-state
              [title]="'common.noData' | t"
              [message]="'common.noData' | t"
              icon="shield"
            />
          </div>
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
                    <td>
                      <a
                        [routerLink]="['/app/admin/users', item.userId]"
                        class="font-black text-violet-700"
                        >User #{{ item.userId }}</a
                      >
                    </td>
                    <td>
                      <a
                        [routerLink]="['/app/bookings', item.bookingId]"
                        class="font-black text-indigo-700"
                        >#BK-{{ item.bookingId }}</a
                      >
                    </td>
                    <td>
                      {{ labelOf('violationType', item.violationType, languageStore.lang()) }}
                    </td>
                    <td>
                      <span
                        class="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-black text-rose-700"
                        >+{{ item.penaltyPointsAdded }}</span
                      >
                    </td>
                    <td>{{ item.loggedAt | date: 'HH:mm dd/MM/yyyy' }}</td>
                    <td><app-status-badge [value]="item.status" domain="violation" /></td>
                    <td>
                      @if (item.status === 'Active') {
                        <div class="flex gap-2">
                          <button
                            class="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700"
                            title="Resolve"
                            (click)="action(item, 'resolve')"
                          >
                            <app-icon name="check" [size]="16" />
                          </button>
                          <button
                            class="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-700"
                            title="Cancel"
                            (click)="action(item, 'cancel')"
                          >
                            <app-icon name="x" [size]="16" />
                          </button>
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

      <app-modal
        [open]="createOpen()"
        [title]="'manageViolations.createViolation' | t"
        [subtitle]="'manageViolations.subtitle' | t"
        (close)="createOpen.set(false)"
      >
        <form class="grid gap-4" (ngSubmit)="create()">
          <div>
            <label class="field-label">{{ 'nav.users' | t }} *</label>
            <select class="input-shell" required [(ngModel)]="form.userId" name="userId">
              <option [ngValue]="null">{{ 'common.all' | t }}</option>
              @for (user of users(); track user.userId) {
                <option [ngValue]="user.userId">{{ user.fullName }} · {{ user.email }}</option>
              }
            </select>
          </div>
          <div>
            <label class="field-label">Booking ID *</label
            ><input
              class="input-shell"
              type="number"
              min="1"
              required
              [(ngModel)]="form.bookingId"
              name="bookingId"
            />
          </div>
          <div>
            <label class="field-label">{{ 'manageViolations.violationType' | t }} *</label>
            <select class="input-shell" [(ngModel)]="form.violationType" name="violationType">
              @for (item of violationTypes(); track item.value) {
                <option [ngValue]="item.value">{{ item.label }}</option>
              }
            </select>
          </div>
          <div class="flex justify-end gap-2">
            <button type="button" class="btn-secondary" (click)="createOpen.set(false)">
              {{ 'common.cancel' | t }}
            </button>
            <button class="btn-primary" [disabled]="saving()">
              {{ saving() ? ('common.saving' | t) : ('manageViolations.createViolation' | t) }}
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
  protected readonly loading = signal(true)
  protected readonly saving = signal(false)
  protected readonly createOpen = signal(false)
  protected keyword = ''
  protected status = ''
  protected type = ''
  protected form = {
    userId: null as number | null,
    bookingId: null as number | null,
    violationType: 1,
  }
  protected readonly labelOf = labelOf

  protected readonly tabs = computed(() => [
    { value: '', label: this.languageStore.t('common.all'), className: 'text-slate-950' },
    {
      value: 'Active',
      label: this.languageStore.t('manageViolations.active'),
      className: 'text-rose-600',
    },
    {
      value: 'Resolved',
      label: this.languageStore.t('manageViolations.resolved'),
      className: 'text-emerald-600',
    },
    {
      value: 'Cancelled',
      label: this.languageStore.t('manageViolations.cancelled'),
      className: 'text-slate-500',
    },
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
      .filter(
        (x) =>
          (!this.status || x.status === this.status) &&
          (!this.type || x.violationType === this.type) &&
          (!n ||
            String(x.violationId).includes(n) ||
            String(x.userId).includes(n) ||
            String(x.bookingId).includes(n)),
      )
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
    this.createOpen.set(true)
    if (!this.users().length)
      this.api.users({ pageSize: 100 }).subscribe((x) => this.users.set(x.items))
  }

  protected create(): void {
    if (!this.form.userId || !this.form.bookingId) {
      this.toast.info('Hãy chọn người dùng và nhập Booking ID')
      return
    }
    this.saving.set(true)
    this.api
      .createViolation({
        userId: this.form.userId,
        bookingId: this.form.bookingId,
        violationType: this.form.violationType,
      })
      .subscribe({
        next: () => {
          this.saving.set(false)
          this.createOpen.set(false)
          this.toast.success('Đã tạo vi phạm')
          this.load()
        },
        error: () => {
          this.saving.set(false)
          this.toast.error('Không thể tạo vi phạm')
        },
      })
  }

  protected action(item: ViolationResponse, action: 'resolve' | 'cancel'): void {
    if (!confirm(`${action === 'resolve' ? 'Xử lý' : 'Hủy'} vi phạm #${item.violationId}?`)) return
    const req =
      action === 'resolve'
        ? this.api.resolveViolation(item.violationId)
        : this.api.cancelViolation(item.violationId)
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
