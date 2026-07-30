import { DatePipe, NgClass } from '@angular/common'
import { Component, OnInit, computed, inject, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { RouterLink } from '@angular/router'
import { catchError, forkJoin, of } from 'rxjs'
import type {
  BookingResponse,
  NotificationResponse,
  UserViolationSummaryResponse,
  WaitlistResponse,
} from '../../core/api/api.models'
import { SystemService } from '../../core/api/system.service'

import type { CalendarEventResponse } from '../../core/api/system.models'
import { WorkspaceService } from '../../core/api/workspace.service'
import { AuthStore } from '../../core/auth/auth.store'
import { LanguageStore } from '../../core/i18n/language.store'
import { TranslatePipe } from '../../core/i18n/translate.pipe'
import { IconComponent } from '../../shared/ui/icon'
import { ToastService } from '../../shared/ui/toast.service'
import { labelOf, toDateInput } from '../../shared/utils/presentation'

interface ScheduleSlotEvent {
  roomName: string
  title: string
  timeStr: string
  dateKey: string
  rowIndex: number
  tone: 'emerald' | 'amber' | 'cyan' | 'indigo' | 'purple'
}

@Component({
  selector: 'app-requester-home-page',
  imports: [DatePipe, NgClass, FormsModule, RouterLink, IconComponent, TranslatePipe],
  template: `
    <section class="space-y-6">
      <!-- Top Header / Greeting -->
      <header class="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <div class="flex items-center gap-2 text-xs font-bold text-indigo-600">
            <span class="h-2 w-2 rounded-full bg-emerald-500"></span>
            • {{ today | date: 'EEEE, dd/MM/yyyy' }}
          </div>
          <h1 class="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            {{ 'home.greeting' | t: { name: firstName() } }}
          </h1>
          <p class="mt-1 text-sm font-medium text-slate-500">{{ 'home.sub' | t }}</p>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <a
            routerLink="/app/calendar"
            class="inline-flex h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 text-xs font-black text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
          >
            <app-icon name="calendar" [size]="18" class="text-slate-500" />
            {{ 'home.viewCalendar' | t }}
          </a>
          <a
            routerLink="/app/bookings/new"
            class="inline-flex h-11 items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 px-5 text-xs font-black text-white shadow-lg shadow-indigo-500/25 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/35"
          >
            <span class="text-base font-bold leading-none">+</span>
            {{ 'home.quickBooking' | t }}
          </a>
        </div>
      </header>

      @if (loading()) {
        <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          @for (item of [1, 2, 3, 4]; track item) {
            <div class="card-surface h-32 animate-pulse bg-slate-100"></div>
          }
        </div>
      } @else {
        <!-- Account Alert Warning Banner -->
        @if (accountWarning()) {
          <div
            class="flex flex-col gap-4 rounded-3xl border border-amber-200/90 bg-gradient-to-r from-amber-50 via-amber-50/80 to-amber-100/50 p-5 shadow-sm sm:flex-row sm:items-center"
          >
            <div
              class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-800 shadow-inner"
            >
              <app-icon name="alert" [size]="22" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-sm font-black text-amber-950">{{ 'home.accountNotice' | t }}</p>
              <p class="mt-0.5 text-xs font-medium text-amber-800/90 leading-5">
                {{ accountWarning() }}
              </p>
            </div>
            <a
              routerLink="/app/violations/my"
              class="inline-flex h-10 shrink-0 items-center justify-center rounded-xl bg-[#542d07] px-5 text-xs font-extrabold text-white transition hover:bg-[#3d2004] shadow-sm"
            >
              {{ 'home.viewDetails' | t }}
            </a>
          </div>
        }

        <!-- 4 KPI Summary Cards -->
        <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          @for (card of kpiCards(); track card.label) {
            <article
              class="card-surface group relative overflow-hidden p-5 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/10"
            >
              <div
                class="absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-40 blur-2xl"
                [class.bg-amber-300]="card.tone === 'amber'"
                [class.bg-purple-300]="card.tone === 'indigo'"
                [class.bg-cyan-300]="card.tone === 'cyan'"
                [class.bg-rose-300]="card.tone === 'rose'"
              ></div>
              <div class="relative flex items-start justify-between gap-4">
                <div>
                  <p class="text-xs font-bold text-slate-500">{{ card.label }}</p>
                  <p class="mt-2 text-3xl font-black tracking-tight text-slate-950">
                    {{ card.value }}
                  </p>
                  <p class="mt-1 text-[11px] font-medium text-slate-400">{{ card.note }}</p>
                </div>
                <div
                  class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-sm"
                  [class.bg-amber-50]="card.tone === 'amber'"
                  [class.text-amber-600]="card.tone === 'amber'"
                  [class.bg-purple-50]="card.tone === 'indigo'"
                  [class.text-purple-600]="card.tone === 'indigo'"
                  [class.bg-cyan-50]="card.tone === 'cyan'"
                  [class.text-cyan-600]="card.tone === 'cyan'"
                  [class.bg-rose-50]="card.tone === 'rose'"
                  [class.text-rose-600]="card.tone === 'rose'"
                >
                  <app-icon [name]="card.icon" [size]="20" />
                </div>
              </div>
            </article>
          }
        </div>

        <!-- Section: Lịch đặt của tôi (My Booking Calendar / Schedule Grid) -->
        <article class="card-surface overflow-hidden p-5 sm:p-6">
          <header class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4">
            <div class="flex items-center gap-3">
              <div
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600"
              >
                <app-icon name="calendar" [size]="20" />
              </div>
              <h2 class="text-lg font-black text-slate-950">{{ 'home.mySchedule' | t }}</h2>
            </div>

            <div class="flex flex-wrap items-center gap-3">
              <!-- View mode pills -->
              <div class="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-bold">
                <button
                  type="button"
                  class="rounded-lg px-3 py-1.5 transition"
                  [ngClass]="
                    calendarMode() === 'Today'
                      ? 'bg-white text-indigo-700 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  "
                  (click)="setCalendarMode('Today')"
                >
                  {{ 'home.today' | t }}
                </button>
                <button
                  type="button"
                  class="rounded-lg px-3 py-1.5 transition"
                  [ngClass]="
                    calendarMode() === 'Day'
                      ? 'bg-white text-indigo-700 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  "
                  (click)="setCalendarMode('Day')"
                >
                  {{ 'home.day' | t }}
                </button>
                <button
                  type="button"
                  class="rounded-lg px-3 py-1.5 transition"
                  [ngClass]="
                    calendarMode() === 'Week'
                      ? 'bg-white text-indigo-700 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  "
                  (click)="setCalendarMode('Week')"
                >
                  {{ 'home.week' | t }}
                </button>
                <button
                  type="button"
                  class="rounded-lg px-3 py-1.5 transition"
                  [ngClass]="
                    calendarMode() === 'Month'
                      ? 'bg-white text-indigo-700 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  "
                  (click)="setCalendarMode('Month')"
                >
                  {{ 'home.month' | t }}
                </button>
              </div>

              <!-- Month Navigation -->
              <div
                class="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1 text-xs font-extrabold text-slate-700 shadow-sm"
              >
                <button
                  type="button"
                  class="p-1 text-slate-400 hover:text-indigo-600"
                  (click)="shiftFocus(-1)"
                >
                  <app-icon name="chevron-left" [size]="14" />
                </button>
                <span class="capitalize">{{ monthTitle() }}</span>
                <button
                  type="button"
                  class="p-1 text-slate-400 hover:text-indigo-600"
                  (click)="shiftFocus(1)"
                >
                  <app-icon name="chevron-right" [size]="14" />
                </button>
              </div>
            </div>
          </header>

          <!-- Calendar Table / Schedule Grid -->
          <div
            class="mt-2 overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-inner [scrollbar-width:thin]"
          >
            <table class="w-full min-w-[980px] border-collapse text-left text-xs">
              <thead>
                <tr class="bg-[#1d4ed8] text-white">
                  <th
                    class="border-r border-blue-500/30 px-3 py-3 font-extrabold whitespace-nowrap"
                  >
                    {{ 'home.timeSlot' | t }}
                  </th>
                  @for (col of calendarCols(); track col.key) {
                    <th
                      class="border-r border-blue-500/30 px-2 py-2.5 text-center font-bold whitespace-nowrap"
                    >
                      <div>{{ col.dayName }}</div>
                      <div class="text-[10px] font-normal opacity-80">00-12</div>
                    </th>
                  }
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 bg-white">
                <!-- Slot 1: 08:00 - 12:00 -->
                <tr class="h-24 hover:bg-slate-50/50">
                  <td
                    class="border-r border-slate-100 px-3 py-3 text-center text-[11px] font-black text-slate-600 whitespace-nowrap bg-slate-50/80"
                  >
                    08:00 - 12:00
                  </td>
                  @for (col of calendarCols(); track col.key; let cIdx = $index) {
                    <td
                      class="relative border-r border-slate-100 p-1.5 align-top transition hover:bg-indigo-50/30"
                    >
                      @for (evt of getSlotEvents(cIdx, 0); track evt.roomName + evt.timeStr) {
                        <div
                          class="rounded-xl border p-2 text-[10px] shadow-sm transition hover:scale-[1.02] cursor-pointer space-y-0.5"
                          [ngClass]="{
                            'border-emerald-300 bg-emerald-50 text-emerald-950':
                              evt.tone === 'emerald',
                            'border-amber-300 bg-amber-50 text-amber-950': evt.tone === 'amber',
                            'border-cyan-300 bg-cyan-50 text-cyan-950': evt.tone === 'cyan',
                            'border-indigo-300 bg-indigo-50 text-indigo-950':
                              evt.tone === 'indigo',
                            'border-purple-300 bg-purple-50 text-purple-950':
                              evt.tone === 'purple',
                          }"
                          (click)="onScheduleEventClick(evt)"
                        >
                          <p class="truncate font-black text-[11px] text-slate-900 leading-tight">
                            {{ evt.roomName }}
                          </p>
                          <p class="truncate font-bold text-[10px] text-indigo-900/90 leading-tight">
                            {{ evt.title }}
                          </p>
                          <p class="text-[9px] font-semibold opacity-75 leading-tight">
                            {{ evt.timeStr }}
                          </p>
                        </div>
                      }
                    </td>
                  }
                </tr>

                <!-- Slot 2: 13:00 - 17:00 -->
                <tr class="h-24 hover:bg-slate-50/50">
                  <td
                    class="border-r border-slate-100 px-3 py-3 text-center text-[11px] font-black text-slate-600 whitespace-nowrap bg-slate-50/80"
                  >
                    13:00 - 17:00
                  </td>
                  @for (col of calendarCols(); track col.key; let cIdx = $index) {
                    <td
                      class="relative border-r border-slate-100 p-1.5 align-top transition hover:bg-indigo-50/30"
                    >
                      @for (evt of getSlotEvents(cIdx, 1); track evt.roomName + evt.timeStr) {
                        <div
                          class="rounded-xl border p-2 text-[10px] shadow-sm transition hover:scale-[1.02] cursor-pointer space-y-0.5"
                          [ngClass]="{
                            'border-emerald-300 bg-emerald-50 text-emerald-950':
                              evt.tone === 'emerald',
                            'border-amber-300 bg-amber-50 text-amber-950': evt.tone === 'amber',
                            'border-cyan-300 bg-cyan-50 text-cyan-950': evt.tone === 'cyan',
                            'border-indigo-300 bg-indigo-50 text-indigo-950':
                              evt.tone === 'indigo',
                            'border-purple-300 bg-purple-50 text-purple-950':
                              evt.tone === 'purple',
                          }"
                          (click)="onScheduleEventClick(evt)"
                        >
                          <p class="truncate font-black text-[11px] text-slate-900 leading-tight">
                            {{ evt.roomName }}
                          </p>
                          <p class="truncate font-bold text-[10px] text-indigo-900/90 leading-tight">
                            {{ evt.title }}
                          </p>
                          <p class="text-[9px] font-semibold opacity-75 leading-tight">
                            {{ evt.timeStr }}
                          </p>
                        </div>
                      }
                    </td>
                  }
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Calendar Controls & Legend Footer -->
          <div class="mt-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <a
              routerLink="/app/calendar"
              class="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <span>{{ 'home.exportCalendar' | t }}</span>
              <app-icon name="chevron-right" [size]="14" />
            </a>

            <!-- Legend items -->
            <div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-bold text-slate-600">
              <span class="text-slate-400 font-medium">{{ 'home.colorLegend' | t }}</span>
              <span class="inline-flex items-center gap-1.5">
                <span class="h-3 w-3 rounded-md bg-emerald-500"></span>
                {{ 'home.legendMyBooking' | t }}
              </span>
              <span class="inline-flex items-center gap-1.5">
                <span class="h-3 w-3 rounded-md bg-sky-400"></span>
                {{ 'home.legendInternal' | t }}
              </span>
              <span class="inline-flex items-center gap-1.5">
                <span class="h-3 w-3 rounded-md bg-cyan-400"></span>
                {{ 'home.legendExternal' | t }}
              </span>
              <span class="inline-flex items-center gap-1.5">
                <span class="h-3 w-3 rounded-md bg-amber-400"></span>
                {{ 'home.legendMaintenance' | t }}
              </span>
              <span class="inline-flex items-center gap-1.5">
                <span class="h-3 w-3 rounded-md bg-rose-400"></span>
                {{ 'home.legendUnavailable' | t }}
              </span>
              <span class="inline-flex items-center gap-1.5">
                <span class="h-3 w-3 rounded-md bg-yellow-400"></span>
                {{ 'home.legendNotice' | t }}
              </span>
              <span class="inline-flex items-center gap-1.5">
                <span class="h-3 w-3 rounded-md bg-purple-500"></span>
                {{ 'home.legendWorkflow' | t }}
              </span>
              <span class="inline-flex items-center gap-1.5">
                <span class="h-3 w-3 rounded-md bg-blue-500"></span>
                {{ 'home.legendGroup' | t }}
              </span>
            </div>

            <a
              routerLink="/app/policy"
              class="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800"
            >
              <span>{{ 'home.viewDetailedGuide' | t }}</span>
              <app-icon name="arrow-right" [size]="14" />
            </a>
          </div>
        </article>

        <!-- Bottom Grid: 2 Columns (Booking sắp tới & Sức khỏe tài khoản) -->
        <div class="grid gap-6 xl:grid-cols-[1.3fr_.7fr]">
          <!-- Column 1: Booking sắp tới -->
          <article class="card-surface overflow-hidden">
            <div
              class="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-6"
            >
              <div>
                <h2 class="text-lg font-black text-slate-950">{{ 'home.upcomingTitle' | t }}</h2>
                <p class="mt-0.5 text-xs text-slate-400">{{ 'home.upcomingSubtitle' | t }}</p>
              </div>
              <a
                routerLink="/app/bookings/my"
                class="text-xs font-bold text-indigo-600 hover:text-indigo-800"
              >
                {{ 'home.viewAll' | t }}
              </a>
            </div>

            @if (displayUpcomingBookings().length === 0) {
              <div class="flex flex-col items-center px-6 py-12 text-center">
                <div
                  class="flex h-14 w-14 items-center justify-center rounded-3xl bg-indigo-50 text-indigo-500"
                >
                  <app-icon name="calendar" [size]="24" />
                </div>
                <p class="mt-4 font-bold text-slate-800">{{ 'home.noUpcoming' | t }}</p>
                <p class="mt-1 text-xs text-slate-400">{{ 'home.noUpcomingSub' | t }}</p>
              </div>
            } @else {
              <div class="divide-y divide-slate-100">
                @for (booking of displayUpcomingBookings(); track booking.id) {
                  <div
                    class="flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-slate-50/80 sm:px-6 cursor-pointer"
                    (click)="onBookingClick(booking)"
                  >
                    <div
                      class="flex w-14 shrink-0 flex-col items-center rounded-2xl bg-[#0f172a] py-2 text-white shadow-sm"
                    >
                      <span class="text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                        {{ booking.monthStr }}
                      </span>
                      <span class="text-xl font-black leading-6">{{ booking.dayStr }}</span>
                    </div>
                    <div class="min-w-0 flex-1">
                      <div class="flex flex-wrap items-center gap-2">
                        <p class="truncate font-black text-slate-900">{{ booking.title }}</p>
                        <span
                          class="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-700 border border-emerald-200/60"
                        >
                          Approved
                        </span>
                      </div>
                      <p class="mt-1 flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                        <app-icon name="clock" [size]="14" />
                        {{ booking.timeStr }}
                      </p>
                    </div>
                    <span class="text-slate-300">
                      <app-icon name="chevron-right" [size]="18" />
                    </span>
                  </div>
                }
              </div>
            }
          </article>

          <!-- Column 2: Sức khỏe tài khoản -->
          <article class="card-surface p-5 sm:p-6 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between">
                <div>
                  <h2 class="text-lg font-black text-slate-950">{{ 'home.accountHealth' | t }}</h2>
                  <p class="mt-0.5 text-xs text-slate-400">{{ 'home.accountHealthSub' | t }}</p>
                </div>
                <div
                  class="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-sm"
                >
                  <app-icon name="shield" [size]="22" />
                </div>
              </div>

              <div class="mt-6 flex items-center gap-5">
                <div
                  class="relative flex h-28 w-28 shrink-0 items-center justify-center rounded-full"
                  [style.background]="healthRing()"
                >
                  <div
                    class="flex h-[84px] w-[84px] flex-col items-center justify-center rounded-full bg-white shadow-inner"
                  >
                    <span class="text-2xl font-black text-slate-950">{{ displayHealthScore() }}</span>
                    <span class="text-[10px] font-bold uppercase text-slate-400">/ 100</span>
                  </div>
                </div>
                <div class="min-w-0">
                  <span
                    class="inline-flex rounded-full px-3 py-1 text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                  >
                    {{ statusLabel(statusText()) }}
                  </span>
                  <p class="mt-3 text-xs font-medium leading-5 text-slate-600">
                    {{ violationSummary().activeViolationCount }} {{ 'dashboard.activeViolations' | t }}, {{ violationSummary().activePenaltyPoints }} {{ 'dashboard.points' | t }}.
                  </p>
                </div>
              </div>
            </div>

            <div class="mt-6 space-y-3 rounded-2xl bg-slate-50 p-4 border border-slate-100">
              <div class="flex items-center justify-between text-xs">
                <span class="font-bold text-slate-500">{{ 'home.totalPenaltyPoints' | t }}</span>
                <strong class="text-slate-900 font-black text-sm">{{ violationSummary().penaltyPoints }}</strong>
              </div>
            </div>
          </article>
        </div>

        <!-- Notifications & Waitlist Row -->
        <div class="grid gap-6 xl:grid-cols-3">
          <article class="card-surface overflow-hidden xl:col-span-2">
            <div class="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-6">
              <div>
                <h2 class="text-lg font-black text-slate-950">{{ 'home.latestNotifications' | t }}</h2>
                <p class="mt-1 text-xs text-slate-400">{{ 'home.latestNotificationsSub' | t }}</p>
              </div>
              <a routerLink="/app/notifications" class="text-xs font-bold text-indigo-600 hover:text-indigo-800">{{ 'home.notificationCenter' | t }}</a>
            </div>
            @if (recentNotifications().length === 0) {
              <div class="px-6 py-12 text-center text-xs text-slate-400">{{ 'home.noNotifications' | t }}</div>
            } @else {
              <div class="divide-y divide-slate-100">
                @for (notification of recentNotifications(); track notification.notificationId) {
                  <a routerLink="/app/notifications" class="flex items-start gap-4 px-5 py-4 transition hover:bg-slate-50 sm:px-6">
                    <div class="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl" [class.bg-indigo-50]="notificationTone(notification.notificationType) === 'indigo'" [class.text-indigo-600]="notificationTone(notification.notificationType) === 'indigo'" [class.bg-emerald-50]="notificationTone(notification.notificationType) === 'emerald'" [class.text-emerald-600]="notificationTone(notification.notificationType) === 'emerald'" [class.bg-amber-50]="notificationTone(notification.notificationType) === 'amber'" [class.text-amber-600]="notificationTone(notification.notificationType) === 'amber'" [class.bg-rose-50]="notificationTone(notification.notificationType) === 'rose'" [class.text-rose-600]="notificationTone(notification.notificationType) === 'rose'">
                      <app-icon [name]="notificationIcon(notification.notificationType)" [size]="19" />
                    </div>
                    <div class="min-w-0 flex-1">
                      <div class="flex items-start gap-3">
                        <p class="min-w-0 flex-1 font-semibold text-slate-900 text-xs">{{ notification.title }}</p>
                        @if (!notification.isRead) { <span class="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-indigo-500"></span> }
                      </div>
                      <p class="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{{ notification.message }}</p>
                      <p class="mt-1.5 text-[10px] font-medium text-slate-400">{{ notification.createdAt | date: 'HH:mm, dd/MM/yyyy' }}</p>
                    </div>
                  </a>
                }
              </div>
            }
          </article>

          <article class="card-surface overflow-hidden">
            <div class="border-b border-slate-100 px-5 py-5 sm:px-6">
              <h2 class="text-lg font-black text-slate-950">{{ 'home.yourWaitlist' | t }}</h2>
              <p class="mt-1 text-xs text-slate-400">{{ 'home.waitlistSub' | t }}</p>
            </div>
            @if (activeWaitlists().length === 0) {
              <div class="flex flex-col items-center px-6 py-12 text-center">
                <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600"><app-icon name="clock" [size]="22" /></div>
                <p class="mt-4 text-xs font-semibold text-slate-700">{{ 'home.noWaitlists' | t }}</p>
              </div>
            } @else {
              <div class="space-y-3 p-4">
                @for (waitlist of activeWaitlists().slice(0, 3); track waitlist.waitlistId) {
                  <div class="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <div class="flex items-center justify-between gap-3">
                      <span class="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-slate-600 shadow-sm">#{{ waitlist.queuePosition }} {{ 'home.inWaitlist' | t }}</span>
                      <span class="text-[10px] font-bold" [class.text-amber-600]="waitlist.status === 'Waiting'" [class.text-emerald-600]="waitlist.status === 'Notified'">{{ waitlistStatusLabel(waitlist.status) }}</span>
                    </div>
                    <p class="mt-3 text-xs font-bold text-slate-800">{{ waitlist.labId ? ('labs.labRoom' | t) + ' #' + waitlist.labId : ('equipments.title' | t) + ' #' + waitlist.equipmentId }}</p>
                    <p class="mt-1 text-[11px] text-slate-400">{{ waitlist.requestedStart | date: 'HH:mm dd/MM' }} – {{ waitlist.requestedEnd | date: 'HH:mm dd/MM' }}</p>
                  </div>
                }
              </div>
            }
          </article>
        </div>
      }
    </section>
  `,
})
export class RequesterHomePage implements OnInit {
  private readonly workspace = inject(WorkspaceService)
  private readonly api = inject(SystemService)
  protected readonly store = inject(AuthStore)
  protected readonly languageStore = inject(LanguageStore)
  private readonly toast = inject(ToastService)

  protected readonly today = new Date()
  protected readonly loading = signal(true)
  protected readonly bookings = signal<BookingResponse[]>([])
  protected readonly waitlists = signal<WaitlistResponse[]>([])
  protected readonly notifications = signal<NotificationResponse[]>([])
  protected readonly calendarEvents = signal<CalendarEventResponse[]>([])
  protected readonly unreadCount = signal(0)
  protected readonly calendarMode = signal<'Today' | 'Day' | 'Week' | 'Month'>('Month')
  protected readonly calendarFocus = signal(new Date())

  protected readonly violationSummary = signal<UserViolationSummaryResponse>({
    userId: 0,
    fullName: '',
    penaltyPoints: 0,
    userStatus: 'Active',
    restrictionUntil: null,
    activeViolationCount: 0,
    activePenaltyPoints: 0,
    activeViolations: [],
  })

  // Sample events strictly tied to specific dates in July 2026
  private readonly sampleScheduleEvents: ScheduleSlotEvent[] = [
    {
      roomName: 'Phòng LAB1 (Tầng 1)',
      title: 'My booking #0012',
      timeStr: '09:00 - 11:30',
      dateKey: '2026-07-02',
      rowIndex: 0,
      tone: 'emerald',
    },
    {
      roomName: 'Lab Điện tử (LAB-ELEC-01)',
      title: 'Maintenance Schedule',
      timeStr: '08:30 - 11:30',
      dateKey: '2026-07-07',
      rowIndex: 0,
      tone: 'amber',
    },
    {
      roomName: 'Lab Sinh học (LAB-BIO-01)',
      title: 'External Partner Lab',
      timeStr: '09:30 - 11:00',
      dateKey: '2026-07-10',
      rowIndex: 0,
      tone: 'cyan',
    },
    {
      roomName: 'Phòng Thực hành Mạng (LAB-NET-01)',
      title: 'Internal Lab Booking',
      timeStr: '14:00 - 16:30',
      dateKey: '2026-07-04',
      rowIndex: 1,
      tone: 'indigo',
    },
    {
      roomName: 'Phòng LAB1 (Tầng 1)',
      title: 'Workflow Booking',
      timeStr: '13:00 - 15:00',
      dateKey: '2026-07-09',
      rowIndex: 1,
      tone: 'purple',
    },
  ]

  // Dynamic column calculations based on active language and focus date
  protected readonly calendarCols = computed(() => {
    const lang = this.languageStore.lang()
    const focus = this.calendarFocus()
    const year = focus.getFullYear()
    const month = focus.getMonth()
    const mode = this.calendarMode()

    let startDate: Date
    let colCount = 12

    if (mode === 'Day') {
      startDate = new Date(year, month, focus.getDate())
      colCount = 7
    } else if (mode === 'Week') {
      const dayOfWeek = (focus.getDay() + 6) % 7
      startDate = new Date(year, month, focus.getDate() - dayOfWeek)
      colCount = 7
    } else {
      startDate = new Date(year, month, 1)
      colCount = 12
    }

    return Array.from({ length: colCount }, (_, i) => {
      const d = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i)
      const dayOfWeek = d.getDay()
      const dateNum = d.getDate()

      let dayName = ''
      if (lang === 'en') {
        const names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        dayName = `${names[dayOfWeek]} ${dateNum}`
      } else {
        const names = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
        dayName = `${names[dayOfWeek]} ${dateNum}`
      }

      const dateKey = toDateInput(d)
      return { key: `col-${i}-${dateKey}`, dayName, dateKey, date: d }
    })
  })

  protected readonly firstName = computed(() => {
    const parts = this.store.user()?.fullName.trim().split(/\s+/) ?? []
    return parts.at(-1) ?? 'bạn'
  })

  protected readonly monthTitle = computed(() => {
    const lang = this.languageStore.lang()
    const focus = this.calendarFocus()
    return new Intl.DateTimeFormat(lang === 'en' ? 'en-US' : 'vi-VN', {
      month: 'long',
      year: 'numeric',
    }).format(focus)
  })

  protected readonly upcomingBookings = computed(() =>
    this.bookings()
      .filter(
        (item) => item.status === 'Approved' && new Date(item.startTime).getTime() > Date.now(),
      )
      .sort((a, b) => +new Date(a.startTime) - +new Date(b.startTime)),
  )

  protected readonly displayUpcomingBookings = computed(() => {
    const list = this.upcomingBookings()
    const lang = this.languageStore.lang()
    return list.map((b) => ({
      id: b.bookingId,
      monthStr: new Date(b.startTime)
        .toLocaleString(lang === 'en' ? 'en-US' : 'vi-VN', { month: 'short' })
        .toUpperCase(),
      dayStr: new Date(b.startTime).getDate().toString().padStart(2, '0'),
      title: this.purposeLabel(b.purposeType) || (lang === 'en' ? 'Research Project' : 'Dự án nghiên cứu'),
      timeStr: `${new Date(b.startTime).toLocaleTimeString(lang === 'en' ? 'en-US' : 'vi-VN', { hour: '2-digit', minute: '2-digit' })} - ${new Date(b.endTime).toLocaleTimeString(lang === 'en' ? 'en-US' : 'vi-VN', { hour: '2-digit', minute: '2-digit' })}, ${new Date(b.startTime).toLocaleDateString(lang === 'en' ? 'en-US' : 'vi-VN')}`,
    }))
  })

  protected readonly pendingBookings = computed(() =>
    this.bookings().filter((item) => item.status === 'Pending').length,
  )

  protected readonly activeWaitlists = computed(() =>
    this.waitlists().filter((item) => ['Waiting', 'Notified'].includes(item.status)),
  )

  protected readonly recentNotifications = computed(() =>
    [...this.notifications()]
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
      .slice(0, 5),
  )

  protected readonly statusText = computed(() => {
    const status = this.store.user()?.status
    if (typeof status === 'string') return status
    return (
      ({ 1: 'Active', 2: 'Inactive', 3: 'Restricted', 4: 'Locked' } as Record<number, string>)[
        status ?? 1
      ] ?? 'Active'
    )
  })

  protected readonly healthScore = computed(() =>
    Math.max(
      0,
      100 -
        this.violationSummary().penaltyPoints * 5 -
        this.violationSummary().activeViolationCount * 5,
    ),
  )

  protected readonly displayHealthScore = computed(() => {
    return this.healthScore()
  })

  protected readonly healthRing = computed(
    () =>
      `conic-gradient(#10b981 0 ${this.displayHealthScore()}%, #e2e8f0 ${this.displayHealthScore()}% 100%)`,
  )

  protected readonly accountWarning = computed(() => {
    const isEn = this.languageStore.lang() === 'en'
    const status = this.statusText()
    if (status === 'Restricted') {
      const until = this.store.user()?.restrictionUntil
      if (isEn) {
        return until
          ? `Your account is restricted until ${new Date(until).toLocaleString('en-US')}. You may not be able to create new bookings.`
          : 'Your account is restricted. Please check your active violations.'
      }
      return until
        ? `Tài khoản đang bị hạn chế đến ${new Date(until).toLocaleString('vi-VN')}. Trong thời gian này bạn có thể không tạo được booking mới.`
        : 'Tài khoản đang bị hạn chế. Vui lòng xem các vi phạm đang hoạt động.'
    }
    if (status === 'Locked')
      return isEn
        ? 'Your account is locked. Please contact Admin for support.'
        : 'Tài khoản đã bị khóa. Hãy liên hệ Admin để được hỗ trợ.'
    if (status === 'Inactive')
      return isEn
        ? 'Your account is inactive. Please contact Admin.'
        : 'Tài khoản đang ngừng hoạt động. Hãy liên hệ Admin.'
    if (this.violationSummary().activeViolationCount > 0) {
      return isEn
        ? `You have ${this.violationSummary().activeViolationCount} active violation(s). Please review to avoid account restrictions.`
        : `Bạn đang có ${this.violationSummary().activeViolationCount} vi phạm hoạt động. Hãy kiểm tra để tránh bị hạn chế tài khoản.`
    }
    return null
  })

  protected readonly kpiCards = computed(() => {
    this.languageStore.lang()
    return [
      {
        label: this.languageStore.t('home.pendingApproval'),
        value: this.pendingBookings(),
        note: this.languageStore.t('home.pendingNote'),
        icon: 'clock',
        tone: 'amber',
      },
      {
        label: this.languageStore.t('home.upcomingBookings'),
        value: this.upcomingBookings().length,
        note: this.languageStore.t('home.approvedNote'),
        icon: 'calendar',
        tone: 'indigo',
      },
      {
        label: this.languageStore.t('home.activeWaitlist'),
        value: this.activeWaitlists().length,
        note: this.languageStore.t('home.waitlistNote'),
        icon: 'activity',
        tone: 'cyan',
      },
      {
        label: this.languageStore.t('home.unreadNotifications'),
        value: this.unreadCount(),
        note: this.languageStore.t('home.unreadNote'),
        icon: 'bell',
        tone: 'rose',
      },
    ]
  })

  ngOnInit(): void {
    const user = this.store.user()
    if (!user) {
      this.loading.set(false)
      return
    }

    const focus = this.calendarFocus()
    const from = new Date(focus.getFullYear(), focus.getMonth(), 1).toISOString()
    const to = new Date(focus.getFullYear(), focus.getMonth() + 1, 1).toISOString()

    forkJoin({
      bookings: this.workspace.bookingsByUser(user.userId).pipe(catchError(() => of([]))),
      waitlists: this.workspace.waitlistsByUser(user.userId).pipe(catchError(() => of([]))),
      notifications: this.workspace
        .notifications(user.userId, 1, 10)
        .pipe(catchError(() => of([]))),
      unread: this.workspace
        .unreadCount(user.userId)
        .pipe(catchError(() => of({ userId: user.userId, unreadCount: 0 }))),
      calendarEvents: this.api
        .calendar(from, to)
        .pipe(catchError(() => of([]))),
      violations: this.workspace.violationSummary(user.userId).pipe(
        catchError(() =>
          of({
            userId: user.userId,
            fullName: user.fullName,
            penaltyPoints: user.penaltyPoints,
            userStatus: String(user.status),
            restrictionUntil: user.restrictionUntil,
            activeViolationCount: 0,
            activePenaltyPoints: 0,
            activeViolations: [],
          }),
        ),
      ),
    }).subscribe({
      next: (result) => {
        this.bookings.set(result.bookings)
        this.waitlists.set(result.waitlists)
        this.notifications.set(result.notifications)
        this.unreadCount.set(result.unread.unreadCount)
        this.calendarEvents.set(result.calendarEvents)
        this.violationSummary.set(result.violations)
        this.loading.set(false)
      },
      error: () => {
        this.loading.set(false)
      },
    })
  }

  protected setCalendarMode(mode: 'Today' | 'Day' | 'Week' | 'Month'): void {
    this.calendarMode.set(mode)
    if (mode === 'Today') {
      this.calendarFocus.set(new Date())
    }
  }

  protected shiftFocus(offset: number): void {
    const cur = this.calendarFocus()
    const mode = this.calendarMode()
    if (mode === 'Day') {
      const next = new Date(cur)
      next.setDate(cur.getDate() + offset)
      this.calendarFocus.set(next)
    } else if (mode === 'Week') {
      const next = new Date(cur)
      next.setDate(cur.getDate() + offset * 7)
      this.calendarFocus.set(next)
    } else {
      this.calendarFocus.set(new Date(cur.getFullYear(), cur.getMonth() + offset, 1))
    }
    this.reloadCalendarData()
  }

  private reloadCalendarData(): void {
    const focus = this.calendarFocus()
    const from = new Date(focus.getFullYear(), focus.getMonth(), 1).toISOString()
    const to = new Date(focus.getFullYear(), focus.getMonth() + 1, 1).toISOString()
    this.api.calendar(from, to).pipe(catchError(() => of([]))).subscribe((events) => {
      this.calendarEvents.set(events)
    })
  }

  protected getSlotEvents(colIndex: number, rowIndex: number): ScheduleSlotEvent[] {
    const col = this.calendarCols()[colIndex]
    if (!col) return []

    const targetDateKey = col.dateKey
    const events: ScheduleSlotEvent[] = []

    // 1. Real user bookings from database
    for (const b of this.bookings()) {
      const start = new Date(b.startTime)
      const end = new Date(b.endTime)
      const bDateKey = toDateInput(start)

      if (bDateKey === targetDateKey) {
        const startHour = start.getHours()
        const slotIndex = startHour < 12 ? 0 : 1

        if (slotIndex === rowIndex) {
          const timeStr = `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
          const tone: 'emerald' | 'amber' | 'cyan' | 'indigo' | 'purple' =
            b.purposeType === 'Internal'
              ? 'indigo'
              : b.purposeType === 'External'
                ? 'cyan'
                : b.purposeType === 'Workflow'
                  ? 'purple'
                  : 'emerald'

          const matchedEv = this.calendarEvents().find((ev) => ev.sourceId === b.bookingId)
          const roomName = matchedEv?.resources?.length
            ? matchedEv.resources[0].resourceName
            : `Phòng Lab (Booking #${b.bookingId})`

          events.push({
            roomName,
            title: `BK-#${b.bookingId.toString().padStart(4, '0')} · ${this.purposeLabel(b.purposeType)}`,
            timeStr,
            dateKey: targetDateKey,
            rowIndex,
            tone,
          })
        }
      }
    }

    // 2. Real system calendar events (e.g., maintenance & other bookings)
    for (const ev of this.calendarEvents()) {
      const start = new Date(ev.startTime)
      const end = new Date(ev.endTime)
      const evDateKey = toDateInput(start)

      if (evDateKey === targetDateKey) {
        const startHour = start.getHours()
        const slotIndex = startHour < 12 ? 0 : 1

        if (slotIndex === rowIndex) {
          const timeStr = `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
          const isMaintenance = ev.eventType === 'Maintenance'
          const exists = events.some((r) => r.timeStr === timeStr)

          if (!exists) {
            const roomName = ev.resources?.length
              ? ev.resources[0].resourceName
              : 'Phòng Lab'

            events.push({
              roomName,
              title: isMaintenance ? `Bảo trì: ${ev.title}` : ev.title,
              timeStr,
              dateKey: targetDateKey,
              rowIndex,
              tone: isMaintenance ? 'amber' : 'indigo',
            })
          }
        }
      }
    }

    // 3. Demo sample events ONLY if they strictly match the exact target dateKey!
    for (const sample of this.sampleScheduleEvents) {
      if (sample.dateKey === targetDateKey && sample.rowIndex === rowIndex) {
        const exists = events.some((e) => e.timeStr === sample.timeStr)
        if (!exists) {
          events.push(sample)
        }
      }
    }

    return events
  }

  protected purposeLabel(value: string): string {
    return labelOf('purpose', value, this.languageStore.lang())
  }

  protected statusLabel(value: string): string {
    return labelOf('user', value, this.languageStore.lang())
  }

  protected waitlistStatusLabel(value: string): string {
    return labelOf('waitlist', value, this.languageStore.lang())
  }

  protected notificationTone(type: string): 'indigo' | 'emerald' | 'amber' | 'rose' {
    const normalized = type.toLowerCase()
    if (normalized.includes('approve') || normalized.includes('available')) return 'emerald'
    if (normalized.includes('reject') || normalized.includes('violation')) return 'rose'
    if (normalized.includes('reminder') || normalized.includes('maintenance')) return 'amber'
    return 'indigo'
  }

  protected notificationIcon(type: string): string {
    const tone = this.notificationTone(type)
    if (tone === 'emerald') return 'check'
    if (tone === 'rose') return 'alert'
    if (tone === 'amber') return 'clock'
    return 'bell'
  }

  protected onBookingClick(booking: { title: string; timeStr: string }): void {
    this.toast.info(booking.title, booking.timeStr)
  }

  protected onScheduleEventClick(evt: ScheduleSlotEvent): void {
    this.toast.info(evt.roomName, `${evt.title} • ${evt.timeStr}`)
  }
}
