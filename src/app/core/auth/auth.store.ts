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
  readonly role = computed(() => this._user()?.roleName?.trim() ?? '')
  readonly roles = computed(() =>
    this._user()?.roleName ? [this._user()!.roleName as UserRole] : [],
  )
  readonly isRequester = computed(() => {
    const r = this.role().toLowerCase().replace(/[\s_]+/g, '')
    return r === 'requester' || r === 'student' || r === 'user'
  })
  readonly isManager = computed(() => {
    const r = this.role().toLowerCase().replace(/[\s_]+/g, '')
    return r === 'labmanager' || r === 'manager'
  })
  readonly isAdmin = computed(() => {
    const r = this.role().toLowerCase().replace(/[\s_]+/g, '')
    return r === 'admin' || r === 'administrator'
  })
  readonly logoutStatus = this._logoutStatus.asReadonly()

  /** Trả về AuthUser để trang Login điều hướng theo role ngay sau khi đăng nhập. */
  async login(payload: LoginPayload, remember = true): Promise<AuthUser> {
    this._status.set('loading')
    this._error.set(null)
    try {
      const res = await firstValueFrom(this.auth.login(payload))
      this.tokens.set(res.accessToken, res.refreshToken, remember)
      this.setUser(res.user, remember)
      this._error.set(null) // Reset lỗi về null khi thành công
      this._status.set('idle')
      return res.user
    } catch (e) {
      this._status.set('error')
      this._error.set(this.resolveMessage(e))
      throw e
    }
  }

  async hydrate(): Promise<void> {
    if (!this.tokens.access) return
    try {
      const user = await firstValueFrom(this.auth.me())
      this.setUser(user, this.tokens.isPersistent)
    } catch {
      this.clear()
    }
  }

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
    const rawRole = this.role().trim().toLowerCase().replace(/[\s_]+/g, '')
    if (!rawRole) return false
    return roles.some((r) => {
      const target = r.trim().toLowerCase().replace(/[\s_]+/g, '')
      if (target === rawRole) return true
      if (target === 'admin' && (rawRole === 'admin' || rawRole === 'administrator')) return true
      if (target === 'labmanager' && (rawRole === 'labmanager' || rawRole === 'manager')) return true
      if (target === 'requester' && (rawRole === 'requester' || rawRole === 'student' || rawRole === 'user')) return true
      return false
    })
  }

  clear(): void {
    this.tokens.clear()
    localStorage.removeItem(USER_KEY)
    sessionStorage.removeItem(USER_KEY)
    this._user.set(null)
    this._status.set('idle')
    this._error.set(null)
  }

  private setUser(user: AuthUser, persistent: boolean): void {
    this._user.set(user)
    const target = persistent ? localStorage : sessionStorage
    const other = persistent ? sessionStorage : localStorage
    other.removeItem(USER_KEY)
    target.setItem(USER_KEY, JSON.stringify(user))
  }

  private restore(): AuthUser | null {
    const raw = localStorage.getItem(USER_KEY) ?? sessionStorage.getItem(USER_KEY)
    if (!raw || raw === 'undefined' || raw === 'null') return null
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
