import { Injectable } from '@angular/core'

/**
 * Single source of truth for auth tokens. Swap the implementation
 * (e.g. httpOnly cookies) without touching call sites.
 */
@Injectable({ providedIn: 'root' })
export class TokenStorage {
  private readonly ACCESS = 'auth.accessToken'
  private readonly REFRESH = 'auth.refreshToken'

  get access(): string | null {
    return localStorage.getItem(this.ACCESS)
  }

  get refresh(): string | null {
    return localStorage.getItem(this.REFRESH)
  }

  set(access: string, refresh?: string): void {
    localStorage.setItem(this.ACCESS, access)
    if (refresh) localStorage.setItem(this.REFRESH, refresh)
  }

  clear(): void {
    localStorage.removeItem(this.ACCESS)
    localStorage.removeItem(this.REFRESH)
  }
}
