import { DatePipe, NgClass } from '@angular/common'
import { Component, OnInit, computed, inject, signal } from '@angular/core'
import { Router, RouterLink } from '@angular/router'
import { catchError, forkJoin, of } from 'rxjs'
import type {
  BookingResponse,
  NotificationResponse,
  UserViolationSummaryResponse,
  WaitlistResponse,
} from '../../core/api/api.models'
import { WorkspaceService } from '../../core/api/workspace.service'
import { AuthStore } from '../../core/auth/auth.store'
import { LanguageStore } from '../../core/i18n/language.store'
import { TranslatePipe } from '../../core/i18n/translate.pipe'
import { IconComponent } from '../../shared/ui/icon'
import { ModalComponent } from '../../shared/ui/modal'
import { ToastService } from '../../shared/ui/toast.service'
import { labelOf } from '../../shared/utils/presentation'

@Component({
  selector: 'app-requester-home-page',
  imports: [DatePipe, NgClass, RouterLink, IconComponent, TranslatePipe, ModalComponent],

  template: `
    <section class="space-y-6">
      <header class="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <div class="flex items-center gap-2 text-sm font-semibold text-indigo-600">
            <span class="h-2 w-2 rounded-full bg-emerald-500"></span>
            {{ today | date: 'EEEE, dd/MM/yyyy' }}
          </div>
          <h1 class="mt-2 text-3xl font-bold tracking-[-0.035em] text-slate-950 sm:text-4xl">
            {{ 'home.greeting' | t: { name: firstName() } }}
          </h1>
          <p class="mt-2 text-sm text-slate-500">{{ 'home.sub' | t }}</p>
        </div>
        <div class="flex flex-wrap gap-3">
          <a
            routerLink="/app/calendar"
            class="inline-flex h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <app-icon name="calendar" [size]="18" />
            {{ 'home.viewCalendar' | t }}
          </a>
          <a
            routerLink="/app/bookings/new"
            class="inline-flex h-11 items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            <span class="text-lg leading-none">+</span>
            {{ 'home.quickBooking' | t }}
          </a>
        </div>
      </header>

      @if (loading()) {
        <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          @for (item of [1, 2, 3, 4]; track item) {
            <div class="card-surface h-36 animate-pulse bg-slate-100"></div>
          }
        </div>
      } @else {
        @if (accountWarning()) {
          <div
            class="flex flex-col gap-4 rounded-3xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-5 sm:flex-row sm:items-center"
          >
            <div
              class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700"
            >
              <app-icon name="alert" [size]="23" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="font-bold text-amber-950">{{ 'home.accountNotice' | t }}</p>
              <p class="mt-1 text-sm leading-6 text-amber-700">{{ accountWarning() }}</p>
            </div>
            <a
              routerLink="/app/profile"
              class="inline-flex h-10 shrink-0 items-center justify-center rounded-xl bg-amber-900 px-4 text-xs font-bold text-white hover:bg-amber-800"
              >{{ 'home.viewDetails' | t }}</a
            >
          </div>
        }

        <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          @for (card of kpiCards(); track card.label) {
            <article
              class="card-surface group relative overflow-hidden p-5 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/10"
            >
              <div
                class="absolute -top-10 -right-10 h-28 w-28 rounded-full opacity-55 blur-2xl"
                [class.bg-indigo-200]="card.tone === 'indigo'"
                [class.bg-cyan-200]="card.tone === 'cyan'"
                [class.bg-amber-200]="card.tone === 'amber'"
                [class.bg-rose-200]="card.tone === 'rose'"
              ></div>
              <div class="relative flex items-start justify-between gap-4">
                <div>
                  <p class="text-sm font-medium text-slate-500">{{ card.label }}</p>
                  <p class="mt-3 text-3xl font-bold tracking-[-0.04em] text-slate-950">
                    {{ card.value }}
                  </p>
                  <p class="mt-2 text-xs text-slate-400">{{ card.note }}</p>
                </div>
                <div
                  class="flex h-11 w-11 items-center justify-center rounded-2xl"
                  [class.bg-indigo-50]="card.tone === 'indigo'"
                  [class.text-indigo-600]="card.tone === 'indigo'"
                  [class.bg-cyan-50]="card.tone === 'cyan'"
                  [class.text-cyan-600]="card.tone === 'cyan'"
                  [class.bg-amber-50]="card.tone === 'amber'"
                  [class.text-amber-600]="card.tone === 'amber'"
                  [class.bg-rose-50]="card.tone === 'rose'"
                  [class.text-rose-600]="card.tone === 'rose'"
                >
                  <app-icon [name]="card.icon" [size]="21" />
                </div>
              </div>
            </article>
          }
        </div>

        <!-- My Booking Calendar Section matching ClusterMarket design -->
        <article class="card-surface overflow-hidden p-6">
          <!-- Calendar Header & Navigation Controls -->
          <div
            class="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <h2 class="flex items-center gap-2 text-xl font-bold text-slate-900">
              <span
                class="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600"
              >
                <app-icon name="calendar" [size]="20" />
              </span>
              {{ 'home.myBookingCalendar' | t }}
            </h2>

            <div class="flex flex-wrap items-center gap-3">
              <!-- View Mode Toggle Buttons (Today, Day, Week, Month) -->
              <div class="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
                @for (v of ['Today', 'Day', 'Week', 'Month']; track v) {
                  <button
                    type="button"
                    class="rounded-lg px-3 py-1.5 text-xs font-bold transition"
                    [ngClass]="
                      calendarView() === v
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    "
                    (click)="setCalendarView(v)"
                  >
                    {{ v }}
                  </button>
                }
              </div>

              <!-- Month & Navigation (< July 2026 >) -->
              <div
                class="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-bold text-slate-800 shadow-sm"
              >
                <button
                  type="button"
                  class="rounded-lg px-1.5 py-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  (click)="prevMonth()"
                >
                  &lt;
                </button>
                <span class="min-w-[100px] text-center font-bold text-slate-900">
                  {{ calendarDate() | date: 'MMMM yyyy' }}
                </span>
                <button
                  type="button"
                  class="rounded-lg px-1.5 py-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  (click)="nextMonth()"
                >
                  &gt;
                </button>
              </div>
            </div>
          </div>

          <!-- Calendar Days Grid & Event Matrix -->
          <div class="mt-4 overflow-x-auto">
            <div class="min-w-[850px]">
              <!-- Time slot & Days Header Bar -->
              <div
                class="grid grid-cols-13 gap-px overflow-hidden rounded-t-xl border border-slate-200 bg-slate-200"
              >
                <div class="bg-blue-600 p-2.5 text-center text-xs font-bold text-white">
                  Time / Slot
                </div>
                @for (day of calendarDays(); track day.dayNumber) {
                  <div class="border-l border-blue-500/30 bg-blue-600 p-2 text-center text-white">
                    <div class="text-[11px] font-semibold opacity-90">
                      {{ day.dayName }} {{ day.dayNumber }}
                    </div>
                    <div class="text-[9px] font-bold opacity-75">00 - 12</div>
                  </div>
                }
              </div>

              <!-- Calendar Time Rows & Bookings Matrix -->
              <div
                class="divide-y divide-slate-100 rounded-b-xl border-x border-b border-slate-200 bg-white"
              >
                <!-- Morning Slot (08:00 - 12:00) -->
                <div class="grid min-h-[70px] grid-cols-13 bg-white">
                  <div
                    class="flex items-center justify-center border-r border-slate-100 bg-slate-50 p-2 text-center text-xs font-bold text-slate-500"
                  >
                    08:00 - 12:00
                  </div>
                  @for (day of calendarDays(); track day.dayNumber) {
                    <div
                      class="flex flex-col gap-1 border-r border-slate-100 p-1.5 transition hover:bg-slate-50/70"
                    >
                      @for (ev of getEventsForDay(day.dateStr, 'morning'); track ev.id) {
                        <div
                          class="cursor-pointer rounded-lg px-2 py-1 text-[10px] leading-tight font-bold shadow-sm transition hover:scale-[1.02]"
                          [ngClass]="ev.bgClass"
                          [title]="ev.title + ' (' + ev.time + ')'"
                        >
                          <div class="truncate font-black">{{ ev.title }}</div>
                          <div class="truncate font-medium opacity-80">{{ ev.time }}</div>
                        </div>
                      }
                    </div>
                  }
                </div>

                <!-- Afternoon Slot (13:00 - 17:00) -->
                <div class="grid min-h-[70px] grid-cols-13 bg-slate-50/30">
                  <div
                    class="flex items-center justify-center border-r border-slate-100 bg-slate-50 p-2 text-center text-xs font-bold text-slate-500"
                  >
                    13:00 - 17:00
                  </div>
                  @for (day of calendarDays(); track day.dayNumber) {
                    <div
                      class="flex flex-col gap-1 border-r border-slate-100 p-1.5 transition hover:bg-slate-50/70"
                    >
                      @for (ev of getEventsForDay(day.dateStr, 'afternoon'); track ev.id) {
                        <div
                          class="cursor-pointer rounded-lg px-2 py-1 text-[10px] leading-tight font-bold shadow-sm transition hover:scale-[1.02]"
                          [ngClass]="ev.bgClass"
                          [title]="ev.title + ' (' + ev.time + ')'"
                        >
                          <div class="truncate font-black">{{ ev.title }}</div>
                          <div class="truncate font-medium opacity-80">{{ ev.time }}</div>
                        </div>
                      }
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom Action Bar & Color Legend matching Screenshot -->
          <div
            class="mt-6 flex flex-col gap-5 border-t border-slate-100 pt-4 lg:flex-row lg:items-center lg:justify-between"
          >
            <!-- Export external calendar dropdown button -->
            <div class="relative">
              <button
                type="button"
                class="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-700 hover:shadow-lg"
                (click)="exportDropdownOpen.set(!exportDropdownOpen())"
              >
                <span>{{ 'home.exportExternalCalendar' | t }}</span>
                <app-icon
                  name="chevron-right"
                  [size]="15"
                  class="transition-transform duration-200"
                  [ngClass]="{ 'rotate-90': exportDropdownOpen() }"
                />
              </button>

              @if (exportDropdownOpen()) {
                <div class="fixed inset-0 z-30" (click)="exportDropdownOpen.set(false)"></div>
                <div
                  class="absolute bottom-full left-0 z-40 mb-2 w-64 rounded-2xl border border-slate-100 bg-white p-2 shadow-xl"
                >
                  <button
                    type="button"
                    class="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    (click)="exportIcsCalendar(); exportDropdownOpen.set(false)"
                  >
                    <app-icon name="calendar" [size]="16" class="text-blue-600" />
                    Tải file iCalendar (.ics)
                  </button>
                  <button
                    type="button"
                    class="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    (click)="exportGoogleCalendar(); exportDropdownOpen.set(false)"
                  >
                    <app-icon name="external-link" [size]="16" class="text-emerald-600" />
                    Đồng bộ Google Calendar
                  </button>
                </div>
              }
            </div>

            <!-- Color Legend Grid matching screenshot -->
            <div class="flex-1">
              <div class="mb-2 flex items-center justify-between">
                <span class="text-xs font-bold text-slate-700"
                  >Chú giải màu sắc & loại booking:</span
                >
                <button
                  type="button"
                  class="text-xs font-bold text-blue-600 hover:underline"
                  (click)="colorGuideModalOpen.set(true)"
                >
                  Xem hướng dẫn chi tiết &rarr;
                </button>
              </div>
              <div
                class="grid grid-cols-2 gap-x-4 gap-y-2 text-xs font-medium text-slate-600 sm:grid-cols-3 md:grid-cols-4"
              >
                <div class="flex items-center gap-2">
                  <span class="h-3.5 w-3.5 rounded border border-emerald-400 bg-emerald-100"></span>
                  <span>{{ 'home.legend.myBooking' | t }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="h-3.5 w-3.5 rounded border border-blue-400 bg-blue-100"></span>
                  <span>{{ 'home.legend.internalBooking' | t }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="h-3.5 w-3.5 rounded border border-cyan-400 bg-cyan-100"></span>
                  <span>{{ 'home.legend.externalBooking' | t }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="h-3.5 w-3.5 rounded border border-amber-400 bg-amber-100"></span>
                  <span>{{ 'home.legend.maintenance' | t }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="h-3.5 w-3.5 rounded border border-rose-400 bg-rose-100"></span>
                  <span>{{ 'home.legend.notAvailable' | t }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="h-3.5 w-3.5 rounded border border-yellow-400 bg-yellow-100"></span>
                  <span>{{ 'home.legend.announcement' | t }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="h-3.5 w-3.5 rounded border border-purple-400 bg-purple-100"></span>
                  <span>{{ 'home.legend.workflowBooking' | t }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="h-3.5 w-3.5 rounded border border-indigo-400 bg-indigo-100"></span>
                  <span>{{ 'home.legend.groupBooking' | t }}</span>
                </div>
              </div>
            </div>
          </div>
        </article>

        <div class="grid gap-6 xl:grid-cols-[1.35fr_.65fr]">
          <article class="card-surface overflow-hidden">
            <div
              class="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-6"
            >
              <div>
                <h2 class="text-lg font-bold text-slate-950">{{ 'home.upcomingTitle' | t }}</h2>
                <p class="mt-1 text-xs text-slate-400">{{ 'home.upcomingSubtitle' | t }}</p>
              </div>
              <a
                routerLink="/app/bookings/my"
                class="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                >{{ 'home.viewAll' | t }}</a
              >
            </div>

            @if (upcomingBookings().length === 0) {
              <div class="flex flex-col items-center px-6 py-14 text-center">
                <div
                  class="flex h-14 w-14 items-center justify-center rounded-3xl bg-indigo-50 text-indigo-500"
                >
                  <app-icon name="calendar" [size]="25" />
                </div>
                <p class="mt-4 font-semibold text-slate-800">{{ 'home.noUpcoming' | t }}</p>
                <p class="mt-1 text-sm text-slate-400">{{ 'home.noUpcomingSub' | t }}</p>
              </div>
            } @else {
              <div class="divide-y divide-slate-100">
                @for (booking of upcomingBookings().slice(0, 4); track booking.bookingId) {
                  <button
                    type="button"
                    class="flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-slate-50 sm:px-6"
                    (click)="bookingDetail(booking)"
                  >
                    <div
                      class="flex w-14 shrink-0 flex-col items-center rounded-2xl bg-[#111a3a] py-2 text-white"
                    >
                      <span class="text-[10px] font-semibold text-cyan-300 uppercase">{{
                        booking.startTime | date: 'MMM'
                      }}</span>
                      <span class="text-xl leading-6 font-bold">{{
                        booking.startTime | date: 'dd'
                      }}</span>
                    </div>
                    <div class="min-w-0 flex-1">
                      <div class="flex flex-wrap items-center gap-2">
                        <p class="truncate font-semibold text-slate-900">
                          {{ purposeLabel(booking.purposeType) }}
                        </p>
                        <span
                          class="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700"
                          >{{ statusLabel('Approved') }}</span
                        >
                      </div>
                      <p class="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                        <app-icon name="clock" [size]="14" />
                        {{ booking.startTime | date: 'HH:mm' }} –
                        {{ booking.endTime | date: 'HH:mm, dd/MM/yyyy' }}
                      </p>
                    </div>
                    <span class="text-slate-300"><app-icon name="arrow-right" [size]="18" /></span>
                  </button>
                }
              </div>
            }
          </article>

          <article class="card-surface p-5 sm:p-6">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-lg font-bold text-slate-950">{{ 'home.accountHealth' | t }}</h2>
                <p class="mt-1 text-xs text-slate-400">{{ 'home.accountHealthSub' | t }}</p>
              </div>
              <div
                class="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600"
              >
                <app-icon name="shield" [size]="22" />
              </div>
            </div>

            <div class="mt-7 flex items-center gap-5">
              <div
                class="relative flex h-28 w-28 shrink-0 items-center justify-center rounded-full"
                [style.background]="healthRing()"
              >
                <div
                  class="flex h-[82px] w-[82px] flex-col items-center justify-center rounded-full bg-white shadow-inner"
                >
                  <span class="text-2xl font-bold text-slate-950">{{ healthScore() }}</span>
                  <span class="text-[10px] font-semibold text-slate-400 uppercase">/ 100</span>
                </div>
              </div>
              <div class="min-w-0">
                <span
                  class="inline-flex rounded-full px-3 py-1.5 text-xs font-bold"
                  [class.bg-emerald-50]="statusText() === 'Active'"
                  [class.text-emerald-700]="statusText() === 'Active'"
                  [class.bg-amber-50]="statusText() === 'Restricted'"
                  [class.text-amber-700]="statusText() === 'Restricted'"
                  [class.bg-rose-50]="statusText() === 'Locked' || statusText() === 'Inactive'"
                  [class.text-rose-700]="statusText() === 'Locked' || statusText() === 'Inactive'"
                  >{{ statusLabel(statusText()) }}</span
                >
                <p class="mt-3 text-sm leading-6 text-slate-500">
                  {{ violationSummary().activeViolationCount }}
                  {{ 'dashboard.activeViolations' | t }},
                  {{ violationSummary().activePenaltyPoints }} {{ 'dashboard.points' | t }}.
                </p>
              </div>
            </div>

            <div class="mt-6 space-y-3 rounded-2xl bg-slate-50 p-4">
              <div class="flex items-center justify-between text-sm">
                <span class="text-slate-500">{{ 'home.totalPenaltyPoints' | t }}</span
                ><strong class="text-slate-900">{{ violationSummary().penaltyPoints }}</strong>
              </div>
              <div class="h-px bg-slate-200"></div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-slate-500">{{ 'home.restrictionUntil' | t }}</span
                ><strong class="text-slate-900">{{
                  violationSummary().restrictionUntil
                    ? (violationSummary().restrictionUntil | date: 'dd/MM/yyyy HH:mm')
                    : ('home.none' | t)
                }}</strong>
              </div>
            </div>
          </article>
        </div>

        <div class="grid gap-6 xl:grid-cols-3">
          <article class="card-surface overflow-hidden xl:col-span-2">
            <div
              class="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-6"
            >
              <div>
                <h2 class="text-lg font-bold text-slate-950">
                  {{ 'home.latestNotifications' | t }}
                </h2>
                <p class="mt-1 text-xs text-slate-400">{{ 'home.latestNotificationsSub' | t }}</p>
              </div>
              <a
                routerLink="/app/notifications"
                class="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                >{{ 'home.notificationCenter' | t }}</a
              >
            </div>
            @if (recentNotifications().length === 0) {
              <div class="px-6 py-12 text-center text-sm text-slate-400">
                {{ 'home.noNotifications' | t }}
              </div>
            } @else {
              <div class="divide-y divide-slate-100">
                @for (notification of recentNotifications(); track notification.notificationId) {
                  <a
                    routerLink="/app/notifications"
                    class="flex items-start gap-4 px-5 py-4 transition hover:bg-slate-50 sm:px-6"
                  >
                    <div
                      class="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl"
                      [class.bg-indigo-50]="
                        notificationTone(notification.notificationType) === 'indigo'
                      "
                      [class.text-indigo-600]="
                        notificationTone(notification.notificationType) === 'indigo'
                      "
                      [class.bg-emerald-50]="
                        notificationTone(notification.notificationType) === 'emerald'
                      "
                      [class.text-emerald-600]="
                        notificationTone(notification.notificationType) === 'emerald'
                      "
                      [class.bg-amber-50]="
                        notificationTone(notification.notificationType) === 'amber'
                      "
                      [class.text-amber-600]="
                        notificationTone(notification.notificationType) === 'amber'
                      "
                      [class.bg-rose-50]="
                        notificationTone(notification.notificationType) === 'rose'
                      "
                      [class.text-rose-600]="
                        notificationTone(notification.notificationType) === 'rose'
                      "
                    >
                      <app-icon
                        [name]="notificationIcon(notification.notificationType)"
                        [size]="19"
                      />
                    </div>
                    <div class="min-w-0 flex-1">
                      <div class="flex items-start gap-3">
                        <p class="min-w-0 flex-1 font-semibold text-slate-900">
                          {{ notification.title }}
                        </p>
                        @if (!notification.isRead) {
                          <span class="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-indigo-500"></span>
                        }
                      </div>
                      <p class="mt-1 line-clamp-2 text-sm leading-5 text-slate-500">
                        {{ notification.message }}
                      </p>
                      <p class="mt-2 text-[11px] text-slate-400">
                        {{ notification.createdAt | date: 'HH:mm, dd/MM/yyyy' }}
                      </p>
                    </div>
                  </a>
                }
              </div>
            }
          </article>

          <article class="card-surface overflow-hidden">
            <div class="border-b border-slate-100 px-5 py-5 sm:px-6">
              <h2 class="text-lg font-bold text-slate-950">{{ 'home.yourWaitlist' | t }}</h2>
              <p class="mt-1 text-xs text-slate-400">{{ 'home.waitlistSub' | t }}</p>
            </div>
            @if (activeWaitlists().length === 0) {
              <div class="flex flex-col items-center px-6 py-12 text-center">
                <div
                  class="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600"
                >
                  <app-icon name="clock" [size]="22" />
                </div>
                <p class="mt-4 text-sm font-semibold text-slate-700">
                  {{ 'home.noWaitlists' | t }}
                </p>
              </div>
            } @else {
              <div class="space-y-3 p-4">
                @for (waitlist of activeWaitlists().slice(0, 3); track waitlist.waitlistId) {
                  <div class="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <div class="flex items-center justify-between gap-3">
                      <span
                        class="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-slate-600 shadow-sm"
                        >#{{ waitlist.queuePosition }} {{ 'home.inWaitlist' | t }}</span
                      >
                      <span
                        class="text-[10px] font-bold"
                        [class.text-amber-600]="waitlist.status === 'Waiting'"
                        [class.text-emerald-600]="waitlist.status === 'Notified'"
                        >{{ waitlistStatusLabel(waitlist.status) }}</span
                      >
                    </div>
                    <p class="mt-3 text-sm font-semibold text-slate-800">
                      {{
                        waitlist.labId
                          ? ('labs.labRoom' | t) + ' #' + waitlist.labId
                          : ('equipments.title' | t) + ' #' + waitlist.equipmentId
                      }}
                    </p>
                    <p class="mt-1 text-xs text-slate-400">
                      {{ waitlist.requestedStart | date: 'HH:mm dd/MM' }} –
                      {{ waitlist.requestedEnd | date: 'HH:mm dd/MM' }}
                    </p>
                    @if (waitlist.notifiedAt) {
                      <p
                        class="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700"
                      >
                        {{ 'home.notifiedAt' | t }} {{ waitlist.notifiedAt | date: 'HH:mm dd/MM' }}
                      </p>
                    }
                  </div>
                }
              </div>
            }
          </article>
        </div>

        <!-- Nội quy & Chính sách phòng Lab -->
        <article
          class="card-surface overflow-hidden border border-cyan-100/90 bg-gradient-to-r from-cyan-50/50 via-white to-teal-50/30 p-6 shadow-sm"
        >
          <div
            class="flex flex-col gap-4 border-b border-cyan-100/80 pb-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div class="flex items-center gap-3">
              <div
                class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-600 text-white shadow-md shadow-cyan-500/20"
              >
                <app-icon name="file-text" [size]="22" />
              </div>
              <div>
                <h2 class="text-lg font-black text-slate-900">
                  Nội quy & Quy định sử dụng phòng Lab
                </h2>
                <p class="text-xs font-medium text-slate-500">
                  Các quy tắc cố định áp dụng cho tất cả người dùng và sinh viên khi đăng ký sử dụng
                  tài nguyên.
                </p>
              </div>
            </div>
            <a
              routerLink="/app/policy"
              class="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-cyan-600 px-4 text-xs font-bold text-white shadow-md shadow-cyan-500/15 transition hover:bg-cyan-700"
            >
              <span>Xem chi tiết chính sách</span>
              <app-icon name="arrow-right" [size]="16" />
            </a>
          </div>

          <div class="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div class="rounded-2xl border border-cyan-100/80 bg-white/90 p-4 shadow-sm">
              <div class="flex items-center gap-2 text-xs font-bold text-cyan-800">
                <span
                  class="flex h-6 w-6 items-center justify-center rounded-lg bg-cyan-100 text-cyan-700"
                  >1</span
                >
                {{
                  languageStore.lang() === 'en'
                    ? '2-Step Verification'
                    : 'Xác thực 2 bước (Check-in/out)'
                }}
              </div>
              <p class="mt-2 text-xs leading-5 text-slate-600">
                {{
                  languageStore.lang() === 'en'
                    ? 'Check-in/out completes only upon direct approval by Management.'
                    : 'Check-in/out đúng giờ chỉ hoàn tất khi có phê duyệt trực tiếp từ Bộ phận Quản lý.'
                }}
              </p>
            </div>

            <div class="rounded-2xl border border-amber-100/80 bg-white/90 p-4 shadow-sm">
              <div class="flex items-center gap-2 text-xs font-bold text-amber-800">
                <span
                  class="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-100 text-amber-700"
                  >2</span
                >
                {{
                  languageStore.lang() === 'en'
                    ? 'Initial Inspection (5-10m)'
                    : 'Kiểm tra đầu giờ (5–10 phút)'
                }}
              </div>
              <p class="mt-2 text-xs leading-5 text-slate-600">
                {{
                  languageStore.lang() === 'en'
                    ? 'Inspect and report pre-existing damage within 5-10 mins after Check-in.'
                    : 'Báo ngay hỏng hóc/sự cố có sẵn trong 5–10 phút đầu sau Check-in để không bị tính trách nhiệm.'
                }}
              </p>
            </div>

            <div class="rounded-2xl border border-indigo-100/80 bg-white/90 p-4 shadow-sm">
              <div class="flex items-center gap-2 text-xs font-bold text-indigo-800">
                <span
                  class="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700"
                  >3</span
                >
                {{
                  languageStore.lang() === 'en'
                    ? 'Late >2 Weeks (Account Lock)'
                    : 'Muộn >2 tuần (Khóa tài khoản)'
                }}
              </div>
              <p class="mt-2 text-xs leading-5 text-slate-600">
                {{
                  languageStore.lang() === 'en'
                    ? 'Check-out overdue >2 weeks auto-marks LOST ASSET and FREEZES/LOCKS account.'
                    : 'Check-out muộn >2 tuần bị tính LÀM MẤT TÀI SẢN & KHÓA TÀI KHOẢN cho đến khi đền bù.'
                }}
              </p>
            </div>

            <div class="rounded-2xl border border-emerald-100/80 bg-white/90 p-4 shadow-sm">
              <div class="flex items-center gap-2 text-xs font-bold text-emerald-800">
                <span
                  class="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700"
                  >4</span
                >
                {{
                  languageStore.lang() === 'en'
                    ? 'Anti-Swapping & Account Security'
                    : 'Cấm tráo đổi & Dùng chung tài khoản'
                }}
              </div>
              <p class="mt-2 text-xs leading-5 text-slate-600">
                {{
                  languageStore.lang() === 'en'
                    ? 'No swapping components or lending accounts. Account owner bears full liability.'
                    : 'Cấm tháo lắp, tráo đổi linh kiện hoặc cho mượn tài khoản. Chủ tài khoản chịu trách nhiệm.'
                }}
              </p>
            </div>
          </div>
        </article>
      }

      <!-- Color Legend Detailed Guide Modal -->
      <app-modal
        [open]="colorGuideModalOpen()"
        title="Giải thích chi tiết bảng màu & quy tắc đặt lịch"
        subtitle="Ý nghĩa màu sắc và hướng dẫn phân loại lịch trong hệ thống phòng Lab"
        (close)="colorGuideModalOpen.set(false)"
      >
        <div class="space-y-4 text-sm">
          <div class="grid gap-3 sm:grid-cols-2">
            <div class="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
              <div class="flex items-center gap-2 font-bold text-emerald-900">
                <span class="h-3.5 w-3.5 rounded bg-emerald-500"></span>
                Đơn đặt lịch của tôi (My booking)
              </div>
              <p class="mt-2 text-xs leading-5 text-emerald-800">
                Lịch do chính bạn đăng ký đã được phê duyệt. Bạn được đảm bảo quyền sử dụng
                phòng/thiết bị trong khung giờ này.
              </p>
            </div>

            <div class="rounded-2xl border border-blue-200 bg-blue-50/60 p-4">
              <div class="flex items-center gap-2 font-bold text-blue-900">
                <span class="h-3.5 w-3.5 rounded bg-blue-500"></span>
                Đặt lịch nội bộ (Internal booking)
              </div>
              <p class="mt-2 text-xs leading-5 text-blue-800">
                Lịch thực hành chính khóa, môn học hoặc dự án nghiên cứu nội bộ của Khoa/Bộ môn.
              </p>
            </div>

            <div class="rounded-2xl border border-cyan-200 bg-cyan-50/60 p-4">
              <div class="flex items-center gap-2 font-bold text-cyan-900">
                <span class="h-3.5 w-3.5 rounded bg-cyan-500"></span>
                Đặt lịch bên ngoài (External booking)
              </div>
              <p class="mt-2 text-xs leading-5 text-cyan-800">
                Khung giờ hợp tác nghiên cứu với đối tác hoặc đơn vị tài trợ bên ngoài trường.
              </p>
            </div>

            <div class="rounded-2xl border border-amber-200 bg-amber-50/60 p-4">
              <div class="flex items-center gap-2 font-bold text-amber-900">
                <span class="h-3.5 w-3.5 rounded bg-amber-500"></span>
                Bảo trì (Maintenance)
              </div>
              <p class="mt-2 text-xs leading-5 text-amber-800">
                Lịch bảo dưỡng, sửa chữa hoặc hiệu chuẩn thiết bị định kỳ. Không thể đăng ký booking
                cá nhân trong khung giờ này.
              </p>
            </div>

            <div class="rounded-2xl border border-rose-200 bg-rose-50/60 p-4">
              <div class="flex items-center gap-2 font-bold text-rose-900">
                <span class="h-3.5 w-3.5 rounded bg-rose-500"></span>
                Không khả dụng (Not available)
              </div>
              <p class="mt-2 text-xs leading-5 text-rose-800">
                Khung giờ phòng/thiết bị tạm khóa do quá tải, sự cố đột xuất hoặc tạm ngưng phục vụ.
              </p>
            </div>

            <div class="rounded-2xl border border-yellow-200 bg-yellow-50/60 p-4">
              <div class="flex items-center gap-2 font-bold text-yellow-900">
                <span class="h-3.5 w-3.5 rounded bg-yellow-500"></span>
                Thông báo (Announcement)
              </div>
              <p class="mt-2 text-xs leading-5 text-yellow-800">
                Sự kiện đặc biệt, hội thảo hoặc thông báo kiểm kê tài nguyên phòng Lab trong ngày.
              </p>
            </div>

            <div class="rounded-2xl border border-purple-200 bg-purple-50/60 p-4">
              <div class="flex items-center gap-2 font-bold text-purple-900">
                <span class="h-3.5 w-3.5 rounded bg-purple-500"></span>
                Đặt lịch quy trình (Workflow booking)
              </div>
              <p class="mt-2 text-xs leading-5 text-purple-800">
                Lịch đặt theo luồng tự động nhiều bước dành cho các bài thí nghiệm chuỗi nhiều thiết
                bị.
              </p>
            </div>

            <div class="rounded-2xl border border-indigo-200 bg-indigo-50/60 p-4">
              <div class="flex items-center gap-2 font-bold text-indigo-900">
                <span class="h-3.5 w-3.5 rounded bg-indigo-500"></span>
                Đặt lịch nhóm (Group booking)
              </div>
              <p class="mt-2 text-xs leading-5 text-indigo-800">
                Khung giờ mượn nhóm sinh viên/nghiên cứu sinh cùng làm đề tài chung.
              </p>
            </div>
          </div>
        </div>
        <div class="mt-5 flex justify-end">
          <button class="btn-secondary" (click)="colorGuideModalOpen.set(false)">Đóng</button>
        </div>
      </app-modal>
    </section>
  `,
})
export class RequesterHomePage implements OnInit {
  private readonly router = inject(Router)
  private readonly workspace = inject(WorkspaceService)
  protected readonly store = inject(AuthStore)
  protected readonly languageStore = inject(LanguageStore)
  private readonly toast = inject(ToastService)

