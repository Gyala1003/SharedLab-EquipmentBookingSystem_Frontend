import { Injectable, computed, inject, signal } from '@angular/core'
import { firstValueFrom } from 'rxjs'
import { AuthService } from './auth.service'
import { TokenStorage } from './token-storage'
import type { AuthUser, LoginPayload, UpdateProfilePayload } from './auth.types'

const USER_KEY = 'auth.user'

/**
 * Signal-based auth store. Handles login (tokens + user fetch via /auth/me),
 * logout (API call + local clear), and role-based access helpers.
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
  readonly roleName = computed(() => this._user()?.roleName ?? '')
  readonly isAdmin = computed(() => this._user()?.roleName === 'Admin')
  readonly isLabManager = computed(() => this._user()?.roleName === 'LabManager')
  readonly isRequester = computed(() => !this.isAdmin() && !this.isLabManager())
  readonly isAdminOrManager = computed(
    () => this.isAdmin() || this.isLabManager(),
  )

  // --- methods ---
  async login(payload: LoginPayload): Promise<void> {
    this._status.set('loading')
    this._error.set(null)
    try {
      // Step 1: get tokens
      const res = await firstValueFrom(this.auth.login(payload))
      this.tokens.set(res.accessToken, res.refreshToken)

      // Step 2: fetch user profile
      const user = await firstValueFrom(this.auth.getMe())
      this._user.set(user)
      localStorage.setItem(USER_KEY, JSON.stringify(user))
      this._status.set('idle')
    } catch (e) {
      this._status.set('error')
      this._error.set(e instanceof Error ? e.message : 'error')
      throw e
    }
  }

  async logout(): Promise<void> {
    const refreshToken = this.tokens.refresh
    if (refreshToken) {
      try {
        await firstValueFrom(this.auth.logout(refreshToken))
      } catch {
        /* best-effort: clear local state even if API fails */
      }
    }
    this.tokens.clear()
    localStorage.removeItem(USER_KEY)
    this._user.set(null)
    this._status.set('idle')
    this._error.set(null)
  }

  async updateProfile(payload: UpdateProfilePayload): Promise<void> {
    this._status.set('loading')
    try {
      const updatedUser = await firstValueFrom(this.auth.updateProfile(payload))
      this._user.set(updatedUser)
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser))
      this._status.set('idle')
    } catch (e) {
      this._status.set('error')
      this._error.set(e instanceof Error ? e.message : 'Lỗi cập nhật profile')
      throw e
    }
  }

  /** Used by the error interceptor on 401 — clears state without an API round-trip. */
  clear(): void {
    this.tokens.clear()
    localStorage.removeItem(USER_KEY)
    this._user.set(null)
  }

  private restore(): AuthUser | null {
    const raw = localStorage.getItem(USER_KEY)
    if (!raw || raw === 'undefined') return null
    try {
      return JSON.parse(raw) as AuthUser
    } catch {
      return null
    }
  }
}
