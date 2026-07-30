import { NgClass } from '@angular/common'
import { Component, OnInit, inject, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { RouterLink } from '@angular/router'
import { SystemService } from '../../core/api/system.service'
import type { LabRoomResponse, UserManagementResponse } from '../../core/api/system.models'
import { AuthStore } from '../../core/auth/auth.store'
import { TranslatePipe } from '../../core/i18n/translate.pipe'
import { DataStateComponent } from '../../shared/ui/data-state'
import { IconComponent } from '../../shared/ui/icon'
import { ModalComponent } from '../../shared/ui/modal'
import { PageHeaderComponent } from '../../shared/ui/page-header'
import { StatusBadgeComponent } from '../../shared/ui/status-badge'
import { ToastService } from '../../shared/ui/toast.service'

interface LabForm {
  labName: string
  roomCode: string
  location: string
  capacity: number
  description: string
  imageUrl: string
  usageGuideline: string
  managerId: number | null
}

@Component({
  selector: 'app-labs-page',
  imports: [NgClass, FormsModule, RouterLink, PageHeaderComponent, IconComponent, ModalComponent, StatusBadgeComponent, DataStateComponent, TranslatePipe],
  template: `
    <section class="space-y-6">
      <app-page-header [title]="'labs.title' | t" [subtitle]="'labs.subtitle' | t">
        <a routerLink="/app/calendar" class="btn-secondary"><app-icon name="calendar" [size]="17" /> {{ 'header.viewCalendar' | t }}</a>
        @if (store.isAdmin()) { <button type="button" class="btn-primary" (click)="openCreate()"><app-icon name="plus" [size]="17" /> {{ 'labs.addLab' | t }}</button> }
      </app-page-header>

      <div class="filter-bar md:grid-cols-2 xl:grid-cols-[2fr_1fr_1fr_1fr_auto]">
        <div><label class="field-label">{{ 'common.search' | t }}</label><div class="relative"><span class="pointer-events-none absolute left-4 top-3.5 text-slate-400"><app-icon name="search" [size]="18" /></span><input class="input-shell pl-11" [(ngModel)]="keyword" (keyup.enter)="load()" placeholder="{{ 'labs.searchPlaceholder' | t }}" /></div></div>
        <div><label class="field-label">{{ 'common.status' | t }}</label><select class="input-shell" [(ngModel)]="status"><option value="">{{ 'common.all' | t }}</option><option [value]="1">{{ 'labs.available' | t }}</option><option [value]="2">{{ 'labs.maintenance' | t }}</option><option [value]="3">{{ 'labs.maintenance' | t }}</option><option [value]="4">{{ 'common.all' | t }}</option></select></div>
        <div><label class="field-label">{{ 'labs.minCapacity' | t }}</label><input class="input-shell" type="number" min="1" [(ngModel)]="minimumCapacity" /></div>
        <div><label class="field-label">{{ 'labs.viewMode' | t }}</label><div class="flex h-12 rounded-2xl bg-slate-100 p-1"><button class="flex-1 rounded-xl text-xs font-black" [ngClass]="view() === 'grid' ? 'bg-white text-cyan-700 shadow-sm' : 'text-slate-400'" (click)="view.set('grid')"><app-icon name="grid" [size]="17" /></button><button class="flex-1 rounded-xl text-xs font-black" [ngClass]="view() === 'table' ? 'bg-white text-cyan-700 shadow-sm' : 'text-slate-400'" (click)="view.set('table')"><app-icon name="list" [size]="17" /></button></div></div>
        <div class="flex items-end"><button class="btn-primary w-full" type="button" (click)="load()"><app-icon name="filter" [size]="17" /> {{ 'common.apply' | t }}</button></div>
      </div>

      @if (loading()) {
        <div class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">@for (i of [1,2,3,4,5,6]; track i) { <div class="card-surface overflow-hidden"><div class="skeleton h-40"></div><div class="p-5"><div class="skeleton h-5 w-2/3 rounded"></div><div class="skeleton mt-3 h-4 rounded"></div><div class="skeleton mt-5 h-10 rounded-xl"></div></div></div> }</div>
      } @else if (labs().length === 0) {
        <app-data-state icon="building" [title]="'common.noData' | t" [message]="'common.noData' | t" />
      } @else if (view() === 'grid') {
        <div class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          @for (lab of labs(); track lab.labId; let index = $index) {
            <article class="group card-surface overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,.1)]">
              <div class="relative h-44 overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-900">
                <div class="absolute inset-0 opacity-25" [style.background-image]="'radial-gradient(circle at '+ ((index % 3 + 1) * 24) +'% 28%, #a78bfa 0, transparent 28%), radial-gradient(circle at 82% 80%, #22d3ee 0, transparent 24%)'"></div>
                @if (store.isAdmin()) {
                  <div class="absolute right-3 top-3 flex gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                    <button type="button" class="flex h-8 w-8 items-center justify-center rounded-xl bg-white/15 text-white backdrop-blur hover:bg-white/25" title="Chỉnh sửa" (click)="openEdit(lab); $event.stopPropagation()"><app-icon name="edit" [size]="15" /></button>
                    <button type="button" class="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500/80 text-white backdrop-blur hover:bg-rose-600/90" title="Ngừng sử dụng" (click)="removeLab(lab); $event.stopPropagation()"><app-icon name="trash" [size]="15" /></button>
                  </div>
                }
                <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/85 to-transparent p-5 pt-14"><div class="flex items-end justify-between gap-3"><div><p class="text-xs font-bold uppercase tracking-[.18em] text-cyan-300">{{ lab.roomCode }}</p><h2 class="mt-1 text-xl font-black text-white">{{ lab.labName }}</h2></div><span class="rounded-2xl bg-white/12 px-3 py-2 text-xs font-black text-white backdrop-blur"><app-icon name="users" [size]="15" /> {{ lab.capacity }}</span></div></div>
              </div>
              <div class="p-5">
                <div class="flex items-center justify-between gap-3"><p class="flex min-w-0 items-center gap-2 truncate text-sm text-slate-500"><app-icon name="map-pin" [size]="17" /> {{ lab.location }}</p><app-status-badge [value]="lab.status" domain="lab" /></div>
                <div class="mt-5 flex gap-2">
                  <a [routerLink]="['/app/labs', lab.labId]" class="btn-primary flex-1">{{ 'common.details' | t }}</a>
                  <a [routerLink]="['/app/bookings/new']" [queryParams]="{ labId: lab.labId }" class="btn-secondary px-3" title="Tạo booking"><app-icon name="calendar-plus" [size]="18" /></a>
                  @if (store.isAdmin()) {
                    <button type="button" class="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100" title="Chỉnh sửa" (click)="openEdit(lab)"><app-icon name="edit" [size]="17" /></button>
                  }
                </div>
              </div>
            </article>
          }
        </div>
      } @else {
        <div class="card-surface overflow-x-auto">
          <table class="table-shell">
            <thead><tr><th>{{ 'labs.labRoom' | t }}</th><th>{{ 'labs.location' | t }}</th><th>{{ 'labs.capacity' | t }}</th><th>{{ 'common.status' | t }}</th><th></th></tr></thead>
            <tbody>
              @for (lab of labs(); track lab.labId) {
                <tr>
                  <td><p class="font-black text-slate-900">{{ lab.labName }}</p><p class="mt-1 text-xs text-slate-400">{{ lab.roomCode }}</p></td>
                  <td>{{ lab.location }}</td>
                  <td>{{ lab.capacity }} {{ 'common.people' | t }}</td>
                  <td><app-status-badge [value]="lab.status" domain="lab" /></td>
                  <td class="text-right">
                    <div class="flex items-center justify-end gap-2">
                      <a [routerLink]="['/app/labs', lab.labId]" class="font-black text-violet-600 hover:text-violet-800">{{ 'common.details' | t }} →</a>
                      @if (store.isAdmin()) {
                        <button type="button" class="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50" title="Chỉnh sửa" (click)="openEdit(lab)"><app-icon name="edit" [size]="16" /></button>
                        <button type="button" class="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100" title="Ngừng sử dụng" (click)="removeLab(lab)"><app-icon name="trash" [size]="16" /></button>
                      }
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      @if (totalPages() > 1) { <div class="flex items-center justify-center gap-2"><button class="btn-secondary" [disabled]="page() === 1" (click)="changePage(page()-1)">{{ 'common.prev' | t }}</button><span class="rounded-xl bg-white px-4 py-3 text-xs font-black text-slate-600 shadow-sm">{{ 'common.page' | t }} {{ page() }}/{{ totalPages() }}</span><button class="btn-secondary" [disabled]="page() === totalPages()" (click)="changePage(page()+1)">{{ 'common.next' | t }}</button></div> }

      <!-- Modal Tạo phòng -->
      <app-modal [open]="createOpen()" title="Thêm phòng thí nghiệm" subtitle="Thông tin được gửi trực tiếp tới POST /api/LabRooms." (close)="createOpen.set(false)">
        <form class="grid gap-4 sm:grid-cols-2" (ngSubmit)="create()">
          <div><label class="field-label">Tên phòng *</label><input class="input-shell" required [(ngModel)]="form.labName" name="labName" placeholder="Phòng Nghiên cứu AI" /></div>
          <div><label class="field-label">Mã phòng *</label><input class="input-shell" required [(ngModel)]="form.roomCode" name="roomCode" placeholder="LAB-AI-01" /></div>
          <div><label class="field-label">Vị trí *</label><input class="input-shell" required [(ngModel)]="form.location" name="location" placeholder="Tầng 4, nhà A" /></div>
          <div><label class="field-label">Sức chứa *</label><input class="input-shell" type="number" min="1" required [(ngModel)]="form.capacity" name="capacity" /></div>
          <div class="sm:col-span-2"><label class="field-label">LabManager *</label><select class="input-shell" required [(ngModel)]="form.managerId" name="managerId"><option [ngValue]="null">Chọn người quản lý</option>@for (manager of managers(); track manager.userId) { <option [ngValue]="manager.userId">{{ manager.fullName }} · {{ manager.email }}</option> }</select></div>
          <div class="sm:col-span-2"><label class="field-label">Mô tả</label><textarea class="textarea-shell" [(ngModel)]="form.description" name="description" placeholder="Mô tả ngắn về không gian và mục đích sử dụng..."></textarea></div>
          <div class="sm:col-span-2"><label class="field-label">URL ảnh</label><input class="input-shell" [(ngModel)]="form.imageUrl" name="imageUrl" placeholder="https://..." /></div>
          <div class="sm:col-span-2"><label class="field-label">Hướng dẫn sử dụng</label><textarea class="textarea-shell" [(ngModel)]="form.usageGuideline" name="usageGuideline"></textarea></div>
          <div class="mt-2 flex justify-end gap-2 sm:col-span-2"><button type="button" class="btn-secondary" (click)="createOpen.set(false)">Hủy</button><button class="btn-primary" [disabled]="saving()">{{ saving() ? 'Đang lưu...' : 'Tạo phòng lab' }}</button></div>
        </form>
      </app-modal>

      <!-- Modal Chỉnh sửa phòng -->
      <app-modal [open]="editOpen()" [title]="'Chỉnh sửa: ' + editingLab()?.labName" subtitle="Cập nhật thông tin phòng lab." (close)="editOpen.set(false)">
        <form class="grid gap-4 sm:grid-cols-2" (ngSubmit)="save()">
          <div><label class="field-label">Tên phòng *</label><input class="input-shell" required [(ngModel)]="editForm.labName" name="elabName" /></div>
          <div><label class="field-label">Vị trí *</label><input class="input-shell" required [(ngModel)]="editForm.location" name="elocation" /></div>
          <div><label class="field-label">Sức chứa *</label><input class="input-shell" type="number" min="1" required [(ngModel)]="editForm.capacity" name="ecapacity" /></div>
          <div><label class="field-label">Đổi LabManager</label><select class="input-shell" [(ngModel)]="editManagerId" name="eManagerId"><option [ngValue]="null">Giữ nguyên</option>@for (manager of managers(); track manager.userId) { <option [ngValue]="manager.userId">{{ manager.fullName }}</option> }</select></div>
          <div class="sm:col-span-2"><label class="field-label">Mô tả</label><textarea class="textarea-shell" [(ngModel)]="editForm.description" name="edescription"></textarea></div>
          <div class="sm:col-span-2"><label class="field-label">URL ảnh</label><input class="input-shell" [(ngModel)]="editForm.imageUrl" name="eimageUrl" /></div>
          <div class="sm:col-span-2"><label class="field-label">Hướng dẫn sử dụng</label><textarea class="textarea-shell" [(ngModel)]="editForm.usageGuideline" name="eusageGuideline"></textarea></div>
          <div class="flex justify-between gap-2 sm:col-span-2">
            <button type="button" class="btn-secondary btn-danger" (click)="removeLab(editingLab()!)"><app-icon name="trash" [size]="16" /> Ngừng sử dụng</button>
            <div class="flex gap-2"><button type="button" class="btn-secondary" (click)="editOpen.set(false)">Hủy</button><button class="btn-primary" [disabled]="saving()">{{ saving() ? 'Đang lưu...' : 'Lưu thay đổi' }}</button></div>
          </div>
        </form>
      </app-modal>
    </section>
  `,
})
export class LabsPage implements OnInit {
  private readonly api = inject(SystemService)
  private readonly toast = inject(ToastService)
  protected readonly store = inject(AuthStore)
  protected readonly labs = signal<LabRoomResponse[]>([])
  protected readonly managers = signal<UserManagementResponse[]>([])
  protected readonly loading = signal(true)
  protected readonly saving = signal(false)
  protected readonly createOpen = signal(false)
  protected readonly editOpen = signal(false)
  protected readonly editingLab = signal<LabRoomResponse | null>(null)
  protected readonly view = signal<'grid' | 'table'>('grid')
  protected readonly page = signal(1)
  protected readonly totalPages = signal(1)
  protected keyword = ''
  protected status: string | number = ''
  protected minimumCapacity: number | null = null
  protected form: LabForm = this.emptyForm()
  protected editForm = { labName: '', location: '', capacity: 1, description: '', imageUrl: '', usageGuideline: '' }
  protected editManagerId: number | null = null

  ngOnInit(): void { this.load(); if (this.store.isAdmin()) this.loadManagers() }

  protected load(): void {
    this.loading.set(true)
    this.api.searchLabs({ keyword: this.keyword || undefined, status: this.status || undefined, minimumCapacity: this.minimumCapacity ?? undefined, pageNumber: this.page(), pageSize: 12 }).subscribe({
      next: (result) => { this.labs.set(result.items); this.totalPages.set(result.totalPages || 1); this.loading.set(false) },
      error: () => { this.loading.set(false); this.toast.error('Không tải được danh sách phòng lab') }
    })
  }

  protected changePage(page: number): void { this.page.set(page); this.load(); window.scrollTo({ top: 0, behavior: 'smooth' }) }

  protected openCreate(): void { this.form = this.emptyForm(); this.createOpen.set(true) }

  protected create(): void {
    if (!this.form.managerId) { this.toast.info('Hãy chọn LabManager'); return }
    this.saving.set(true)
    this.api.createLab({ ...this.form, managerId: this.form.managerId, description: this.form.description || null, imageUrl: this.form.imageUrl || null, usageGuideline: this.form.usageGuideline || null }).subscribe({
      next: () => { this.saving.set(false); this.createOpen.set(false); this.toast.success('Đã tạo phòng lab'); this.load() },
      error: () => { this.saving.set(false); this.toast.error('Không thể tạo phòng lab') }
    })
  }

  protected openEdit(lab: LabRoomResponse): void {
    this.editingLab.set(lab)
    this.editForm = { labName: lab.labName, location: lab.location, capacity: lab.capacity, description: '', imageUrl: '', usageGuideline: '' }
    this.editManagerId = null
    this.editOpen.set(true)
    if (!this.managers().length) this.loadManagers()
    // Load detail to prefill description/imageUrl/usageGuideline
    this.api.lab(lab.labId).subscribe({ next: (detail) => { this.editForm.description = detail.description ?? ''; this.editForm.imageUrl = detail.imageUrl ?? ''; this.editForm.usageGuideline = detail.usageGuideline ?? '' }, error: () => {} })
  }

  protected save(): void {
    const lab = this.editingLab()
    if (!lab) return
    this.saving.set(true)
    this.api.updateLab(lab.labId, { labName: this.editForm.labName, location: this.editForm.location, capacity: this.editForm.capacity, description: this.editForm.description || null, imageUrl: this.editForm.imageUrl || null, usageGuideline: this.editForm.usageGuideline || null }).subscribe({
      next: () => {
        if (this.editManagerId) {
          this.api.changeLabManager(lab.labId, this.editManagerId).subscribe({
            next: () => this.finishSave(),
            error: () => { this.saving.set(false); this.toast.error('Đã lưu thông tin nhưng chưa đổi được quản lý') }
          })
        } else this.finishSave()
      },
      error: () => { this.saving.set(false); this.toast.error('Không thể cập nhật phòng lab') }
    })
  }

  protected removeLab(lab: LabRoomResponse): void {
    if (!confirm(`Ngừng sử dụng phòng "${lab.labName}"?`)) return
    this.api.deleteLab(lab.labId).subscribe({
      next: () => { this.toast.success('Đã ngừng sử dụng phòng lab'); this.editOpen.set(false); this.load() },
      error: () => this.toast.error('Không thể ngừng sử dụng phòng')
    })
  }

  private finishSave(): void { this.saving.set(false); this.editOpen.set(false); this.toast.success('Đã cập nhật phòng lab'); this.load() }
  private loadManagers(): void { this.api.users({ roleName: 'LabManager', pageNumber: 1, pageSize: 100 }).subscribe({ next: (result) => this.managers.set(result.items), error: () => this.managers.set([]) }) }
  private emptyForm(): LabForm { return { labName: '', roomCode: '', location: '', capacity: 20, description: '', imageUrl: '', usageGuideline: '', managerId: null } }
}