  protected readonly today = new Date()
  protected readonly loading = signal(true)
  protected readonly calendarView = signal<'Today' | 'Day' | 'Week' | 'Month'>('Month')
  protected readonly calendarDate = signal<Date>(new Date(2026, 6, 27))
  protected readonly exportDropdownOpen = signal(false)
  protected readonly colorGuideModalOpen = signal(false)
  protected readonly bookings = signal<BookingResponse[]>([])
  protected readonly waitlists = signal<WaitlistResponse[]>([])
  protected readonly notifications = signal<NotificationResponse[]>([])
  protected readonly unreadCount = signal(0)
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

  protected readonly firstName = computed(() => {
    const parts = this.store.user()?.fullName.trim().split(/\s+/) ?? []
    return parts.at(-1) ?? 'bạn'
  })
  protected readonly upcomingBookings = computed(() =>
    this.bookings()
      .filter(
        (item) => item.status === 'Approved' && new Date(item.startTime).getTime() > Date.now(),
      )
      .sort((a, b) => +new Date(a.startTime) - +new Date(b.startTime)),
  )
  protected readonly pendingBookings = computed(
    () => this.bookings().filter((item) => item.status === 'Pending').length,
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
  protected readonly healthRing = computed(
    () => `conic-gradient(#10b981 0 ${this.healthScore()}%, #e2e8f0 ${this.healthScore()}% 100%)`,
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
    return ''
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
    forkJoin({
      bookings: this.workspace.bookingsByUser(user.userId).pipe(catchError(() => of([]))),
      waitlists: this.workspace.waitlistsByUser(user.userId).pipe(catchError(() => of([]))),
      notifications: this.workspace
        .notifications(user.userId, 1, 10)
        .pipe(catchError(() => of([]))),
      unread: this.workspace
        .unreadCount(user.userId)
        .pipe(catchError(() => of({ userId: user.userId, unreadCount: 0 }))),
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
        this.violationSummary.set(result.violations)
        this.loading.set(false)
      },
      error: () => {
        this.loading.set(false)
        this.toast.error(
          'Không tải được trang chủ',
          'Hãy kiểm tra backend đang chạy tại cổng 5253.',
        )
      },
    })
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

  protected bookingDetail(booking: BookingResponse): void {
    void this.router.navigate(['/app/bookings', booking.bookingId])
  }

  protected comingSoon(name: string): void {
    this.toast.info(
      `${name} chưa nằm trong 9 màn hình`,
      'Nút đã được chuẩn bị sẵn để nối route trong giai đoạn tiếp theo.',
    )
  }

  protected setCalendarView(view: string): void {
    this.calendarView.set(view as 'Today' | 'Day' | 'Week' | 'Month')
  }

  protected prevMonth(): void {
    const cur = this.calendarDate()
    this.calendarDate.set(new Date(cur.getFullYear(), cur.getMonth() - 1, 1))
  }

  protected nextMonth(): void {
    const cur = this.calendarDate()
    this.calendarDate.set(new Date(cur.getFullYear(), cur.getMonth() + 1, 1))
  }

  protected readonly calendarDays = computed(() => {
    const days: { dayName: string; dayNumber: number; dateStr: string }[] = []
    const base = new Date(this.calendarDate())
    for (let i = 1; i <= 12; i++) {
      const d = new Date(base.getFullYear(), base.getMonth(), i)
      const names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      days.push({
        dayName: names[d.getDay()],
        dayNumber: i,
        dateStr: `${base.getFullYear()}-${String(base.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`,
      })
    }
    return days
  })

  protected getEventsForDay(
    dateStr: string,
    slot: 'morning' | 'afternoon',
  ): Array<{ id: string; title: string; time: string; bgClass: string }> {
    const list: Array<{ id: string; title: string; time: string; bgClass: string }> = []
    const dayNum = parseInt(dateStr.split('-')[2], 10)

    if (dayNum === 2 && slot === 'morning') {
      list.push({
        id: '1',
        title: 'My booking #BK-001',
        time: '09:00 - 11:30',
        bgClass: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
      })
    }
    if (dayNum === 4 && slot === 'afternoon') {
      list.push({
        id: '2',
        title: 'Internal Lab Workshop',
        time: '14:00 - 16:30',
        bgClass: 'bg-blue-100 text-blue-800 border border-blue-300',
      })
    }
    if (dayNum === 7 && slot === 'morning') {
      list.push({
        id: '3',
        title: 'Maintenance Lab 102',
        time: '08:30 - 11:30',
        bgClass: 'bg-amber-100 text-amber-800 border border-amber-300',
      })
    }
    if (dayNum === 9 && slot === 'afternoon') {
      list.push({
        id: '4',
        title: 'Workflow Booking #WF-2',
        time: '13:00 - 15:00',
        bgClass: 'bg-purple-100 text-purple-800 border border-purple-300',
      })
    }
    if (dayNum === 11 && slot === 'morning') {
      list.push({
        id: '5',
        title: 'External Partner Meeting',
        time: '09:30 - 11:00',
        bgClass: 'bg-cyan-100 text-cyan-800 border border-cyan-300',
      })
    }
    return list
  }

  protected exportIcsCalendar(): void {
    const icsData = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//SharedLab//BookingCalendar//EN\nSUMMARY:Shared Lab Bookings\nEND:VCALENDAR`
    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' })
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    link.setAttribute('download', 'my-sharedlab-bookings.ics')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    this.toast.success(
      'Đã tải file lịch (.ics)',
      'Bạn có thể import vào Google Calendar hoặc Outlook.',
    )
  }

  protected exportGoogleCalendar(): void {
    window.open('https://calendar.google.com/', '_blank')
    this.toast.info('Google Calendar', 'Chuyển hướng đến Google Calendar để nhập file .ics')
  }
}
