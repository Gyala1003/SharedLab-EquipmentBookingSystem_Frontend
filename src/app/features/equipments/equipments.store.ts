import { Injectable, computed, inject, signal } from '@angular/core'
import { firstValueFrom } from 'rxjs'
import { EquipmentsService } from './equipments.service'
import type { CreateEquipmentInput, Equipment, EquipmentDetail } from './equipments.types'

@Injectable({ providedIn: 'root' })
export class EquipmentsStore {
  private readonly api = inject(EquipmentsService)

  private readonly _items = signal<Equipment[]>([])
  private readonly _selected = signal<EquipmentDetail | null>(null)
  private readonly _status = signal<'idle' | 'loading' | 'error'>('idle')
  private readonly _mutating = signal(false)

  readonly items = this._items.asReadonly()
  readonly selected = this._selected.asReadonly()
  readonly status = this._status.asReadonly()
  readonly mutating = this._mutating.asReadonly()
  readonly isEmpty = computed(() => this._status() === 'idle' && this._items().length === 0)
  readonly availableCount = computed(
    () => this._items().filter((e) => e.status === 'Available').length,
  )
  readonly brokenCount = computed(
    () => this._items().filter((e) => e.status === 'Broken' || e.status === 'Maintenance').length,
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

  async create(input: CreateEquipmentInput): Promise<EquipmentDetail> {
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
      this._items.update((list) => list.filter((e) => e.equipmentId !== id))
    } finally {
      this._mutating.set(false)
    }
  }
}
