import { NgClass } from '@angular/common'
import { Component, OnInit, computed, inject, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import type { Observable } from 'rxjs'
import { SystemService } from '../../core/api/system.service'
import type { DepartmentResponse } from '../../core/api/system.models'
import { LanguageStore } from '../../core/i18n/language.store'
import { TranslatePipe } from '../../core/i18n/translate.pipe'
import { DataStateComponent } from '../../shared/ui/data-state'
import { IconComponent } from '../../shared/ui/icon'
import { ModalComponent } from '../../shared/ui/modal'
import { PageHeaderComponent } from '../../shared/ui/page-header'
import { StatusBadgeComponent } from '../../shared/ui/status-badge'
import { ToastService } from '../../shared/ui/toast.service'

@Component({
  selector: 'app-departments-page',
  imports: [NgClass, FormsModule, PageHeaderComponent, IconComponent, ModalComponent, StatusBadgeComponent, DataStateComponent, TranslatePipe],
  template: `
    <section class="space-y-6">
      <app-page-header [title]="'departments.title' | t" [subtitle]="'departments.subtitle' | t">
        <button class="btn-primary" type="button" (click)="openCreate()"><app-icon name="plus" [size]="17" /> {{ 'departments.addDepartment' | t }}</button>
      </app-page-header>

      <div class="grid gap-4 sm:grid-cols-3">
        <article class="kpi-card"><p class="text-xs font-bold text-slate-400">{{ 'departments.totalUnits' | t }}</p><p class="mt-3 text-3xl font-black text-slate-950">{{ departments().length }}</p></article>
        <article class="kpi-card"><p class="text-xs font-bold text-slate-400">{{ 'departments.active' | t }}</p><p class="mt-3 text-3xl font-black text-emerald-600">{{ activeCount() }}</p></article>
        <article class="kpi-card"><p class="text-xs font-bold text-slate-400">{{ 'departments.inactive' | t }}</p><p class="mt-3 text-3xl font-black text-slate-500">{{ departments().length - activeCount() }}</p></article>
      </div>

      <div class="filter-bar md:grid-cols-[2fr_1fr_auto]">
        <div>
          <label class="field-label">{{ 'common.search' | t }}</label>
          <div class="relative">
            <span class="pointer-events-none absolute left-4 top-3.5 text-slate-400"><app-icon name="search" [size]="18" /></span>
            <input class="input-shell pl-11" [(ngModel)]="keyword" [placeholder]="'departments.searchPlaceholder' | t" />
          </div>
        </div>
        <div>
          <label class="field-label">{{ 'common.status' | t }}</label>
          <select class="input-shell" [(ngModel)]="statusFilter">
            <option value="all">{{ 'common.all' | t }}</option>
            <option value="active">{{ 'departments.active' | t }}</option>
            <option value="inactive">{{ 'departments.inactive' | t }}</option>
          </select>
        </div>
        <div class="flex items-end">
          <button class="btn-secondary w-full" (click)="load()"><app-icon name="refresh" [size]="17" /> {{ 'common.reset' | t }}</button>
        </div>
      </div>

      @if (loading()) {
        <div class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">@for (item of [1,2,3,4,5,6]; track item) { <div class="skeleton h-52 rounded-[28px]"></div> }</div>
      } @else if (filtered().length === 0) {
        <app-data-state icon="building" [title]="'common.noData' | t" [message]="'common.noData' | t" />
      } @else {
        <div class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          @for (department of filtered(); track department.departmentId; let index = $index) {
            <article class="group card-surface overflow-hidden transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,.1)]">
              <div class="h-1.5 bg-gradient-to-r" [ngClass]="index % 3 === 0 ? 'from-violet-500 to-indigo-500' : index % 3 === 1 ? 'from-cyan-500 to-emerald-400' : 'from-amber-400 to-rose-400'"></div>
              <div class="p-6">
                <div class="flex items-start justify-between gap-3">
                  <span class="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-600"><app-icon name="building" [size]="22" /></span>
                  <app-status-badge [value]="department.status" domain="department" />
                </div>
                <h2 class="mt-5 text-lg font-black text-slate-950">{{ department.departmentName }}</h2>
                <p class="mt-2 min-h-12 text-sm leading-6 text-slate-500">{{ department.description || ('common.noData' | t) }}</p>
                <div class="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                  <span class="text-xs font-bold text-slate-400">#DEP-{{ department.departmentId }}</span>
                  <div class="flex gap-1">
                    <button class="rounded-xl p-2 text-slate-400 hover:bg-violet-50 hover:text-violet-600" title="Edit" (click)="openEdit(department)"><app-icon name="edit" [size]="17" /></button>
                    @if (isActive(department.status)) {
                      <button class="rounded-xl p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600" title="Deactivate" (click)="confirmToggle(department)"><app-icon name="pause" [size]="17" /></button>
                    } @else {
                      <button class="rounded-xl p-2 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600" title="Activate" (click)="confirmToggle(department)"><app-icon name="play" [size]="17" /></button>
                    }
                  </div>
                </div>
              </div>
            </article>
          }
        </div>
      }

      <app-modal [open]="formOpen()" [title]="editingId() ? ('common.edit' | t) : ('departments.addDepartment' | t)" [subtitle]="'departments.subtitle' | t" (close)="formOpen.set(false)">
        <form class="space-y-4" (ngSubmit)="save()">
          <div>
            <label class="field-label">{{ 'departments.title' | t }} *</label>
            <input class="input-shell" required maxlength="150" [(ngModel)]="form.departmentName" name="departmentName" placeholder="Faculty of Computer Science..." />
          </div>
          <div>
            <label class="field-label">Mô tả</label>
            <textarea class="textarea-shell" maxlength="500" [(ngModel)]="form.description" name="description" placeholder="Description..."></textarea>
            <p class="mt-2 text-right text-[11px] font-bold text-slate-400">{{ form.description.length }}/500</p>
          </div>
          <div class="flex justify-end gap-2">
            <button type="button" class="btn-secondary" (click)="formOpen.set(false)">{{ 'common.cancel' | t }}</button>
            <button class="btn-primary" [disabled]="saving() || !form.departmentName.trim()">{{ saving() ? ('common.saving' | t) : ('common.save' | t) }}</button>
          </div>
        </form>
      </app-modal>

      <app-modal [open]="toggleTarget() !== null" title="Status Change" [subtitle]="toggleText()" width="540px" (close)="toggleTarget.set(null)">
        <div class="flex justify-end gap-2">
          <button class="btn-secondary" (click)="toggleTarget.set(null)">{{ 'common.cancel' | t }}</button>
          <button class="btn-primary" [disabled]="saving()" (click)="toggleStatus()">{{ 'common.apply' | t }}</button>
        </div>
      </app-modal>
    </section>
  `,
})
export class DepartmentsPage implements OnInit {
  private readonly api = inject(SystemService)
  private readonly toast = inject(ToastService)
  protected readonly languageStore = inject(LanguageStore)
  protected readonly departments = signal<DepartmentResponse[]>([])
  protected readonly loading = signal(true)
  protected readonly saving = signal(false)
  protected readonly formOpen = signal(false)
  protected readonly editingId = signal<number | null>(null)
  protected readonly toggleTarget = signal<DepartmentResponse | null>(null)
  protected keyword = ''
  protected statusFilter = 'all'
  protected form = { departmentName: '', description: '' }
  protected readonly activeCount = computed(() => this.departments().filter((item) => this.isActive(item.status)).length)
  protected readonly filtered = computed(() => {
    const keyword = this.keyword.trim().toLowerCase()
    return this.departments().filter((item) => {
      const statusMatches = this.statusFilter === 'all' || (this.statusFilter === 'active' ? this.isActive(item.status) : !this.isActive(item.status))
      const keywordMatches = !keyword || `${item.departmentName} ${item.description ?? ''}`.toLowerCase().includes(keyword)
      return statusMatches && keywordMatches
    })
  })

  ngOnInit(): void {
    this.load()
  }

  protected isActive(status: string | number): boolean {
    return status === 1 || status === '1' || status === 'Active'
  }

  protected openCreate(): void {
    this.editingId.set(null)
    this.form = { departmentName: '', description: '' }
    this.formOpen.set(true)
  }

  protected openEdit(item: DepartmentResponse): void {
    this.editingId.set(item.departmentId)
    this.form = { departmentName: item.departmentName, description: item.description ?? '' }
    this.formOpen.set(true)
  }

  protected confirmToggle(item: DepartmentResponse): void {
    this.toggleTarget.set(item)
  }

  protected toggleText(): string {
    const item = this.toggleTarget()
    if (!item) return ''
    const isEn = this.languageStore.lang() === 'en'
    return this.isActive(item.status)
      ? (isEn ? `Deactivate unit "${item.departmentName}"?` : `Ngừng hoạt động đơn vị “${item.departmentName}”? Người dùng cũ vẫn giữ liên kết dữ liệu.`)
      : (isEn ? `Reactivate unit "${item.departmentName}"?` : `Kích hoạt lại đơn vị “${item.departmentName}”?`)
  }

  protected save(): void {
    if (!this.form.departmentName.trim()) return
    this.saving.set(true)
    const payload = { departmentName: this.form.departmentName.trim(), description: this.form.description.trim() || null }
    const request: Observable<unknown> = this.editingId() ? this.api.updateDepartment(this.editingId()!, payload) : this.api.createDepartment(payload)
    request.subscribe({
      next: () => {
        this.saving.set(false)
        this.formOpen.set(false)
        this.toast.success(this.editingId() ? 'Đã cập nhật đơn vị' : 'Đã tạo đơn vị mới')
        this.load(false)
      },
      error: () => {
        this.saving.set(false)
        this.toast.error('Không thể lưu khoa/phòng ban')
      },
    })
  }

  protected toggleStatus(): void {
    const item = this.toggleTarget()
    if (!item) return
    this.saving.set(true)
    const request: Observable<unknown> = this.isActive(item.status) ? this.api.deactivateDepartment(item.departmentId) : this.api.activateDepartment(item.departmentId)
    request.subscribe({
      next: () => {
        this.saving.set(false)
        this.toggleTarget.set(null)
        this.toast.success('Đã cập nhật trạng thái đơn vị')
        this.load(false)
      },
      error: () => {
        this.saving.set(false)
        this.toast.error('Không thể đổi trạng thái đơn vị')
      },
    })
  }

  protected load(showLoading = true): void {
    if (showLoading) this.loading.set(true)
    this.api.departments(false).subscribe({
      next: (items) => {
        this.departments.set(items)
        this.loading.set(false)
      },
      error: () => {
        this.loading.set(false)
        this.toast.error('Không tải được khoa/phòng ban')
      },
    })
  }
}
