import { Component, computed, inject, output, signal } from '@angular/core'
import { DatePipe } from '@angular/common'
import { TranslatePipe } from '@ngx-translate/core'
import { BadgeTone } from '../../shared/ui/badge'
import { IconComponent } from '../../shared/ui/icon'
import type { BookingResponse } from './bookings.types'
import { BookingsStore } from './bookings.store'

const STATUS_TONE: Record<string, BadgeTone> = {
  Approved: 'green',
  Pending: 'amber',
  Rejected: 'red',
  Cancelled: 'slate',
  Completed: 'green',
  CheckedIn: 'green',
  NoShow: 'red',
}

const STATUS_COLOR: Record<string, string> = {
  Approved: 'bg-emerald-500',
  Pending: 'bg-amber-500',
  Rejected: 'bg-red-500',
  Cancelled: 'bg-slate-400',
  Completed: 'bg-emerald-400',
  CheckedIn: 'bg-blue-500',
  NoShow: 'bg-red-400',
}

interface CalendarDay {
  date: Date
  day: number
  isCurrentMonth: boolean
  isToday: boolean
  bookings: BookingResponse[]
}

@Component({
  selector: 'app-booking-calendar',
  imports: [DatePipe, TranslatePipe, IconComponent],
  template: `
    <div class="rounded-xl border border-slate-200 bg-white">
      <!-- Header with navigation -->
      <div class="flex items-center justify-between border-b border-slate-200 px-5 py-3">
        <button
          class="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          (click)="prevMonth()"
        >
          <app-icon name="back" [size]="18" />
        </button>
        <h3 class="text-sm font-semibold text-slate-900">
          {{ currentDate() | date: 'MMMM yyyy' }}
        </h3>
        <button
          class="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          (click)="nextMonth()"
        >
          <app-icon name="chevronRight" [size]="18" />
        </button>
      </div>

      <!-- Day headers -->
      <div class="grid grid-cols-7 border-b border-slate-100">
        @for (dayName of dayNames; track dayName) {
          <div class="px-2 py-2 text-center text-xs font-medium text-slate-500">
            {{ dayName }}
          </div>
        }
      </div>

      <!-- Calendar grid -->
      <div class="grid grid-cols-7">
        @for (day of calendarDays(); track day.date.toISOString()) {
          <div
            class="min-h-[80px] border-b border-r border-slate-100 p-1 text-xs transition-colors"
            [class.bg-slate-50]="!day.isCurrentMonth"
            [class.bg-brand-50]="day.isToday"
          >
            <div class="mb-1 flex justify-between">
              <span
                class="inline-flex h-6 w-6 items-center justify-center rounded-full text-xs"
                [class.font-medium]="day.isCurrentMonth"
                [class.text-slate-400]="!day.isCurrentMonth"
                [class.text-slate-700]="day.isCurrentMonth && !day.isToday"
                [class.bg-brand-500]="day.isToday"
                [class.text-white]="day.isToday"
              >
                {{ day.day }}
              </span>
            </div>
            <div class="flex flex-col gap-0.5">
              @for (b of day.bookings.slice(0, 2); track b.bookingId) {
                <button
                  class="flex w-full items-center gap-1 rounded px-1 py-0.5 text-left text-[10px] font-medium text-white transition-opacity hover:opacity-80"
                  [class]="STATUS_COLOR[b.status] ?? 'bg-slate-400'"
                  (click)="bookingClick.emit(b.bookingId)"
                >
                  <span class="truncate">{{ b.purposeType }}</span>
                </button>
              }
              @if (day.bookings.length > 2) {
                <span class="px-1 text-[10px] text-slate-500">
                  +{{ day.bookings.length - 2 }} {{ 'calendar.more' | translate }}
                </span>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class BookingCalendarComponent {
  protected readonly store = inject(BookingsStore)
  readonly bookingClick = output<number>()

  protected readonly STATUS_TONE = STATUS_TONE
  protected readonly STATUS_COLOR = STATUS_COLOR
  protected readonly dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  protected readonly currentDate = signal(new Date())

  protected readonly calendarDays = computed(() => {
    const date = this.currentDate()
    const year = date.getFullYear()
    const month = date.getMonth()
    const bookings = this.store.items()

    // First day of month
    const firstDay = new Date(year, month, 1)
    // Last day of month
    const lastDay = new Date(year, month + 1, 0)

    // Start from Monday before the first day
    let startDate = new Date(firstDay)
    const dayOfWeek = startDate.getDay()
    const offset = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // Monday = 0
    startDate.setDate(startDate.getDate() - offset)

    // End on Sunday after the last day
    let endDate = new Date(lastDay)
    const endDayOfWeek = endDate.getDay()
    if (endDayOfWeek !== 0) {
      endDate.setDate(endDate.getDate() + (7 - endDayOfWeek))
    }

    const days: CalendarDay[] = []
    const current = new Date(startDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    while (current <= endDate) {
      const dayStart = new Date(current)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(current)
      dayEnd.setHours(23, 59, 59, 999)

      const dayBookings = bookings.filter((b) => {
        const bStart = new Date(b.startTime)
        const bEnd = new Date(b.endTime)
        return bStart <= dayEnd && bEnd >= dayStart
      })

      days.push({
        date: new Date(current),
        day: current.getDate(),
        isCurrentMonth: current.getMonth() === month,
        isToday: current.getTime() === today.getTime(),
        bookings: dayBookings,
      })
      current.setDate(current.getDate() + 1)
    }

    return days
  })

  prevMonth(): void {
    const d = this.currentDate()
    this.currentDate.set(new Date(d.getFullYear(), d.getMonth() - 1, 1))
  }

  nextMonth(): void {
    const d = this.currentDate()
    this.currentDate.set(new Date(d.getFullYear(), d.getMonth() + 1, 1))
  }
}
