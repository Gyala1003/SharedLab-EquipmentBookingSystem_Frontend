import { Injectable, computed, inject, signal } from '@angular/core'
import { firstValueFrom } from 'rxjs'
import { ApiError } from '../http/api-error'
import { AuthService } from './auth.service'
import { TokenStorage } from './token-storage'
import { ROLE } from './auth.types'
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
  readonly isRequester = computed(() => this.matchRole(ROLE.Requester))
  readonly isManager = computed(() => this.matchRole(ROLE.LabManager))
  readonly isAdmin = computed(() => this.matchRole(ROLE.Admin))
  readonly logoutStatus = this._logoutStatus.asReadonly()

  async login(payload: LoginPayload, remember = false): Promise<AuthUser> {
    this._status.set('loading')
    this._error.set(null)
    try {
      const res = await firstValueFrom(this.auth.login(payload))
      this.tokens.set(res.accessToken, res.refreshToken, remember)
      // BE AuthResponseDTO chỉ trả { accessToken, refreshToken }.
      // Luôn gọi GET /Auth/me để lấy thông tin user và role sau khi nhận token.
      const user = await firstValueFrom(this.auth.me())
      this.setUser(user, remember)
      this._error.set(null)
      this._status.set('idle')
      return user
    } catch (e) {
      this._status.set('error')
      this._error.set(this.resolveMessage(e))
      throw e
    }
  }

  async hydrate(): Promise<void> {
    if (!this.tokens.access && !this.tokens.refresh) {
      this.clear()
      return
    }
    const cachedUser = this._user()
    try {
      const user = await firstValueFrom(this.auth.me())
      this.setUser(user, this.tokens.isPersistent)
    } catch (e) {
      if (e instanceof ApiError && (e.status === 401 || e.status === 403)) {
        this.clear()
      } else if (!cachedUser) {
        this.clear()
      }
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
    if (!this.role()) return false
    return roles.some((r) => this.matchRole(r))
  }

  /** Strict match: normalize whitespace/underscore only, respect BE enum values exactly. */
  private matchRole(target: UserRole): boolean {
    const raw = this.role()
      .trim()
      .replace(/[\s_]+/g, '')
    const tgt = target.trim().replace(/[\s_]+/g, '')
    return raw.toLowerCase() === tgt.toLowerCase()
  }

  clear(): void {
    this.tokens.clear()
    this.clearStorage()
    this._user.set(null)
    this._status.set('idle')
    this._error.set(null)
  }

  private clearStorage(): void {
    localStorage.removeItem(USER_KEY)
    sessionStorage.removeItem(USER_KEY)
  }

  private setUser(user: AuthUser, persistent: boolean): void {
    this._user.set(user)
    const target = persistent ? localStorage : sessionStorage
    const other = persistent ? sessionStorage : localStorage
    other.removeItem(USER_KEY)
    target.setItem(USER_KEY, JSON.stringify(user))
  }

  private restore(): AuthUser | null {
    if (!this.tokens?.access && !this.tokens?.refresh) {
      this.clearStorage()
      return null
    }
    const raw =
      sessionStorage.getItem(USER_KEY) ??
      (this.tokens.isRemembered ? localStorage.getItem(USER_KEY) : null)
    if (!raw || raw === 'undefined' || raw === 'null') {
      this.clearStorage()
      return null
    }
    try {
      return JSON.parse(raw) as AuthUser
    } catch {
      this.clearStorage()
      return null
    }
  }

  private resolveMessage(error: unknown): string {
    if (error instanceof ApiError) return error.message
    if (error instanceof Error) return error.message
    return 'Không thể đăng nhập. Vui lòng thử lại.'
  }
}
