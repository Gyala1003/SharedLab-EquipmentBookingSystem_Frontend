import { Injectable } from '@angular/core'

/**
 * Single source of truth for auth tokens.
 * Persistent sessions use localStorage; non-persistent sessions use sessionStorage.
 */
@Injectable({ providedIn: 'root' })
export class TokenStorage {
  private readonly ACCESS = 'auth.accessToken'
  private readonly REFRESH = 'auth.refreshToken'
  private readonly REMEMBER = 'auth.remember'

  get isRemembered(): boolean {
    return localStorage.getItem(this.REMEMBER) === 'true'
  }

  get access(): string | null {
    return sessionStorage.getItem(this.ACCESS) ?? localStorage.getItem(this.ACCESS)
  }

  get refresh(): string | null {
    return sessionStorage.getItem(this.REFRESH) ?? localStorage.getItem(this.REFRESH)
  }

  get isPersistent(): boolean {
    return this.isRemembered && Boolean(localStorage.getItem(this.ACCESS) || localStorage.getItem(this.REFRESH))
  }

  set(access: string, refresh?: string, persistent = false): void {
    const target = persistent ? localStorage : sessionStorage
    const other = persistent ? sessionStorage : localStorage

    other.removeItem(this.ACCESS)
    other.removeItem(this.REFRESH)

    if (persistent) {
      localStorage.setItem(this.REMEMBER, 'true')
    } else {
      localStorage.removeItem(this.REMEMBER)
    }

    target.setItem(this.ACCESS, access)
    if (refresh) target.setItem(this.REFRESH, refresh)
  }

  clear(): void {
    localStorage.removeItem(this.REMEMBER)
    for (const storage of [localStorage, sessionStorage]) {
      storage.removeItem(this.ACCESS)
      storage.removeItem(this.REFRESH)
    }
  }
}
