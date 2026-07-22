import { Injectable, computed, inject, signal } from '@angular/core'
import { firstValueFrom } from 'rxjs'
import { UsersService } from './users.service'
import type { PagedUserResponse, UpdateUserInput, User, UserSearchParams } from './users.types'

@Injectable({ providedIn: 'root' })
export class UsersStore {
  private readonly api = inject(UsersService)

  private readonly _items = signal<User[]>([])
  private readonly _status = signal<'idle' | 'loading' | 'error'>('idle')
  private readonly _mutating = signal(false)
  private readonly _totalCount = signal(0)
  private readonly _totalPages = signal(0)
  private readonly _pageNumber = signal(1)
  private readonly _pageSize = signal(20)

  readonly items = this._items.asReadonly()
  readonly status = this._status.asReadonly()
  readonly mutating = this._mutating.asReadonly()
  readonly totalCount = this._totalCount.asReadonly()
  readonly totalPages = this._totalPages.asReadonly()
  readonly pageNumber = this._pageNumber.asReadonly()
  readonly pageSize = this._pageSize.asReadonly()
  readonly isEmpty = computed(() => this._status() === 'idle' && this._items().length === 0)

  async load(params: UserSearchParams = {}): Promise<void> {
    this._status.set('loading')
    try {
      const res: PagedUserResponse = await firstValueFrom(
        this.api.search({
          ...params,
          pageNumber: params.pageNumber ?? this._pageNumber(),
          pageSize: params.pageSize ?? this._pageSize(),
        }),
      )
      this._items.set(res.items)
      this._totalCount.set(res.totalCount)
      this._totalPages.set(res.totalPages)
      this._pageNumber.set(res.pageNumber)
      this._pageSize.set(res.pageSize)
      this._status.set('idle')
    } catch {
      this._status.set('error')
    }
  }

  async update(id: number, input: UpdateUserInput): Promise<void> {
    this._mutating.set(true)
    try {
      const updated = await firstValueFrom(this.api.update(id, input))
      this._items.update((list) => list.map((u) => (u.userId === id ? updated : u)))
    } finally {
      this._mutating.set(false)
    }
  }

  async lock(id: number): Promise<void> {
    this._mutating.set(true)
    try {
      const updated = await firstValueFrom(this.api.lock(id))
      this._items.update((list) => list.map((u) => (u.userId === id ? updated : u)))
    } finally {
      this._mutating.set(false)
    }
  }

  async unlock(id: number): Promise<void> {
    this._mutating.set(true)
    try {
      const updated = await firstValueFrom(this.api.unlock(id))
      this._items.update((list) => list.map((u) => (u.userId === id ? updated : u)))
    } finally {
      this._mutating.set(false)
    }
  }

  async deactivate(id: number): Promise<void> {
    this._mutating.set(true)
    try {
      const updated = await firstValueFrom(this.api.deactivate(id))
      this._items.update((list) => list.map((u) => (u.userId === id ? updated : u)))
    } finally {
      this._mutating.set(false)
    }
  }

  async activate(id: number): Promise<void> {
    this._mutating.set(true)
    try {
      const updated = await firstValueFrom(this.api.activate(id))
      this._items.update((list) => list.map((u) => (u.userId === id ? updated : u)))
    } finally {
      this._mutating.set(false)
    }
  }
}
