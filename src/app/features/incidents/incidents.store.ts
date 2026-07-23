import { Injectable, computed, inject, signal } from '@angular/core'
import { firstValueFrom } from 'rxjs'
import { IncidentsService } from './incidents.service'
import type { CreateIncidentInput, Incident, UpdateIncidentInput } from './incidents.types'

@Injectable({ providedIn: 'root' })
export class IncidentsStore {
  private readonly api = inject(IncidentsService)

  private readonly _items = signal<Incident[]>([])
  private readonly _status = signal<'idle' | 'loading' | 'error'>('idle')
  private readonly _mutating = signal(false)

  readonly items = this._items.asReadonly()
  readonly status = this._status.asReadonly()
  readonly mutating = this._mutating.asReadonly()
  readonly isEmpty = computed(() => this._status() === 'idle' && this._items().length === 0)
  readonly openCount = computed(() => this._items().filter((i) => i.status === 'Open' || i.status === 'InProgress').length)

  async load(): Promise<void> {
    this._status.set('loading')
    try {
      this._items.set(await firstValueFrom(this.api.getAll()))
      this._status.set('idle')
    } catch {
      this._status.set('error')
    }
  }

  async create(input: CreateIncidentInput): Promise<Incident> {
    this._mutating.set(true)
    try {
      const created = await firstValueFrom(this.api.create(input))
      this._items.update((list) => [created, ...list])
      return created
    } finally {
      this._mutating.set(false)
    }
  }

  async update(id: number, input: UpdateIncidentInput): Promise<void> {
    this._mutating.set(true)
    try {
      await firstValueFrom(this.api.update(id, input))
      this._items.update((list) =>
        list.map((i) => (i.incidentId === id ? { ...i, ...input } : i)),
      )
    } finally {
      this._mutating.set(false)
    }
  }
}
