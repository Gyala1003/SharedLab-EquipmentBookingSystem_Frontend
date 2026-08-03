import { DatePipe, NgClass } from '@angular/common'
import { Component, OnInit, computed, inject, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { ActivatedRoute, Router, RouterLink } from '@angular/router'
import { forkJoin } from 'rxjs'
import { SystemService } from '../../core/api/system.service'
import type { BookingItemRequest, CalendarEventResponse, EquipmentResponse, LabRoomResponse, PriorityRuleResponse } from '../../core/api/system.models'
import { AuthStore } from '../../core/auth/auth.store'
import { LanguageStore } from '../../core/i18n/language.store'
import { TranslatePipe } from '../../core/i18n/translate.pipe'
import { DataStateComponent } from '../../shared/ui/data-state'
import { IconComponent } from '../../shared/ui/icon'
import { PageHeaderComponent } from '../../shared/ui/page-header'
import { StatusBadgeComponent } from '../../shared/ui/status-badge'
import { ToastService } from '../../shared/ui/toast.service'
import { labelOf, toIso } from '../../shared/utils/presentation'

interface SelectedResource {
  key: string
  resourceType: number
  labId: number | null
  equipmentId: number | null
  name: string
  note: string
}

export interface TimeSlot {
  id: number
  slotNumber: number
  startTimeStr: string
  endTimeStr: string
  label: string
}

export const FIXED_TIME_SLOTS: TimeSlot[] = [
  { id: 1, slotNumber: 1, startTimeStr: '07:50', endTimeStr: '09:50', label: 'Slot 1 (07:50 - 09:50)' },
  { id: 2, slotNumber: 2, startTimeStr: '10:00', endTimeStr: '12:20', label: 'Slot 2 (10:00 - 12:20)' },
  { id: 3, slotNumber: 3, startTimeStr: '12:50', endTimeStr: '15:10', label: 'Slot 3 (12:50 - 15:10)' },
  { id: 4, slotNumber: 4, startTimeStr: '15:20', endTimeStr: '17:40', label: 'Slot 4 (15:20 - 17:40)' },
]

export interface SlotWithStatus extends TimeSlot {
  isOccupied: boolean
  isSelected: boolean
  occupiedReason?: 'booking' | 'maintenance'
  maintenanceTitle?: string
}

@Component({
  selector: 'app-booking-form-page',
  imports: [DatePipe, NgClass, FormsModule, RouterLink, PageHeaderComponent, IconComponent, DataStateComponent, StatusBadgeComponent, TranslatePipe],
  template: `
    <section class="space-y-6">
      <app-page-header title="{{ 'bookingForm.title' | t }}" subtitle="{{ 'bookingForm.subtitle' | t }}">
        <a routerLink="/app/calendar" class="btn-secondary"><app-icon name="calendar" [size]="17" /> {{ 'bookingForm.checkCalendar' | t }}</a>
      </app-page-header>

      @if (store.user()?.status !== 'Active') {
        <div class="rounded-[24px] border border-amber-200 bg-amber-50 p-5 text-amber-900"><div class="flex gap-3"><app-icon name="alert" [size]="21" /><div><p class="font-black">{{ 'bookingForm.accountStatusRestrictedTitle' | t }}</p><p class="mt-1 text-sm leading-6 text-amber-800/75">{{ 'bookingForm.accountStatusRestrictedMsg' | t: { status: store.user()?.status ?? '' } }}</p></div></div></div>
      }

      <div class="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div class="space-y-6">
          <div class="card-surface p-3 sm:p-4"><div class="grid grid-cols-4 gap-2">@for (item of steps(); track item.id) { <button type="button" class="relative rounded-2xl px-2 py-3 text-center transition" [ngClass]="step() === item.id ? 'bg-violet-600 text-white shadow-lg shadow-violet-200' : step() > item.id ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-400'" (click)="goTo(item.id)"><span class="mx-auto flex h-8 w-8 items-center justify-center rounded-full border border-current/20 text-xs font-black">{{ step() > item.id ? '✓' : item.id }}</span><span class="mt-2 hidden text-[10px] font-black uppercase tracking-[.08em] sm:block">{{ item.labelKey | t }}</span></button> }</div></div>

          @if (step() === 1) {
            <article class="card-surface p-5 sm:p-7">
              <!-- Header -->
              <div class="flex items-start gap-4">
                <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                  <app-icon name="building" [size]="23" />
                </div>
                <div>
                  <h2 class="text-xl font-black text-slate-950">{{ 'bookingForm.step1.title' | t }}</h2>
                  <p class="mt-1 text-sm text-slate-500">{{ 'bookingForm.step1.subtitle' | t }}</p>
                </div>
              </div>

              <!-- Section label -->
              <div class="mt-7">
                <p class="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">{{ 'bookingForm.step1.selectLabTitle' | t }}</p>

                <!-- Lab status legend -->
                <div class="mb-4 flex flex-wrap items-center gap-3 text-[11px] font-bold text-slate-500">
                  <span class="inline-flex items-center gap-1.5"><span class="h-2.5 w-2.5 rounded-full bg-emerald-400"></span> {{ 'bookingForm.step1.statusAvailable' | t }}</span>
                  <span class="inline-flex items-center gap-1.5"><span class="h-2.5 w-2.5 rounded-full bg-rose-400"></span> {{ 'bookingForm.step1.statusInUse' | t }}</span>
                  <span class="inline-flex items-center gap-1.5"><span class="h-2.5 w-2.5 rounded-full bg-amber-400"></span> {{ 'bookingForm.step1.statusMaintenance' | t }}</span>
                  <span class="inline-flex items-center gap-1.5"><span class="h-2.5 w-2.5 rounded-full bg-slate-300"></span> {{ 'bookingForm.step1.statusUnavailable' | t }}</span>
                </div>

                <!-- Lab Cards Grid -->
                <div class="grid gap-3 sm:grid-cols-2">
                  @for (lab of labs(); track lab.labId) {
                    <button
                      type="button"
                      class="group relative flex items-center gap-4 rounded-[20px] border p-4 text-left transition duration-200"
                      [ngClass]="{
                        'border-violet-400 bg-gradient-to-br from-violet-50 to-indigo-50 shadow-md ring-2 ring-violet-400/30': labId() === lab.labId,
                        'border-slate-200 bg-white hover:border-violet-200 hover:bg-slate-50/80 hover:shadow-sm': labId() !== lab.labId && lab.status === 'Available',
                        'border-slate-100 bg-slate-50/60 cursor-not-allowed opacity-60': lab.status !== 'Available'
                      }"
                      [disabled]="lab.status !== 'Available'"
                      (click)="selectLab(lab)"
                    >
                      <!-- Icon -->
                      <span
                        class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-sm transition"
                        [ngClass]="{
                          'bg-violet-600 text-white': labId() === lab.labId,
                          'bg-emerald-50 text-emerald-600': labId() !== lab.labId && lab.status === 'Available',
                          'bg-rose-50 text-rose-400': lab.status === 'InUse',
                          'bg-amber-50 text-amber-500': lab.status === 'UnderMaintenance',
                          'bg-slate-100 text-slate-400': lab.status !== 'Available' && lab.status !== 'InUse' && lab.status !== 'UnderMaintenance'
                        }"
                      >
                        <app-icon name="building" [size]="21" />
                      </span>

                      <!-- Info -->
                      <div class="min-w-0 flex-1">
                        <p class="truncate font-black text-slate-900 text-sm">{{ lab.labName | t }}</p>
                        <p class="mt-0.5 text-[11px] font-semibold text-slate-400">{{ lab.roomCode }}</p>
                        <!-- Status badge -->
                        <div class="mt-1.5">
                          @if (lab.status === 'Available') {
                            <span class="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-black text-emerald-700 border border-emerald-200">
                              <span class="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              {{ 'bookingForm.step1.badgeAvailable' | t }}
                            </span>
                          } @else if (lab.status === 'InUse') {
                            <span class="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-[10px] font-black text-rose-700 border border-rose-200">
                              <span class="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
                              {{ 'bookingForm.step1.badgeInUse' | t }}
                            </span>
                          } @else if (lab.status === 'UnderMaintenance') {
                            <span class="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-black text-amber-700 border border-amber-200">
                              <span class="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                              {{ 'bookingForm.step1.badgeMaintenance' | t }}
                            </span>
                          } @else {
                            <span class="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-black text-slate-500 border border-slate-200">
                              <span class="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
                              {{ lab.status }}
                            </span>
                          }
                        </div>
                      </div>

                      <!-- Selected checkmark -->
                      @if (labId() === lab.labId) {
                        <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-600 text-white shadow-sm">
                          <app-icon name="check" [size]="15" />
                        </div>
                      }
                    </button>
                  }
                </div>
              </div>

              <!-- Selected Lab Detail + Note + Equipment Toggle -->
              @if (labId() && selectedLab()) {
                <div class="mt-6 rounded-[24px] border border-violet-200 bg-gradient-to-br from-violet-50/80 to-indigo-50/60 p-5 space-y-5">
                  <!-- Lab info row -->
                  <div class="flex items-center gap-3">
                    <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                      <app-icon name="building" [size]="19" />
                    </span>
                    <div>
                      <p class="font-black text-violet-900">{{ selectedLab()!.labName | t }}</p>
                      <p class="text-xs text-violet-600/70">{{ selectedLab()!.roomCode }} · {{ 'labs.capacity' | t }}: {{ selectedLab()!.capacity }} {{ 'common.people' | t }}</p>
                    </div>
                  </div>

                  <!-- Note field -->
                  <div>
                    <label class="field-label">{{ 'bookingForm.step1.roomNoteLabel' | t }}</label>
                    <input class="input-shell bg-white" [ngModel]="labNote" (ngModelChange)="onLabNoteChange($event)" placeholder="{{ 'bookingForm.step1.roomNotePlaceholder' | t }}" />
                  </div>

                  <!-- Equipment section toggle -->
                  <div class="rounded-2xl border border-violet-200/70 bg-white/70 p-4">
                    <button
                      type="button"
                      class="flex w-full items-center justify-between gap-3 text-left"
                      (click)="toggleAddEquipment()"
                    >
                      <div class="flex items-center gap-3">
                        <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 shadow-sm">
                          <app-icon name="microscope" [size]="18" />
                        </span>
                        <div>
                          <p class="font-black text-slate-900 text-sm">{{ 'bookingForm.step1.addEquipmentTitle' | t }}</p>
                          <p class="mt-0.5 text-xs text-slate-500">{{ 'bookingForm.step1.addEquipmentSubtitle' | t }}</p>
                        </div>
                      </div>
                      <!-- Toggle switch -->
                      <div
                        class="relative h-6 w-11 rounded-full transition-colors duration-200"
                        [ngClass]="addEquipment() ? 'bg-cyan-500' : 'bg-slate-200'"
                      >
                        <div
                          class="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-200"
                          [ngClass]="addEquipment() ? 'translate-x-5' : 'translate-x-0.5'"
                        ></div>
                      </div>
                    </button>

                    <!-- Equipment list (shown when toggle is on) -->
                    @if (addEquipment()) {
                      <div class="mt-4 border-t border-slate-100 pt-4">
                        <div class="flex items-center justify-between mb-3">
                          <p class="text-xs font-black text-slate-700">{{ 'bookingForm.step1.equipmentsInLab' | t: { name: (selectedLab()!.labName | t) } }}</p>
                          <span class="rounded-full bg-cyan-50 px-3 py-0.5 text-[11px] font-black text-cyan-700 border border-cyan-200">
                            {{ selectedEquipmentCount() }} {{ 'bookingForm.step1.selectedCount' | t }}
                          </span>
                        </div>
                        @if (availableEquipments().length === 0) {
                          <app-data-state
                            title="{{ 'bookingForm.step1.noEquipment' | t }}"
                            message="{{ 'bookingForm.step1.noEquipmentMsg' | t }}"
                            icon="microscope"
                          />
                        } @else {
                          <div class="grid gap-2 sm:grid-cols-2">
                            @for (equipment of availableEquipments(); track equipment.equipmentId) {
                              <button
                                type="button"
                                class="flex items-center gap-3 rounded-xl border p-3 text-left transition"
                                [ngClass]="isEquipmentSelected(equipment.equipmentId)
                                  ? 'border-cyan-300 bg-cyan-50 shadow-sm'
                                  : equipment.status === 'Available'
                                    ? 'border-slate-200 bg-white hover:border-cyan-200 hover:bg-cyan-50/30'
                                    : 'border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed'"
                                [disabled]="equipment.status !== 'Available'"
                                (click)="toggleEquipment(equipment)"
                              >
                                <span
                                  class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg shadow-sm"
                                  [ngClass]="isEquipmentSelected(equipment.equipmentId) ? 'bg-cyan-500 text-white' : 'bg-white text-cyan-600'"
                                >
                                  <app-icon name="microscope" [size]="16" />
                                </span>
                                <span class="min-w-0 flex-1">
                                  <span class="block truncate text-sm font-black text-slate-900">{{ equipment.equipmentName | t }}</span>
                                  @if (equipment.status !== 'Available') {
                                    <span class="mt-0.5 block text-[10px] font-bold text-rose-500">{{ 'bookingForm.step1.statusUnavailable' | t }}</span>
                                  } @else {
                                    <span class="mt-0.5 block text-[10px] font-bold text-emerald-600">{{ 'bookingForm.step1.badgeAvailable' | t }}</span>
                                  }
                                </span>
                                @if (isEquipmentSelected(equipment.equipmentId)) {
                                  <span class="shrink-0 text-cyan-600">
                                    <app-icon name="check" [size]="16" />
                                  </span>
                                }
                              </button>
                            }
                          </div>
                        }
                      </div>
                    }
                  </div>
                </div>
              }

              <div class="mt-7 flex justify-end">
                <button class="btn-primary" [disabled]="selected().length === 0" (click)="goToStep2()">
                  {{ 'common.next' | t }} <app-icon name="arrow-right" [size]="17" />
                </button>
              </div>
            </article>
          }

          @if (step() === 2) {
            <article class="card-surface p-5 sm:p-7">
              <div class="flex items-start gap-4">
                <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
                  <app-icon name="clock" [size]="23" />
                </div>
                <div>
                  <h2 class="text-xl font-black text-slate-950">{{ 'bookingForm.step2.title' | t }}</h2>
                  <p class="mt-1 text-sm text-slate-500">{{ 'bookingForm.step2.subtitle' | t }}</p>
                </div>
              </div>

              <!-- 2-COLUMN LAYOUT -->
              <div class="mt-6 grid gap-6 lg:grid-cols-12">
                <!-- LEFT COLUMN: Date Picker & Day's Bookings Schedule -->
                <div class="space-y-4 lg:col-span-6">
                  <div class="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                    <label class="field-label flex items-center justify-between">
                      <span>{{ 'bookingForm.step2.dateLabel' | t }}</span>
                      <span class="text-xs font-bold text-violet-600">
                        {{ 'bookingForm.step2.userQuota' | t: { current: userDayBookingsCount(), max: 2 } }}
                      </span>
                    </label>
                    <input
                      class="input-shell bg-white"
                      type="date"
                      [min]="minDate"
                      [(ngModel)]="bookingDate"
                      (ngModelChange)="onDateChange()"
                    />
                  </div>

                  @if (userMaxLimitReached()) {
                    <div class="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
                      <div class="flex items-center gap-2.5 font-black text-xs sm:text-sm">
                        <app-icon name="alert" [size]="18" class="text-amber-600 shrink-0" />
                        <span>{{ 'bookingForm.step2.userLimitReached' | t }}</span>
                      </div>
                    </div>
                  }

                  <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div class="flex items-center justify-between border-b border-slate-100 pb-3">
                      <h3 class="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-700">
                        <app-icon name="calendar" [size]="16" class="text-violet-500" />
                        <span>{{ 'bookingForm.step2.dayEventsTitle' | t }}</span>
                      </h3>
                      <span class="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-black text-slate-600">
                        {{ dayEvents().length }} {{ 'bookingForm.step2.eventsCount' | t }}
                      </span>
                    </div>

                    <div class="mt-3 space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
                      @if (dayEventsLoading()) {
                        <div class="py-6 text-center text-xs text-slate-400 font-medium">
                          {{ 'bookingForm.step2.loadingSchedule' | t }}
                        </div>
                      } @else if (dayEvents().length === 0) {
                        <div class="rounded-xl border border-dashed border-slate-200 p-5 text-center">
                          <app-icon name="check" [size]="24" class="mx-auto text-emerald-500" />
                          <p class="mt-2 text-xs font-bold text-slate-700">{{ 'bookingForm.step2.noEventsToday' | t }}</p>
                          <p class="mt-1 text-[11px] text-slate-400">{{ 'bookingForm.step2.allSlotsFree' | t }}</p>
                        </div>
                      } @else {
                        @for (event of dayEvents(); track event.sourceId + event.eventType) {
                          <div class="flex items-center justify-between rounded-xl border border-slate-150 bg-slate-50/80 p-3 transition hover:bg-slate-50">
                            <div class="min-w-0 flex-1">
                              <div class="flex items-center gap-2">
                                <span class="rounded-md bg-violet-100 px-2 py-0.5 text-[10px] font-black text-violet-800">
                                  {{ event.startTime | date:'HH:mm' }} - {{ event.endTime | date:'HH:mm' }}
                                </span>
                                <span class="truncate text-xs font-bold text-slate-900">{{ event.title }}</span>
                              </div>
                            </div>
                            <app-status-badge [value]="event.status" [domain]="event.eventType === 'Maintenance' ? 'maintenance' : 'booking'" />
                          </div>
                        }
                      }
                    </div>
                  </div>
                </div>

                <!-- RIGHT COLUMN: 4 Fixed Time Slots Selection -->
                <div class="space-y-4 lg:col-span-6">
                  <div class="flex items-center justify-between">
                    <h3 class="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                      <app-icon name="clock" [size]="16" class="text-cyan-500" />
                      <span>{{ 'bookingForm.step2.selectSlotTitle' | t }}</span>
                    </h3>
                    <span class="text-[11px] font-extrabold text-slate-400">
                      {{ 'bookingForm.step2.fixedSlotsHint' | t }}
                    </span>
                  </div>

                  <div class="grid gap-3">
                    @for (slot of slotsWithStatus(); track slot.id) {
                      <button
                        type="button"
                        class="group relative flex items-center justify-between rounded-2xl border p-4 text-left transition duration-200"
                        [ngClass]="{
                          'border-amber-300 bg-amber-50/90 text-amber-950 shadow-sm cursor-not-allowed': slot.isOccupied && slot.occupiedReason === 'maintenance',
                          'border-slate-200 bg-slate-100/70 text-slate-400 cursor-not-allowed opacity-75': slot.isOccupied && slot.occupiedReason !== 'maintenance',
                          'border-violet-600 bg-violet-50/90 text-violet-950 shadow-md ring-2 ring-violet-500/20': slot.isSelected && !slot.isOccupied,
                          'border-slate-200 bg-white hover:border-violet-300 hover:bg-slate-50/80 text-slate-800 shadow-sm': !slot.isSelected && !slot.isOccupied
                        }"
                        [disabled]="slot.isOccupied"
                        (click)="selectSlot(slot)"
                      >
                        <div class="flex items-center gap-3.5 min-w-0">
                          <div
                            class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-black text-xs transition"
                            [ngClass]="{
                              'bg-amber-500 text-white shadow-sm': slot.isOccupied && slot.occupiedReason === 'maintenance',
                              'bg-slate-200 text-slate-500': slot.isOccupied && slot.occupiedReason !== 'maintenance',
                              'bg-violet-600 text-white shadow-sm': slot.isSelected && !slot.isOccupied,
                              'bg-violet-100 text-violet-700 group-hover:bg-violet-200': !slot.isSelected && !slot.isOccupied
                            }"
                          >
                            @if (slot.isOccupied && slot.occupiedReason === 'maintenance') {
                              <app-icon name="wrench" [size]="18" />
                            } @else {
                              S{{ slot.slotNumber }}
                            }
                          </div>
                          <div class="min-w-0">
                            <p class="font-extrabold text-sm leading-tight">
                              Slot {{ slot.slotNumber }} ({{ slot.startTimeStr }} – {{ slot.endTimeStr }})
                            </p>
                            <p class="mt-1 text-xs font-semibold"
                              [ngClass]="{
                                'text-amber-800 font-bold': slot.isOccupied && slot.occupiedReason === 'maintenance',
                                'text-rose-600': slot.isOccupied && slot.occupiedReason !== 'maintenance',
                                'text-violet-700': slot.isSelected && !slot.isOccupied,
                                'text-slate-400': !slot.isSelected && !slot.isOccupied
                              }"
                            >
                              @if (slot.isOccupied && slot.occupiedReason === 'maintenance') {
                                 {{ 'bookingForm.step2.slotUnderMaintenance' | t }}
                              } @else if (slot.isOccupied) {
                                 {{ 'bookingForm.step2.slotOccupied' | t }}
                              } @else if (slot.isSelected) {
                                 {{ 'bookingForm.step2.slotSelected' | t }}
                              } @else {
                                 {{ 'bookingForm.step2.slotAvailable' | t }}
                              }
                            </p>
                          </div>
                        </div>

                        @if (slot.isSelected && !slot.isOccupied) {
                          <div class="flex h-7 w-7 items-center justify-center rounded-full bg-violet-600 text-white shadow-sm">
                            <app-icon name="check" [size]="16" />
                          </div>
                        }
                      </button>
                    }
                  </div>

                  @if (selectedSlotIds().length > 0) {
                    <div class="rounded-2xl border border-violet-200 bg-violet-50/80 p-4">
                      <div class="flex items-center justify-between text-xs font-bold text-violet-900">
                        <span>{{ 'bookingForm.step2.selectedTimeRange' | t }}:</span>
                        <span class="rounded-lg bg-white px-3 py-1 font-black text-violet-700 shadow-sm border border-violet-100">
                          {{ formattedSelectedRange() }}
                        </span>
                      </div>
                    </div>
                  }
                </div>
              </div>

              <!-- Navigation Buttons -->
              <div class="mt-7 flex justify-between border-t border-slate-100 pt-5">
                <button class="btn-secondary" (click)="step.set(1)">
                  <app-icon name="arrow-left" [size]="17" /> {{ 'common.back' | t }}
                </button>
                <button class="btn-primary" [disabled]="!validSlotSelection()" (click)="step.set(3)">
                  {{ 'common.next' | t }} <app-icon name="arrow-right" [size]="17" />
                </button>
              </div>
            </article>
          }

          @if (step() === 3) {
            <article class="card-surface p-5 sm:p-7"><div class="flex items-start gap-4"><div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600"><app-icon name="sparkles" [size]="23" /></div><div><h2 class="text-xl font-black text-slate-950">{{ 'bookingForm.step3.title' | t }}</h2><p class="mt-1 text-sm text-slate-500">{{ 'bookingForm.step3.subtitle' | t }}</p></div></div><div class="mt-6 grid gap-3 sm:grid-cols-2">@for (purpose of purposesList(); track purpose.value) { <button type="button" class="rounded-2xl border p-4 text-left transition" [ngClass]="purposeType === purpose.value ? 'border-violet-300 bg-violet-50 shadow-sm' : 'border-slate-200 hover:border-violet-200'" (click)="purposeType = purpose.value"><div class="flex items-start justify-between gap-3"><div><p class="font-black text-slate-900">{{ purpose.label }}</p><p class="mt-1 text-xs leading-5 text-slate-500">{{ purpose.description }}</p></div><span class="rounded-full bg-white px-2.5 py-1 text-[10px] font-black text-violet-700 shadow-sm">P{{ priorityFor(purpose.key) }}</span></div></button> }</div><div class="mt-5"><label class="field-label">{{ 'bookingForm.step3.descLabel' | t }}</label><textarea class="textarea-shell min-h-36" [(ngModel)]="purposeDescription" placeholder="{{ 'bookingForm.step3.descPlaceholder' | t }}"></textarea></div><div class="mt-7 flex justify-between"><button class="btn-secondary" (click)="step.set(2)"><app-icon name="arrow-left" [size]="17" /> {{ 'common.back' | t }}</button><button class="btn-primary" [disabled]="!purposeDescription.trim()" (click)="step.set(4)">{{ 'bookingForm.step3.reviewBtn' | t }} <app-icon name="arrow-right" [size]="17" /></button></div></article>
          }

          @if (step() === 4) {
            <article class="card-surface p-5 sm:p-7"><div class="flex items-start gap-4"><div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600"><app-icon name="check" [size]="23" /></div><div><h2 class="text-xl font-black text-slate-950">{{ 'bookingForm.step4.title' | t }}</h2><p class="mt-1 text-sm text-slate-500">{{ 'bookingForm.step4.subtitle' | t }}</p></div></div><div class="mt-6 grid gap-4 md:grid-cols-2"><div class="rounded-2xl bg-slate-50 p-5"><p class="text-[10px] font-black uppercase tracking-[.15em] text-slate-400">{{ 'bookingForm.step4.timeLabel' | t }}</p><p class="mt-2 font-black text-slate-900">{{ startTime() | date:'HH:mm dd/MM/yyyy' }}</p><p class="mt-1 text-sm text-slate-500">{{ 'bookingForm.step2.to' | t }} {{ endTime() | date:'HH:mm dd/MM/yyyy' }}</p></div><div class="rounded-2xl bg-slate-50 p-5"><p class="text-[10px] font-black uppercase tracking-[.15em] text-slate-400">{{ 'bookingForm.step4.purposeLabel' | t }}</p><p class="mt-2 font-black text-slate-900">{{ purposeLabel() }}</p><p class="mt-1 text-sm text-slate-500">{{ 'bookingForm.step4.priorityLevel' | t: { level: priorityFor(purposeKey()) } }}</p></div></div><div class="mt-4 rounded-2xl border border-slate-200 p-5"><p class="text-xs font-black text-slate-700">{{ 'bookingForm.step4.selectedResources' | t }}</p><div class="mt-3 space-y-3">@for (resource of selected(); track resource.key) { <div class="flex items-center gap-3"><span class="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600"><app-icon [name]="resource.resourceType === 1 ? 'building' : 'microscope'" [size]="17" /></span><div class="min-w-0 flex-1"><p class="truncate text-sm font-black text-slate-900">{{ resource.name }}</p><p class="truncate text-xs text-slate-400">{{ resource.note || ('bookingForm.step4.noNote' | t) }}</p></div></div> }</div></div><div class="mt-4 rounded-2xl bg-violet-50 p-5"><p class="text-xs font-black text-violet-800">{{ 'bookingForm.step4.description' | t }}</p><p class="mt-2 whitespace-pre-line text-sm leading-6 text-violet-900/70">{{ purposeDescription }}</p></div><div class="mt-7 flex justify-between"><button class="btn-secondary" (click)="step.set(3)"><app-icon name="arrow-left" [size]="17" /> {{ 'common.back' | t }}</button><button class="btn-primary" [disabled]="submitting() || store.user()?.status !== 'Active'" (click)="submit()"><app-icon name="send" [size]="17" /> {{ submitting() ? ('bookingForm.step4.submittingBtn' | t) : ('bookingForm.step4.submitBtn' | t) }}</button></div></article>
          }
        </div>

        <aside class="space-y-4 xl:sticky xl:top-28 xl:self-start"><article class="card-surface p-5"><p class="text-[10px] font-black uppercase tracking-[.16em] text-violet-500">{{ 'bookingForm.sidebar.quickSummary' | t }}</p><div class="mt-4 space-y-4"><div class="flex items-center justify-between text-sm"><span class="text-slate-500">{{ 'bookingForm.sidebar.labRoom' | t }}</span><strong class="max-w-40 truncate text-slate-900">{{ selectedLabName() }}</strong></div><div class="h-px bg-slate-100"></div><div class="flex items-center justify-between text-sm"><span class="text-slate-500">{{ 'bookingForm.sidebar.resources' | t }}</span><strong class="text-slate-900">{{ selected().length }}</strong></div><div class="h-px bg-slate-100"></div><div class="flex items-center justify-between text-sm"><span class="text-slate-500">{{ 'bookingForm.sidebar.priority' | t }}</span><strong class="text-violet-700">P{{ priorityFor(purposeKey()) }}</strong></div></div></article><article class="rounded-[24px] border border-cyan-200 bg-gradient-to-br from-cyan-50 to-indigo-50 p-5"><div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-cyan-600 shadow-sm"><app-icon name="lightbulb" [size]="21" /></div><p class="mt-4 font-black text-slate-900">{{ 'bookingForm.sidebar.tipTitle' | t }}</p><p class="mt-2 text-sm leading-6 text-slate-600">{{ 'bookingForm.sidebar.tipBody' | t }}</p></article></aside>
      </div>
    </section>
  `,
})
export class BookingFormPage implements OnInit {
  private readonly api = inject(SystemService)
  private readonly route = inject(ActivatedRoute)
  private readonly router = inject(Router)
  private readonly toast = inject(ToastService)
  protected readonly store = inject(AuthStore)
  protected readonly languageStore = inject(LanguageStore)
  protected readonly labs = signal<LabRoomResponse[]>([])
  protected readonly equipments = signal<EquipmentResponse[]>([])
  protected readonly rules = signal<PriorityRuleResponse[]>([])
  protected readonly selected = signal<SelectedResource[]>([])
  protected readonly mode = signal<'lab' | 'equipment'>('lab')
  protected readonly step = signal(1)
  protected readonly submitting = signal(false)
  protected readonly addEquipment = signal(false)
  protected labNote = ''

  protected readonly labId = signal<number | null>(null)
  protected bookingDate = new Date().toISOString().split('T')[0]
  protected minDate = new Date().toISOString().split('T')[0]
  protected readonly selectedSlotIds = signal<number[]>([])
  protected readonly dayEvents = signal<CalendarEventResponse[]>([])
  protected readonly dayEventsLoading = signal(false)
  protected readonly userDayBookingsCount = signal(0)
  protected readonly userMaxLimitReached = computed(() => this.userDayBookingsCount() >= 2)

  protected purposeType = 1
  protected purposeDescription = ''
  private sourceWaitlistId: number | null = null

  protected readonly steps = computed(() => {
    this.languageStore.lang()
    return [
      { id: 1, labelKey: 'bookingForm.steps.resource' },
      { id: 2, labelKey: 'bookingForm.steps.time' },
      { id: 3, labelKey: 'bookingForm.steps.purpose' },
      { id: 4, labelKey: 'bookingForm.steps.confirm' },
    ]
  })

  protected readonly purposesList = computed(() => {
    this.languageStore.lang()
    return [
      {
        value: 1,
        key: 'ResearchProject',
        label: this.languageStore.t('bookingForm.purposes.research.label'),
        description: this.languageStore.t('bookingForm.purposes.research.desc'),
      },
      {
        value: 2,
        key: 'CoursePractice',
        label: this.languageStore.t('bookingForm.purposes.course.label'),
        description: this.languageStore.t('bookingForm.purposes.course.desc'),
      },
      {
        value: 3,
        key: 'SelfStudy',
        label: this.languageStore.t('bookingForm.purposes.selfStudy.label'),
        description: this.languageStore.t('bookingForm.purposes.selfStudy.desc'),
      },
      {
        value: 4,
        key: 'Other',
        label: this.languageStore.t('bookingForm.purposes.other.label'),
        description: this.languageStore.t('bookingForm.purposes.other.desc'),
      },
    ]
  })

  protected readonly slotsWithStatus = computed<SlotWithStatus[]>(() => {
    const date = this.bookingDate
    const events = this.dayEvents()
    const selectedIds = this.selectedSlotIds()

    return FIXED_TIME_SLOTS.map((slot) => {
      const slotStart = new Date(`${date}T${slot.startTimeStr}:00`)
      const slotEnd = new Date(`${date}T${slot.endTimeStr}:00`)

      const matchingEvent = events.find((ev) => {
        const evStart = new Date(ev.startTime)
        const evEnd = new Date(ev.endTime)
        return evStart < slotEnd && evEnd > slotStart
      })

      const isOccupied = Boolean(matchingEvent)
      const occupiedReason = matchingEvent
        ? matchingEvent.eventType === 'Maintenance'
          ? 'maintenance'
          : 'booking'
        : undefined

      const isSelected = selectedIds.includes(slot.id)
      return {
        ...slot,
        isOccupied,
        isSelected,
        occupiedReason,
        maintenanceTitle: matchingEvent?.eventType === 'Maintenance' ? matchingEvent.title : undefined,
      }
    })
  })

  protected readonly formattedSelectedRange = computed(() => {
    const ids = [...this.selectedSlotIds()].sort((a, b) => a - b)
    if (!ids.length) return ''
    const first = FIXED_TIME_SLOTS.find((s) => s.id === ids[0])!
    const last = FIXED_TIME_SLOTS.find((s) => s.id === ids[ids.length - 1])!
    return `${first.startTimeStr} – ${last.endTimeStr} (${this.bookingDate})`
  })

  protected readonly startTime = computed(() => {
    const ids = [...this.selectedSlotIds()].sort((a, b) => a - b)
    if (!ids.length) return new Date(`${this.bookingDate}T07:50:00`)
    const first = FIXED_TIME_SLOTS.find((s) => s.id === ids[0])!
    return new Date(`${this.bookingDate}T${first.startTimeStr}:00`)
  })

  protected readonly endTime = computed(() => {
    const ids = [...this.selectedSlotIds()].sort((a, b) => a - b)
    if (!ids.length) return new Date(`${this.bookingDate}T09:50:00`)
    const last = FIXED_TIME_SLOTS.find((s) => s.id === ids[ids.length - 1])!
    return new Date(`${this.bookingDate}T${last.endTimeStr}:00`)
  })

  protected readonly validSlotSelection = computed(() => {
    return this.selectedSlotIds().length > 0
  })

  protected readonly availableEquipments = computed(() => this.equipments().filter((item) => item.labId === this.labId()))
  protected readonly selectedLab = computed(() => this.labs().find((lab) => lab.labId === this.labId()) ?? null)
  protected readonly selectedLabName = computed(() => {
    this.languageStore.lang()
    const name = this.selectedLab()?.labName
    return name ? this.languageStore.t(name) : this.languageStore.t('bookingForm.sidebar.notSelected')
  })
  protected readonly selectedEquipmentCount = computed(() => this.selected().filter((r) => r.resourceType === 2).length)

  ngOnInit(): void {
    const q = this.route.snapshot.queryParams
    if (q['labId']) this.labId.set(Number(q['labId']))
    if (q['waitlistId']) this.sourceWaitlistId = Number(q['waitlistId'])

    forkJoin({ labs: this.api.labs(), equipments: this.api.equipments(), rules: this.api.priorityRules(true) }).subscribe({
      next: ({ labs, equipments, rules }) => {
        this.labs.set(labs)
        this.equipments.set(equipments)
        this.rules.set(rules)

        const preselectedId = this.labId()
        if (preselectedId) {
          const lab = labs.find((item) => item.labId === preselectedId)
          if (lab) {
            this.selected.set([{ key: `lab-${lab.labId}`, resourceType: 1, labId: lab.labId, equipmentId: null, name: lab.labName, note: '' }])
          }
        }
      },
      error: () => this.toast.error('Không tải được dữ liệu tạo booking'),
    })
  }

  protected setMode(mode: 'lab' | 'equipment'): void { this.mode.set(mode); this.selected.set([]); if (this.labId()) this.onLabChange() }

  protected selectLab(lab: LabRoomResponse): void {
    if (lab.status !== 'Available') return
    this.labId.set(lab.labId)
    this.addEquipment.set(false)
    this.labNote = ''
    // Set the lab as the primary selected resource
    this.selected.set([{ key: `lab-${lab.labId}`, resourceType: 1, labId: lab.labId, equipmentId: null, name: lab.labName, note: '' }])
  }

  protected onLabChange(): void {
    this.addEquipment.set(false)
    this.labNote = ''
    this.selected.set([])
    const lab = this.labs().find((item) => item.labId === this.labId())
    if (lab) {
      this.selected.set([{ key: `lab-${lab.labId}`, resourceType: 1, labId: lab.labId, equipmentId: null, name: lab.labName, note: '' }])
    }
  }

  protected onLabNoteChange(note: string): void {
    this.labNote = note
    this.selected.update((items) => items.map((item) => item.resourceType === 1 ? { ...item, note } : item))
  }

  protected toggleAddEquipment(): void {
    this.addEquipment.update((v) => !v)
    if (!this.addEquipment()) {
      // Remove all equipment selections when toggling off
      this.selected.update((items) => items.filter((item) => item.resourceType !== 2))
    }
  }

  protected toggleEquipment(item: EquipmentResponse): void {
    if (item.status !== 'Available') return
    this.selected.update((current) =>
      current.some((s) => s.equipmentId === item.equipmentId)
        ? current.filter((s) => s.equipmentId !== item.equipmentId)
        : [...current, { key: `equipment-${item.equipmentId}`, resourceType: 2, labId: null, equipmentId: item.equipmentId, name: item.equipmentName, note: '' }]
    )
  }

  protected isEquipmentSelected(id: number): boolean { return this.selected().some((item) => item.equipmentId === id) }
  protected isSelected(id: number): boolean { return this.isEquipmentSelected(id) }
  protected updateNote(index: number, note: string): void { this.selected.update((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, note } : item)) }

  protected goToStep2(): void {
    this.step.set(2)
    this.loadDayData()
  }

  protected goTo(target: number): void {
    if (target <= this.step()) {
      this.step.set(target)
      if (target === 2) this.loadDayData()
    }
  }

  protected onDateChange(): void {
    this.loadDayData()
  }

  protected loadDayData(): void {
    if (!this.bookingDate) return
    this.dayEventsLoading.set(true)
    this.selectedSlotIds.set([])

    const fromStr = `${this.bookingDate}T00:00:00`
    const toStr = `${this.bookingDate}T23:59:59`
    const user = this.store.user()
    const userId = user?.userId
    const currentLabId = this.labId()

    forkJoin({
      events: this.api.calendar(toIso(fromStr), toIso(toStr), currentLabId ?? undefined),
      maintenances: currentLabId ? this.api.maintenancesByLab(currentLabId) : this.api.maintenances(),
      userBookings: userId ? this.api.bookingsByUser(userId) : this.api.bookings(),
    }).subscribe({
      next: ({ events, maintenances, userBookings }) => {
        const selectedEquipmentIds = new Set(
          this.selected().map((i) => i.equipmentId).filter((id): id is number => id !== null)
        )
        const relevantEvents = events.filter((ev) => {
          if (ev.status === 'Cancelled' || ev.status === 'Rejected') return false
          return ev.resources.some((r) => r.labId === currentLabId)
        })

        const maintenanceEvents: CalendarEventResponse[] = (maintenances || [])
          .filter((m) => {
            if (m.status === 'Cancelled' || m.status === 'Completed') return false
            if (m.labId && m.labId !== currentLabId) return false
            if (m.equipmentId && !selectedEquipmentIds.has(m.equipmentId)) return false
            const mStart = new Date(m.startTime).getTime()
            const mEnd = new Date(m.endTime).getTime()
            const dayStart = new Date(fromStr).getTime()
            const dayEnd = new Date(toStr).getTime()
            return mStart < dayEnd && mEnd > dayStart
          })
          .map((m) => ({
            sourceId: m.maintenanceId,
            eventType: 'Maintenance',
            title: `Lịch bảo trì phòng / thiết bị #${m.maintenanceId}`,
            startTime: m.startTime,
            endTime: m.endTime,
            status: m.status || 'InProgress',
            blocking: true,
            userId: null,
            resources: [
              {
                resourceType: m.equipmentId ? 'Equipment' : 'LabRoom',
                resourceId: m.equipmentId || m.labId || 0,
                labId: m.labId || 0,
                equipmentId: m.equipmentId || undefined,
                resourceName: 'Tài nguyên bảo trì',
              },
            ],
          }))

        const combinedEvents = [...relevantEvents, ...maintenanceEvents]
        this.dayEvents.set(combinedEvents)

        const activeUserCount = userBookings.filter(
          (b) =>
            b.status !== 'Cancelled' &&
            b.status !== 'Rejected' &&
            b.startTime.startsWith(this.bookingDate),
        ).length
        this.userDayBookingsCount.set(activeUserCount)
        this.dayEventsLoading.set(false)
      },
      error: () => {
        this.dayEventsLoading.set(false)
        this.dayEvents.set([])
        this.userDayBookingsCount.set(0)
      },
    })
  }

  protected selectSlot(slot: SlotWithStatus): void {
    if (slot.isOccupied) {
      if (slot.occupiedReason === 'maintenance') {
        this.toast.error(
          'Không thể đặt khung giờ này',
          `Slot ${slot.slotNumber} (${slot.startTimeStr} - ${slot.endTimeStr}) đang trong thời gian bảo trì.`,
        )
      } else {
        this.toast.error('Khung giờ đã có người đặt', `Slot ${slot.slotNumber} đã được sử dụng.`)
      }
      return
    }

    const current = [...this.selectedSlotIds()]
    const idx = current.indexOf(slot.id)

    if (idx > -1) {
      // Deselect
      current.splice(idx, 1)
    } else {
      // Allow at most 2 slots per booking
      if (current.length >= 2) {
        current.shift() // remove oldest selection
      }
      current.push(slot.id)
    }

    current.sort((a, b) => a - b)
    this.selectedSlotIds.set(current)
  }

  protected priorityFor(purpose: string): number { return this.rules().find((rule) => rule.purposeType === purpose)?.priorityLevel ?? this.purposesList().findIndex((item) => item.key === purpose) + 1 }
  protected purposeKey(): string { return this.purposesList().find((item) => item.value === this.purposeType)?.key ?? 'Other' }
  protected purposeLabel(): string { return labelOf('purpose', this.purposeKey()) }

  protected submit(): void {
    if (!this.validSlotSelection() || !this.selected().length || !this.purposeDescription.trim()) {
      this.toast.info('Thông tin booking chưa đầy đủ hoặc không hợp lệ')
      return
    }
    // Enforce daily booking limit at submit time
    if (this.userMaxLimitReached()) {
      this.toast.error('Bạn đã đạt giới hạn 2 lượt đặt trong 1 ngày')
      return
    }
    const userId = this.store.user()?.userId
    const bookings$ = userId ? this.api.bookingsByUser(userId) : this.api.bookings()
    bookings$.subscribe((res) => {
      const today = this.bookingDate
      const activeBookingsOnDate = res.filter(
        (b) => (b.status === 'Pending' || b.status === 'Approved') && b.startTime.startsWith(today)
      ).length

      if (activeBookingsOnDate >= 2) {
        this.toast.error('Bạn đã đạt giới hạn tối đa 2 lần đặt trong 1 ngày')
        return
      }

      this.submitting.set(true)
      this.api
        .createBooking({
          purposeType: this.purposeType,
          purposeDescription: this.purposeDescription.trim(),
          startTime: toIso(this.startTime().toISOString()),
          endTime: toIso(this.endTime().toISOString()),
          items: this.itemPayload(),
        })
        .subscribe({
          next: (booking) => {
            this.submitting.set(false)
            this.toast.success('Đã gửi yêu cầu booking', `Booking #${booking.bookingId} đang chờ duyệt.`)
            void this.router.navigate(['/app/bookings', booking.bookingId])
          },
          error: () => {
            this.submitting.set(false)
            this.toast.error('Không thể tạo booking')
          },
        })
    })
  }

  private itemPayload(): BookingItemRequest[] { return this.selected().map((item) => ({ resourceType: item.resourceType, labId: item.labId, equipmentId: item.equipmentId, note: item.note || null })) }
}
