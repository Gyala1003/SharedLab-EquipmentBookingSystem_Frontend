import { Injectable, computed, inject, signal } from '@angular/core'
import { firstValueFrom } from 'rxjs'
import { LabRoomsService } from './lab-rooms.service'
import type { CreateLabRoomInput, LabRoom, LabRoomDetail } from './lab-rooms.types'

@Injectable({ providedIn: 'root' })
export class LabRoomsStore {
  private readonly api = inject(LabRoomsService)

  private readonly _items = signal<LabRoom[]>([])
  private readonly _selected = signal<LabRoomDetail | null>(null)
  private readonly _status = signal<'idle' | 'loading' | 'error'>('idle')
  private readonly _mutating = signal(false)

  readonly items = this._items.asReadonly()
  readonly selected = this._selected.asReadonly()
  readonly status = this._status.asReadonly()
  readonly mutating = this._mutating.asReadonly()
  readonly isEmpty = computed(() => this._status() === 'idle' && this._items().length === 0)
  readonly availableCount = computed(
    () => this._items().filter((r) => r.status === 'Available').length,
  )
  readonly maintenanceCount = computed(
    () => this._items().filter((r) => r.status === 'Maintenance').length,
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

  async ensureLoaded(): Promise<void> {
    if (this._items().length === 0 && this._status() === 'idle') await this.load()
  }

  async loadById(id: number): Promise<void> {
    this._status.set('loading')
    try {
      this._selected.set(await firstValueFrom(this.api.getById(id)))
      this._status.set('idle')
    } catch {
      this._status.set('error')
    }
  }

  async create(input: CreateLabRoomInput): Promise<LabRoomDetail> {
    this._mutating.set(true)
    try {
      const created = await firstValueFrom(this.api.create(input))
      await this.load()
      return created
    } finally {
      this._mutating.set(false)
    }
  }

  async remove(id: number): Promise<void> {
    this._mutating.set(true)
    try {
      await firstValueFrom(this.api.delete(id))
      this._items.update((list) => list.filter((r) => r.labId !== id))
    } finally {
      this._mutating.set(false)
    }
  }
}
