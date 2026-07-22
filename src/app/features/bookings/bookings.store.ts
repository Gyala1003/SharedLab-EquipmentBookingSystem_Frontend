import { Injectable, computed, inject, signal } from '@angular/core'
import { firstValueFrom } from 'rxjs'
import { BookingsService } from './bookings.service'
import type {
  BookingDetailResponse,
  BookingResponse,
  CreateBookingRequest,
  RejectBookingRequest,
} from './bookings.types'

@Injectable({ providedIn: 'root' })
export class BookingsStore {
  private readonly api = inject(BookingsService)

  private readonly _items = signal<BookingResponse[]>([])
  private readonly _detail = signal<BookingDetailResponse | null>(null)
  private readonly _status = signal<'idle' | 'loading' | 'error'>('idle')
  private readonly _mutating = signal(false)

  readonly items = this._items.asReadonly()
  readonly detail = this._detail.asReadonly()
  readonly status = this._status.asReadonly()
  readonly mutating = this._mutating.asReadonly()

  readonly pending = computed(() => this._items().filter((b) => b.status === 'Pending'))

  /** Load all bookings (Admin/LabManager) */
  async loadAll(): Promise<void> {
    this._status.set('loading')
    try {
      this._items.set(await firstValueFrom(this.api.getAll()))
      this._status.set('idle')
    } catch {
      this._status.set('error')
    }
  }

  /** Load bookings for a specific user */
  async loadByUserId(userId: number): Promise<void> {
    this._status.set('loading')
    try {
      this._items.set(await firstValueFrom(this.api.getByUserId(userId)))
      this._status.set('idle')
    } catch {
      this._status.set('error')
    }
  }

  /** Load pending bookings (Admin/LabManager) */
  async loadPending(): Promise<void> {
    this._status.set('loading')
    try {
      this._items.set(await firstValueFrom(this.api.getPending()))
      this._status.set('idle')
    } catch {
      this._status.set('error')
    }
  }

  /** Load booking detail by ID */
  async loadById(id: number): Promise<void> {
    this._status.set('loading')
    try {
      this._detail.set(await firstValueFrom(this.api.getById(id)))
      this._status.set('idle')
    } catch {
      this._status.set('error')
    }
  }

  async create(request: CreateBookingRequest): Promise<BookingDetailResponse> {
    this._mutating.set(true)
    try {
      const created = await firstValueFrom(this.api.create(request))
      // Refresh list
      this._items.update((list) => [{
        bookingId: created.bookingId,
        userId: created.userId,
        purposeType: created.purposeType,
        startTime: created.startTime,
        endTime: created.endTime,
        status: created.status,
        createdAt: created.createdAt,
      }, ...list])
      return created
    } finally {
      this._mutating.set(false)
    }
  }

  async approve(id: number): Promise<void> {
    this._mutating.set(true)
    try {
      await firstValueFrom(this.api.approve(id))
      this._items.update((list) =>
        list.map((b) => (b.bookingId === id ? { ...b, status: 'Approved' } : b)),
      )
    } finally {
      this._mutating.set(false)
    }
  }

  async reject(id: number, request: RejectBookingRequest): Promise<void> {
    this._mutating.set(true)
    try {
      await firstValueFrom(this.api.reject(id, request))
      this._items.update((list) =>
        list.map((b) => (b.bookingId === id ? { ...b, status: 'Rejected' } : b)),
      )
    } finally {
      this._mutating.set(false)
    }
  }

  async cancel(id: number): Promise<void> {
    this._mutating.set(true)
    try {
      await firstValueFrom(this.api.cancel(id))
      this._items.update((list) =>
        list.map((b) => (b.bookingId === id ? { ...b, status: 'Cancelled' } : b)),
      )
    } finally {
      this._mutating.set(false)
    }
  }

  async complete(id: number): Promise<void> {
    this._mutating.set(true)
    try {
      await firstValueFrom(this.api.complete(id))
      this._items.update((list) =>
        list.map((b) => (b.bookingId === id ? { ...b, status: 'Completed' } : b)),
      )
    } finally {
      this._mutating.set(false)
    }
  }
}
