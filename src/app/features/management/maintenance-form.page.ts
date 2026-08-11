import { NgClass } from '@angular/common'
import { ChangeDetectorRef, Component, OnInit, computed, inject, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { ActivatedRoute, Router, RouterLink } from '@angular/router'
import { catchError, forkJoin, map, of } from 'rxjs'
import { SystemService } from '../../core/api/system.service'
import type { EquipmentResponse, LabRoomResponse } from '../../core/api/system.models'
import { AuthStore } from '../../core/auth/auth.store'
import { LanguageStore } from '../../core/i18n/language.store'
import { IconComponent } from '../../shared/ui/icon'
import { PageHeaderComponent } from '../../shared/ui/page-header'
import { ToastService } from '../../shared/ui/toast.service'
import { toIso, toLocalDateTimeInput } from '../../shared/utils/presentation'
import { TranslatePipe } from '../../core/i18n/translate.pipe'

@Component({
  selector: 'app-maintenance-form-page',
  imports: [NgClass, FormsModule, RouterLink, PageHeaderComponent, IconComponent, TranslatePipe],
  template: `<section class="space-y-6">
    <app-page-header
      [title]="(editing() ? 'maintenanceForm.editTitle' : 'maintenanceForm.createTitle') | t"
      [subtitle]="'maintenanceForm.subtitle' | t"
      ><a routerLink="/app/management/maintenances" class="btn-secondary"
        ><app-icon name="arrow-left" [size]="17" /> {{ 'maintenanceForm.back' | t }}</a
      ></app-page-header
    >
    <div class="grid gap-6 xl:grid-cols-[1fr_360px]">
      <form class="card-surface p-5 sm:p-7" (ngSubmit)="submit()">
        <div class="flex items-start gap-4">
          <div
            class="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600"
          >
            <app-icon name="wrench" [size]="22" />
          </div>
          <div>
            <h2 class="text-xl font-black text-slate-950">{{ 'maintenanceForm.resourceAndTime' | t }}</h2>
            <p class="mt-1 text-sm text-slate-500">
              {{ 'maintenanceForm.conflictNotice' | t }}
            </p>
          </div>
        </div>
        <div class="mt-6 grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            class="rounded-[22px] border p-4 text-left"
            [ngClass]="
              resourceType === 'lab' ? 'border-violet-300 bg-violet-50' : 'border-slate-200'
            "
            (click)="setType('lab')"
          >
            <p class="font-black text-slate-900">{{ 'maintenanceForm.labMaintenance' | t }}</p>
            <p class="mt-1 text-xs text-slate-500">
              {{ 'maintenanceForm.labMaintenanceDesc' | t }}
            </p></button
          ><button
            type="button"
            class="rounded-[22px] border p-4 text-left"
            [ngClass]="
              resourceType === 'equipment' ? 'border-cyan-300 bg-cyan-50' : 'border-slate-200'
            "
            (click)="setType('equipment')"
          >
            <p class="font-black text-slate-900">{{ 'maintenanceForm.equipmentMaintenance' | t }}</p>
            <p class="mt-1 text-xs text-slate-500">{{ 'maintenanceForm.equipmentMaintenanceDesc' | t }}</p>
          </button>
        </div>
        @if (resourceType === 'lab') {
          <div class="mt-5">
            <label class="field-label">{{ 'maintenanceForm.labRoom' | t }} *</label>
            <select class="input-shell" required [(ngModel)]="labId" name="labId">
              <option [ngValue]="null">{{ 'maintenanceForm.selectLab' | t }}</option>
              @for (lab of labs(); track lab.labId) {
                <option [ngValue]="lab.labId">{{ (lab.labName | t) }} · {{ lab.roomCode }}</option>
              }
            </select>
          </div>
        } @else {
          <div class="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label class="field-label">{{ 'maintenanceForm.equipmentLab' | t }}</label>
              <select
                class="input-shell"
                [ngModel]="equipmentLabId"
                (ngModelChange)="onLabChange($event)"
                name="equipmentLabId"
              >
                <option [ngValue]="null">
                  {{ (store.isManager() && !store.isAdmin() ? 'maintenanceForm.allManagedLabs' : 'maintenanceForm.allLabs') | t }}
                </option>
                @for (lab of labs(); track lab.labId) {
                  <option [ngValue]="lab.labId">{{ (lab.labName | t) }}</option>
                }
              </select>
              <p class="mt-1.5 text-xs font-medium text-slate-400">
                {{ 'maintenanceForm.filterLabHint' | t }}
              </p>
            </div>
            <div>
              <label class="field-label">{{ 'maintenanceForm.equipment' | t }} *</label>
              <select
                class="input-shell"
                required
                [ngModel]="equipmentId"
                (ngModelChange)="onEquipmentChange($event)"
                name="equipmentId"
              >
                <option [ngValue]="null">{{ 'maintenanceForm.selectEquipment' | t }}</option>
                @for (eq of equipmentOptions(); track eq.equipmentId) {
                  <option [ngValue]="eq.equipmentId">
                    {{ (eq.equipmentName | t) }}{{ labNameFor(eq.labId) }}
                  </option>
                }
              </select>
              <p class="mt-1.5 text-xs font-medium text-slate-400">
                {{ 'maintenanceForm.autoAssignLabHint' | t }}
              </p>
            </div>
          </div>
        }
        <div class="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label class="field-label">{{ 'maintenanceForm.startTime' | t }} *</label>
            <input
              class="input-shell"
              type="datetime-local"
              required
              [min]="minStartTime"
              [(ngModel)]="startTime"
              name="startTime"
            />
            <p class="mt-1.5 text-xs font-medium text-slate-400">
              {{ 'maintenanceForm.startTimeHint' | t }}
            </p>
          </div>
          <div>
            <label class="field-label">{{ 'maintenanceForm.endTime' | t }} *</label>
            <input
              class="input-shell"
              type="datetime-local"
              required
              [min]="minEndTime"
              [(ngModel)]="endTime"
              name="endTime"
            />
            <p class="mt-1.5 text-xs font-medium text-slate-400">
              {{ 'maintenanceForm.endTimeHint' | t }}
            </p>
          </div>
          <div>
            <label class="field-label">{{ 'maintenanceForm.cost' | t }}</label
            ><input class="input-shell" type="number" min="0" [(ngModel)]="cost" name="cost" />
          </div>
          <div>
            <label class="field-label">{{ 'maintenanceForm.recurrenceType' | t }}</label
            ><select class="input-shell" [(ngModel)]="recurrenceType" name="recurrenceType">
              <option [ngValue]="0">{{ 'maintenanceForm.none' | t }}</option>
              <option [ngValue]="1">{{ 'maintenanceForm.daily' | t }}</option>
              <option [ngValue]="2">{{ 'maintenanceForm.weekly' | t }}</option>
              <option [ngValue]="3">{{ 'maintenanceForm.monthly' | t }}</option>
            </select>
          </div>
          @if (recurrenceType !== 0) {
            <div>
              <label class="field-label">{{ 'maintenanceForm.recurrenceInterval' | t }}</label
              ><input
                class="input-shell"
                type="number"
                min="1"
                [(ngModel)]="recurrenceInterval"
                name="recurrenceInterval"
              />
            </div>
            <div>
              <label class="field-label">{{ 'maintenanceForm.recurrenceEndDate' | t }}</label
              ><input
                class="input-shell"
                type="datetime-local"
                [(ngModel)]="recurrenceEndDate"
                name="recurrenceEndDate"
              />
            </div>
          }
        </div>
        <div class="mt-5">
          <label class="field-label">{{ 'maintenanceForm.notes' | t }}</label
          ><textarea
            class="textarea-shell"
            [(ngModel)]="notes"
            name="notes"
            [placeholder]="'maintenanceForm.notesPlaceholder' | t"
          ></textarea>
        </div>
        <div class="mt-7 flex justify-end gap-2">
          <a routerLink="/app/management/maintenances" class="btn-secondary">{{ 'maintenanceForm.cancel' | t }}</a
          ><button class="btn-primary" [disabled]="saving()">
            <app-icon name="save" [size]="17" />
            {{ (saving() ? 'maintenanceForm.saving' : editing() ? 'maintenanceForm.saveChanges' : 'maintenanceForm.createTitle') | t }}
          </button>
        </div>
      </form>
      <aside class="space-y-5">
        <article class="card-surface p-5">
          <p class="text-[10px] font-black tracking-[.16em] text-violet-500 uppercase">
            {{ 'maintenanceForm.checklistTitle' | t }}
          </p>
          <div class="mt-4 space-y-3">
            @for (rule of rules; track rule) {
              <div class="flex gap-3 text-sm text-slate-600">
                <span class="mt-0.5 text-emerald-500"><app-icon name="check" [size]="16" /></span
                ><span>{{ rule | t }}</span>
              </div>
            }
          </div>
        </article>
        <article class="rounded-[24px] border border-amber-200 bg-amber-50 p-5">
          <p class="font-black text-amber-900">{{ 'maintenanceForm.impactTitle' | t }}</p>
          <p class="mt-2 text-sm leading-6 text-amber-800/75">
            {{ 'maintenanceForm.impactDesc' | t }}
          </p>
        </article>
      </aside>
    </div>
  </section>`,
})
export class MaintenanceFormPage implements OnInit {
  private readonly api = inject(SystemService)
  private readonly route = inject(ActivatedRoute)
  private readonly router = inject(Router)
  private readonly toast = inject(ToastService)
  private readonly cdr = inject(ChangeDetectorRef)
  protected readonly store = inject(AuthStore)
  protected readonly languageStore = inject(LanguageStore)
  protected readonly labs = signal<LabRoomResponse[]>([])
  protected readonly equipments = signal<EquipmentResponse[]>([])
  protected readonly saving = signal(false)
  protected readonly editing = signal(false)
  protected resourceType: 'lab' | 'equipment' = 'lab'
  protected labId: number | null = null
  protected equipmentLabId: number | null = null
  protected equipmentId: number | null = null
  protected startTime = toLocalDateTimeInput(new Date(Date.now() + 60_000))
  protected endTime = toLocalDateTimeInput(new Date(Date.now() + (2 * 60 + 1) * 60_000))
  protected cost = 0
  protected notes = ''
  protected recurrenceType = 0
  protected recurrenceInterval = 1
  protected recurrenceEndDate = ''
  private id = 0

  protected get minStartTime(): string {
    return toLocalDateTimeInput(new Date(Date.now() + 60_000))
  }

  protected get minEndTime(): string {
    const start = this.startTime ? new Date(this.startTime) : new Date()
    return toLocalDateTimeInput(new Date(start.getTime() + 30 * 60 * 1000))
  }

  protected readonly equipmentOptions = computed(() =>
    this.equipmentLabId
      ? this.equipments().filter((x) => x.labId === this.equipmentLabId)
      : this.equipments(),
  )
  protected readonly rules = [
    'maintenanceForm.rule1',
    'maintenanceForm.rule2',
    'maintenanceForm.rule3',
    'maintenanceForm.rule4',
  ]
  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'))
    this.editing.set(Boolean(this.id))

    const user = this.store.user()
    const isManagerOnly = this.store.isManager() && !this.store.isAdmin() && user?.userId

    const labs$ = isManagerOnly
      ? this.api.searchLabs({ managerId: user.userId, pageSize: 100 }).pipe(
          map((res) => res.items || []),
          catchError(() => this.api.labs()),
        )
      : this.api.labs().pipe(catchError(() => of([])))

    forkJoin({
      labs: labs$,
      equipments: this.api.equipments().pipe(catchError(() => of([]))),
    }).subscribe(
      ({ labs, equipments }) => {
        let allowedLabs = labs as LabRoomResponse[]
        let allowedEquipments = equipments as EquipmentResponse[]

        if (isManagerOnly) {
          const allowedLabIds = new Set(allowedLabs.map((l) => l.labId))
          allowedEquipments = allowedEquipments.filter((eq) => allowedLabIds.has(eq.labId))
        }

        this.labs.set(allowedLabs)
        this.equipments.set(allowedEquipments)
        if (!this.id) {
          const query = this.route.snapshot.queryParamMap
          const labId = Number(query.get('labId'))
          const equipmentId = Number(query.get('equipmentId'))
          if (equipmentId > 0) {
            this.resourceType = 'equipment'
            this.equipmentId = equipmentId
            this.equipmentLabId =
              (allowedEquipments as any[])?.find((item: any) => item.equipmentId === equipmentId)?.labId ?? null
          } else if (labId > 0) {
            this.resourceType = 'lab'
            this.labId = labId
          }
          this.cdr.markForCheck()
          return
        }
        this.api.maintenance(this.id).subscribe({
          next: (item) => {
            this.resourceType = item.labId ? 'lab' : 'equipment'
            this.labId = item.labId
            this.equipmentId = item.equipmentId
            this.equipmentLabId =
              (allowedEquipments as any[])?.find((equipment: any) => equipment.equipmentId === item.equipmentId)?.labId ??
              (item.labId ? item.labId : null)
            this.startTime = toLocalDateTimeInput(item.startTime)
            this.endTime = toLocalDateTimeInput(item.endTime)
            this.cost = item.maintenanceCost
            this.notes = item.notes ?? ''
            const recIdx = ['None', 'Daily', 'Weekly', 'Monthly'].indexOf(item.recurrenceType)
            this.recurrenceType = recIdx >= 0 ? recIdx : 0
            this.recurrenceInterval = item.recurrenceInterval || 1
            this.recurrenceEndDate = item.recurrenceEndDate
              ? toLocalDateTimeInput(item.recurrenceEndDate)
              : ''

            this.cdr.markForCheck()
            this.cdr.detectChanges()
          },
          error: () => {
            this.toast.error(this.languageStore.t('maintenanceForm.loadError'))
            this.cdr.markForCheck()
          },
        })
      },
    )
  }
  protected setType(type: 'lab' | 'equipment'): void {
    this.resourceType = type
    if (type === 'lab') {
      this.equipmentId = null
      this.equipmentLabId = null
    } else this.labId = null
    this.cdr.markForCheck()
  }

  protected onLabChange(newLabId: number | null): void {
    this.equipmentLabId = newLabId
    if (this.equipmentId) {
      const selectedEq = this.equipments().find((e) => e.equipmentId === this.equipmentId)
      if (newLabId && selectedEq && selectedEq.labId !== newLabId) {
        this.equipmentId = null
      }
    }
    this.cdr.markForCheck()
  }

  protected onEquipmentChange(newEquipmentId: number | null): void {
    this.equipmentId = newEquipmentId
    if (newEquipmentId) {
      const selectedEq = this.equipments().find((e) => e.equipmentId === newEquipmentId)
      if (selectedEq && selectedEq.labId) {
        this.equipmentLabId = selectedEq.labId
      }
    }
    this.cdr.markForCheck()
  }

  protected labNameFor(labId: number): string {
    const lab = this.labs().find((l) => l.labId === labId)
    if (!lab) return ''
    const translatedLab = this.languageStore.t(lab.labName)
    const prefix = this.languageStore.isEn() ? 'Lab: ' : 'Phòng: '
    return ` (${prefix}${translatedLab})`
  }

  protected submit(): void {
    if (
      (this.resourceType === 'lab' && !this.labId) ||
      (this.resourceType === 'equipment' && !this.equipmentId)
    ) {
      this.toast.info(this.languageStore.t('maintenanceForm.selectResourceError'))
      return
    }

    const startMs = new Date(this.startTime).getTime()
    const endMs = new Date(this.endTime).getTime()
    const nowMs = Date.now()

    // 1. Start time must be at least 1 minute after current time (with 10s buffer for fast submit)
    if (startMs < nowMs + 50_000) {
      this.toast.error(this.languageStore.t('maintenanceForm.pastTimeError'))
      return
    }

    // 2. End time must be at least 30 minutes after start time
    const minEndMs = startMs + 30 * 60 * 1000
    if (endMs < minEndMs) {
      this.toast.error(this.languageStore.t('maintenanceForm.minDurationError'))
      return
    }

    const payload = {
      labId: this.resourceType === 'lab' ? this.labId : null,
      equipmentId: this.resourceType === 'equipment' ? this.equipmentId : null,
      startTime: toIso(this.startTime),
      endTime: toIso(this.endTime),
      maintenanceCost: this.cost,
      notes: this.notes || null,
      recurrenceType: this.recurrenceType,
      recurrenceInterval: this.recurrenceType === 0 ? 1 : this.recurrenceInterval,
      recurrenceEndDate:
        this.recurrenceType === 0 || !this.recurrenceEndDate ? null : toIso(this.recurrenceEndDate),
    }

    const completed = (maintenanceId: number, showReminder = false): void => {
      this.saving.set(false)
      this.toast.success(
        this.editing()
          ? this.languageStore.t('maintenanceForm.updateSuccess')
          : this.languageStore.t('maintenanceForm.createSuccess'),
      )
      if (showReminder) {
        this.toast.info(this.languageStore.t('maintenanceForm.reminderNotice'))
      }
      void this.router.navigate(['/app/management/maintenances', maintenanceId])
    }
    const failed = (): void => {
      this.saving.set(false)
      this.toast.error(
        this.languageStore.t('maintenanceForm.saveErrorTitle'),
        this.languageStore.t('maintenanceForm.saveErrorSub'),
      )
    }

    this.saving.set(true)
    if (this.editing()) {
      this.api
        .updateMaintenance(this.id, payload)
        .subscribe({ next: () => completed(this.id), error: failed })
      return
    }
    this.api
      .createMaintenance(payload)
      .subscribe({
        next: (result) => {
          const isFuture = new Date(this.startTime) > new Date()
          completed(result.maintenanceId, isFuture)
        },
        error: failed,
      })
  }
}
