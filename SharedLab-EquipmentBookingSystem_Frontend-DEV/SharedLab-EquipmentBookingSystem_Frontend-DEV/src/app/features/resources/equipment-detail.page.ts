import { DatePipe, NgClass } from '@angular/common'
import { Component, OnInit, inject, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { ActivatedRoute, Router, RouterLink } from '@angular/router'
import { catchError, map, of } from 'rxjs'
import { SystemService } from '../../core/api/system.service'
import type {
  CalendarEventResponse,
  EquipmentDetailResponse,
  EquipmentResponse,
  LabRoomDetailResponse,
  LabRoomResponse,
  MaintenanceResponse,
} from '../../core/api/system.models'
import { AuthStore } from '../../core/auth/auth.store'
import { TranslatePipe } from '../../core/i18n/translate.pipe'
import { DataStateComponent } from '../../shared/ui/data-state'
import { IconComponent } from '../../shared/ui/icon'
import { ModalComponent } from '../../shared/ui/modal'
import { PageHeaderComponent } from '../../shared/ui/page-header'
import { StatusBadgeComponent } from '../../shared/ui/status-badge'
import { ToastService } from '../../shared/ui/toast.service'
import { ConfirmDialogService } from '../../shared/ui/confirm-dialog'
import { getEquipmentImageUrl } from '../../shared/utils/presentation'

@Component({
  selector: 'app-equipment-detail-page',
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
          <div class="skeleton h-8 w-1/3 rounded"></div>
          <div class="skeleton mt-5 h-72 rounded-3xl"></div>
        </div>
      } @else if (accessDenied() || !item()) {
        <div
          class="mx-auto my-8 max-w-xl space-y-5 rounded-[28px] border border-amber-200 bg-amber-50/90 p-8 text-center shadow-lg backdrop-blur-sm sm:p-10"
        >
          <div
            class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 text-amber-700 shadow-inner"
          >
            <app-icon name="shield" [size]="32" />
          </div>

          <div>
            <span
              class="inline-block rounded-full bg-amber-200/60 px-3 py-1 text-[11px] font-black tracking-wider text-amber-900 uppercase"
            >
              HTTP 403 Forbidden
            </span>
            <h3 class="mt-2 text-2xl font-black text-slate-950 sm:text-3xl">
              {{ 'common.accessDeniedTitle' | t }}
            </h3>
            <p class="mt-2 text-sm text-slate-600">
              {{ 'common.accessDeniedSubtitle' | t }}
            </p>
          </div>

          <div class="flex flex-wrap justify-center gap-3 pt-2">
            <a
              routerLink="/app/equipments"
              class="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-700"
            >
              <app-icon name="arrow-left" [size]="15" /> {{ 'lab.backToList' | t }}
            </a>
          </div>
        </div>
      } @else {
        <app-page-header
          [title]="item()!.equipmentName | t"
          [subtitle]="
            ('nav.items.equipments' | t) +
            ' #' +
            item()!.equipmentId +
            ' · ' +
            ((lab()?.labName ?? '' | t) || ('nav.items.labs' | t) + ' #' + item()!.labId)
          "
        >
          @if (!store.isManager() && !store.isAdmin()) {
            <a
              routerLink="/app/bookings/new"
              [queryParams]="{ labId: item()!.labId, equipmentId: item()!.equipmentId }"
              class="btn-primary"
              [class.opacity-50]="item()!.status !== 'Available'"
              ><app-icon name="calendar-plus" [size]="17" /> {{ 'equipment.book' | t }}</a
            >
          }
          @if (store.isManager()) {
            <a
              routerLink="/app/management/maintenances/new"
              [queryParams]="{ equipmentId: item()!.equipmentId }"
              class="btn-secondary"
              ><app-icon name="wrench" [size]="17" /> {{ 'equipment.scheduleMaintenance' | t }}</a
            >
          }
          @if (store.isAdmin()) {
            <button class="btn-secondary" (click)="openEdit()">
              <app-icon name="edit" [size]="17" /> {{ 'equipment.edit' | t }}
            </button>
          }
        </app-page-header>

        @if (item()!.status !== 'Available') {
          <div
            class="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900"
          >
            <app-icon name="wrench" [size]="20" class="shrink-0 text-amber-600" />
            <div>
              <p class="text-sm font-black">{{ 'equipment.underMaintenanceTitle' | t }}</p>
              <p class="text-xs text-amber-800/80">{{ 'equipment.underMaintenanceMsg' | t }}</p>
            </div>
          </div>
        }

        <div class="grid gap-6 xl:grid-cols-[.8fr_1.2fr]">
          <article class="card-surface overflow-hidden">
            <div
              class="relative flex h-80 items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-900"
            >
              <img
                [src]="getEquipmentImage(item())"
                [alt]="item()!.equipmentName"
                class="h-full w-full object-cover"
                [class.grayscale]="item()!.status === 'Inactive' || item()!.status === 'Retired' || item()!.status === '5'"
              />
              @if (item()!.status === 'Inactive' || item()!.status === 'Retired' || item()!.status === '5') {
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
              }
              <div class="absolute top-5 left-5">
                <app-status-badge [value]="item()!.status" domain="equipment" />
              </div>
            </div>
          </article>
          <article class="card-surface p-6 sm:p-7">
            <p class="text-xs font-black tracking-[.18em] text-violet-500 uppercase">
              {{ 'equipment.techInfo' | t }}
            </p>
            <h2 class="mt-2 text-2xl font-black text-slate-950">{{ item()!.equipmentName | t }}</h2>
            <div class="mt-6 grid gap-4 sm:grid-cols-2">
              <div class="rounded-2xl bg-slate-50 p-4">
                <p class="text-[10px] font-black tracking-[.15em] text-slate-400 uppercase">
                  {{ 'equipment.locatedLab' | t }}
                </p>
                <a
                  [routerLink]="['/app/labs', item()!.labId]"
                  class="mt-2 block font-black text-violet-700 hover:text-violet-900"
                  >{{
                    (lab()?.labName ?? '' | t) || ('nav.items.labs' | t) + ' #' + item()!.labId
                  }}</a
                >
              </div>
              <div class="rounded-2xl bg-slate-50 p-4">
                <p class="text-[10px] font-black tracking-[.15em] text-slate-400 uppercase">
                  {{ 'equipment.code' | t }}
                </p>
                <p class="mt-2 font-black text-slate-800">
                  EQ-{{ item()!.equipmentId.toString().padStart(4, '0') }}
                </p>
              </div>
            </div>
            <div class="mt-5">
              <p class="text-xs font-black text-slate-700">{{ 'equipment.specs' | t }}</p>
              <p class="mt-2 text-sm leading-7 whitespace-pre-line text-slate-500">
                {{ item()!.modelSpecs ?? '' | t }}
              </p>
            </div>
            <div class="mt-5 rounded-2xl border border-cyan-100 bg-cyan-50/60 p-4">
              <p class="flex items-center gap-2 text-xs font-black text-cyan-800">
                <app-icon name="book-open" [size]="17" /> {{ 'equipment.usageGuideline' | t }}
              </p>
              <p class="mt-2 text-sm leading-6 whitespace-pre-line text-cyan-900/65">
                {{ item()!.usageGuideline ?? '' | t }}
              </p>
            </div>
          </article>
        </div>

        <div class="grid gap-6 xl:grid-cols-2">
          <article class="card-surface overflow-hidden">
            <header class="flex items-center justify-between border-b border-slate-100 px-5 py-5">
              <div>
                <h2 class="font-black text-slate-950">{{ 'equipment.next30Days' | t }}</h2>
                <p class="mt-1 text-xs text-slate-400">{{ 'equipment.scheduleSubtitle' | t }}</p>
              </div>
              <a
                routerLink="/app/calendar"
                [queryParams]="{ equipmentId: item()!.equipmentId }"
                class="text-xs font-black text-violet-600"
                >{{ 'equipment.viewAll' | t }}</a
              >
            </header>
            @if (events().length === 0) {
              <div class="p-5">
                <app-data-state
                  [title]="'equipment.emptyScheduleTitle' | t"
                  [message]="'equipment.emptyScheduleMsg' | t"
                  icon="calendar"
                />
              </div>
            } @else {
              <div class="divide-y divide-slate-100">
                @for (event of events().slice(0, 6); track event.eventType + event.sourceId) {
                  <button
                    class="flex w-full items-center gap-4 px-5 py-4 text-left hover:bg-slate-50"
                    (click)="openEvent(event)"
                  >
                    <div
                      class="flex h-10 w-10 items-center justify-center rounded-2xl"
                      [ngClass]="
                        event.eventType === 'Maintenance'
                          ? 'bg-amber-50 text-amber-600'
                          : 'bg-indigo-50 text-indigo-600'
                      "
                    >
                      <app-icon
                        [name]="event.eventType === 'Maintenance' ? 'wrench' : 'calendar'"
                        [size]="18"
                      />
                    </div>
                    <div class="min-w-0 flex-1">
                      <div class="flex flex-wrap items-center gap-2">
                        <p class="truncate text-sm font-black text-slate-800">
                          {{ event.title | t }}
                        </p>
                        @if (isFullRoomBooking(event)) {
                          <span
                            class="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-700"
                            >🏢 {{ 'equipment.fullRoomLock' | t }}</span
                          >
                        } @else if (isThisEquipmentBooking(event)) {
                          <span
                            class="rounded-full bg-cyan-100 px-2 py-0.5 text-[10px] font-bold text-cyan-700"
                            >🔬 {{ 'equipment.specificEquipLock' | t }}</span
                          >
                        }
                      </div>
                      <p class="mt-1 text-xs text-slate-400">
                        {{ event.startTime | date: 'HH:mm dd/MM' }} –
                        {{ event.endTime | date: 'HH:mm dd/MM' }}
                      </p>
                    </div>
                    <app-status-badge
                      [value]="event.status"
                      [domain]="event.eventType === 'Maintenance' ? 'maintenance' : 'booking'"
                    />
                  </button>
                }
              </div>
            }
          </article>
          <article class="card-surface overflow-hidden">
            <header class="border-b border-slate-100 px-5 py-5">
              <h2 class="font-black text-slate-950">{{ 'equipment.maintenanceHistory' | t }}</h2>
              <p class="mt-1 text-xs text-slate-400">{{ 'equipment.maintenanceHistorySub' | t }}</p>
            </header>
            @if (maintenances().length === 0) {
              <div class="p-5">
                <app-data-state
                  [title]="'equipment.emptyMaintenanceTitle' | t"
                  [message]="'equipment.emptyMaintenanceMsg' | t"
                  icon="wrench"
                />
              </div>
            } @else {
              <div class="divide-y divide-slate-100">
                @for (maintenance of maintenances().slice(0, 6); track maintenance.maintenanceId) {
                  <a
                    [routerLink]="['/app/management/maintenances', maintenance.maintenanceId]"
                    class="flex items-center gap-4 px-5 py-4 hover:bg-slate-50"
                    ><div
                      class="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600"
                    >
                      <app-icon name="wrench" [size]="18" />
                    </div>
                    <div class="min-w-0 flex-1">
                      <p class="font-black text-slate-800">
                        {{ 'lab.maintenanceItem' | t: { id: maintenance.maintenanceId } }}
                      </p>
                      <p class="mt-1 text-xs text-slate-400">
                        {{ maintenance.startTime | date: 'dd/MM/yyyy HH:mm' }}
                      </p>
                    </div>
                    <app-status-badge [value]="maintenance.status" domain="maintenance"
                  /></a>
                }
              </div>
            }
          </article>
        </div>

        <app-modal
          [open]="editOpen()"
          [title]="'equipments.editTitle' | t"
          [subtitle]="'equipments.editSubtitle' | t"
          (close)="editOpen.set(false)"
          ><form class="grid gap-4" (ngSubmit)="save()">
            @if (item()?.status === 'Inactive' || item()?.status === 'Retired') {
              <div
                class="flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50/90 p-3.5 text-xs leading-5 text-rose-950"
              >
                <app-icon name="alert-triangle" [size]="18" class="mt-0.5 shrink-0 text-rose-600" />
                <div>
                  <strong class="font-bold">Lưu ý về quy tắc Backend:</strong> Thiết bị này đang ở
                  trạng thái <em>Ngừng hoạt động (Retired/Inactive)</em>. Backend hiện đang có quy
                  tắc chặn cập nhật thiết bị ở trạng thái Retired.
                </div>
              </div>
            }
            <div>
              <label class="field-label">{{ 'equipments.name' | t }}</label
              ><input
                class="input-shell"
                required
                [(ngModel)]="form.equipmentName"
                name="equipmentName"
              />
            </div>
            <div>
              <label class="field-label">{{ 'labs.labRoom' | t }}</label
              ><select class="input-shell" required [(ngModel)]="form.labId" name="labId">
                @for (room of labs(); track room.labId) {
                  <option [ngValue]="room.labId">{{ room.labName }}</option>
                }
              </select>
            </div>
            <div>
              <label class="field-label">{{ 'equipments.modelSpecs' | t }}</label
              ><textarea
                class="textarea-shell"
                [(ngModel)]="form.modelSpecs"
                name="modelSpecs"
              ></textarea>
            </div>
            <div>
              <label class="field-label">{{ 'common.imageUrl' | t }}</label
              ><input class="input-shell" [(ngModel)]="form.imageUrl" name="imageUrl" />
            </div>
            <div>
              <label class="field-label">{{ 'common.usageGuideline' | t }}</label
              ><textarea
                class="textarea-shell"
                [(ngModel)]="form.usageGuideline"
                name="usageGuideline"
              ></textarea>
            </div>
            <div class="flex justify-between gap-2">
              <button type="button" class="btn-secondary btn-danger" (click)="remove()">
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
          </form></app-modal
        >
      }
    </section>
  `,
})
export class EquipmentDetailPage implements OnInit {
  private readonly api = inject(SystemService)
  private readonly route = inject(ActivatedRoute)
  private readonly router = inject(Router)
  private readonly toast = inject(ToastService)
  private readonly confirmDialog = inject(ConfirmDialogService)
  protected readonly store = inject(AuthStore)
  protected readonly item = signal<EquipmentDetailResponse | null>(null)
  protected readonly lab = signal<LabRoomDetailResponse | null>(null)
  protected readonly labs = signal<LabRoomResponse[]>([])
  protected readonly maintenances = signal<MaintenanceResponse[]>([])
  protected readonly events = signal<CalendarEventResponse[]>([])
  protected readonly loading = signal(true)
  protected readonly accessDenied = signal(false)
  protected readonly saving = signal(false)
  protected readonly editOpen = signal(false)
  protected form = { labId: 0, equipmentName: '', modelSpecs: '', imageUrl: '', usageGuideline: '' }
  private id = 0

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('equipmentId'))
    this.loading.set(true)
    this.api
      .equipment(this.id)
      .pipe(
        catchError(() =>
          this.api.searchEquipments({ pageSize: 100 }).pipe(
            map((res) => {
              const found = (res.items || []).find((e) => e.equipmentId === this.id)
              if (!found) throw new Error('Equipment not found')
              return {
                ...found,
                modelSpecs: (found as any).modelSpecs ?? null,
                imageUrl: found.imageUrl ?? null,
                usageGuideline: (found as any).usageGuideline ?? null,
              } as EquipmentDetailResponse
            }),
          ),
        ),
      )
      .subscribe({
        next: (item) => {
          if (
            (item.status === 'Inactive' || item.status === 'Retired' || item.status === '5') &&
            !this.store.isAdmin()
          ) {
            this.accessDenied.set(true)
            this.loading.set(false)
            return
          }
          this.item.set(item)
          this.loading.set(false)

          const from = new Date()
          const to = new Date()
          to.setDate(to.getDate() + 30)

          if (item.labId > 0) {
            this.api
              .lab(item.labId)
              .pipe(
                catchError(() =>
                  this.api.searchLabs({ pageNumber: 1, pageSize: 100 }).pipe(
                    map((res) => {
                      const found = (res.items || []).find((l) => l.labId === item.labId)
                      if (!found) throw new Error('Lab not found')
                      return {
                        ...found,
                        description: (found as any).description ?? null,
                        imageUrl: found.imageUrl ?? null,
                        usageGuideline: (found as any).usageGuideline ?? null,
                        managerName: (found as any).managerName ?? null,
                      } as LabRoomDetailResponse
                    }),
                    catchError(() => of(null)),
                  ),
                ),
              )
              .subscribe((lab) => {
                if (lab) this.lab.set(lab)
              })
          }

          if (this.store.isManager() || this.store.isAdmin()) {
            this.api
              .maintenancesByEquipment(this.id)
              .pipe(catchError(() => of([])))
              .subscribe((maintenances) => {
                this.maintenances.set(maintenances)
              })
          }

          this.api
            .calendar(from.toISOString(), to.toISOString(), undefined, this.id)
            .pipe(catchError(() => of([])))
            .subscribe((events) => {
              this.events.set(events)
            })
        },
        error: () => {
          this.loading.set(false)
          this.item.set(null)
        },
      })
  }
  protected getEquipmentImage(item?: EquipmentDetailResponse | EquipmentResponse | null): string {
    return getEquipmentImageUrl(item)
  }
  protected isFullRoomBooking(event: CalendarEventResponse): boolean {
    return event.resources.some((r) => r.resourceType === 'LabRoom')
  }
  // API-004: BE CalendarResourceResponse không có equipmentId; dùng resourceType + resourceId.
  protected isThisEquipmentBooking(event: CalendarEventResponse): boolean {
    return event.resources.some((r) => r.resourceType === 'Equipment' && r.resourceId === this.id)
  }
  protected openEdit(): void {
    const item = this.item()
    if (!item) return
    this.form = {
      labId: item.labId,
      equipmentName: item.equipmentName,
      modelSpecs: item.modelSpecs ?? '',
      imageUrl: item.imageUrl ?? '',
      usageGuideline: item.usageGuideline ?? '',
    }
    this.editOpen.set(true)
    if (!this.labs().length) this.api.labs().subscribe((items) => this.labs.set(items))
  }
  protected save(): void {
    this.saving.set(true)
    this.api
      .updateEquipment(this.id, {
        labId: this.form.labId,
        equipmentName: this.form.equipmentName,
        modelSpecs: this.form.modelSpecs || null,
        imageUrl: this.form.imageUrl || null,
        usageGuideline: this.form.usageGuideline || null,
      })
      .subscribe({
        next: () => {
          this.saving.set(false)
          this.editOpen.set(false)
          this.toast.success('Đã cập nhật thiết bị')
          window.location.reload()
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
  protected remove(): void {
    if (!confirm('Ngừng sử dụng thiết bị này?')) return
    this.api.deleteEquipment(this.id).subscribe({
      next: () => {
        this.toast.success('Đã ngừng sử dụng thiết bị')
        void this.router.navigate(['/app/equipments'])
      },
      error: () => {
        this.toast.error('Không thể ngừng sử dụng thiết bị')
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
}
