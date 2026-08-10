import { DatePipe, NgClass } from '@angular/common'
import { Component, OnInit, computed, inject, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { ActivatedRoute, Router, RouterLink } from '@angular/router'
import { catchError, of, timeout } from 'rxjs'
import { SystemService } from '../../core/api/system.service'
import type {
  CalendarEventResponse,
  EquipmentResponse,
  LabRoomResponse,
} from '../../core/api/system.models'
import { AuthStore } from '../../core/auth/auth.store'
import { LanguageStore } from '../../core/i18n/language.store'
import { TranslatePipe } from '../../core/i18n/translate.pipe'
import { DataStateComponent } from '../../shared/ui/data-state'
import { IconComponent } from '../../shared/ui/icon'
import { PageHeaderComponent } from '../../shared/ui/page-header'
import { SearchableSelectComponent, type SelectOption } from '../../shared/ui/searchable-select'
import { StatusBadgeComponent } from '../../shared/ui/status-badge'
import { ToastService } from '../../shared/ui/toast.service'
import { labelOf, toDateInput } from '../../shared/utils/presentation'

interface CalendarDay {
  date: Date
  inMonth: boolean
  events: CalendarEventResponse[]
}

@Component({
  selector: 'app-calendar-page',
  imports: [
    DatePipe,
    NgClass,
    FormsModule,
    RouterLink,
    PageHeaderComponent,
    IconComponent,
    StatusBadgeComponent,
    DataStateComponent,
    SearchableSelectComponent,
    TranslatePipe,
  ],
  template: `
    <section class="space-y-6">
      <app-page-header [title]="'calendar.title' | t" [subtitle]="'calendar.subtitle' | t">
        @if (!store.isAdmin() && !store.isManager()) {
          <a
            routerLink="/app/bookings/new"
            [queryParams]="{ labId: labId, equipmentId: equipmentId }"
            class="btn-primary"
            ><app-icon name="plus" [size]="17" /> {{ 'calendar.createBooking' | t }}</a
          >
        }
        @if (store.isManager()) {
          <a
            routerLink="/app/management/maintenances/new"
            [queryParams]="{ labId: labId, equipmentId: equipmentId }"
            class="btn-secondary"
            ><app-icon name="wrench" [size]="17" /> {{ 'calendar.scheduleMaintenance' | t }}</a
          >
        }
      </app-page-header>

      <div class="filter-bar lg:grid-cols-[1fr_1fr_1fr_auto]">
        <div>
          <label class="field-label">{{ 'calendar.labFilter' | t }}</label
          ><app-searchable-select
            [options]="labOptions()"
            [(ngModel)]="labId"
            placeholder="{{ 'calendar.allLabs' | t }}"
            searchPlaceholder="Tìm tên, mã phòng..."
            (selectionChange)="onLabChange()"
          />
        </div>
        <div>
          <label class="field-label">{{ 'calendar.equipmentFilter' | t }}</label
          ><app-searchable-select
            [options]="equipmentOptions()"
            [(ngModel)]="equipmentId"
            placeholder="{{ 'calendar.allEquipments' | t }}"
            searchPlaceholder="Tìm thiết bị, model..."
            (selectionChange)="load()"
          />
        </div>
        <div>
          <label class="field-label">{{ 'calendar.eventTypeFilter' | t }}</label
          ><select class="input-shell" [(ngModel)]="eventType">
            <option value="">{{ 'calendar.bookingAndMaintenance' | t }}</option>
            <option value="Booking">Booking</option>
            <option value="Maintenance">{{ 'maintenances.scheduled' | t }}</option>
          </select>
        </div>
        <div class="flex items-end gap-2">
          <button class="btn-secondary" type="button" (click)="shiftFocus(-1)">
            <app-icon name="chevron-left" [size]="17" />
          </button>
          <button
            class="btn-secondary min-w-[130px] font-bold"
            type="button"
            (click)="today()"
            title="{{ 'calendar.today' | t }}"
          >
            {{ viewTitle() }}
          </button>
          <button class="btn-secondary" type="button" (click)="shiftFocus(1)">
            <app-icon name="chevron-right" [size]="17" />
          </button>
        </div>
      </div>

      <article class="card-surface overflow-hidden">
        <header
          class="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"
        >
          <div>
            <p class="text-xs font-bold tracking-[.18em] text-violet-500 uppercase">
              {{ viewTitle() }}
            </p>
            <h2 class="mt-1 text-xl font-black text-slate-950">
              {{ filteredEvents().length }} {{ 'calendar.eventsInPeriod' | t }}
            </h2>
          </div>
          <div class="inline-flex gap-1 rounded-2xl bg-slate-100 p-1">
            <button
              class="rounded-xl px-3 py-2 text-xs font-extrabold transition"
              [ngClass]="
                view() === 'month'
                  ? 'bg-white text-violet-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              "
              (click)="setView('month')"
            >
              {{ 'calendar.monthView' | t }}
            </button>
            <button
              class="rounded-xl px-3 py-2 text-xs font-extrabold transition"
              [ngClass]="
                view() === 'week'
                  ? 'bg-white text-violet-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              "
              (click)="setView('week')"
            >
              Tuần
            </button>
            <button
              class="rounded-xl px-3 py-2 text-xs font-extrabold transition"
              [ngClass]="
                view() === 'day'
                  ? 'bg-white text-violet-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              "
              (click)="setView('day')"
            >
              Ngày
            </button>
            <button
              class="rounded-xl px-3 py-2 text-xs font-extrabold transition"
              [ngClass]="
                view() === 'list'
                  ? 'bg-white text-violet-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              "
              (click)="setView('list')"
            >
              {{ 'calendar.listView' | t }}
            </button>
          </div>
        </header>

        @if (loading()) {
          <div class="grid grid-cols-7 gap-px bg-slate-100 p-px">
            @for (i of skeletons; track i) {
              <div class="h-32 bg-white p-3">
                <div class="skeleton h-4 w-8 rounded"></div>
                <div class="skeleton mt-5 h-8 rounded-xl"></div>
              </div>
            }
          </div>
        } @else if (view() === 'month') {
          <div class="grid grid-cols-7 border-b border-slate-100 bg-slate-50">
            @for (day of weekdays(); track day) {
              <div
                class="px-2 py-3 text-center text-[10px] font-black tracking-[.14em] text-slate-400 uppercase"
              >
                {{ day }}
              </div>
            }
          </div>
          <div class="grid grid-cols-7 gap-px bg-slate-100">
            @for (day of calendarDays(); track day.date.toISOString()) {
              <div
                class="min-h-32 bg-white p-2 transition hover:bg-violet-50/30"
                [class.opacity-45]="!day.inMonth"
              >
                <div class="flex items-center justify-between">
                  <span
                    class="flex h-7 w-7 items-center justify-center rounded-full text-xs font-black"
                    [ngClass]="isToday(day.date) ? 'bg-violet-600 text-white' : 'text-slate-600'"
                    >{{ day.date.getDate() }}</span
                  ><span class="text-[10px] font-bold text-slate-300">{{
                    day.events.length || ''
                  }}</span>
                </div>
                <div class="mt-2 space-y-1.5">
                  @for (event of day.events.slice(0, 3); track event.eventType + event.sourceId) {
                    <button
                      type="button"
                      class="block w-full truncate rounded-lg border px-2 py-1.5 text-left text-[10px] font-bold"
                      [ngClass]="
                        event.eventType === 'Maintenance'
                          ? 'border-amber-200 bg-amber-50 text-amber-700'
                          : 'border-indigo-200 bg-indigo-50 text-indigo-700'
                      "
                      (click)="openEvent(event)"
                    >
                      {{ event.startTime | date: 'HH:mm' }} ·
                      {{ formatEventTitle(event.title) | t }}
                    </button>
                  }
                  @if (day.events.length > 3) {
                    <p class="px-1 text-[10px] font-bold text-slate-400">
                      +{{ day.events.length - 3 }} {{ 'calendar.eventsInPeriod' | t }}
                    </p>
                  }
                </div>
              </div>
            }
          </div>
        } @else if (view() === 'week') {
          <!-- Week Time-Grid -->
          <div class="overflow-hidden">
            <!-- Day headers -->
            <div
              class="grid border-b border-slate-100 bg-slate-50"
              style="grid-template-columns: 52px repeat(7, minmax(0,1fr))"
            >
              <div class="border-r border-slate-100 py-3"></div>
              @for (day of currentWeekDays(); track day.date.toISOString()) {
                <div
                  class="border-r border-slate-100 px-2 py-3 text-center last:border-r-0"
                  [class.bg-violet-50]="isToday(day.date)"
                >
                  <p class="text-[10px] font-black tracking-wider text-slate-400 uppercase">
                    {{ weekdays()[(day.date.getDay() + 6) % 7] }}
                  </p>
                  <p
                    class="mt-0.5 text-xs font-black"
                    [ngClass]="isToday(day.date) ? 'text-violet-700' : 'text-slate-700'"
                  >
                    {{ day.date.getDate() }}/{{ day.date.getMonth() + 1 }}
                  </p>
                  @if (day.events.length > 0) {
                    <span
                      class="mt-1 inline-block rounded-full bg-indigo-100 px-1.5 py-0.5 text-[9px] font-black text-indigo-700"
                      >{{ day.events.length }}</span
                    >
                  }
                </div>
              }
            </div>
            <!-- Scrollable time-grid body -->
            <div class="overflow-y-auto" style="max-height:580px">
              <div class="grid" style="grid-template-columns: 52px repeat(7, minmax(0,1fr))">
                <!-- Time labels column -->
                <div
                  class="relative border-r border-slate-100 bg-white/80"
                  [style.height.px]="GRID_TOTAL_PX"
                >
                  @for (hour of timeSlotHours; track hour) {
                    <div
                      class="absolute right-2 text-[10px] font-semibold text-slate-300 select-none"
                      [style.top.px]="(hour - GRID_START) * HOUR_PX - 8"
                    >
                      {{ hour }}:00
                    </div>
                  }
                </div>
                <!-- 7 day columns -->
                @for (day of currentWeekDays(); track day.date.toISOString()) {
                  <div
                    class="relative border-r border-slate-100 last:border-r-0"
                    [class.bg-violet-50/20]="isToday(day.date)"
                    [style.height.px]="GRID_TOTAL_PX"
                  >
                    <!-- Hour lines -->
                    @for (hour of timeSlotHours; track hour) {
                      <div
                        class="absolute inset-x-0 border-t border-slate-100"
                        [style.top.px]="(hour - GRID_START) * HOUR_PX"
                      ></div>
                    }
                    <!-- Current time indicator -->
                    @if (isToday(day.date) && currentTimeTopPx() >= 0) {
                      <div
                        class="pointer-events-none absolute inset-x-0 z-20 flex items-center gap-0"
                        [style.top.px]="currentTimeTopPx()"
                      >
                        <div class="-ml-1 h-2 w-2 shrink-0 rounded-full bg-red-500"></div>
                        <div class="h-px flex-1 bg-red-400"></div>
                      </div>
                    }
                    <!-- Events -->
                    @for (event of day.events; track event.eventType + event.sourceId) {
                      <button
                        type="button"
                        class="absolute inset-x-0.5 z-10 overflow-hidden rounded-lg border px-1.5 py-0.5 text-left transition hover:z-30 hover:opacity-90 hover:shadow-sm"
                        [ngClass]="
                          event.eventType === 'Maintenance'
                            ? 'border-amber-200 bg-amber-50 text-amber-700'
                            : 'border-indigo-200 bg-indigo-50 text-indigo-700'
                        "
                        [style.top.px]="eventTopPx(event)"
                        [style.height.px]="eventHeightPx(event)"
                        (click)="openEvent(event)"
                      >
                        <span class="block text-[9px] leading-tight font-black">{{
                          event.startTime | date: 'HH:mm'
                        }}</span>
                        <span class="block truncate text-[9px] leading-tight">{{
                          formatEventTitle(event.title) | t
                        }}</span>
                      </button>
                    }
                  </div>
                }
              </div>
            </div>
          </div>
        } @else if (view() === 'day') {
          <!-- Day Time-Grid -->
          <div class="overflow-hidden">
            <!-- Header -->
            <div
              class="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-5 py-4"
            >
              <div class="flex items-center gap-3">
                <span
                  class="flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-black shadow-sm"
                  [ngClass]="
                    isToday(focus()) ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-700'
                  "
                  >{{ focus().getDate() }}</span
                >
                <div>
                  <p class="font-black text-slate-900">{{ viewTitle() }}</p>
                  <p class="text-xs text-slate-400">{{ dayEventsForFocusDate().length }} sự kiện</p>
                </div>
              </div>
              <button type="button" class="btn-secondary text-xs" (click)="today()">Hôm nay</button>
            </div>
            <!-- Scrollable time-grid -->
            <div class="overflow-y-auto" style="max-height:560px">
              <div class="grid" style="grid-template-columns: 52px 1fr">
                <!-- Time labels -->
                <div
                  class="relative border-r border-slate-100 bg-white/80"
                  [style.height.px]="GRID_TOTAL_PX"
                >
                  @for (hour of timeSlotHours; track hour) {
                    <div
                      class="absolute right-2 text-[10px] font-semibold text-slate-300 select-none"
                      [style.top.px]="(hour - GRID_START) * HOUR_PX - 8"
                    >
                      {{ hour }}:00
                    </div>
                  }
                </div>
                <!-- Event column -->
                <div class="relative" [style.height.px]="GRID_TOTAL_PX">
                  <!-- Hour lines -->
                  @for (hour of timeSlotHours; track hour) {
                    <div
                      class="absolute inset-x-0 border-t border-slate-100"
                      [style.top.px]="(hour - GRID_START) * HOUR_PX"
                    ></div>
                  }
                  <!-- Current time indicator -->
                  @if (currentTimeTopPx() >= 0) {
                    <div
                      class="pointer-events-none absolute inset-x-0 z-20 flex items-center"
                      [style.top.px]="currentTimeTopPx()"
                    >
                      <div class="-ml-1 h-2 w-2 shrink-0 rounded-full bg-red-500"></div>
                      <div class="h-px flex-1 bg-red-400"></div>
                    </div>
                  }
                  @if (dayEventsForFocusDate().length === 0) {
                    <div class="absolute inset-0 flex items-center justify-center">
                      <p class="text-sm font-bold text-slate-300">
                        Không có sự kiện trong ngày này
                      </p>
                    </div>
                  }
                  @for (event of dayEventsForFocusDate(); track event.eventType + event.sourceId) {
                    <button
                      type="button"
                      class="absolute inset-x-1 z-10 overflow-hidden rounded-xl border px-3 py-2 text-left transition hover:z-20 hover:opacity-90 hover:shadow-md"
                      [ngClass]="
                        event.eventType === 'Maintenance'
                          ? 'border-amber-200 bg-amber-50 text-amber-800'
                          : 'border-indigo-200 bg-indigo-50 text-indigo-800'
                      "
                      [style.top.px]="eventTopPx(event)"
                      [style.height.px]="eventHeightPx(event)"
                      (click)="openEvent(event)"
                    >
                      <p class="truncate text-xs font-black">
                        {{ event.startTime | date: 'HH:mm' }} – {{ event.endTime | date: 'HH:mm' }}
                      </p>
                      <p class="truncate text-[10px] opacity-70">
                        {{ formatEventTitle(event.title) | t }}
                      </p>
                      @if (eventHeightPx(event) >= 52) {
                        <div class="mt-1">
                          <app-status-badge
                            [value]="event.status"
                            [domain]="event.eventType === 'Maintenance' ? 'maintenance' : 'booking'"
                          />
                        </div>
                      }
                    </button>
                  }
                </div>
              </div>
            </div>
          </div>
        } @else if (filteredEvents().length === 0) {
          <div class="p-6">
            <app-data-state
              [title]="'common.noData' | t"
              [message]="'common.noData' | t"
              icon="calendar"
            />
          </div>
        } @else {
          <div class="divide-y divide-slate-100">
            @for (event of filteredEvents(); track event.eventType + event.sourceId) {
              <button
                type="button"
                class="flex w-full flex-col gap-4 px-5 py-5 text-left transition hover:bg-slate-50 sm:flex-row sm:items-center sm:px-6"
                (click)="openEvent(event)"
              >
                <div
                  class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
                  [ngClass]="
                    event.eventType === 'Maintenance'
                      ? 'bg-amber-50 text-amber-600'
                      : 'bg-indigo-50 text-indigo-600'
                  "
                >
                  <app-icon
                    [name]="event.eventType === 'Maintenance' ? 'wrench' : 'calendar'"
                    [size]="21"
                  />
                </div>
                <div class="min-w-0 flex-1">
                  <div class="flex flex-wrap items-center gap-2">
                    <p class="font-black text-slate-900">{{ formatEventTitle(event.title) | t }}</p>
                    <app-status-badge
                      [value]="event.status"
                      [domain]="event.eventType === 'Maintenance' ? 'maintenance' : 'booking'"
                    />
                  </div>
                  <p class="mt-1 text-sm text-slate-500">
                    {{ event.startTime | date: 'HH:mm dd/MM/yyyy' }} –
                    {{ event.endTime | date: 'HH:mm dd/MM/yyyy' }}
                  </p>
                  <p class="mt-2 truncate text-xs text-slate-400">{{ resourceText(event) }}</p>
                </div>
                <span class="text-slate-300"><app-icon name="arrow-right" [size]="19" /></span>
              </button>
            }
          </div>
        }
      </article>
    </section>
  `,
})
export class CalendarPage implements OnInit {
  private readonly api = inject(SystemService)
  private readonly route = inject(ActivatedRoute)
  private readonly router = inject(Router)
  private readonly toast = inject(ToastService)
  protected readonly store = inject(AuthStore)
  protected readonly languageStore = inject(LanguageStore)
  protected readonly labs = signal<LabRoomResponse[]>([])
  protected readonly equipments = signal<EquipmentResponse[]>([])
  protected readonly events = signal<CalendarEventResponse[]>([])
  protected readonly loading = signal(true)
  protected readonly view = signal<'month' | 'week' | 'day' | 'list'>('month')
  protected readonly focus = signal(new Date())
  protected labId: number | null = null
  protected equipmentId: number | null = null
  protected eventType = ''
  protected readonly weekdays = computed(() =>
    this.languageStore.lang() === 'en'
      ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      : ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
  )
  protected readonly skeletons = Array.from({ length: 35 }, (_, index) => index)

  protected readonly monthTitle = computed(() =>
    new Intl.DateTimeFormat(this.languageStore.lang() === 'en' ? 'en-US' : 'vi-VN', {
      month: 'long',
      year: 'numeric',
    }).format(this.focus()),
  )
  protected readonly filteredEquipments = computed(() =>
    this.labId ? this.equipments().filter((item) => item.labId === this.labId) : this.equipments(),
  )
  protected readonly filteredEvents = computed(() =>
    this.events()
      .filter((event) => !this.eventType || event.eventType === this.eventType)
      .sort((a, b) => +new Date(a.startTime) - +new Date(b.startTime)),
  )
  protected readonly labOptions = computed<SelectOption[]>(() =>
    this.labs().map((lab) => ({
      value: lab.labId,
      label: lab.labName,
      code: lab.roomCode,
      sublabel: lab.location,
    })),
  )
  protected readonly equipmentOptions = computed<SelectOption[]>(() =>
    this.filteredEquipments().map((item) => ({
      value: item.equipmentId,
      label: item.equipmentName,
    })),
  )

  protected readonly calendarDays = computed<CalendarDay[]>(() => {
    const focus = this.focus()
    const first = new Date(focus.getFullYear(), focus.getMonth(), 1)
    const mondayIndex = (first.getDay() + 6) % 7
    const start = new Date(first)
    start.setDate(first.getDate() - mondayIndex)
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(start)
      date.setDate(start.getDate() + index)
      const key = toDateInput(date)
      return {
        date,
        inMonth: date.getMonth() === focus.getMonth(),
        events: this.filteredEvents().filter(
          (event) => toDateInput(new Date(event.startTime)) === key,
        ),
      }
    })
  })

  protected readonly currentWeekDays = computed<CalendarDay[]>(() => {
    const focus = this.focus()
    const mondayIndex = (focus.getDay() + 6) % 7
    const start = new Date(focus)
    start.setDate(focus.getDate() - mondayIndex)
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(start)
      date.setDate(start.getDate() + index)
      const key = toDateInput(date)
      return {
        date,
        inMonth: true,
        events: this.filteredEvents().filter(
          (event) => toDateInput(new Date(event.startTime)) === key,
        ),
      }
    })
  })

  protected readonly dayEventsForFocusDate = computed<CalendarEventResponse[]>(() => {
    const key = toDateInput(this.focus())
    return this.filteredEvents().filter((event) => toDateInput(new Date(event.startTime)) === key)
  })

  protected readonly viewTitle = computed(() => {
    const focus = this.focus()
    const lang = this.languageStore.lang() === 'en' ? 'en-US' : 'vi-VN'
    if (this.view() === 'day') {
      return new Intl.DateTimeFormat(lang, {
        weekday: 'short',
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
      }).format(focus)
    }
    if (this.view() === 'week') {
      const mondayIndex = (focus.getDay() + 6) % 7
      const start = new Date(focus)
      start.setDate(focus.getDate() - mondayIndex)
      const end = new Date(start)
      end.setDate(start.getDate() + 6)
      return `Tuần (${start.getDate()}/${start.getMonth() + 1} - ${end.getDate()}/${end.getMonth() + 1})`
    }
    return new Intl.DateTimeFormat(lang, { month: 'long', year: 'numeric' }).format(focus)
  })

  ngOnInit(): void {
    const query = this.route.snapshot.queryParamMap
    const qLab = Number(query.get('labId'))
    const qEquipment = Number(query.get('equipmentId'))
    const qFrom = query.get('from')
    if (qLab > 0) this.labId = qLab
    if (qEquipment > 0) this.equipmentId = qEquipment
    if (qFrom && !Number.isNaN(new Date(qFrom).getTime())) this.focus.set(new Date(qFrom))

    // Load calendar data immediately — don't wait for labs/equipments dropdowns
    this.load()

    // Load filter dropdown data in parallel (non-blocking)
    this.api
      .labs()
      .pipe(catchError(() => of([])))
      .subscribe((labs) => this.labs.set(labs))
    this.api
      .equipments()
      .pipe(catchError(() => of([])))
      .subscribe((equipments) => this.equipments.set(equipments))
  }

  protected setView(mode: 'month' | 'week' | 'day' | 'list'): void {
    this.view.set(mode)
    this.load()
  }

  protected shiftFocus(offset: number): void {
    const current = this.focus()
    if (this.view() === 'month' || this.view() === 'list') {
      this.focus.set(new Date(current.getFullYear(), current.getMonth() + offset, 1))
    } else if (this.view() === 'week') {
      const next = new Date(current)
      next.setDate(current.getDate() + offset * 7)
      this.focus.set(next)
    } else if (this.view() === 'day') {
      const next = new Date(current)
      next.setDate(current.getDate() + offset)
      this.focus.set(next)
    }
    this.load()
  }

  protected load(): void {
    this.loading.set(true)
    const focus = this.focus()
    let start: Date
    let end: Date

    if (this.view() === 'month' || this.view() === 'list') {
      const first = new Date(focus.getFullYear(), focus.getMonth(), 1)
      const mondayIndex = (first.getDay() + 6) % 7
      start = new Date(first)
      start.setDate(first.getDate() - mondayIndex)
      end = new Date(start)
      end.setDate(start.getDate() + 42)
    } else if (this.view() === 'week') {
      const mondayIndex = (focus.getDay() + 6) % 7
      start = new Date(focus)
      start.setDate(focus.getDate() - mondayIndex)
      start.setHours(0, 0, 0, 0)
      end = new Date(start)
      end.setDate(start.getDate() + 7)
      end.setHours(23, 59, 59, 999)
    } else {
      start = new Date(focus)
      start.setHours(0, 0, 0, 0)
      end = new Date(focus)
      end.setHours(23, 59, 59, 999)
    }

    this.api
      .calendar(
        start.toISOString(),
        end.toISOString(),
        this.equipmentId ? undefined : (this.labId ?? undefined),
        this.equipmentId ?? undefined,
      )
      .pipe(
        timeout(3000),
        catchError(() => of([])),
      )
      .subscribe({
        next: (items) => {
          this.events.set(items)
          this.loading.set(false)
        },
        error: () => {
          this.events.set([])
          this.loading.set(false)
          this.toast.error('Không tải được lịch', 'Kiểm tra backend hoặc quyền truy cập.')
        },
      })
  }

  protected onLabChange(): void {
    this.equipmentId = null
    this.load()
  }
  protected today(): void {
    this.focus.set(new Date())
    this.load()
  }
  protected isToday(date: Date): boolean {
    return toDateInput(date) === toDateInput(new Date())
  }
  protected resourceText(event: CalendarEventResponse): string {
    return (
      event.resources
        .map((item) => `${labelOf('resource', item.resourceType)}: ${item.resourceName}`)
        .join(' · ') || 'Chưa có thông tin tài nguyên'
    )
  }
  protected openEvent(event: CalendarEventResponse): void {
    void this.router.navigate(
      event.eventType === 'Maintenance'
        ? ['/app/management/maintenances', event.sourceId]
        : ['/app/bookings', event.sourceId],
    )
  }
  protected formatEventTitle(title: string): string {
    if (!title) return ''
    const isEn = this.languageStore.lang() === 'en'
    return title
      .replace(/ResearchProject/gi, isEn ? 'Research Project' : 'Dự án nghiên cứu')
      .replace(/CoursePractice/gi, isEn ? 'Course Practice' : 'Thực hành môn học')
      .replace(/SelfStudy/gi, isEn ? 'Self-study' : 'Tự học')
      .replace(/Other/gi, isEn ? 'Other' : 'Khác')
      .replace(/Internal/gi, isEn ? 'Internal' : 'Nội bộ')
      .replace(/External/gi, isEn ? 'External' : 'Đối tác')
      .replace(/Workflow/gi, isEn ? 'Workflow' : 'Quy trình')
  }

  // ── Time-Grid helpers ──────────────────────────────────────────────────────
  /** Grid starts at 07:00 */
  protected readonly GRID_START = 7
  /** Grid ends at 19:00 (events after this are clamped) */
  protected readonly GRID_END = 19
  /** Height in pixels per 1 hour slot */
  protected readonly HOUR_PX = 64
  /** Total grid height in px */
  protected readonly GRID_TOTAL_PX = (19 - 7) * 64 // 768px
  /** Array of hour numbers to render time labels [7, 8, ..., 18] */
  protected readonly timeSlotHours = Array.from({ length: 19 - 7 }, (_, i) => 7 + i)

  /** Top offset in px for an event block, clamped to grid bounds. */
  protected eventTopPx(event: CalendarEventResponse): number {
    const d = new Date(event.startTime)
    const minutesSinceStart = (d.getHours() - this.GRID_START) * 60 + d.getMinutes()
    return Math.max(0, Math.min((minutesSinceStart / 60) * this.HOUR_PX, this.GRID_TOTAL_PX - 24))
  }

  /** Height in px for an event block. Min 24px so 1-min events are still clickable. */
  protected eventHeightPx(event: CalendarEventResponse): number {
    const durationMs = new Date(event.endTime).getTime() - new Date(event.startTime).getTime()
    const durationHours = Math.max(durationMs / 3_600_000, 24 / this.HOUR_PX)
    const maxHeight = this.GRID_TOTAL_PX - this.eventTopPx(event)
    return Math.min(durationHours * this.HOUR_PX, maxHeight)
  }

  /** Top offset in px for the current-time red line. Returns -1 if outside grid range. */
  protected currentTimeTopPx(): number {
    const now = new Date()
    if (now.getHours() < this.GRID_START || now.getHours() >= this.GRID_END) return -1
    return (((now.getHours() - this.GRID_START) * 60 + now.getMinutes()) / 60) * this.HOUR_PX
  }
}
