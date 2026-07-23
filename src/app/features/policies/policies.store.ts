import { Injectable, computed, inject, signal } from '@angular/core'
import { firstValueFrom } from 'rxjs'
import { PoliciesService } from './policies.service'
import type { CreatePolicyInput, Policy, UpdatePolicyInput } from './policies.types'

@Injectable({ providedIn: 'root' })
export class PoliciesStore {
  private readonly api = inject(PoliciesService)

  private readonly _items = signal<Policy[]>([])
  private readonly _status = signal<'idle' | 'loading' | 'error'>('idle')
  private readonly _mutating = signal(false)

  readonly items = this._items.asReadonly()
  readonly status = this._status.asReadonly()
  readonly mutating = this._mutating.asReadonly()
  readonly isEmpty = computed(() => this._status() === 'idle' && this._items().length === 0)
  readonly activeCount = computed(() => this._items().filter((p) => p.isActive).length)

  async load(): Promise<void> {
    this._status.set('loading')
    try {
      this._items.set(await firstValueFrom(this.api.getAll()))
      this._status.set('idle')
    } catch {
      this._status.set('error')
    }
  }

  async create(input: CreatePolicyInput): Promise<Policy> {
    this._mutating.set(true)
    try {
      const created = await firstValueFrom(this.api.create(input))
      this._items.update((list) => [created, ...list])
      return created
    } finally {
      this._mutating.set(false)
    }
  }

  async update(id: number, input: UpdatePolicyInput): Promise<void> {
    this._mutating.set(true)
    try {
      await firstValueFrom(this.api.update(id, input))
      this._items.update((list) =>
        list.map((p) => (p.policyId === id ? { ...p, ...input } : p)),
      )
    } finally {
      this._mutating.set(false)
    }
  }

  async remove(id: number): Promise<void> {
    this._mutating.set(true)
    try {
      await firstValueFrom(this.api.delete(id))
      this._items.update((list) => list.filter((p) => p.policyId !== id))
    } finally {
      this._mutating.set(false)
    }
  }
}
