import { Injectable, computed, inject, signal } from '@angular/core'
import { firstValueFrom } from 'rxjs'
import { MaintenanceService } from './maintenance.service'
import type { CreateMaintenanceInput, MaintenanceSchedule, UpdateMaintenanceInput } from './maintenance.types'

@Injectable({ providedIn: 'root' })
export class MaintenanceStore {
  private readonly api = inject(MaintenanceService)

  private readonly _items = signal<MaintenanceSchedule[]>([])
  private readonly _status = signal<'idle' | 'loading' | 'error'>('idle')
  private readonly _mutating = signal(false)

  readonly items = this._items.asReadonly()
  readonly status = this._status.asReadonly()
  readonly mutating = this._mutating.asReadonly()
  readonly isEmpty = computed(() => this._status() === 'idle' && this._items().length === 0)

  readonly activeCount = computed(
    () => this._items().filter((m) => m.status === 'Scheduled' || m.status === 'InProgress').length,
  )

  readonly totalCost = computed(
    () => this._items().reduce((sum, m) => sum + (m.cost || 0), 0),
  )

  readonly completedItems = computed(
    () => this._items().filter((m) => m.status === 'Completed'),
  )

  async load(): Promise<void> {
    this._status.set('loading')
    try {
      this._items.set(await firstValueFrom(this.api.getAll()))
      this._status.set('idle')
    } catch {
      this._status.set('error')
    }
  }

  async create(input: CreateMaintenanceInput): Promise<MaintenanceSchedule> {
    this._mutating.set(true)
    try {
      const created = await firstValueFrom(this.api.create(input))
      this._items.update((list) => [created, ...list])
      return created
    } finally {
      this._mutating.set(false)
    }
  }

  async update(id: number, input: UpdateMaintenanceInput): Promise<void> {
    this._mutating.set(true)
    try {
      await firstValueFrom(this.api.update(id, input))
      this._items.update((list) =>
        list.map((m) => (m.maintenanceId === id ? { ...m, ...input } : m)),
      )
    } finally {
      this._mutating.set(false)
    }
  }

  async remove(id: number): Promise<void> {
    this._mutating.set(true)
    try {
      await firstValueFrom(this.api.delete(id))
      this._items.update((list) => list.filter((m) => m.maintenanceId !== id))
    } finally {
      this._mutating.set(false)
    }
  }
}
