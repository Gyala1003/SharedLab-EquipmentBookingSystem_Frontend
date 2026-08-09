import { DatePipe, NgClass } from '@angular/common'
import { Component, OnInit, computed, inject, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { ActivatedRoute, Router, RouterLink } from '@angular/router'
import { forkJoin } from 'rxjs'
import { SystemService } from '../../core/api/system.service'
import type {
  CalendarEventResponse,
  EquipmentResponse,
  LabRoomDetailResponse,
  LabRoomResponse,
  MaintenanceResponse,
  UserManagementResponse,
} from '../../core/api/system.models'
import { AuthStore } from '../../core/auth/auth.store'
import { TranslatePipe } from '../../core/i18n/translate.pipe'
import { DataStateComponent } from '../../shared/ui/data-state'
import { IconComponent } from '../../shared/ui/icon'
import { ModalComponent } from '../../shared/ui/modal'
import { PageHeaderComponent } from '../../shared/ui/page-header'
import { StatusBadgeComponent } from '../../shared/ui/status-badge'
import { ToastService } from '../../shared/ui/toast.service'
import { getLabImageUrl } from '../../shared/utils/presentation'

@Component({
  selector: 'app-lab-detail-page',
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
      @if (loading()) {
        <div class="card-surface p-7">
          <div class="skeleton h-7 w-2/5 rounded"></div>
          <div class="skeleton mt-4 h-52 rounded-3xl"></div>
        </div>
      } @else if (!lab()) {
        <app-data-state
          [title]="'lab.notFoundTitle' | t"
          [message]="'lab.notFoundMsg' | t"
          icon="building"
          ><a routerLink="/app/labs" class="btn-primary mt-5">{{
            'lab.backToList' | t
          }}</a></app-data-state
        >
      } @else {
        <app-page-header
          [title]="lab()!.labName | t"
          [subtitle]="lab()!.roomCode + ' · ' + (lab()!.location | t)"
        >
          @if (!store.isManager() && !store.isAdmin()) {
            <a
              [routerLink]="['/app/bookings/new']"
              [queryParams]="{ labId: lab()!.labId }"
              class="btn-primary"
              [class.opacity-50]="lab()!.status !== 'Available'"
              ><app-icon name="calendar-plus" [size]="17" /> {{ 'lab.bookFullRoom' | t }}</a
            >
          }
          @if (store.isManager()) {
            <a
              routerLink="/app/management/maintenances/new"
              [queryParams]="{ labId: lab()!.labId }"
              class="btn-secondary"
              ><app-icon name="wrench" [size]="17" /> {{ 'lab.scheduleMaintenance' | t }}</a
            >
          }
          @if (store.isAdmin()) {
            <button class="btn-secondary" (click)="openEdit()">
              <app-icon name="edit" [size]="17" /> {{ 'lab.edit' | t }}
            </button>
          }
        </app-page-header>

        @if (lab()!.status === 'Maintenance') {
          <div
            class="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900"
          >
            <app-icon name="wrench" [size]="20" class="shrink-0 text-amber-600" />
            <div>
              <p class="text-sm font-black">Phòng Lab này hiện đang có lịch bảo trì</p>
              <p class="text-xs text-amber-800/80">
                Không thể đăng ký mượn phòng trong khoảng thời gian bảo trì.
              </p>
            </div>
          </div>
        } @else if (lab()!.status === 'Inactive') {
          <div
            class="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-900"
          >
            <app-icon name="ban" [size]="20" class="shrink-0 text-rose-600" />
            <div>
              <p class="text-sm font-black">Phòng Lab này đã Ngừng hoạt động (Inactive)</p>
              <p class="text-xs text-rose-800/80">
                Phòng đã bị ngừng sử dụng trên hệ thống và không thể đăng ký mượn mới.
              </p>
            </div>
          </div>
        }

        <div class="grid gap-6 xl:grid-cols-[1.35fr_.65fr]">
          <article class="card-surface overflow-hidden">
            <div
              class="relative h-64 bg-gradient-to-br from-[#111a3a] via-indigo-950 to-violet-800 sm:h-80"
            >
              <img
                [src]="getLabImage(lab())"
                [alt]="lab()!.labName"
                class="h-full w-full object-cover"
              />
              <div
                class="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent"
              ></div>
              <div
                class="absolute right-0 bottom-0 left-0 flex items-end justify-between gap-4 p-6"
              >
                <div>
                  <p class="text-xs font-black tracking-[.2em] text-cyan-300 uppercase">
                    {{ lab()!.roomCode }}
                  </p>
                  <p class="mt-2 text-2xl font-black text-white">{{ lab()!.labName | t }}</p>
                </div>
                <app-status-badge [value]="lab()!.status" domain="lab" />
              </div>
            </div>
            <div class="grid gap-px bg-slate-100 sm:grid-cols-3">
              <div class="bg-white p-5">
                <p class="text-[10px] font-black tracking-[.15em] text-slate-400 uppercase">
                  {{ 'lab.location' | t }}
                </p>
                <p class="mt-2 font-bold text-slate-800">{{ lab()!.location | t }}</p>
              </div>
              <div class="bg-white p-5">
                <p class="text-[10px] font-black tracking-[.15em] text-slate-400 uppercase">
                  {{ 'lab.capacity' | t }}
                </p>
                <p class="mt-2 font-bold text-slate-800">
                  {{ lab()!.capacity }} {{ 'common.people' | t }}
                </p>
              </div>
              <div class="bg-white p-5">
                <p class="text-[10px] font-black tracking-[.15em] text-slate-400 uppercase">
                  {{ 'lab.manager' | t }}
                </p>
                <p class="mt-2 font-bold text-slate-800">
                  {{ lab()!.managerName || ('lab.unassigned' | t) }}
                </p>
              </div>
            </div>
          </article>

          <article class="card-surface p-6">
            <p class="text-xs font-black tracking-[.17em] text-violet-500 uppercase">
              {{ 'lab.overview' | t }}
            </p>
            <h2 class="mt-2 text-xl font-black text-slate-950">{{ 'lab.researchSpace' | t }}</h2>
            <p class="mt-4 text-sm leading-7 text-slate-500">{{ lab()!.description ?? '' | t }}</p>
            <div class="mt-6 rounded-2xl bg-slate-50 p-4">
              <p class="text-xs font-black text-slate-700">{{ 'lab.usageGuideline' | t }}</p>
              <p class="mt-2 text-sm leading-6 whitespace-pre-line text-slate-500">
                {{ lab()!.usageGuideline ?? '' | t }}
              </p>
            </div>
            <a
              routerLink="/app/calendar"
              [queryParams]="{ labId: lab()!.labId }"
              class="btn-secondary mt-5 w-full"
              ><app-icon name="calendar" [size]="17" /> {{ 'lab.viewSchedule' | t }}</a
            >
          </article>
        </div>

        <div class="flex gap-2 overflow-x-auto rounded-2xl bg-white p-1.5 shadow-sm">
          @for (item of tabs; track item.key) {
            <button
              type="button"
              class="shrink-0 rounded-xl px-4 py-2.5 text-xs font-black"
              [ngClass]="
                tab() === item.key
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-200'
                  : 'text-slate-500 hover:bg-slate-50'
              "
              (click)="tab.set(item.key)"
            >
              {{ item.labelKey | t }} <span class="ml-1 opacity-65">{{ item.count }}</span>
            </button>
          }
        </div>

        @if (tab() === 'equipment') {
          @if (equipments().length === 0) {
            <app-data-state
              [title]="'lab.emptyEquipmentTitle' | t"
              [message]="'lab.emptyEquipmentMsg' | t"
              icon="microscope"
            />
          } @else {
            <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              @for (item of equipments(); track item.equipmentId) {
                <a
                  [routerLink]="['/app/equipments', item.equipmentId]"
                  class="card-surface group flex items-center gap-4 p-5 transition hover:-translate-y-1"
                  ><div
                    class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
                    [ngClass]="
                      item.status === 'Inactive'
                        ? 'bg-red-50 text-red-600'
                        : item.status === 'Maintenance'
                          ? 'bg-indigo-50 text-indigo-600'
                          : item.status === 'Broken'
                            ? 'bg-orange-50 text-orange-600'
                            : 'bg-cyan-50 text-cyan-600'
                    "
                  >
                    <app-icon
                      [name]="
                        item.status === 'Inactive'
                          ? 'ban'
                          : item.status === 'Maintenance'
                            ? 'wrench'
                            : item.status === 'Broken'
                              ? 'triangle-alert'
                              : 'microscope'
                      "
                      [size]="22"
                    />
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="truncate font-black text-slate-900">{{ item.equipmentName | t }}</p>
                    <div class="mt-2">
                      <app-status-badge [value]="item.status" domain="equipment" />
                    </div>
                  </div>
                  <app-icon name="arrow-right" [size]="18"
                /></a>
              }
            </div>
          }
        } @else if (tab() === 'schedule') {
          @if (bookingEvents().length === 0) {
            <app-data-state
              [title]="'lab.emptyScheduleTitle' | t"
              [message]="'lab.emptyScheduleMsg' | t"
              icon="calendar"
            />
          } @else {
            <div class="card-surface divide-y divide-slate-100">
              @for (event of bookingEvents(); track event.sourceId) {
                <button
                  class="flex w-full items-center gap-4 px-5 py-4 text-left hover:bg-slate-50"
                  (click)="openEvent(event)"
                >
                  <div
                    class="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600"
                  >
                    <app-icon name="calendar" [size]="20" />
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="truncate font-black text-slate-900">{{ event.title }}</p>
                    <p class="mt-1 text-xs text-slate-400">
                      {{ event.startTime | date: 'HH:mm dd/MM/yyyy' }} –
                      {{ event.endTime | date: 'HH:mm dd/MM/yyyy' }}
                    </p>
                  </div>
                  <app-status-badge [value]="event.status" domain="booking" />
                </button>
              }
            </div>
          }
        } @else {
          @if (maintenances().length === 0) {
            <app-data-state
              [title]="'lab.emptyMaintenanceTitle' | t"
              [message]="'lab.emptyMaintenanceMsg' | t"
              icon="wrench"
            />
          } @else {
            <div class="grid gap-4 md:grid-cols-2">
              @for (item of maintenances(); track item.maintenanceId) {
                <a
                  [routerLink]="['/app/management/maintenances', item.maintenanceId]"
                  class="card-surface flex items-center gap-4 p-5 hover:-translate-y-1"
                  ><div
                    class="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600"
                  >
                    <app-icon name="wrench" [size]="21" />
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="font-black text-slate-900">
                      {{ 'lab.maintenanceItem' | t: { id: item.maintenanceId } }}
                    </p>
                    <p class="mt-1 text-xs text-slate-400">
                      {{ item.startTime | date: 'HH:mm dd/MM' }} –
                      {{ item.endTime | date: 'HH:mm dd/MM' }}
                    </p>
                  </div>
                  <app-status-badge [value]="item.status" domain="maintenance"
                /></a>
              }
            </div>
          }
        }

        <app-modal
          [open]="editOpen()"
          title="Chỉnh sửa phòng lab"
          subtitle="RoomCode không thể sửa bằng API hiện tại."
          (close)="editOpen.set(false)"
        >
          <form class="grid gap-4 sm:grid-cols-2" (ngSubmit)="save()">
            @if (lab()?.status === 'Inactive') {
              <div
                class="flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50/90 p-3.5 text-xs leading-5 text-rose-950 sm:col-span-2"
              >
                <app-icon name="alert-triangle" [size]="18" class="mt-0.5 shrink-0 text-rose-600" />
                <div>
                  <strong class="font-bold">Lưu ý về quy tắc Backend:</strong> Phòng lab này đang ở
                  trạng thái <em>Ngừng hoạt động (Inactive)</em>. Backend hiện chưa có API Kích hoạt
                  lại hoặc Xóa vĩnh viễn khỏi DB.
                </div>
              </div>
            }
            <div>
              <label class="field-label">Tên phòng</label
              ><input class="input-shell" [(ngModel)]="editForm.labName" name="labName" required />
            </div>
            <div>
              <label class="field-label">Vị trí</label
              ><input
                class="input-shell"
                [(ngModel)]="editForm.location"
                name="location"
                required
              />
            </div>
            <div>
              <label class="field-label">Sức chứa</label
              ><input
                class="input-shell"
                type="number"
                min="1"
                [(ngModel)]="editForm.capacity"
                name="capacity"
                required
              />
            </div>
            <div>
              <label class="field-label">Đổi LabManager</label
              ><select class="input-shell" [(ngModel)]="managerId" name="managerId">
                <option [ngValue]="null">Giữ nguyên</option>
                @for (manager of managers(); track manager.userId) {
                  <option [ngValue]="manager.userId">{{ manager.fullName }}</option>
                }
              </select>
            </div>
            <div class="sm:col-span-2">
              <label class="field-label">Mô tả</label
              ><textarea
                class="textarea-shell"
                [(ngModel)]="editForm.description"
                name="description"
              ></textarea>
            </div>
            <div class="sm:col-span-2">
              <label class="field-label">URL ảnh</label
              ><input class="input-shell" [(ngModel)]="editForm.imageUrl" name="imageUrl" />
            </div>
            <div class="sm:col-span-2">
              <label class="field-label">Hướng dẫn</label
              ><textarea
                class="textarea-shell"
                [(ngModel)]="editForm.usageGuideline"
                name="usageGuideline"
              ></textarea>
            </div>
            <div class="flex justify-between gap-2 sm:col-span-2">
              @if (lab()?.status === 'Inactive') {
                <div class="flex gap-2">
                  <button
                    type="button"
                    class="btn-secondary text-emerald-700 hover:bg-emerald-50"
                    (click)="reactivate()"
                  >
                    <app-icon name="check" [size]="16" /> Active lại phòng</button
                  ><button
                    type="button"
                    class="btn-secondary btn-danger"
                    (click)="permanentDelete()"
                  >
                    <app-icon name="trash" [size]="16" /> Xóa vĩnh viễn khỏi DB
                  </button>
                </div>
              } @else {
                <button type="button" class="btn-secondary btn-danger" (click)="remove()">
                  <app-icon name="trash" [size]="16" /> Ngừng sử dụng
                </button>
              }
              <div class="flex gap-2">
                <button type="button" class="btn-secondary" (click)="editOpen.set(false)">
                  Hủy</button
                ><button class="btn-primary" [disabled]="saving()">
                  {{ saving() ? 'Đang lưu...' : 'Lưu thay đổi' }}
                </button>
              </div>
            </div>
          </form>
        </app-modal>
      }
    </section>
  `,
})
export class LabDetailPage implements OnInit {
  private readonly api = inject(SystemService)
  private readonly route = inject(ActivatedRoute)
  private readonly router = inject(Router)
  private readonly toast = inject(ToastService)
  protected readonly store = inject(AuthStore)
  protected readonly lab = signal<LabRoomDetailResponse | null>(null)
  protected readonly equipments = signal<EquipmentResponse[]>([])
  protected readonly maintenances = signal<MaintenanceResponse[]>([])
  protected readonly events = signal<CalendarEventResponse[]>([])
  /** Only Booking events for the Schedule tab — Maintenance events are shown in the Maintenance tab. */
  protected readonly bookingEvents = computed(() =>
    this.events().filter((e) => e.eventType === 'Booking'),
  )
  protected readonly managers = signal<UserManagementResponse[]>([])
  protected readonly loading = signal(true)
  protected readonly saving = signal(false)
  protected readonly editOpen = signal(false)
  protected readonly tab = signal<'equipment' | 'schedule' | 'maintenance'>('equipment')
  protected readonly tabs = [
    { key: 'equipment' as const, labelKey: 'lab.tabs.equipment', count: 0 },
    { key: 'schedule' as const, labelKey: 'lab.tabs.schedule', count: 0 },
    { key: 'maintenance' as const, labelKey: 'lab.tabs.maintenance', count: 0 },
  ]
  protected editForm = {
    labName: '',
    location: '',
    capacity: 1,
    description: '',
    imageUrl: '',
    usageGuideline: '',
  }
  protected managerId: number | null = null
  private id = 0

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('labId'))
    this.load()
  }
  protected getLabImage(lab?: LabRoomDetailResponse | LabRoomResponse | null): string {
    return getLabImageUrl(lab)
  }
  protected openEdit(): void {
    const lab = this.lab()
    if (!lab) return
    this.editForm = {
      labName: lab.labName,
      location: lab.location,
      capacity: lab.capacity,
      description: lab.description ?? '',
      imageUrl: lab.imageUrl ?? '',
      usageGuideline: lab.usageGuideline ?? '',
    }
    this.managerId = null
    this.editOpen.set(true)
    if (!this.managers().length)
      this.api
        .users({ roleName: 'LabManager', pageSize: 15 })
        .subscribe((result) => this.managers.set(result.items))
  }
  protected save(): void {
    this.saving.set(true)
    this.api
      .updateLab(this.id, {
        labName: this.editForm.labName,
        location: this.editForm.location,
        capacity: this.editForm.capacity,
        description: this.editForm.description || null,
        imageUrl: this.editForm.imageUrl || null,
        usageGuideline: this.editForm.usageGuideline || null,
      })
      .subscribe({
        next: () => {
          if (this.managerId) {
            this.api.changeLabManager(this.id, this.managerId).subscribe({
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
  protected remove(): void {
    if (!confirm('Ngừng sử dụng phòng lab này?')) return
    this.api.deleteLab(this.id).subscribe({
      next: () => {
        this.toast.success('Đã ngừng sử dụng phòng lab')
        void this.router.navigate(['/app/labs'])
      },
      error: () => this.toast.error('Không thể ngừng sử dụng phòng'),
    })
  }
  protected reactivate(): void {
    if (!confirm('Kích hoạt lại phòng lab này?')) return
    this.api.reactivateLab(this.id).subscribe({
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
  protected permanentDelete(): void {
    if (
      !confirm('Xác nhận XÓA VĨNH VIỄN phòng lab này khỏi CSDL? Hành động này không thể hoàn tác!')
    )
      return
    this.api.permanentDeleteLab(this.id).subscribe({
      next: () => {
        this.toast.success('Đã xóa vĩnh viễn phòng lab khỏi CSDL')
        void this.router.navigate(['/app/labs'])
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
  protected openEvent(event: CalendarEventResponse): void {
    void this.router.navigate(
      event.eventType === 'Maintenance'
        ? ['/app/management/maintenances', event.sourceId]
        : ['/app/bookings', event.sourceId],
    )
  }
  private load(): void {
    const from = new Date()
    const to = new Date()
    to.setDate(to.getDate() + 30)
    forkJoin({
      lab: this.api.lab(this.id),
      equipments: this.api.equipmentsByLab(this.id),
      maintenances: this.api.maintenancesByLab(this.id),
      events: this.api.calendar(from.toISOString(), to.toISOString(), this.id),
    }).subscribe({
      next: ({ lab, equipments, maintenances, events }) => {
        this.lab.set(lab)
        const validEquipments = !this.store.isAdmin()
          ? equipments.filter(
              (e) =>
                e.status !== 'Inactive' &&
                e.status !== 'Retired' &&
                e.status !== '5' &&
                String(e.status).toLowerCase() !== 'inactive' &&
                String(e.status).toLowerCase() !== 'retired',
            )
          : equipments
        this.equipments.set(validEquipments)
        this.maintenances.set(maintenances)
        this.events.set(events)
        this.tabs[0].count = validEquipments.length
        this.tabs[1].count = events.filter((e) => e.eventType === 'Booking').length
        this.tabs[2].count = maintenances.length
        this.loading.set(false)
      },
      error: () => {
        this.loading.set(false)
        this.lab.set(null)
      },
    })
  }
  private finishSave(): void {
    this.saving.set(false)
    this.editOpen.set(false)
    this.toast.success('Đã cập nhật phòng lab')
    this.load()
  }
}
