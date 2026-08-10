import { NgClass } from '@angular/common'
import { ChangeDetectorRef, Component, OnInit, computed, inject, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { RouterLink } from '@angular/router'
import { catchError, finalize, forkJoin, of, from } from 'rxjs'
import { timeout, mergeMap, toArray, map } from 'rxjs/operators'
import { SystemService } from '../../core/api/system.service'
import type {
  EquipmentResponse,
  EquipmentDetailResponse,
  LabRoomResponse,
} from '../../core/api/system.models'
import { AuthStore } from '../../core/auth/auth.store'
import { TranslatePipe } from '../../core/i18n/translate.pipe'
import { DataStateComponent } from '../../shared/ui/data-state'
import { IconComponent } from '../../shared/ui/icon'
import { ModalComponent } from '../../shared/ui/modal'
import { PageHeaderComponent } from '../../shared/ui/page-header'
import { SearchableSelectComponent, type SelectOption } from '../../shared/ui/searchable-select'
import { StatusBadgeComponent } from '../../shared/ui/status-badge'
import { ToastService } from '../../shared/ui/toast.service'
import { ConfirmDialogService } from '../../shared/ui/confirm-dialog'
import { getEquipmentImageUrl } from '../../shared/utils/presentation'

@Component({
  selector: 'app-equipments-page',
  imports: [
    FormsModule,
    RouterLink,
    PageHeaderComponent,
    IconComponent,
    ModalComponent,
    StatusBadgeComponent,
    DataStateComponent,
    SearchableSelectComponent,
    TranslatePipe,
  ],
  template: `
    <section class="space-y-6">
      <app-page-header [title]="'equipments.title' | t" [subtitle]="'equipments.subtitle' | t">
        <a routerLink="/app/calendar" class="btn-secondary"
          ><app-icon name="calendar" [size]="17" /> {{ 'header.viewCalendar' | t }}</a
        >
        @if (store.isAdmin()) {
          <button class="btn-primary" (click)="openCreate()">
            <app-icon name="plus" [size]="17" /> {{ 'equipments.addEquipment' | t }}
          </button>
        }
      </app-page-header>

      <div class="filter-bar md:grid-cols-3 xl:grid-cols-[2fr_1fr_1fr]">
        <div>
          <label class="field-label">{{ 'common.search' | t }}</label>
          <div class="relative">
            <span class="pointer-events-none absolute top-3.5 left-4 text-slate-400"
              ><app-icon name="search" [size]="18" /></span
            ><input
              class="input-shell pl-11"
              [(ngModel)]="keyword"
              (ngModelChange)="applyFilters()"
              (keyup.enter)="applyFilters()"
              placeholder="{{ 'equipments.searchPlaceholder' | t }}"
            />
          </div>
        </div>
        <div>
          <label class="field-label">{{ 'calendar.labFilter' | t }}</label
          ><app-searchable-select
            [options]="labOptions()"
            [(ngModel)]="labId"
            placeholder="{{ 'calendar.allLabs' | t }}"
            searchPlaceholder="Tìm tên, mã phòng..."
            (selectionChange)="applyFilters()"
          />
        </div>
        <div>
          <label class="field-label">{{ 'common.status' | t }}</label
          ><select class="input-shell" [(ngModel)]="status" (ngModelChange)="applyFilters()">
            <option value="">{{ 'common.all' | t }}</option>
            <option [value]="1">{{ 'equipments.ready' | t }}</option>
            <option [value]="2">{{ 'equipments.inUse' | t }}</option>
            <option [value]="3">{{ 'labs.maintenance' | t }}</option>
            <option [value]="4">{{ 'equipments.broken' | t }}</option>
            <option [value]="5">{{ 'equipments.retired' | t }}</option>
          </select>
        </div>
      </div>

      @if (loading()) {
        <div class="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          @for (i of [1, 2, 3, 4, 5, 6, 7, 8]; track i) {
            <div class="card-surface p-5">
              <div class="skeleton h-36 rounded-2xl"></div>
              <div class="skeleton mt-4 h-5 w-3/4 rounded"></div>
              <div class="skeleton mt-3 h-4 rounded"></div>
            </div>
          }
        </div>
      } @else if (items().length === 0) {
        <app-data-state
          [title]="'common.noData' | t"
          [message]="'common.noData' | t"
          icon="microscope"
        />
      } @else {
        <div class="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          @for (item of items(); track item.equipmentId; let index = $index) {
            <article
              class="group card-surface overflow-hidden transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,.1)]"
            >
              <div
                class="relative flex h-40 items-center justify-center overflow-hidden bg-slate-900"
              >
                @if (!$any(item)._detailLoaded) {
                  <div class="absolute inset-0 flex items-center justify-center">
                    <div
                      class="h-6 w-6 animate-spin rounded-full border-2 border-slate-700 border-t-slate-400"
                    ></div>
                  </div>
                } @else {
                  <img
                    [src]="getEquipmentImage(item)"
                    [alt]="item.equipmentName"
                    class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    [class.grayscale]="
                      item.status === 'Inactive' ||
                      item.status === 'Maintenance' ||
                      item.status === 'Broken'
                    "
                  />
                }
                <div
                  class="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent"
                ></div>

                @if (item.status === 'Maintenance') {
                  <div class="absolute inset-0 bg-indigo-950/50 backdrop-blur-[1px]"></div>
                  <div
                    class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pb-8 text-indigo-300 opacity-80"
                  >
                    <app-icon name="wrench" [size]="32" /><span
                      class="mt-2 text-xs font-black tracking-widest uppercase"
                      >{{ 'labs.maintenance' | t }}</span
                    >
                  </div>
                } @else if (item.status === 'Inactive' || item.status === 'Retired' || item.status === '5') {
                  <div class="pointer-events-none absolute inset-0 bg-rose-950/60 backdrop-blur-[1px]"></div>
                  <svg class="pointer-events-none absolute inset-0 h-full w-full stroke-rose-500/85" stroke-width="4" stroke-linecap="round">
                    <line x1="0" y1="0" x2="100%" y2="100%" />
                    <line x1="100%" y1="0" x2="0" y2="100%" />
                  </svg>
                  <div class="pointer-events-none absolute inset-0 flex items-center justify-center pb-8">
                    <div class="flex items-center gap-2 rounded-full border-2 border-rose-500 bg-rose-600/90 px-4 py-1.5 font-black text-xs text-white uppercase tracking-widest shadow-xl shadow-rose-950/50 backdrop-blur-md">
                      <app-icon name="ban" [size]="16" />
                      <span>INACTIVE</span>
                    </div>
                  </div>
                } @else if (item.status === 'Broken') {
                  <div class="absolute inset-0 bg-orange-950/50 backdrop-blur-[1px]"></div>
                  <div
                    class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pb-8 text-orange-300 opacity-80"
                  >
                    <app-icon name="triangle-alert" [size]="32" /><span
                      class="mt-2 text-xs font-black tracking-widest uppercase"
                      >Bị hỏng</span
                    >
                  </div>
                }

                <div class="absolute top-4 right-4 z-10">
                  <app-status-badge [value]="item.status" domain="equipment" />
                </div>
              </div>
              <div class="p-5">
                <p class="truncate text-base font-black text-slate-950">
                  {{ item.equipmentName | t }}
                </p>
                <p class="mt-2 flex items-center gap-2 truncate text-xs text-slate-400">
                  <app-icon name="building" [size]="15" /> {{ labName(item.labId) | t }}
                </p>
                <div class="mt-5 flex gap-2">
                  <a
                    [routerLink]="['/app/equipments', item.equipmentId]"
                    class="btn-primary flex-1"
                    >{{ 'common.details' | t }}</a
                  >
                  @if (!store.isManager() && !store.isAdmin()) {
                    <a
                      routerLink="/app/bookings/new"
                      [queryParams]="{ equipmentId: item.equipmentId, labId: item.labId }"
                      class="btn-secondary px-3"
                      title="{{ 'sidebar.quickBooking' | t }}"
                      ><app-icon name="calendar-plus" [size]="18"
                    /></a>
                  }
                  @if (store.isAdmin()) {
                    <button
                      type="button"
                      class="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                      title="{{ 'equipment.edit' | t }}"
                      (click)="openEdit(item)"
                    >
                      <app-icon name="edit" [size]="17" />
                    </button>
                  }
                </div>
              </div>
            </article>
          }
        </div>
      }

      @if (totalPages() > 1) {
        <div
          class="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-3 shadow-sm"
        >
          <p class="px-2 text-xs font-bold text-slate-400">
            Hiển thị {{ items().length }} / {{ totalCount() }} thiết bị
          </p>
          <div class="flex items-center gap-2">
            <button class="btn-secondary" [disabled]="page() <= 1" (click)="changePage(page() - 1)">
              <app-icon name="chevron-left" [size]="16" /> {{ 'common.prev' | t }}</button
            ><span class="rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-black text-slate-600"
              >{{ page() }} / {{ totalPages() }}</span
            ><button
              class="btn-secondary"
              [disabled]="page() >= totalPages()"
              (click)="changePage(page() + 1)"
            >
              {{ 'common.next' | t }} <app-icon name="chevron-right" [size]="16" />
            </button>
          </div>
        </div>
      }

      <!-- Modal Tạo thiết bị -->
      <app-modal
        [open]="createOpen()"
        [title]="'equipments.createTitle' | t"
        [subtitle]="'equipments.createSubtitle' | t"
        (close)="createOpen.set(false)"
      >
        <form class="grid gap-4" (ngSubmit)="create()" ngNativeValidate>
          <div>
            <label class="field-label">{{ 'labs.labRoom' | t }} *</label
            ><app-searchable-select
              [options]="labOptions()"
              [(ngModel)]="form.labId"
              name="labId"
              [allowNull]="false"
              [placeholder]="'equipments.selectLab' | t"
              searchPlaceholder="Tìm tên, mã phòng..."
            />
          </div>
          <div>
            <label class="field-label">{{ 'equipments.name' | t }} *</label
            ><input
              class="input-shell"
              required
              [(ngModel)]="form.equipmentName"
              name="equipmentName"
              [placeholder]="'equipments.namePlaceholder' | t"
            />
          </div>
          <div>
            <label class="field-label">{{ 'equipments.modelSpecs' | t }}</label
            ><textarea
              class="textarea-shell"
              [(ngModel)]="form.modelSpecs"
              name="modelSpecs"
              [placeholder]="'equipments.specsPlaceholder' | t"
            ></textarea>
          </div>
          <div>
            <label class="field-label">{{ 'common.imageUrl' | t }}</label
            ><input
              class="input-shell"
              [(ngModel)]="form.imageUrl"
              name="imageUrl"
              placeholder="https://..."
            />
          </div>
          <div>
            <label class="field-label">{{ 'common.usageGuideline' | t }}</label
            ><textarea
              class="textarea-shell"
              [(ngModel)]="form.usageGuideline"
              name="usageGuideline"
            ></textarea>
          </div>
          <div class="flex justify-end gap-2">
            <button type="button" class="btn-secondary" (click)="createOpen.set(false)">
              {{ 'common.cancel' | t }}
            </button
            ><button class="btn-primary" [disabled]="saving()">
              {{ saving() ? ('common.saving' | t) : ('equipments.create' | t) }}
            </button>
          </div>
        </form>
      </app-modal>

      <!-- Modal Chỉnh sửa thiết bị -->
      <app-modal
        [open]="editOpen()"
        [title]="('common.editTitle' | t) + editingItem()?.equipmentName"
        [subtitle]="'equipments.editSubtitle' | t"
        (close)="editOpen.set(false)"
      >
        <form class="grid gap-4" (ngSubmit)="save()" ngNativeValidate>
          @if (editingItem()?.status === 'Inactive' || editingItem()?.status === 'Retired') {
            <div
              class="flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50/90 p-3.5 text-xs leading-5 text-rose-950"
            >
              <app-icon name="alert-triangle" [size]="18" class="mt-0.5 shrink-0 text-rose-600" />
              <div>
                <strong class="font-bold">Lưu ý về quy tắc Backend:</strong> Thiết bị này đang ở
                trạng thái <em>Ngừng hoạt động (Retired/Inactive)</em>. Backend hiện đang có quy tắc
                chặn cập nhật thiết bị ở trạng thái Retired.
              </div>
            </div>
          }
          <div>
            <label class="field-label">{{ 'equipments.name' | t }} *</label
            ><input
              class="input-shell"
              required
              [(ngModel)]="editForm.equipmentName"
              name="eequipmentName"
            />
          </div>
          <div>
            <label class="field-label">{{ 'equipments.labRoom' | t }} *</label
            ><app-searchable-select
              [options]="labOptions()"
              [(ngModel)]="editForm.labId"
              name="elaborId"
              [allowNull]="false"
              [placeholder]="'calendar.allLabs' | t"
              searchPlaceholder="Tìm tên, mã phòng..."
            />
          </div>
          <div>
            <label class="field-label">{{ 'equipments.modelSpecs' | t }}</label
            ><textarea
              class="textarea-shell"
              [(ngModel)]="editForm.modelSpecs"
              name="emodelSpecs"
            ></textarea>
          </div>
          <div>
            <label class="field-label">{{ 'common.imageUrl' | t }}</label
            ><input class="input-shell" [(ngModel)]="editForm.imageUrl" name="eimageUrl" />
          </div>
          <div>
            <label class="field-label">{{ 'common.usageGuideline' | t }}</label
            ><textarea
              class="textarea-shell"
              [(ngModel)]="editForm.usageGuideline"
              name="eusageGuideline"
            ></textarea>
          </div>
          <div class="flex justify-between gap-2">
            <button
              type="button"
              class="btn-secondary btn-danger"
              (click)="removeItem(editingItem()!)"
            >
              <app-icon name="trash" [size]="16" /> {{ 'common.disable' | t }}
            </button>
            <div class="flex gap-2">
              <button type="button" class="btn-secondary" (click)="editOpen.set(false)">
                {{ 'common.cancel' | t }}</button
              ><button class="btn-primary" [disabled]="saving()">
                {{ saving() ? ('common.saving' | t) : ('common.saveChanges' | t) }}
              </button>
            </div>
          </div>
        </form>
      </app-modal>
    </section>
  `,
})
export class EquipmentsPage implements OnInit {
  private readonly api = inject(SystemService)
  private readonly toast = inject(ToastService)
  private readonly confirmDialog = inject(ConfirmDialogService)
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
  protected readonly totalCount = signal(0)
  protected keyword = ''
  protected labId: number | null = null
  protected status: string | number = ''
  protected form = {
    labId: null as number | null,
    equipmentName: '',
    modelSpecs: '',
    imageUrl: '',
    usageGuideline: '',
  }
  protected editForm = {
    labId: null as number | null,
    equipmentName: '',
    modelSpecs: '',
    imageUrl: '',
    usageGuideline: '',
  }
  protected readonly labMap = computed(
    () => new Map(this.labs().map((lab) => [lab.labId, lab.labName])),
  )
  protected readonly labOptions = computed<SelectOption[]>(() =>
    this.labs()
      .filter(
        (lab) =>
          this.store.isAdmin() ||
          (lab.status !== 'Inactive' &&
            lab.status !== '4' &&
            String(lab.status).toLowerCase() !== 'inactive'),
      )
      .map((lab) => ({
        value: lab.labId,
        label: lab.labName,
        code: lab.roomCode,
        sublabel: lab.location,
      })),
  )

  ngOnInit(): void {
    this.api
      .labs()
      .pipe(catchError(() => of([])))
      .subscribe({
        next: (labs) => {
          this.labs.set(labs)
          this.load()
        },
        error: () => {
          this.load()
        },
      })
  }

  protected getEquipmentImage(item?: EquipmentResponse | null): string {
    return getEquipmentImageUrl(item)
  }

  protected applyFilters(): void {
    this.page.set(1)
    this.load()
  }

  protected changePage(page: number): void {
    if (page < 1 || page > this.totalPages()) return
    this.page.set(page)
    this.load()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  protected load(): void {
    this.loading.set(true)
    this.api
      .searchEquipments({
        keyword: this.keyword.trim() || undefined,
        labId: this.labId ?? undefined,
        status: this.status || undefined,
        pageNumber: this.page(),
        pageSize: 16,
      })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (result) => {
          let items = result.items || []

          if (!this.store.isAdmin()) {
            items = items.filter(
              (e) =>
                e.status !== 'Inactive' &&
                e.status !== 'Retired' &&
                e.status !== '5' &&
                String(e.status).toLowerCase() !== 'inactive' &&
                String(e.status).toLowerCase() !== 'retired',
            )
          }

          this.totalPages.set(result.totalPages || 1)
          this.totalCount.set(result.totalCount ?? items.length)

          const pagedItems = items.map((e) => ({ ...e, _detailLoaded: false }))
          this.items.set(pagedItems)

          this.enrichWithDetails(pagedItems)
        },
        error: () => {
          this.toast.error('Không tải được danh sách thiết bị')
        },
      })
  }

  private enrichWithDetails(pagedItems: (EquipmentResponse & { _detailLoaded?: boolean })[]): void {
    if (!pagedItems.length) return
    from(
      pagedItems.map((item, index) =>
        this.api.equipment(item.equipmentId).pipe(
          timeout(3000),
          map((detail: any) => ({ index, url: detail?.imageUrl })),
          catchError(() => of({ index, url: null })),
        ),
      ),
    )
      .pipe(
        mergeMap((req) => req, 3),
        toArray(),
      )
      .subscribe((results: any[]) => {
        const enriched = [...pagedItems]
        results.forEach((res: any) => {
          const item = enriched[res.index]
          enriched[res.index] = { ...item, imageUrl: res.url || item.imageUrl, _detailLoaded: true }
        })
        this.items.set(enriched)
      })
  }

  protected labName(id: number): string {
    return this.labMap().get(id) ?? `Phòng #${id}`
  }

  protected openCreate(): void {
    this.form = { labId: null, equipmentName: '', modelSpecs: '', imageUrl: '', usageGuideline: '' }
    this.createOpen.set(true)
  }

  protected create(): void {
    if (!this.form.labId) {
      this.toast.info('Hãy chọn phòng lab')
      return
    }
    this.saving.set(true)
    this.api
      .createEquipment({
        labId: this.form.labId,
        equipmentName: this.form.equipmentName,
        modelSpecs: this.form.modelSpecs || null,
        imageUrl: this.form.imageUrl || null,
        usageGuideline: this.form.usageGuideline || null,
      })
      .subscribe({
        next: () => {
          this.saving.set(false)
          this.createOpen.set(false)
          this.toast.success('Đã thêm thiết bị')
          this.load()
        },
        error: () => {
          this.saving.set(false)
          this.toast.error('Không thể thêm thiết bị')
        },
      })
  }

  protected openEdit(item: EquipmentResponse): void {
    this.editingItem.set(item)
    this.editForm = {
      labId: item.labId,
      equipmentName: item.equipmentName,
      modelSpecs: '',
      imageUrl: '',
      usageGuideline: '',
    }
    this.editOpen.set(true)
    // Load detail to prefill optional fields
    this.api.equipment(item.equipmentId).subscribe({
      next: (detail) => {
        this.editForm.modelSpecs = detail.modelSpecs ?? ''
        this.editForm.imageUrl = detail.imageUrl ?? ''
        this.editForm.usageGuideline = detail.usageGuideline ?? ''
        this.cdr.detectChanges()
      },
      error: () => {},
    })
  }

  protected save(): void {
    const item = this.editingItem()
    if (!item || !this.editForm.labId) {
      this.toast.info('Hãy chọn phòng lab')
      return
    }
    this.saving.set(true)
    this.api
      .updateEquipment(item.equipmentId, {
        labId: this.editForm.labId,
        equipmentName: this.editForm.equipmentName,
        modelSpecs: this.editForm.modelSpecs || null,
        imageUrl: this.editForm.imageUrl || null,
        usageGuideline: this.editForm.usageGuideline || null,
      })
      .subscribe({
        next: () => {
          this.saving.set(false)
          this.editOpen.set(false)
          this.toast.success('Đã cập nhật thiết bị')
          this.load()
        },
        error: (err: any) => {
          this.saving.set(false)
          const msg =
            err?.error?.message ||
            (typeof err?.error === 'string' ? err.error : null) ||
            err?.message ||
            'Không thể cập nhật thiết bị'
          this.toast.error('Không thể cập nhật thiết bị', msg)
        },
      })
  }

  protected async removeItem(item: EquipmentResponse): Promise<void> {
    const confirmed = await this.confirmDialog.confirm({
      title: 'Ngừng sử dụng thiết bị',
      message: `Ngừng sử dụng thiết bị "${item.equipmentName}"?`,
      variant: 'danger',
      confirmText: 'Ngừng sử dụng',
    })
    if (!confirmed) return
    this.api.deleteEquipment(item.equipmentId).subscribe({
      next: () => {
        this.toast.success('Đã ngừng sử dụng thiết bị')
        this.editOpen.set(false)
        this.load()
      },
      error: () => this.toast.error('Không thể ngừng sử dụng thiết bị'),
    })
  }
}
