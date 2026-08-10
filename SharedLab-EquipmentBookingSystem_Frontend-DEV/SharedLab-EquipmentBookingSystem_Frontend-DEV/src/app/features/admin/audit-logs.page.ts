import { DatePipe, NgClass } from '@angular/common'
import { Component, OnInit, inject, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { SystemService } from '../../core/api/system.service'
import type { AuditLogResponse, UserManagementResponse } from '../../core/api/system.models'
import { LanguageStore } from '../../core/i18n/language.store'
import { TranslatePipe } from '../../core/i18n/translate.pipe'
import { DataStateComponent } from '../../shared/ui/data-state'
import { IconComponent } from '../../shared/ui/icon'
import { ModalComponent } from '../../shared/ui/modal'
import { PageHeaderComponent } from '../../shared/ui/page-header'
import { ToastService } from '../../shared/ui/toast.service'
import { getFirstDayOfMonth, getLastDayOfMonth } from '../../shared/utils/presentation'

@Component({
  selector: 'app-audit-logs-page',
  standalone: true,
  imports: [
    DatePipe,
    NgClass,
    FormsModule,
    PageHeaderComponent,
    IconComponent,
    ModalComponent,
    DataStateComponent,
    TranslatePipe,
  ],
  template: `
    <section class="space-y-6">
      <app-page-header [title]="'auditLogs.title' | t" [subtitle]="'auditLogs.subtitle' | t">
        <button class="btn-secondary" type="button" (click)="resetFilters()">
          <app-icon name="refresh" [size]="17" /> {{ 'common.reset' | t }}
        </button>
      </app-page-header>

      <!-- KPI Stat Cards (Interactive & Clickable Filters) -->
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <!-- Total Records KPI Card -->
        <article
          class="kpi-card group cursor-pointer border border-transparent transition-all duration-200 hover:-translate-y-1 hover:border-slate-200 hover:shadow-lg hover:shadow-slate-200/50 active:translate-y-0"
          (click)="resetFilters()"
          title="Click to reset all filters"
        >
          <div class="flex items-center justify-between">
            <p class="text-xs font-bold text-slate-400">{{ 'auditLogs.kpi.totalRecords' | t }}</p>
            <div
              class="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition duration-200 group-hover:bg-slate-900 group-hover:text-white"
            >
              <app-icon name="history" [size]="18" />
            </div>
          </div>
          <div class="mt-3 flex items-baseline justify-between">
            <p class="text-3xl font-black text-slate-950">{{ totalCount() }}</p>
            <span
              class="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600 transition group-hover:bg-slate-900 group-hover:text-white"
            >
              Reset
            </span>
          </div>
        </article>

        <!-- Current Page KPI Card -->
        <article
          class="kpi-card group cursor-pointer border border-transparent transition-all duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-100 active:translate-y-0"
          (click)="scrollToTable()"
          title="Click to view current page records"
        >
          <div class="flex items-center justify-between">
            <p class="text-xs font-bold text-slate-400">{{ 'auditLogs.kpi.currentPage' | t }}</p>
            <div
              class="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition duration-200 group-hover:bg-indigo-600 group-hover:text-white"
            >
              <app-icon name="list" [size]="18" />
            </div>
          </div>
          <div class="mt-3 flex items-baseline justify-between">
            <p class="text-3xl font-black text-indigo-600">{{ logs().length }}</p>
            <span
              class="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700 transition group-hover:bg-indigo-600 group-hover:text-white"
            >
              Page {{ page() }} / {{ totalPages() || 1 }}
            </span>
          </div>
        </article>

        <!-- Change Actions KPI Card -->
        <article
          class="kpi-card group cursor-pointer border transition-all duration-200 hover:-translate-y-1 hover:border-amber-300 hover:shadow-lg hover:shadow-amber-100 active:translate-y-0"
          [ngClass]="
            ['Create', 'Update', 'Delete'].includes(actionType || '')
              ? 'border-amber-400 bg-amber-50/50 shadow-md shadow-amber-100'
              : 'border-transparent'
          "
          (click)="filterChangeActions()"
          title="Click to filter mutation actions (Create / Update / Delete)"
        >
          <div class="flex items-center justify-between">
            <p class="text-xs font-bold text-slate-400">{{ 'auditLogs.kpi.changeActions' | t }}</p>
            <div
              class="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 transition duration-200 group-hover:bg-amber-600 group-hover:text-white"
            >
              <app-icon name="edit" [size]="18" />
            </div>
          </div>
          <div class="mt-3 flex items-baseline justify-between">
            <p class="text-3xl font-black text-amber-600">{{ changeCount() }}</p>
            <span
              class="rounded-full bg-amber-100/80 px-2.5 py-0.5 text-[10px] font-bold text-amber-800 transition group-hover:bg-amber-600 group-hover:text-white"
            >
              {{ actionType ? actionType : 'Filter' }}
            </span>
          </div>
        </article>

        <!-- Active Users KPI Card -->
        <article
          class="kpi-card group cursor-pointer border border-transparent transition-all duration-200 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-100 active:translate-y-0"
          (click)="focusUserFilter()"
          title="Click to filter by operator user"
        >
          <div class="flex items-center justify-between">
            <p class="text-xs font-bold text-slate-400">{{ 'auditLogs.kpi.activeUsers' | t }}</p>
            <div
              class="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition duration-200 group-hover:bg-emerald-600 group-hover:text-white"
            >
              <app-icon name="users" [size]="18" />
            </div>
          </div>
          <div class="mt-3 flex items-baseline justify-between">
            <p class="text-3xl font-black text-emerald-600">{{ uniqueUsers() }}</p>
            <span
              class="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 transition group-hover:bg-emerald-600 group-hover:text-white"
            >
              Select User
            </span>
          </div>
        </article>
      </div>

      <!-- Filter Controls Toolbar -->
      <div class="filter-bar grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-7">
        <div>
          <label class="field-label">{{ 'auditLogs.filters.user' | t }}</label>
          <select
            id="user-filter-select"
            class="input-shell"
            [(ngModel)]="userId"
            (ngModelChange)="onFilterChange()"
          >
            <option [ngValue]="null">{{ 'common.all' | t }}</option>
            @for (user of users(); track user.userId) {
              <option [ngValue]="user.userId">{{ user.fullName }}</option>
            }
          </select>
        </div>
        <div>
          <label class="field-label">{{ 'auditLogs.filters.actionType' | t }}</label>
          <select class="input-shell" [(ngModel)]="actionType" (ngModelChange)="onFilterChange()">
            <option [ngValue]="null">{{ 'common.all' | t }}</option>
            @for (action of actions; track action.value) {
              <option [ngValue]="action.value">{{ action.key | t }}</option>
            }
          </select>
        </div>
        <div>
          <label class="field-label">{{ 'auditLogs.filters.entity' | t }}</label>
          <input
            class="input-shell"
            [(ngModel)]="entityName"
            (ngModelChange)="onFilterChange()"
            [placeholder]="'auditLogs.filters.entityPlaceholder' | t"
          />
        </div>
        <div>
          <label class="field-label">{{ 'auditLogs.filters.entityId' | t }}</label>
          <input
            class="input-shell"
            type="number"
            min="1"
            [(ngModel)]="entityId"
            (ngModelChange)="onFilterChange()"
          />
        </div>
        <div>
          <label class="field-label">{{ 'auditLogs.filters.fromDate' | t }}</label>
          <input
            class="input-shell"
            type="date"
            [max]="to || null"
            [(ngModel)]="from"
            (ngModelChange)="onFromChange()"
          />
        </div>
        <div>
          <label class="field-label">{{ 'auditLogs.filters.toDate' | t }}</label>
          <input
            class="input-shell"
            type="date"
            [min]="from || null"
            [(ngModel)]="to"
            (ngModelChange)="onToChange()"
          />
        </div>
        <div>
          <label class="field-label">{{ 'auditLogs.filters.pageSize' | t }}</label>
          <select class="input-shell" [(ngModel)]="pageSize" (ngModelChange)="onFilterChange()">
            <option [ngValue]="10">10</option>
            <option [ngValue]="20">20</option>
            <option [ngValue]="50">50</option>
          </select>
        </div>
      </div>

      <!-- Main Logs Table Section -->
      @if (loading()) {
        <div class="card-surface p-5">
          <div class="space-y-3">
            @for (item of [1, 2, 3, 4, 5, 6, 7]; track item) {
              <div class="skeleton h-14 rounded-2xl"></div>
            }
          </div>
        </div>
      } @else if (logs().length === 0) {
        <app-data-state
          icon="history"
          [title]="'auditLogs.empty.title' | t"
          [message]="'auditLogs.empty.message' | t"
        />
      } @else {
        <article id="audit-log-table" class="card-surface overflow-hidden">
          <div class="overflow-x-auto">
            <table class="table-shell">
              <thead>
                <tr>
                  <th>{{ 'auditLogs.table.time' | t }}</th>
                  <th>{{ 'auditLogs.table.user' | t }}</th>
                  <th>{{ 'auditLogs.table.action' | t }}</th>
                  <th>{{ 'auditLogs.table.entity' | t }}</th>
                  <th>{{ 'auditLogs.table.ip' | t }}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                @for (log of logs(); track log.auditLogId) {
                  <tr>
                    <td>
                      <p class="font-black text-slate-800">
                        {{ log.createdAt | date: 'dd/MM/yyyy' }}
                      </p>
                      <p class="mt-1 text-xs text-slate-400">
                        {{ log.createdAt | date: 'HH:mm:ss' }}
                      </p>
                    </td>
                    <td>
                      <p class="font-black text-slate-800">
                        {{ log.userName || 'User #' + log.userId }}
                      </p>
                      <p class="mt-1 text-xs text-slate-400">ID {{ log.userId }}</p>
                    </td>
                    <td>
                      <span
                        class="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-black"
                        [ngClass]="actionClass(log.actionType)"
                      >
                        <app-icon [name]="actionIcon(log.actionType)" [size]="14" />
                        {{ actionLabel(log.actionType) }}
                      </span>
                    </td>
                    <td>
                      <p class="font-black text-slate-800">{{ log.entityName }}</p>
                      <p class="mt-1 text-xs text-slate-400">#{{ log.entityId }}</p>
                    </td>
                    <td class="font-mono text-xs">{{ log.ipAddress || '—' }}</td>
                    <td class="text-right">
                      <button
                        class="rounded-xl border border-slate-200 px-3 py-2 text-xs font-black text-violet-600 hover:border-violet-200 hover:bg-violet-50"
                        (click)="openDetail(log)"
                      >
                        {{ 'auditLogs.table.viewChanges' | t }}
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </article>
      }

      @if (totalPages() > 1) {
        <div
          class="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-3 shadow-sm"
        >
          <p class="px-2 text-xs font-bold text-slate-400">
            {{ 'auditLogs.pagination.page' | t }} {{ page() }} · {{ totalCount() }}
            {{ 'auditLogs.pagination.records' | t }}
          </p>
          <div class="flex gap-2">
            <button class="btn-secondary" [disabled]="page() <= 1" (click)="goPage(page() - 1)">
              <app-icon name="chevron-left" [size]="16" /> {{ 'common.prev' | t }}
            </button>
            <button
              class="btn-secondary"
              [disabled]="page() >= totalPages()"
              (click)="goPage(page() + 1)"
            >
              {{ 'common.next' | t }} <app-icon name="chevron-right" [size]="16" />
            </button>
          </div>
        </div>
      }

      <app-modal
        [open]="selected() !== null"
        [title]="'auditLogs.modal.title' | t"
        [subtitle]="selectedSubtitle()"
        width="980px"
        (close)="selected.set(null)"
      >
        @if (selected(); as log) {
          <div class="space-y-5">
            <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div class="rounded-2xl bg-slate-50 p-4">
                <p class="text-[10px] font-bold tracking-[.15em] text-slate-400 uppercase">
                  {{ 'auditLogs.modal.auditId' | t }}
                </p>
                <p class="mt-2 font-black text-slate-800">#{{ log.auditLogId }}</p>
              </div>
              <div class="rounded-2xl bg-slate-50 p-4">
                <p class="text-[10px] font-bold tracking-[.15em] text-slate-400 uppercase">
                  {{ 'auditLogs.modal.action' | t }}
                </p>
                <p class="mt-2 font-black text-slate-800">{{ actionLabel(log.actionType) }}</p>
              </div>
              <div class="rounded-2xl bg-slate-50 p-4">
                <p class="text-[10px] font-bold tracking-[.15em] text-slate-400 uppercase">
                  {{ 'auditLogs.modal.entity' | t }}
                </p>
                <p class="mt-2 font-black text-slate-800">
                  {{ log.entityName }} #{{ log.entityId }}
                </p>
              </div>
              <div class="rounded-2xl bg-slate-50 p-4">
                <p class="text-[10px] font-bold tracking-[.15em] text-slate-400 uppercase">
                  {{ 'auditLogs.modal.ip' | t }}
                </p>
                <p class="mt-2 font-mono text-sm font-black text-slate-800">
                  {{ log.ipAddress || '—' }}
                </p>
              </div>
            </div>
            <div class="grid gap-5 lg:grid-cols-2">
              <article class="overflow-hidden rounded-[24px] border border-rose-100">
                <header class="flex items-center justify-between bg-rose-50 px-5 py-4">
                  <h3 class="font-black text-rose-900">{{ 'auditLogs.modal.oldValue' | t }}</h3>
                  <span
                    class="rounded-full bg-white px-2.5 py-1 text-[10px] font-black text-rose-600"
                    >OLD</span
                  >
                </header>
                <pre
                  class="max-h-[420px] overflow-auto bg-slate-950 p-5 text-xs leading-6 break-words whitespace-pre-wrap text-rose-100"
                  >{{ pretty(log.oldValue) }}</pre>
              </article>
              <article class="overflow-hidden rounded-[24px] border border-emerald-100">
                <header class="flex items-center justify-between bg-emerald-50 px-5 py-4">
                  <h3 class="font-black text-emerald-900">{{ 'auditLogs.modal.newValue' | t }}</h3>
                  <span
                    class="rounded-full bg-white px-2.5 py-1 text-[10px] font-black text-emerald-600"
                    >NEW</span
                  >
                </header>
                <pre
                  class="max-h-[420px] overflow-auto bg-slate-950 p-5 text-xs leading-6 break-words whitespace-pre-wrap text-emerald-100"
                  >{{ pretty(log.newValue) }}</pre>
              </article>
            </div>
          </div>
        }
      </app-modal>
    </section>
  `,
})
export class AuditLogsPage implements OnInit {
  private readonly api = inject(SystemService)
  private readonly toast = inject(ToastService)
  private readonly languageStore = inject(LanguageStore)

  protected readonly logs = signal<AuditLogResponse[]>([])
  protected readonly users = signal<UserManagementResponse[]>([])
  protected readonly selected = signal<AuditLogResponse | null>(null)
  protected readonly loading = signal(true)
  protected readonly page = signal(1)
  protected readonly totalPages = signal(0)
  protected readonly totalCount = signal(0)
  protected userId: number | null = null
  protected actionType: string | null = null
  protected entityName = ''
  protected entityId: number | null = null
  protected from = ''
  protected to = ''
  protected pageSize = 20
  protected readonly actions = [
    { value: 'Create', key: 'auditLogs.actions.Create' },
    { value: 'Update', key: 'auditLogs.actions.Update' },
    { value: 'Delete', key: 'auditLogs.actions.Delete' },
    { value: 'Login', key: 'auditLogs.actions.Login' },
    { value: 'Logout', key: 'auditLogs.actions.Logout' },
    { value: 'ApproveBooking', key: 'auditLogs.actions.ApproveBooking' },
    { value: 'RejectBooking', key: 'auditLogs.actions.RejectBooking' },
    { value: 'CheckIn', key: 'auditLogs.actions.CheckIn' },
    { value: 'CheckOut', key: 'auditLogs.actions.CheckOut' },
  ]

  ngOnInit(): void {
    this.from = getFirstDayOfMonth()
    this.to = getLastDayOfMonth()
    this.api
      .users({ pageNumber: 1, pageSize: 15 })
      .subscribe({ next: (response) => this.users.set(response.items) })
    this.load()
  }

  protected changeCount(): number {
    return this.logs().filter((log) => ['Create', 'Update', 'Delete'].includes(log.actionType))
      .length
  }

  protected uniqueUsers(): number {
    return new Set(this.logs().map((log) => log.userId)).size
  }

  protected filterChangeActions(): void {
    if (this.actionType === 'Update') {
      this.actionType = 'Create'
    } else if (this.actionType === 'Create') {
      this.actionType = 'Delete'
    } else if (this.actionType === 'Delete') {
      this.actionType = null
    } else {
      this.actionType = 'Update'
    }
    this.onFilterChange()
  }

  protected focusUserFilter(): void {
    const el = document.getElementById('user-filter-select')
    if (el) {
      el.focus()
      ;(el as HTMLSelectElement).click?.()
    }
  }

  protected scrollToTable(): void {
    const el = document.getElementById('audit-log-table')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  protected onFromChange(): void {
    if (this.from && this.to && this.from > this.to) {
      this.to = this.from
    }
    this.onFilterChange()
  }

  protected onToChange(): void {
    if (this.from && this.to && this.to < this.from) {
      this.from = this.to
    }
    this.onFilterChange()
  }

  protected onFilterChange(): void {
    this.page.set(1)
    this.load()
  }

  protected resetFilters(): void {
    this.userId = null
    this.actionType = null
    this.entityName = ''
    this.entityId = null
    this.from = getFirstDayOfMonth()
    this.to = getLastDayOfMonth()
    this.page.set(1)
    this.load()
  }

  protected goPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return
    this.page.set(page)
    this.load()
  }

  protected openDetail(log: AuditLogResponse): void {
    this.api.auditLog(log.auditLogId).subscribe({
      next: (item) => this.selected.set(item),
      error: () => this.toast.error(this.languageStore.t('auditLogs.toast.detailError')),
    })
  }

  protected selectedSubtitle(): string {
    const log = this.selected()
    return log
      ? `${log.userName || `User #${log.userId}`} · ${new Date(log.createdAt).toLocaleString(this.languageStore.lang() === 'vi' ? 'vi-VN' : 'en-US')}`
      : ''
  }

  protected pretty(value: string | null): string {
    if (!value) return this.languageStore.t('auditLogs.modal.noData')
    try {
      return JSON.stringify(JSON.parse(value), null, 2)
    } catch {
      return value
    }
  }

  protected actionLabel(action: string): string {
    const translated = this.languageStore.t('auditLogs.actions.' + action)
    return translated !== 'auditLogs.actions.' + action ? translated : action
  }

  protected actionIcon(action: string): string {
    if (action === 'Create') return 'plus'
    if (action === 'Update') return 'edit'
    if (action === 'Delete') return 'trash'
    if (action === 'Login') return 'login'
    if (action === 'Logout') return 'logout'
    if (action === 'ApproveBooking') return 'check'
    if (action === 'RejectBooking') return 'x'
    if (action === 'CheckIn') return 'login'
    if (action === 'CheckOut') return 'logout'
    return 'history'
  }

  protected actionClass(action: string): string {
    if (['Create', 'ApproveBooking', 'CheckIn'].includes(action))
      return 'border-emerald-200 bg-emerald-50 text-emerald-700'
    if (['Delete', 'RejectBooking'].includes(action))
      return 'border-rose-200 bg-rose-50 text-rose-700'
    if (action === 'Update') return 'border-amber-200 bg-amber-50 text-amber-700'
    return 'border-indigo-200 bg-indigo-50 text-indigo-700'
  }

  private load(): void {
    if (this.from && this.to && this.from > this.to) {
      this.to = this.from
    }
    this.loading.set(true)
    this.api
      .auditLogs({
        userId: this.userId ?? undefined,
        actionType: this.actionType ?? undefined,
        entityName: this.entityName.trim() || undefined,
        entityId: this.entityId ?? undefined,
        from: this.from ? new Date(`${this.from}T00:00:00`).toISOString() : undefined,
        to: this.to ? new Date(`${this.to}T23:59:59`).toISOString() : undefined,
        pageNumber: this.page(),
        pageSize: this.pageSize,
      })
      .subscribe({
        next: (response) => {
          this.logs.set(response.items)
          this.totalPages.set(response.totalPages)
          this.totalCount.set(response.totalCount)
          this.loading.set(false)
        },
        error: () => {
          this.loading.set(false)
          this.toast.error(this.languageStore.t('auditLogs.toast.loadError'))
        },
      })
  }
}
