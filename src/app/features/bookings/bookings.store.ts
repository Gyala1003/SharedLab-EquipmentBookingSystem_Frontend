import { Injectable, computed, inject, signal } from '@angular/core'
import { firstValueFrom } from 'rxjs'
import { BookingsService } from './bookings.service'
import { ViolationsStore } from '../violations/violations.store'
import type {
  BookingDetailResponse,
  BookingResponse,
  CalendarEventResponse,
  CreateBookingRequest,
  RejectBookingRequest,
} from './bookings.types'

import { AuthStore } from '../../core/auth/auth.store'

@Injectable({ providedIn: 'root' })
export class BookingsStore {
  private readonly api = inject(BookingsService)
  private readonly violationsStore = inject(ViolationsStore)
  private readonly authStore = inject(AuthStore)

  private readonly _items = signal<BookingResponse[]>([])
  private readonly _detail = signal<BookingDetailResponse | null>(null)
  private readonly _calendarEvents = signal<CalendarEventResponse[]>([])
  private readonly _status = signal<'idle' | 'loading' | 'error'>('idle')
  private readonly _mutating = signal(false)

  readonly items = this._items.asReadonly()
  readonly detail = this._detail.asReadonly()
  readonly calendarEvents = this._calendarEvents.asReadonly()
  readonly status = this._status.asReadonly()
  readonly mutating = this._mutating.asReadonly()

  readonly pending = computed(() => this._items().filter((b) => b.status === 'Pending'))

  private checkAndProcessOverdueBookings(): void {
    const now = Date.now()
    let updated = false
    const items = this._items()

    items.forEach((b) => {
      if (!b.endTime) return
      const endTimeMs = new Date(b.endTime).getTime()

      if (now > endTimeMs) {
        if (b.status === 'CheckedIn') {
          b.status = 'Completed'
          updated = true
          this.violationsStore.addAutoViolation(
            b.userId,
            b.bookingId,
            `Vi phạm: Quên Check-out khi hết thời gian ca đặt lịch phòng Lab #${b.bookingId}`,
            'Tự động ghi nhận vi phạm quá giờ',
          )
        } else if (b.status === 'Approved') {
          b.status = 'NoShow'
          updated = true
          this.violationsStore.addAutoViolation(
            b.userId,
            b.bookingId,
            `Vi phạm: Vắng mặt không Check-in theo lịch đặt phòng Lab #${b.bookingId} đã duyệt`,
            'Tự động ghi nhận lỗi No-Show',
          )
        }
      }
    })

    if (updated) {
      this._items.set([...items])
    }
  }

  /** Load all bookings (Admin/LabManager) */
  async loadAll(): Promise<void> {
    this.checkAndProcessOverdueBookings()
    this._status.set('loading')
    try {
      const remote = await firstValueFrom(this.api.getAll())
      this._items.set(remote)
      this.checkAndProcessOverdueBookings()
      this._status.set('idle')
    } catch {
      this._status.set('error')
    }
  }

  /** Load bookings for a specific user */
  async loadByUserId(userId: number): Promise<void> {
    this._status.set('loading')
    try {
      const remote = await firstValueFrom(this.api.getByUserId(userId))
      this._items.set(remote)
      this.checkAndProcessOverdueBookings()
      this._status.set('idle')
    } catch {
      this._status.set('error')
    }
  }

  /** Load pending bookings (Admin/LabManager) */
  async loadPending(): Promise<void> {
    this._status.set('loading')
    try {
      const remote = await firstValueFrom(this.api.getPending())
      this._items.set(remote)
      this.checkAndProcessOverdueBookings()
      this._status.set('idle')
    } catch {
      this._status.set('error')
    }
  }

  /** Load booking detail by ID */
  async loadById(id: number): Promise<void> {
    this._status.set('loading')
    try {
      const detail = await firstValueFrom(this.api.getById(id))
      this._detail.set(detail)
      this._status.set('idle')
    } catch {
      this._status.set('error')
    }
  }

  /** Load calendar events for a date range */
  async loadCalendar(from: string, to: string, labId?: number, equipmentId?: number): Promise<void> {
    try {
      const res = await firstValueFrom(this.api.getCalendar(from, to, labId, equipmentId))
      this._calendarEvents.set(res ?? [])
    } catch {
      this._calendarEvents.set([])
    }
  }

