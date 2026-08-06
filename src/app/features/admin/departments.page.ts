import { NgClass } from '@angular/common'
import { Component, OnInit, computed, inject, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import type { Observable } from 'rxjs'
import { SystemService } from '../../core/api/system.service'
import type { DepartmentResponse, UserManagementResponse } from '../../core/api/system.models'
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

      <!-- KPI Summary Cards -->
      <div class="grid gap-4 sm:grid-cols-3">
        <article class="kpi-card">
          <p class="text-xs font-bold text-slate-400">{{ 'departments.totalUnits' | t }}</p>
          <p class="mt-3 text-3xl font-black text-slate-950">{{ departments().length }}</p>
        </article>
        <article class="kpi-card">
          <p class="text-xs font-bold text-slate-400">{{ 'departments.active' | t }}</p>
          <p class="mt-3 text-3xl font-black text-emerald-600">{{ activeCount() }}</p>
        </article>
        <article class="kpi-card">
          <p class="text-xs font-bold text-slate-400">{{ 'departments.inactive' | t }}</p>
          <p class="mt-3 text-3xl font-black text-slate-500">{{ departments().length - activeCount() }}</p>
        </article>
      </div>

      <!-- Filter Bar -->
      <div class="filter-bar md:grid-cols-2 xl:grid-cols-[2fr_1fr_1fr_auto]">
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
        <div>
          <label class="field-label">{{ 'labs.viewMode' | t }}</label>
          <div class="flex h-12 rounded-2xl bg-slate-100 p-1">
            <button type="button" class="flex-1 h-full inline-flex items-center justify-center rounded-xl text-xs font-black transition-all duration-150" [ngClass]="view() === 'grid' ? 'bg-white text-cyan-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'" (click)="view.set('grid')"><app-icon name="grid" [size]="17" /></button>
            <button type="button" class="flex-1 h-full inline-flex items-center justify-center rounded-xl text-xs font-black transition-all duration-150" [ngClass]="view() === 'table' ? 'bg-white text-cyan-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'" (click)="view.set('table')"><app-icon name="list" [size]="17" /></button>
          </div>
        </div>
        <div class="flex items-end">
          <button type="button" class="btn-secondary w-full" (click)="load()"><app-icon name="refresh" [size]="17" /> {{ 'common.reset' | t }}</button>
        </div>
      </div>

      <!-- Data List -->
      @if (loading()) {
        <div class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">@for (item of [1,2,3,4,5,6]; track item) { <div class="skeleton h-52 rounded-[28px]"></div> }</div>
      } @else if (filtered().length === 0) {
        <app-data-state icon="building" [title]="'common.noData' | t" [message]="'common.noData' | t" />
      } @else if (view() === 'grid') {
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
                  <div class="flex items-center gap-1">
                    <button type="button" class="rounded-xl p-2 text-slate-400 hover:bg-violet-50 hover:text-violet-600" title="Chi tiết thành viên" (click)="openDetail(department)"><app-icon name="users" [size]="17" /></button>
                    <button type="button" class="rounded-xl p-2 text-slate-400 hover:bg-violet-50 hover:text-violet-600" title="Chỉnh sửa" (click)="openEdit(department)"><app-icon name="edit" [size]="17" /></button>
                    @if (isActive(department.status)) {
                      <button type="button" class="rounded-xl p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600" title="Ngừng hoạt động" (click)="confirmToggle(department)"><app-icon name="pause" [size]="17" /></button>
                    } @else {
                      <button type="button" class="rounded-xl p-2 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600" title="Kích hoạt lại" (click)="confirmToggle(department)"><app-icon name="play" [size]="17" /></button>
                    }
                    <button type="button" class="rounded-xl p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600" title="Xóa đơn vị" (click)="confirmDelete(department)"><app-icon name="trash" [size]="17" /></button>
                  </div>
                </div>
              </div>
            </article>
          }
        </div>
      } @else {
        <div class="card-surface overflow-x-auto">
          <table class="table-shell">
            <thead>
              <tr>
                <th>Mã đơn vị</th>
                <th>Tên khoa / phòng ban</th>
                <th>Mô tả</th>
                <th>Trạng thái</th>
                <th class="text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              @for (department of filtered(); track department.departmentId) {
                <tr>
                  <td><span class="font-bold text-slate-600">#DEP-{{ department.departmentId }}</span></td>
                  <td><p class="font-black text-slate-900">{{ department.departmentName }}</p></td>
                  <td><p class="max-w-md truncate text-xs text-slate-500">{{ department.description || '—' }}</p></td>
                  <td><app-status-badge [value]="department.status" domain="department" /></td>
                  <td class="text-right">
                    <div class="flex items-center justify-end gap-1.5">
                      <button type="button" class="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50" title="Chi tiết thành viên" (click)="openDetail(department)"><app-icon name="users" [size]="16" /></button>
                      <button type="button" class="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50" title="Chỉnh sửa" (click)="openEdit(department)"><app-icon name="edit" [size]="16" /></button>
                      @if (isActive(department.status)) {
                        <button type="button" class="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100" title="Ngừng hoạt động" (click)="confirmToggle(department)"><app-icon name="pause" [size]="16" /></button>
                      } @else {
                        <button type="button" class="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100" title="Kích hoạt lại" (click)="confirmToggle(department)"><app-icon name="play" [size]="16" /></button>
                      }
                      <button type="button" class="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100" title="Xóa đơn vị" (click)="confirmDelete(department)"><app-icon name="trash" [size]="16" /></button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      <!-- Modal Tạo / Chỉnh sửa -->
      <app-modal [open]="formOpen()" [title]="editingId() ? ('common.edit' | t) : ('departments.addDepartment' | t)" [subtitle]="'departments.subtitle' | t" (close)="formOpen.set(false)">
        <form class="space-y-4" (ngSubmit)="save()">
          <div>
            <label class="field-label">{{ 'departments.title' | t }} *</label>
            <input class="input-shell" required maxlength="150" [(ngModel)]="form.departmentName" name="departmentName" placeholder="Ví dụ: Khoa Công nghệ thông tin..." />
          </div>
          <div>
            <label class="field-label">Mô tả</label>
            <textarea class="textarea-shell" maxlength="500" [(ngModel)]="form.description" name="description" placeholder="Mô tả chức năng, nhiệm vụ của khoa/phòng ban..."></textarea>
            <p class="mt-2 text-right text-[11px] font-bold text-slate-400">{{ form.description.length }}/500</p>
          </div>
          <div class="flex justify-between gap-2">
            @if (editingId()) {
              <button type="button" class="btn-secondary btn-danger" (click)="confirmDeleteById(editingId()!)"><app-icon name="trash" [size]="16" /> Xóa đơn vị</button>
            } @else { <div></div> }
            <div class="flex gap-2">
              <button type="button" class="btn-secondary" (click)="formOpen.set(false)">{{ 'common.cancel' | t }}</button>
              <button class="btn-primary" [disabled]="saving() || !form.departmentName.trim()">{{ saving() ? ('common.saving' | t) : ('common.save' | t) }}</button>
            </div>
          </div>
        </form>
      </app-modal>

      <!-- Modal Đổi trạng thái (Bật/Tắt) -->
      <app-modal [open]="toggleTarget() !== null" title="Đổi trạng thái đơn vị" [subtitle]="toggleText()" width="540px" (close)="toggleTarget.set(null)">
        <div class="flex justify-end gap-2 pt-4">
          <button type="button" class="btn-secondary" (click)="toggleTarget.set(null)">{{ 'common.cancel' | t }}</button>
          <button type="button" class="btn-primary" [disabled]="saving()" (click)="toggleStatus()">{{ 'common.apply' | t }}</button>
        </div>
      </app-modal>

      <!-- Modal Chi tiết Thành viên trong Khoa/Phòng ban -->
      <app-modal [open]="detailOpen()" [title]="'Thành viên: ' + detailDepartment()?.departmentName" subtitle="Danh sách người dùng thuộc khoa / phòng ban này." (close)="detailOpen.set(false)">
        @if (membersLoading()) {
          <div class="space-y-3 p-3"><div class="skeleton h-12 rounded-xl"></div><div class="skeleton h-12 rounded-xl"></div></div>
        } @else if (members().length === 0) {
          <app-data-state icon="users" title="Chưa có thành viên" message="Khoa/phòng ban này hiện chưa có tài khoản người dùng nào." />
        } @else {
          <div class="max-h-96 overflow-y-auto divide-y divide-slate-100 rounded-2xl border border-slate-100 bg-white">
            @for (user of members(); track user.userId) {
              <div class="flex items-center justify-between gap-3 p-4">
                <div>
                  <p class="font-black text-slate-900">{{ user.fullName }}</p>
                  <p class="mt-1 text-xs text-slate-400">{{ user.email }} · {{ user.roleName }}</p>
                </div>
                <app-status-badge [value]="user.status" domain="user" />
              </div>
            }
          </div>
        }
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
  protected readonly view = signal<'grid' | 'table'>('grid')
  protected readonly detailOpen = signal(false)
  protected readonly detailDepartment = signal<DepartmentResponse | null>(null)
  protected readonly members = signal<UserManagementResponse[]>([])
  protected readonly membersLoading = signal(false)

  protected keyword = ''
  protected statusFilter = 'all'
  protected form = { departmentName: '', description: '' }
  protected readonly activeCount = computed(() => this.departments().filter((item) => this.isActive(item.status)).length)
  protected readonly filtered = computed(() => {
    const keyword = this.keyword.trim().toLowerCase()
    return this.departments().filter((item) => {
      const statusMatches = this.statusFilter === 'all' || (this.statusFilter === 'active' ? this.isActive(item.status) : !this.isActive(item.status))
      const keywordMatches = !keyword || `${item.departmentName} ${item.description ?? ''} #dep-${item.departmentId}`.toLowerCase().includes(keyword)
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

  protected openDetail(item: DepartmentResponse): void {
    this.detailDepartment.set(item)
    this.membersLoading.set(true)
    this.detailOpen.set(true)
    this.api.users({ departmentId: item.departmentId, pageSize: 100 }).subscribe({
      next: (res) => { this.members.set(res.items); this.membersLoading.set(false) },
      error: () => { this.membersLoading.set(false); this.toast.error('Không tải được danh sách thành viên') }
    })
  }

  protected confirmToggle(item: DepartmentResponse): void {
    this.toggleTarget.set(item)
  }

  protected confirmDelete(item: DepartmentResponse): void {
    if (!confirm(`Xác nhận xóa / ngừng sử dụng khoa/phòng ban "${item.departmentName}"?`)) return
    this.saving.set(true)
    this.api.deactivateDepartment(item.departmentId).subscribe({
      next: () => {
        this.saving.set(false)
        this.toast.success('Đã ngừng hoạt động đơn vị')
        this.load(false)
      },
      error: () => {
        this.saving.set(false)
        this.toast.error('Không thể xóa đơn vị')
      }
    })
  }

  protected confirmDeleteById(id: number): void {
    const item = this.departments().find((d) => d.departmentId === id)
    if (item) {
      this.formOpen.set(false)
      this.confirmDelete(item)
    }
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
