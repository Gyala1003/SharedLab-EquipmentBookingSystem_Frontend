import { Injectable, computed, inject, signal } from '@angular/core'
import { firstValueFrom } from 'rxjs'
import { ViolationsService } from './violations.service'
import type { CreateViolationInput, Violation } from './violations.types'

const VIOLATIONS_KEY = 'app_violations_items_v2'

function getStoredViolations(): Violation[] {
  try {
    const raw = localStorage.getItem(VIOLATIONS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveStoredViolations(items: Violation[]): void {
  try {
    localStorage.setItem(VIOLATIONS_KEY, JSON.stringify(items))
  } catch {}
}

@Injectable({ providedIn: 'root' })
export class ViolationsStore {
  private readonly api = inject(ViolationsService)

  private readonly _items = signal<Violation[]>(getStoredViolations())
  private readonly _status = signal<'idle' | 'loading' | 'error'>('idle')
  private readonly _mutating = signal(false)

  readonly items = this._items.asReadonly()
  readonly status = this._status.asReadonly()
  readonly mutating = this._mutating.asReadonly()
  readonly isEmpty = computed(() => this._status() === 'idle' && this._items().length === 0)

  async load(): Promise<void> {
    this._status.set('loading')
    try {
      const remote = await firstValueFrom(this.api.getAll())
      if (remote && remote.length > 0) {
        const remoteIds = new Set(remote.map((r) => r.violationId))
        const localOnly = this._items().filter((l) => !remoteIds.has(l.violationId))
        const merged = [...remote, ...localOnly]
        this._items.set(merged)
        saveStoredViolations(merged)
      }
      this._status.set('idle')
    } catch {
      this._status.set('idle')
    }
  }

  async create(input: CreateViolationInput): Promise<Violation> {
    this._mutating.set(true)
    try {
      let created: Violation
      try {
        created = await firstValueFrom(this.api.create(input))
      } catch {
        const mockId = Math.floor(100000 + Math.random() * 900000)
        created = {
          violationId: mockId,
          userId: input.userId,
          userName: `User #${input.userId}`,
          bookingId: input.bookingId ?? null,
          policyId: input.policyId,
          policyTitle: 'Quy định phòng Lab',
          description: input.description,
          violationCount: 1,
          actionTaken: null,
          createdAt: new Date().toISOString(),
        }
      }

      const updated = [created, ...this._items().filter((v) => v.violationId !== created.violationId)]
      this._items.set(updated)
      saveStoredViolations(updated)
      return created
    } finally {
      this._mutating.set(false)
    }
  }

  addAutoViolation(userId: number, bookingId: number, description: string, actionTaken: string): void {
    // Avoid duplicate violation for the same booking
    const exists = this._items().some((v) => v.bookingId === bookingId && v.description.includes(description.slice(0, 15)))
    if (exists) return

    const mockId = Math.floor(100000 + Math.random() * 900000)
    const autoCreated: Violation = {
      violationId: mockId,
      userId,
      userName: `User #${userId}`,
      bookingId,
      policyId: 1,
      policyTitle: 'Chính sách Quá giờ / No-Show',
      description,
      violationCount: 1,
      actionTaken,
      createdAt: new Date().toISOString(),
    }

    const updated = [autoCreated, ...this._items()]
    this._items.set(updated)
    saveStoredViolations(updated)
  }

  isUserLocked(userId: number): boolean {
    return this._items().some((v) => v.userId === userId && v.actionTaken && v.actionTaken.includes('Khoá đặt lịch'))
  }

  updateActionTaken(violationId: number, actionTaken: string | null): void {
    const updated = this._items().map((v) => (v.violationId === violationId ? { ...v, actionTaken } : v))
    this._items.set(updated)
    saveStoredViolations(updated)
  }
}
