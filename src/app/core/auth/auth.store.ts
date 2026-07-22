import { Injectable, computed, inject, signal } from '@angular/core'
import { firstValueFrom } from 'rxjs'
import { AuthService } from './auth.service'
import { TokenStorage } from './token-storage'
import type { AuthUser, LoginPayload } from './auth.types'

const USER_KEY = 'auth.user'

/**
 * Signal-based auth store. This is the native-Signals equivalent of an NgRx
 * SignalStore — state as signals, derived values as computed, async methods
 * mutating the signals. To migrate to @ngrx/signals later, replace this class
 * with `signalStore(withState(...), withMethods(...))` — call sites (which read
 * `store.user()`, `store.isAuthenticated()`) stay identical.
 */
@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly auth = inject(AuthService)
  private readonly tokens = inject(TokenStorage)

  // --- state ---
  private readonly _user = signal<AuthUser | null>(this.restore())
  private readonly _status = signal<'idle' | 'loading' | 'error'>('idle')
  private readonly _error = signal<string | null>(null)

  // --- selectors ---
  readonly user = this._user.asReadonly()
  readonly status = this._status.asReadonly()
  readonly error = this._error.asReadonly()
  readonly isAuthenticated = computed(() => this._user() !== null)
  readonly roles = computed(() => this._user()?.roles ?? [])

  // --- methods ---
  async login(payload: LoginPayload): Promise<void> {
    this._status.set('loading')
    this._error.set(null)
    try {
      const res = await firstValueFrom(this.auth.login(payload))
      this.tokens.set(res.accessToken, res.refreshToken)
      this._user.set(res.user)
      if (res.user) {
        localStorage.setItem(USER_KEY, JSON.stringify(res.user))
      }
      this._status.set('idle')
    } catch (e) {
      this._status.set('error')
      this._error.set(e instanceof Error ? e.message : 'error')
      throw e
    }
  }

  logout(): void {
    this.tokens.clear()
    localStorage.removeItem(USER_KEY)
    this._user.set(null)
    this._status.set('idle')
    this._error.set(null)
  }

  /** Used by the error interceptor on 401 — clears state without an API round-trip. */
  clear(): void {
    this.tokens.clear()
    localStorage.removeItem(USER_KEY)
    this._user.set(null)
  }

  private restore(): AuthUser | null {
    const raw = localStorage.getItem(USER_KEY)

    // Kiểm tra nếu không có dữ liệu hoặc dữ liệu là chuỗi 'undefined' / 'null'
    if (!raw || raw === 'undefined' || raw === 'null') {
      return null
    }
  
    try {
      return JSON.parse(raw) as AuthUser
    } catch (e) {
      console.error('Lỗi parse AuthUser từ localStorage:', e)
      // Nếu dữ liệu bị hỏng, dọn dẹp sạch luôn
      localStorage.removeItem(USER_KEY)
      return null
    }
  }
}