  async create(request: CreateBookingRequest): Promise<BookingDetailResponse> {
    this._mutating.set(true)
    try {
      const created = await firstValueFrom(this.api.create(request))
      
      const summaryItem: BookingResponse = {
        bookingId: created.bookingId,
        userId: created.userId,
        purposeType: created.purposeType,
        startTime: created.startTime,
        endTime: created.endTime,
        status: created.status,
        createdAt: created.createdAt,
      }

      const updatedList = [summaryItem, ...this._items()]
      this._items.set(updatedList)

      this._calendarEvents.update((events) => [
        {
          bookingId: created.bookingId,
          title: `Lịch đặt #${created.bookingId} (${created.purposeType})`,
          start: created.startTime,
          end: created.endTime,
          status: created.status,
        },
        ...events,
      ])

      this._status.set('idle')
      return created
    } finally {
      this._mutating.set(false)
    }
  }

  async approve(id: number): Promise<void> {
    this._mutating.set(true)
    try {
      await firstValueFrom(this.api.approve(id))

      const updatedList = this._items().map((b) => (b.bookingId === id ? { ...b, status: 'Approved' } : b))
      this._items.set(updatedList)

      if (this._detail()?.bookingId === id) {
        const updatedDetail = { ...this._detail()!, status: 'Approved', approvedAt: new Date().toISOString() }
        this._detail.set(updatedDetail)
      }
    } finally {
      this._mutating.set(false)
    }
  }

  async reject(id: number, request: RejectBookingRequest): Promise<void> {
    this._mutating.set(true)
    try {
      await firstValueFrom(this.api.reject(id, request))

      const updatedList = this._items().map((b) =>
        b.bookingId === id ? { ...b, status: 'Rejected', rejectionReason: request.reason } : b,
      )
      this._items.set(updatedList)

      if (this._detail()?.bookingId === id) {
        const updatedDetail = { ...this._detail()!, status: 'Rejected', rejectionReason: request.reason }
        this._detail.set(updatedDetail)
      }
    } finally {
      this._mutating.set(false)
    }
  }

  async cancel(id: number): Promise<void> {
    this._mutating.set(true)
    try {
      await firstValueFrom(this.api.cancel(id))

      const updatedList = this._items().map((b) => (b.bookingId === id ? { ...b, status: 'Cancelled' } : b))
      this._items.set(updatedList)

      if (this._detail()?.bookingId === id) {
        const updatedDetail = { ...this._detail()!, status: 'Cancelled' }
        this._detail.set(updatedDetail)
      }
    } finally {
      this._mutating.set(false)
    }
  }

  async complete(id: number): Promise<void> {
    this._mutating.set(true)
    try {
      await firstValueFrom(this.api.complete(id))

      const updatedList = this._items().map((b) => (b.bookingId === id ? { ...b, status: 'Completed' } : b))
      this._items.set(updatedList)

      if (this._detail()?.bookingId === id) {
        const updatedDetail = { ...this._detail()!, status: 'Completed', checkedOutAt: new Date().toISOString() }
        this._detail.set(updatedDetail)
      }
    } finally {
      this._mutating.set(false)
    }
  }

  async checkIn(id: number): Promise<void> {
    this._mutating.set(true)
    try {
      await firstValueFrom(this.api.checkIn(id))

      const updatedList = this._items().map((b) => (b.bookingId === id ? { ...b, status: 'CheckedIn' } : b))
      this._items.set(updatedList)

      if (this._detail()?.bookingId === id) {
        const updatedDetail = { ...this._detail()!, status: 'CheckedIn', checkedInAt: new Date().toISOString() }
        this._detail.set(updatedDetail)
      }
    } finally {
      this._mutating.set(false)
    }
  }

  async checkOut(id: number): Promise<void> {
    this._mutating.set(true)
    try {
      await firstValueFrom(this.api.checkOut(id))

      const updatedList = this._items().map((b) => (b.bookingId === id ? { ...b, status: 'Completed' } : b))
      this._items.set(updatedList)

      if (this._detail()?.bookingId === id) {
        const updatedDetail = { ...this._detail()!, status: 'Completed', checkedOutAt: new Date().toISOString() }
        this._detail.set(updatedDetail)
      }
    } finally {
      this._mutating.set(false)
    }
  }
}
