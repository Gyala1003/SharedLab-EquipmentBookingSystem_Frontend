import { NgClass } from '@angular/common'
import { ChangeDetectorRef, Component, OnInit, inject, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { RouterLink } from '@angular/router'
import { catchError, forkJoin, of, from } from 'rxjs'
import { timeout, mergeMap, toArray, map } from 'rxjs/operators'
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
import { getLabImageUrl } from '../../shared/utils/presentation'

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
  imports: [
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
      <app-page-header [title]="'labs.title' | t" [subtitle]="'labs.subtitle' | t">
        <a routerLink="/app/calendar" class="btn-secondary"
          ><app-icon name="calendar" [size]="17" /> {{ 'header.viewCalendar' | t }}</a
        >
        @if (store.isAdmin()) {
          <button type="button" class="btn-primary" (click)="openCreate()">
            <app-icon name="plus" [size]="17" /> {{ 'labs.addLab' | t }}
          </button>
        }
      </app-page-header>

      <div class="filter-bar md:grid-cols-2 xl:grid-cols-[2fr_1fr_1fr_1fr_auto]">
        <div>
          <label class="field-label">{{ 'common.search' | t }}</label>
          <div class="relative">
            <span class="pointer-events-none absolute top-3.5 left-4 text-slate-400"
              ><app-icon name="search" [size]="18" /></span
            ><input
              class="input-shell pl-11"
              [(ngModel)]="keyword"
              (keyup.enter)="load()"
              placeholder="{{ 'labs.searchPlaceholder' | t }}"
            />
          </div>
        </div>
        <div>
          <label class="field-label">{{ 'common.status' | t }}</label
          ><select class="input-shell" [(ngModel)]="status">
            <option value="">{{ 'common.all' | t }}</option>
            <option [value]="1">{{ 'labs.available' | t }}</option>
            <option [value]="3">{{ 'labs.maintenance' | t }}</option>
          </select>
        </div>
        <div>
          <label class="field-label">{{ 'labs.minCapacity' | t }}</label
          ><input class="input-shell" type="number" min="1" [(ngModel)]="minimumCapacity" />
        </div>
        <div>
          <label class="field-label">{{ 'labs.viewMode' | t }}</label>
          <div class="flex h-12 rounded-2xl bg-slate-100 p-1">
            <button
              type="button"
              class="inline-flex h-full flex-1 items-center justify-center rounded-xl text-xs font-black transition-all duration-150"
              [ngClass]="
                view() === 'grid'
                  ? 'bg-white text-cyan-700 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600'
              "
              (click)="view.set('grid')"
            >
              <app-icon name="grid" [size]="17" /></button
            ><button
              type="button"
              class="inline-flex h-full flex-1 items-center justify-center rounded-xl text-xs font-black transition-all duration-150"
              [ngClass]="
                view() === 'table'
                  ? 'bg-white text-cyan-700 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600'
              "
              (click)="view.set('table')"
            >
              <app-icon name="list" [size]="17" />
            </button>
          </div>
        </div>
        <div>
          <label class="field-label pointer-events-none hidden opacity-0 xl:block">&nbsp;</label
          ><button class="btn-primary h-12 w-full" type="button" (click)="load()">
            <app-icon name="filter" [size]="17" /> {{ 'common.apply' | t }}
          </button>
        </div>
      </div>

      @if (loading()) {
        <div class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          @for (i of [1, 2, 3, 4, 5, 6]; track i) {
            <div class="card-surface overflow-hidden">
              <div class="skeleton h-40"></div>
              <div class="p-5">
                <div class="skeleton h-5 w-2/3 rounded"></div>
                <div class="skeleton mt-3 h-4 rounded"></div>
                <div class="skeleton mt-5 h-10 rounded-xl"></div>
              </div>
            </div>
          }
        </div>
      } @else if (labs().length === 0) {
        <app-data-state
          icon="building"
          [title]="'common.noData' | t"
          [message]="'common.noData' | t"
        />
      } @else if (view() === 'grid') {
        <div class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          @for (lab of labs(); track lab.labId; let index = $index) {
            <article
              class="group card-surface overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,.1)]"
            >
              <div class="relative h-44 overflow-hidden bg-slate-900">
                @if (!$any(lab)._detailLoaded) {
                  <div class="absolute inset-0 flex items-center justify-center">
                    <div
                      class="h-6 w-6 animate-spin rounded-full border-2 border-slate-700 border-t-slate-400"
                    ></div>
                  </div>
                } @else {
                  <img
                    [src]="getLabImage(lab)"
                    [alt]="lab.labName"
                    class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    [class.grayscale]="lab.status === 'Inactive' || lab.status === '4' || lab.status === 'inactive'"
                  />
                }
                <div
                  class="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent"
                ></div>

                @if (lab.status === 'Inactive' || lab.status === '4' || lab.status === 'inactive') {
                  <div class="pointer-events-none absolute inset-0 bg-rose-950/50 backdrop-blur-[1px]"></div>
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
                }

                <div
                  class="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-slate-950/85 to-transparent p-5 pt-14"
                >
                  <div class="flex items-end justify-between gap-3">
                    <div>
                      <p class="text-xs font-bold tracking-[.18em] text-cyan-300 uppercase">
                        {{ lab.roomCode }}
                      </p>
                      <h2 class="mt-1 text-xl font-black text-white">{{ lab.labName | t }}</h2>
                    </div>
                    <span
                      class="rounded-2xl bg-white/12 px-3 py-2 text-xs font-black text-white backdrop-blur"
                      ><app-icon name="users" [size]="15" /> {{ lab.capacity }}</span
                    >
                  </div>
                </div>
              </div>
              <div class="p-5">
                <div class="flex items-center justify-between gap-3">
                  <p class="flex min-w-0 items-center gap-2 truncate text-sm text-slate-500">
                    <app-icon name="map-pin" [size]="17" /> {{ lab.location | t }}
                  </p>
                  <app-status-badge [value]="lab.status" domain="lab" />
                </div>
                <div class="mt-5 flex gap-2">
                  <a [routerLink]="['/app/labs', lab.labId]" class="btn-primary flex-1">{{
                    'common.details' | t
                  }}</a>
                  @if (!store.isManager() && !store.isAdmin()) {
                    <a
                      [routerLink]="['/app/bookings/new']"
                      [queryParams]="{ labId: lab.labId }"
                      class="btn-secondary px-3"
                      title="{{ 'sidebar.quickBooking' | t }}"
                      ><app-icon name="calendar-plus" [size]="18"
                    /></a>
                  }
                  @if (store.isAdmin()) {
                    <button
                      type="button"
                      class="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                      title="{{ 'lab.edit' | t }}"
                      (click)="openEdit(lab)"
                    >
                      <app-icon name="edit" [size]="17" />
                    </button>
                  }
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
                <th>{{ 'labs.labRoom' | t }}</th>
                <th>{{ 'labs.location' | t }}</th>
                <th>{{ 'labs.capacity' | t }}</th>
                <th>{{ 'common.status' | t }}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              @for (lab of labs(); track lab.labId) {
                <tr>
                  <td>
                    <div class="flex items-center gap-3">
                      <div class="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl">
                        <img
                          [src]="getLabImage(lab)"
                          [alt]="lab.labName"
                          class="h-full w-full object-cover"
                          [class.grayscale]="lab.status === 'Inactive' || lab.status === '4'"
                        />
                        @if (lab.status === 'Inactive' || lab.status === '4') {
                          <div class="absolute inset-0 bg-rose-950/70 flex items-center justify-center text-rose-400">
                            <app-icon name="ban" [size]="16" />
                          </div>
                        }
                      </div>
                      <div>
                        <p class="font-black text-slate-900">{{ lab.labName | t }}</p>
                        <p class="mt-0.5 text-xs text-slate-400">{{ lab.roomCode }}</p>
                      </div>
                    </div>
                  </td>
                  <td>{{ lab.location | t }}</td>
                  <td>{{ lab.capacity }} {{ 'common.people' | t }}</td>
                  <td><app-status-badge [value]="lab.status" domain="lab" /></td>
                  <td class="text-right">
                    <div class="flex items-center justify-end gap-2">
                      <a
                        [routerLink]="['/app/labs', lab.labId]"
                        class="font-black text-violet-600 hover:text-violet-800"
                        >{{ 'common.details' | t }} →</a
                      >
                      @if (store.isAdmin()) {
                        <button
                          type="button"
                          class="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                          title="Chỉnh sửa"
                          (click)="openEdit(lab)"
                        >
                          <app-icon name="edit" [size]="16" />
                        </button>
                      }
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      @if (totalPages() > 1) {
        <div class="flex items-center justify-center gap-2">
          <button class="btn-secondary" [disabled]="page() === 1" (click)="changePage(page() - 1)">
            {{ 'common.prev' | t }}</button
          ><span class="rounded-xl bg-white px-4 py-3 text-xs font-black text-slate-600 shadow-sm"
            >{{ 'common.page' | t }} {{ page() }}/{{ totalPages() }}</span
          ><button
            class="btn-secondary"
            [disabled]="page() === totalPages()"
            (click)="changePage(page() + 1)"
          >
            {{ 'common.next' | t }}
          </button>
        </div>
      }

      <!-- Modal Tạo phòng -->
      <app-modal
        [open]="createOpen()"
        [title]="'labs.createTitle' | t"
        [subtitle]="'labs.createSubtitle' | t"
        (close)="createOpen.set(false)"
      >
        <form class="grid gap-4 sm:grid-cols-2" (ngSubmit)="create()" ngNativeValidate>
          <div>
            <label class="field-label">{{ 'labs.roomName' | t }} *</label
            ><input
              class="input-shell"
              required
              [(ngModel)]="form.labName"
              name="labName"
              [placeholder]="'labs.roomNamePlaceholder' | t"
            />
          </div>
          <div>
            <label class="field-label">{{ 'labs.roomCode' | t }} *</label
            ><input
              class="input-shell"
              required
              [(ngModel)]="form.roomCode"
              name="roomCode"
              placeholder="LAB-AI-01"
            />
          </div>
          <div>
            <label class="field-label">{{ 'labs.location' | t }} *</label
            ><input
              class="input-shell"
              required
              [(ngModel)]="form.location"
              name="location"
              [placeholder]="'labs.locationPlaceholder' | t"
            />
          </div>
          <div>
            <label class="field-label">{{ 'labs.capacity' | t }} *</label
            ><input
              class="input-shell"
              type="number"
              min="1"
              required
              [(ngModel)]="form.capacity"
              name="capacity"
            />
          </div>
          <div class="sm:col-span-2">
            <label class="field-label">LabManager *</label
            ><select class="input-shell" required [(ngModel)]="form.managerId" name="managerId">
              <option [ngValue]="null">{{ 'labs.selectManager' | t }}</option>
              @for (manager of managers(); track manager.userId) {
                <option [ngValue]="manager.userId">
                  {{ manager.fullName }} · {{ manager.email }}
                </option>
              }
            </select>
          </div>
          <div class="sm:col-span-2">
            <label class="field-label">{{ 'common.description' | t }}</label
            ><textarea
              class="textarea-shell"
              [(ngModel)]="form.description"
              name="description"
              [placeholder]="'labs.descPlaceholder' | t"
            ></textarea>
          </div>
          <div class="sm:col-span-2">
            <label class="field-label">{{ 'common.imageUrl' | t }}</label
            ><input
              class="input-shell"
              [(ngModel)]="form.imageUrl"
              name="imageUrl"
              placeholder="https://..."
            />
          </div>
          <div class="sm:col-span-2">
            <label class="field-label">{{ 'common.usageGuideline' | t }}</label
            ><textarea
              class="textarea-shell"
              [(ngModel)]="form.usageGuideline"
              name="usageGuideline"
            ></textarea>
          </div>
          <div class="mt-2 flex justify-end gap-2 sm:col-span-2">
            <button type="button" class="btn-secondary" (click)="createOpen.set(false)">
              {{ 'common.cancel' | t }}
            </button
            ><button class="btn-primary" [disabled]="saving()">
              {{ saving() ? ('common.saving' | t) : ('labs.create' | t) }}
            </button>
          </div>
        </form>
      </app-modal>

      <!-- Modal Chỉnh sửa phòng -->
      <app-modal
        [open]="editOpen()"
        [title]="('common.editTitle' | t) + editingLab()?.labName"
        [subtitle]="'labs.editSubtitle' | t"
        (close)="editOpen.set(false)"
      >
        <form class="grid gap-4 sm:grid-cols-2" (ngSubmit)="save()" ngNativeValidate>
          @if (editingLab()?.status === 'Inactive') {
            <div
              class="flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50/90 p-3.5 text-xs leading-5 text-rose-950 sm:col-span-2"
            >
              <app-icon name="alert-triangle" [size]="18" class="mt-0.5 shrink-0 text-rose-600" />
              <div>
                <strong class="font-bold">Lưu ý về quy tắc Backend:</strong> Phòng lab này đang ở
                trạng thái <em>Ngừng hoạt động (Inactive)</em>. Backend hiện đang có quy tắc chặn
                cập nhật phòng ở trạng thái Inactive.
              </div>
            </div>
          }
          <div>
            <label class="field-label">{{ 'labs.name' | t }} *</label
            ><input class="input-shell" required [(ngModel)]="editForm.labName" name="elabName" />
          </div>
          <div>
            <label class="field-label">{{ 'labs.location' | t }} *</label
            ><input class="input-shell" required [(ngModel)]="editForm.location" name="elocation" />
          </div>
          <div>
            <label class="field-label">{{ 'labs.capacity' | t }} *</label
            ><input
              class="input-shell"
              type="number"
              min="1"
              required
              [(ngModel)]="editForm.capacity"
              name="ecapacity"
            />
          </div>
          <div>
            <label class="field-label">Manager</label
            ><select class="input-shell" [(ngModel)]="editManagerId" name="eManagerId">
              <option [ngValue]="null">{{ (editingLab() && 'managerName' in editingLab()! ? $any(editingLab()).managerName : null) || ('lab.unassigned' | t) }}</option>
              @for (manager of managers(); track manager.userId) {
                <option [ngValue]="manager.userId">{{ manager.fullName }}</option>
              }
            </select>
          </div>
          <div class="sm:col-span-2">
            <label class="field-label">{{ 'common.description' | t }}</label
            ><textarea
              class="textarea-shell"
              [(ngModel)]="editForm.description"
              name="edescription"
            ></textarea>
          </div>
          <div class="sm:col-span-2">
            <label class="field-label">{{ 'common.imageUrl' | t }}</label
            ><input class="input-shell" [(ngModel)]="editForm.imageUrl" name="eimageUrl" />
          </div>
          <div class="sm:col-span-2">
            <label class="field-label">{{ 'common.usageGuideline' | t }}</label
            ><textarea
              class="textarea-shell"
              [(ngModel)]="editForm.usageGuideline"
              name="eusageGuideline"
            ></textarea>
          </div>
          <div class="flex justify-between gap-2 sm:col-span-2">
            @if (editingLab()?.status === 'Inactive') {
              <div class="flex gap-2">
                <button
                  type="button"
                  class="btn-secondary text-emerald-700 hover:bg-emerald-50"
                  (click)="reactivateLab(editingLab()!)"
                >
                  <app-icon name="check" [size]="16" /> Active lại phòng
                </button>
                <button
                  type="button"
                  class="btn-secondary btn-danger"
                  (click)="permanentDeleteLab(editingLab()!)"
                >
                  <app-icon name="trash" [size]="16" /> Xóa vĩnh viễn khỏi DB
                </button>
              </div>
            } @else {
              <button
                type="button"
                class="btn-secondary btn-danger"
                (click)="removeLab(editingLab()!)"
              >
                <app-icon name="trash" [size]="16" /> {{ 'common.disable' | t }}
              </button>
            }
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
export class LabsPage implements OnInit {
  private readonly api = inject(SystemService)
  private readonly toast = inject(ToastService)
  private readonly cdr = inject(ChangeDetectorRef)
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
  protected editForm = {
    labName: '',
    location: '',
    capacity: 1,
    description: '',
    imageUrl: '',
    usageGuideline: '',
  }
  protected editManagerId: number | null = null

  ngOnInit(): void {
    this.load()
    if (this.store.isAdmin()) this.loadManagers()
  }

  protected getLabImage(lab?: LabRoomResponse | null): string {
    return getLabImageUrl(lab)
  }

  protected load(): void {
    this.loading.set(true)
    // Backend search API has broken filter logic, and /LabRooms doesn't exist.
    // Fetch all labs using searchLabs with pageSize=100 (backend max limit) and filter on frontend.
    this.api.searchLabs({ pageNumber: 1, pageSize: 100 }).subscribe({
      next: (result) => {
        let filtered = result.items || []

        if (!this.store.isAdmin()) {
          filtered = filtered.filter(
            (l) =>
              l.status !== 'Inactive' &&
              l.status !== '4' &&
              String(l.status).toLowerCase() !== 'inactive',
          )
        }

        if (this.keyword && this.keyword.trim().length > 0) {
          const kw = this.keyword.toLowerCase().trim()
          filtered = filtered.filter(
            (l) =>
              (l.labName && l.labName.toLowerCase().includes(kw)) ||
              (l.roomCode && l.roomCode.toLowerCase().includes(kw)) ||
              (l.location && l.location.toLowerCase().includes(kw)),
          )
        }

        if (this.status) {
          const statusStr = String(this.status)
          let targetStatus = ''
          if (statusStr === '1') targetStatus = 'Available'
          else if (statusStr === '2') targetStatus = 'Maintenance'
          else if (statusStr === '3') targetStatus = 'Unavailable'
          else if (statusStr === '4') targetStatus = 'Inactive'

          if (targetStatus) {
            filtered = filtered.filter((l) => l.status === targetStatus)
          }
        }

        if (this.minimumCapacity) {
          filtered = filtered.filter((l) => l.capacity >= this.minimumCapacity!)
        }

        const pageSize = 12
        this.totalPages.set(Math.ceil(filtered.length / pageSize) || 1)

        if (this.page() > this.totalPages()) this.page.set(this.totalPages())
        if (this.page() < 1) this.page.set(1)

        const pagedItems = filtered
          .slice((this.page() - 1) * pageSize, this.page() * pageSize)
          .map((l) => ({ ...l, _detailLoaded: false }))
        this.labs.set(pagedItems)
        this.loading.set(false)

        if (pagedItems.length) {
          from(
            pagedItems.map((lab, index) =>
              this.api.lab(lab.labId).pipe(
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
                const lab = enriched[res.index]
                enriched[res.index] = {
                  ...lab,
                  imageUrl: res.url || lab.imageUrl,
                  _detailLoaded: true,
                }
              })
              this.labs.set(enriched)
            })
        }
      },
      error: () => {
        this.loading.set(false)
        this.toast.error('Không tải được danh sách phòng lab')
      },
    })
  }

  protected changePage(page: number): void {
    this.page.set(page)
    this.load()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  protected openCreate(): void {
    this.form = this.emptyForm()
    this.createOpen.set(true)
  }

  protected create(): void {
    if (!this.form.managerId) {
      this.toast.info('Hãy chọn LabManager')
      return
    }
    this.saving.set(true)
    this.api
      .createLab({
        ...this.form,
        managerId: this.form.managerId,
        description: this.form.description || null,
        imageUrl: this.form.imageUrl || null,
        usageGuideline: this.form.usageGuideline || null,
      })
      .subscribe({
        next: () => {
          this.saving.set(false)
          this.createOpen.set(false)
          this.toast.success('Đã tạo phòng lab')
          this.load()
        },
        error: () => {
          this.saving.set(false)
          this.toast.error('Không thể tạo phòng lab')
        },
      })
  }

  protected openEdit(lab: LabRoomResponse): void {
    this.editingLab.set(lab)
    this.editForm = {
      labName: lab.labName,
      location: lab.location,
      capacity: lab.capacity,
      description: '',
      imageUrl: '',
      usageGuideline: '',
    }
    this.editManagerId = null
    this.editOpen.set(true)
    if (!this.managers().length) this.loadManagers()
    this.api.lab(lab.labId).subscribe({
      next: (detail) => {
        this.editForm.description = detail.description ?? ''
        this.editForm.imageUrl = detail.imageUrl ?? ''
        this.editForm.usageGuideline = detail.usageGuideline ?? ''
        const current = this.managers().find((m) => m.fullName === detail.managerName)
        this.editManagerId = current ? current.userId : null
        this.cdr.detectChanges()
      },
      error: () => {},
    })
  }

  protected save(): void {
    const lab = this.editingLab()
    if (!lab) return
    this.saving.set(true)
    this.api
      .updateLab(lab.labId, {
        labName: this.editForm.labName,
        location: this.editForm.location,
        capacity: this.editForm.capacity,
        description: this.editForm.description || null,
        imageUrl: this.editForm.imageUrl || null,
        usageGuideline: this.editForm.usageGuideline || null,
      })
      .subscribe({
        next: () => {
          if (this.editManagerId) {
            this.api.changeLabManager(lab.labId, this.editManagerId).subscribe({
              next: () => this.finishSave(),
              error: (err: any) => {
                this.saving.set(false)
                const msg =
                  err?.error?.message ||
                  (typeof err?.error === 'string' ? err.error : null) ||
                  err?.message ||
                  'Đã lưu thông tin nhưng chưa đổi được quản lý'
                this.toast.error('Không thể cập nhật quản lý phòng lab', msg)
              },
            })
          } else this.finishSave()
        },
        error: (err: any) => {
          this.saving.set(false)
          const msg =
            err?.error?.message ||
            (typeof err?.error === 'string' ? err.error : null) ||
            err?.message ||
            'Không thể cập nhật phòng lab'
          this.toast.error('Không thể cập nhật phòng lab', msg)
        },
      })
  }

  protected removeLab(lab: LabRoomResponse): void {
    if (!confirm(`Ngừng sử dụng phòng "${lab.labName}"?`)) return
    this.api.deleteLab(lab.labId).subscribe({
      next: () => {
        this.toast.success('Đã ngừng sử dụng phòng lab')
        this.editOpen.set(false)
        this.load()
      },
      error: (err: any) => {
        const msg =
          err?.error?.message ||
          (typeof err?.error === 'string' ? err.error : null) ||
          'Không thể ngừng sử dụng phòng'
        this.toast.error('Không thể ngừng sử dụng phòng', msg)
      },
    })
  }

  protected reactivateLab(lab: LabRoomResponse): void {
    if (!confirm(`Kích hoạt lại phòng "${lab.labName}"?`)) return
    this.api.reactivateLab(lab.labId).subscribe({
      next: () => {
        this.toast.success('Đã kích hoạt lại phòng lab')
        this.editOpen.set(false)
        this.load()
      },
      error: (err: any) => {
        const msg =
          err?.error?.message ||
          (typeof err?.error === 'string' ? err.error : null) ||
          'Backend chưa có API hỗ trợ kích hoạt lại (PUT /api/LabRooms/{id}/reactivate). Xem Dev Note.'
        this.toast.error('Không thể kích hoạt lại phòng lab', msg)
      },
    })
  }

  protected permanentDeleteLab(lab: LabRoomResponse): void {
    if (
      !confirm(
        `Xác nhận XÓA VĨNH VIỄN phòng "${lab.labName}" khỏi CSDL? Hành động này không thể hoàn tác!`,
      )
    )
      return
    this.api.permanentDeleteLab(lab.labId).subscribe({
      next: () => {
        this.toast.success('Đã xóa vĩnh viễn phòng lab khỏi CSDL')
        this.editOpen.set(false)
        this.load()
      },
      error: (err: any) => {
        const msg =
          err?.error?.message ||
          (typeof err?.error === 'string' ? err.error : null) ||
          'Backend chưa có API hỗ trợ xóa vĩnh viễn (DELETE /api/LabRooms/{id}/permanent). Xem Dev Note.'
        this.toast.error('Không thể xóa vĩnh viễn', msg)
      },
    })
  }

  private finishSave(): void {
    this.saving.set(false)
    this.editOpen.set(false)
    this.toast.success('Đã cập nhật phòng lab')
    this.load()
  }
  private loadManagers(): void {
    this.api
      .users({ roleName: 'LabManager', pageNumber: 1, pageSize: 15 })
      .subscribe({
        next: (result) => this.managers.set(result.items),
        error: () => this.managers.set([]),
      })
  }
  private emptyForm(): LabForm {
    return {
      labName: '',
      roomCode: '',
      location: '',
      capacity: 20,
      description: '',
      imageUrl: '',
      usageGuideline: '',
      managerId: null,
    }
  }
}
