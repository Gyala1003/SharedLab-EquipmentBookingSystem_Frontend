import { NgClass } from '@angular/common'
import { ChangeDetectorRef, Component, OnInit, computed, inject, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { RouterLink } from '@angular/router'
import { catchError, forkJoin, of } from 'rxjs'
import { timeout } from 'rxjs/operators'
import { SystemService } from '../../core/api/system.service'
import type { EquipmentResponse, EquipmentDetailResponse, LabRoomResponse } from '../../core/api/system.models'
import { AuthStore } from '../../core/auth/auth.store'
import { TranslatePipe } from '../../core/i18n/translate.pipe'
import { DataStateComponent } from '../../shared/ui/data-state'
import { IconComponent } from '../../shared/ui/icon'
import { ModalComponent } from '../../shared/ui/modal'
import { PageHeaderComponent } from '../../shared/ui/page-header'
import { SearchableSelectComponent, type SelectOption } from '../../shared/ui/searchable-select'
import { StatusBadgeComponent } from '../../shared/ui/status-badge'
import { ToastService } from '../../shared/ui/toast.service'
import { getEquipmentImageUrl } from '../../shared/utils/presentation'

@Component({
  selector: 'app-equipments-page',
  imports: [FormsModule, RouterLink, PageHeaderComponent, IconComponent, ModalComponent, StatusBadgeComponent, DataStateComponent, SearchableSelectComponent, TranslatePipe],
  template: `
    <section class="space-y-6">
      <app-page-header [title]="'equipments.title' | t" [subtitle]="'equipments.subtitle' | t">
        <a routerLink="/app/calendar" class="btn-secondary"><app-icon name="calendar" [size]="17" /> {{ 'header.viewCalendar' | t }}</a>
        @if (store.isAdmin()) { <button class="btn-primary" (click)="openCreate()"><app-icon name="plus" [size]="17" /> {{ 'equipments.addEquipment' | t }}</button> }
      </app-page-header>

      <div class="filter-bar md:grid-cols-2 xl:grid-cols-[2fr_1fr_1fr_auto]">
        <div><label class="field-label">{{ 'common.search' | t }}</label><div class="relative"><span class="pointer-events-none absolute left-4 top-3.5 text-slate-400"><app-icon name="search" [size]="18" /></span><input class="input-shell pl-11" [(ngModel)]="keyword" (keyup.enter)="load()" placeholder="{{ 'equipments.searchPlaceholder' | t }}" /></div></div>
        <div><label class="field-label">{{ 'calendar.labFilter' | t }}</label><app-searchable-select [options]="labOptions()" [(ngModel)]="labId" placeholder="{{ 'calendar.allLabs' | t }}" searchPlaceholder="Tìm tên, mã phòng..." (selectionChange)="load()" /></div>
        <div><label class="field-label">{{ 'common.status' | t }}</label><select class="input-shell" [(ngModel)]="status"><option value="">{{ 'common.all' | t }}</option><option [value]="1">{{ 'equipments.ready' | t }}</option><option [value]="2">{{ 'equipments.inUse' | t }}</option><option [value]="3">{{ 'labs.maintenance' | t }}</option><option [value]="4">{{ 'equipments.broken' | t }}</option><option [value]="5">{{ 'equipments.retired' | t }}</option></select></div>
        <div><label class="field-label hidden xl:block opacity-0 pointer-events-none">&nbsp;</label><button class="btn-primary w-full h-12" (click)="load()"><app-icon name="filter" [size]="17" /> {{ 'common.apply' | t }}</button></div>
      </div>

      @if (loading()) { <div class="grid gap-5 md:grid-cols-2 xl:grid-cols-4">@for (i of [1,2,3,4,5,6,7,8]; track i) { <div class="card-surface p-5"><div class="skeleton h-36 rounded-2xl"></div><div class="skeleton mt-4 h-5 w-3/4 rounded"></div><div class="skeleton mt-3 h-4 rounded"></div></div> }</div> }
      @else if (items().length === 0) { <app-data-state [title]="'common.noData' | t" [message]="'common.noData' | t" icon="microscope" /> }
      @else {
        <div class="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          @for (item of items(); track item.equipmentId; let index = $index) {
            <article class="group card-surface overflow-hidden transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,.1)]">
              <div class="relative flex h-40 items-center justify-center overflow-hidden bg-slate-900">
                @if (!$any(item)._detailLoaded) {
                  <div class="absolute inset-0 flex items-center justify-center">
                    <div class="h-6 w-6 animate-spin rounded-full border-2 border-slate-700 border-t-slate-400"></div>
                  </div>
                } @else {
                  <img [src]="getEquipmentImage(item)" [alt]="item.equipmentName" class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                }
                <div class="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent"></div>
                <div class="absolute right-4 top-4 z-10"><app-status-badge [value]="item.status" domain="equipment" /></div>

              </div>
              <div class="p-5">
                <p class="truncate text-base font-black text-slate-950">{{ item.equipmentName | t }}</p>
                <p class="mt-2 flex items-center gap-2 truncate text-xs text-slate-400"><app-icon name="building" [size]="15" /> {{ labName(item.labId) | t }}</p>
                <div class="mt-5 flex gap-2">
                  <a [routerLink]="['/app/equipments', item.equipmentId]" class="btn-primary flex-1">{{ 'common.details' | t }}</a>
                  @if (!store.isManager() && !store.isAdmin()) { <a routerLink="/app/bookings/new" [queryParams]="{ equipmentId: item.equipmentId, labId: item.labId }" class="btn-secondary px-3" title="{{ 'sidebar.quickBooking' | t }}"><app-icon name="calendar-plus" [size]="18" /></a> }
                  @if (store.isAdmin()) {
                    <button type="button" class="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100" title="{{ 'equipment.edit' | t }}" (click)="openEdit(item)"><app-icon name="edit" [size]="17" /></button>
                  }
                </div>
              </div>
            </article>
          }
        </div>
      }

      @if (totalPages() > 1) { <div class="flex justify-center gap-2"><button class="btn-secondary" [disabled]="page() <= 1" (click)="page.set(page()-1); load()">{{ 'common.prev' | t }}</button><span class="rounded-xl bg-white px-4 py-3 text-xs font-black">{{ page() }}/{{ totalPages() }}</span><button class="btn-secondary" [disabled]="page() >= totalPages()" (click)="page.set(page()+1); load()">{{ 'common.next' | t }}</button></div> }

      <!-- Modal Tạo thiết bị -->
      <app-modal [open]="createOpen()" title="Thêm thiết bị mới" subtitle="Thiết bị phải thuộc một phòng lab đang tồn tại." (close)="createOpen.set(false)">
        <form class="grid gap-4" (ngSubmit)="create()" ngNativeValidate>
          <div><label class="field-label">Phòng lab *</label><app-searchable-select [options]="labOptions()" [(ngModel)]="form.labId" name="labId" [allowNull]="false" placeholder="Chọn phòng lab" searchPlaceholder="Tìm tên, mã phòng..." /></div>
          <div><label class="field-label">Tên thiết bị *</label><input class="input-shell" required [(ngModel)]="form.equipmentName" name="equipmentName" placeholder="Máy quang phổ FTIR" /></div>
          <div><label class="field-label">Model / thông số</label><textarea class="textarea-shell" [(ngModel)]="form.modelSpecs" name="modelSpecs" placeholder="Hãng, model, dải đo..."></textarea></div>
          <div><label class="field-label">URL ảnh</label><input class="input-shell" [(ngModel)]="form.imageUrl" name="imageUrl" placeholder="https://..." /></div>
          <div><label class="field-label">Hướng dẫn sử dụng</label><textarea class="textarea-shell" [(ngModel)]="form.usageGuideline" name="usageGuideline"></textarea></div>
          <div class="flex justify-end gap-2"><button type="button" class="btn-secondary" (click)="createOpen.set(false)">Hủy</button><button class="btn-primary" [disabled]="saving()">{{ saving() ? 'Đang lưu...' : 'Tạo thiết bị' }}</button></div>
        </form>
      </app-modal>

      <!-- Modal Chỉnh sửa thiết bị -->
      <app-modal [open]="editOpen()" [title]="('common.editTitle' | t) + editingItem()?.equipmentName" [subtitle]="'equipments.editSubtitle' | t" (close)="editOpen.set(false)">
        <form class="grid gap-4" (ngSubmit)="save()" ngNativeValidate>
          <div><label class="field-label">{{ 'equipments.name' | t }} *</label><input class="input-shell" required [(ngModel)]="editForm.equipmentName" name="eequipmentName" /></div>
          <div><label class="field-label">{{ 'equipments.labRoom' | t }} *</label><app-searchable-select [options]="labOptions()" [(ngModel)]="editForm.labId" name="elaborId" [allowNull]="false" [placeholder]="'calendar.allLabs' | t" searchPlaceholder="Tìm tên, mã phòng..." /></div>
          <div><label class="field-label">{{ 'equipments.modelSpecs' | t }}</label><textarea class="textarea-shell" [(ngModel)]="editForm.modelSpecs" name="emodelSpecs"></textarea></div>
          <div><label class="field-label">{{ 'common.imageUrl' | t }}</label><input class="input-shell" [(ngModel)]="editForm.imageUrl" name="eimageUrl" /></div>
          <div><label class="field-label">{{ 'common.usageGuideline' | t }}</label><textarea class="textarea-shell" [(ngModel)]="editForm.usageGuideline" name="eusageGuideline"></textarea></div>
          <div class="flex justify-between gap-2">
            <button type="button" class="btn-secondary btn-danger" (click)="removeItem(editingItem()!)"><app-icon name="trash" [size]="16" /> {{ 'common.disable' | t }}</button>
            <div class="flex gap-2"><button type="button" class="btn-secondary" (click)="editOpen.set(false)">{{ 'common.cancel' | t }}</button><button class="btn-primary" [disabled]="saving()">{{ saving() ? ('common.saving' | t) : ('common.saveChanges' | t) }}</button></div>
          </div>
        </form>
      </app-modal>
    </section>
  `,
})
export class EquipmentsPage implements OnInit {
  private readonly api = inject(SystemService)
  private readonly toast = inject(ToastService)
  private readonly cdr = inject(ChangeDetectorRef)
  protected readonly store = inject(AuthStore)
  protected readonly labs = signal<LabRoomResponse[]>([])
  protected readonly items = signal<EquipmentResponse[]>([])
  protected readonly loading = signal(true)
  protected readonly saving = signal(false)
  protected readonly createOpen = signal(false)
  protected readonly editOpen = signal(false)
  protected readonly editingItem = signal<EquipmentResponse | null>(null)
  protected readonly page = signal(1)
  protected readonly totalPages = signal(1)
  protected keyword = ''
  protected labId: number | null = null
  protected status: string | number = ''
  protected form = { labId: null as number | null, equipmentName: '', modelSpecs: '', imageUrl: '', usageGuideline: '' }
  protected editForm = { labId: null as number | null, equipmentName: '', modelSpecs: '', imageUrl: '', usageGuideline: '' }
  protected readonly labMap = computed(() => new Map(this.labs().map((lab) => [lab.labId, lab.labName])))
  protected readonly labOptions = computed<SelectOption[]>(() =>
    this.labs().map((lab) => ({
      value: lab.labId,
      label: lab.labName,
      code: lab.roomCode,
      sublabel: lab.location,
    })),
  )

  ngOnInit(): void {
    // Run labs() and searchEquipments() in parallel — saves ~241ms vs sequential
    forkJoin({
      labs: this.api.labs().pipe(catchError(() => of([]))),
      result: this.api.searchEquipments({ pageNumber: this.page(), pageSize: 16 }).pipe(catchError(() => of({ items: [], totalPages: 1, totalCount: 0, pageNumber: 1, pageSize: 16 }))),
    }).subscribe({
      next: ({ labs, result }) => {
        this.labs.set(labs)
        this.items.set(result.items)
        this.totalPages.set(result.totalPages || 1)
        this.loading.set(false)
        this.enrichWithDetails(result.items)
      },
      error: () => { this.loading.set(false); this.toast.error('Không tải được dữ liệu') },
    })
  }

  protected getEquipmentImage(item?: EquipmentResponse | null): string { return getEquipmentImageUrl(item) }

  protected load(): void {
    this.loading.set(true)
    // Backend search API has broken filter logic.
    // Fetch all equipments using searchEquipments with pageSize=100 (backend max limit) and filter on frontend.
    this.api.searchEquipments({ pageNumber: 1, pageSize: 100 }).subscribe({
      next: (result) => {
        let filtered = result.items || []

        if (this.keyword && this.keyword.trim().length > 0) {
          const kw = this.keyword.toLowerCase().trim()
          filtered = filtered.filter(e => e.equipmentName && e.equipmentName.toLowerCase().includes(kw))
        }

        if (this.labId) {
          filtered = filtered.filter(e => e.labId === this.labId)
        }

        if (this.status) {
          const statusStr = String(this.status)
          let targetStatus = ''
          if (statusStr === '1') targetStatus = 'Available'
          else if (statusStr === '2') targetStatus = 'In Use'
          else if (statusStr === '3') targetStatus = 'Under Maintenance'
          else if (statusStr === '4') targetStatus = 'Broken'
          else if (statusStr === '5') targetStatus = 'Retired'
          
          if (targetStatus) {
            filtered = filtered.filter(e => e.status === targetStatus)
          }
        }

        const pageSize = 16
        this.totalPages.set(Math.ceil(filtered.length / pageSize) || 1)
        
        if (this.page() > this.totalPages()) this.page.set(this.totalPages())
        if (this.page() < 1) this.page.set(1)
        
        const pagedItems = filtered.slice((this.page() - 1) * pageSize, this.page() * pageSize).map(e => ({ ...e, _detailLoaded: false }))
        this.items.set(pagedItems)
        this.loading.set(false)

        this.enrichWithDetails(pagedItems)
      },
      error: () => {
        this.loading.set(false)
        this.toast.error('Không tải được danh sách thiết bị')
      }
    })
  }


  private enrichWithDetails(pagedItems: EquipmentResponse[]): void {
    if (!pagedItems.length) return
    forkJoin(pagedItems.map(item =>
      this.api.equipment(item.equipmentId).pipe(
        timeout(3000),
        catchError(() => of(null)),
      ),
    )).subscribe(details => {
      const enriched = pagedItems.map((item, i) => {
        const detailUrl = details[i]?.imageUrl
        return { ...item, imageUrl: detailUrl || item.imageUrl, _detailLoaded: true }
      })
      this.items.set(enriched)
    })
  }


  protected labName(id: number): string { return this.labMap().get(id) ?? `Phòng #${id}` }

  protected openCreate(): void { this.form = { labId: null, equipmentName: '', modelSpecs: '', imageUrl: '', usageGuideline: '' }; this.createOpen.set(true) }

  protected create(): void {
    if (!this.form.labId) { this.toast.info('Hãy chọn phòng lab'); return }
    this.saving.set(true)
    this.api.createEquipment({ labId: this.form.labId, equipmentName: this.form.equipmentName, modelSpecs: this.form.modelSpecs || null, imageUrl: this.form.imageUrl || null, usageGuideline: this.form.usageGuideline || null }).subscribe({
      next: () => { this.saving.set(false); this.createOpen.set(false); this.toast.success('Đã thêm thiết bị'); this.load() },
      error: () => { this.saving.set(false); this.toast.error('Không thể thêm thiết bị') }
    })
  }

  protected openEdit(item: EquipmentResponse): void {
    this.editingItem.set(item)
    this.editForm = { labId: item.labId, equipmentName: item.equipmentName, modelSpecs: '', imageUrl: '', usageGuideline: '' }
    this.editOpen.set(true)
    // Load detail to prefill optional fields
    this.api.equipment(item.equipmentId).subscribe({
      next: (detail) => { this.editForm.modelSpecs = detail.modelSpecs ?? ''; this.editForm.imageUrl = detail.imageUrl ?? ''; this.editForm.usageGuideline = detail.usageGuideline ?? ''; this.cdr.detectChanges() },
      error: () => {}
    })
  }

  protected save(): void {
    const item = this.editingItem()
    if (!item || !this.editForm.labId) { this.toast.info('Hãy chọn phòng lab'); return }
    this.saving.set(true)
    this.api.updateEquipment(item.equipmentId, { labId: this.editForm.labId, equipmentName: this.editForm.equipmentName, modelSpecs: this.editForm.modelSpecs || null, imageUrl: this.editForm.imageUrl || null, usageGuideline: this.editForm.usageGuideline || null }).subscribe({
      next: () => { this.saving.set(false); this.editOpen.set(false); this.toast.success('Đã cập nhật thiết bị'); this.load() },
      error: () => { this.saving.set(false); this.toast.error('Không thể cập nhật thiết bị') }
    })
  }

  protected removeItem(item: EquipmentResponse): void {
    if (!confirm(`Ngừng sử dụng thiết bị "${item.equipmentName}"?`)) return
    this.api.deleteEquipment(item.equipmentId).subscribe({
      next: () => { this.toast.success('Đã ngừng sử dụng thiết bị'); this.editOpen.set(false); this.load() },
      error: () => this.toast.error('Không thể ngừng sử dụng thiết bị')
    })
  }
}
