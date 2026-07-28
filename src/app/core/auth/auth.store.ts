import { Injectable, computed, inject, signal } from '@angular/core'
import { firstValueFrom } from 'rxjs'
import { ApiError } from '../http/api-error'
import { AuthService } from './auth.service'
import { TokenStorage } from './token-storage'
import type { AuthUser, LoginPayload, UserRole } from './auth.types'

const USER_KEY = 'auth.user'

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly auth = inject(AuthService)
  private readonly tokens = inject(TokenStorage)

  private readonly _user = signal<AuthUser | null>(this.restore())
  private readonly _status = signal<'idle' | 'loading' | 'error'>('idle')
  private readonly _error = signal<string | null>(null)
  private readonly _logoutStatus = signal<'idle' | 'loading'>('idle')

  readonly user = this._user.asReadonly()
  readonly status = this._status.asReadonly()
  readonly error = this._error.asReadonly()
  readonly isAuthenticated = computed(() => Boolean(this._user() && this.tokens.access))
  readonly role = computed(() => this._user()?.roleName ?? '')
  readonly roles = computed(() => this._user()?.roleName ? [this._user()!.roleName as UserRole] : [])
  readonly isRequester = computed(() => this.role() === 'Requester')
  readonly isManager = computed(() => this.role() === 'LabManager')
  readonly isAdmin = computed(() => this.role() === 'Admin')
  readonly logoutStatus = this._logoutStatus.asReadonly()

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

  async hydrate(): Promise<void> {
    if (!this.tokens.access) return
    try {
      const user = await firstValueFrom(this.auth.me())
      this.setUser(user)
    } catch {
      this.clearLocalSession()
    }
  }

  /**
   * Calls the backend logout endpoint, then always clears local session state
   * regardless of the API outcome (a failed round-trip shouldn't leave the
   * user stuck "logged in" locally). Re-throws on failure so the caller can
   * distinguish success vs. failure for navigation purposes.
   */
  async logout(): Promise<void> {
    const refreshToken = this.tokens.refresh
    this._logoutStatus.set('loading')
    try {
      if (refreshToken) {
        await firstValueFrom(this.auth.logout(refreshToken))
      }
    } finally {
      this.clear()
      this._logoutStatus.set('idle')
    }
  }

  hasRole(roles: readonly UserRole[]): boolean {
    return roles.includes(this.role() as UserRole)
  }

  clearLocalSession(): void {
    this.tokens.clear()
    localStorage.removeItem(USER_KEY)
    sessionStorage.removeItem(USER_KEY)
    this._user.set(null)
    this._status.set('idle')
    this._error.set(null)
  }

  private setUser(user: AuthUser, persistent = this.tokens.isPersistent): void {
    this._user.set(user)
    const target = persistent ? localStorage : sessionStorage
    const other = persistent ? sessionStorage : localStorage
    other.removeItem(USER_KEY)
    target.setItem(USER_KEY, JSON.stringify(user))
  }

  private restore(): AuthUser | null {
    const raw = localStorage.getItem(USER_KEY) ?? sessionStorage.getItem(USER_KEY)
    // Kiểm tra nếu không có dữ liệu hoặc dữ liệu là chuỗi 'undefined' / 'null'
    if (!raw || raw === 'undefined' || raw === 'null') {
      return null
    }

    try {
      return JSON.parse(raw) as AuthUser
    } catch {
      localStorage.removeItem(USER_KEY)
      sessionStorage.removeItem(USER_KEY)
      return null
    }
  }

  private resolveMessage(error: unknown): string {
    if (error instanceof ApiError) return error.message
    if (error instanceof Error) return error.message
    return 'Không thể đăng nhập. Vui lòng thử lại.'
  }
}
