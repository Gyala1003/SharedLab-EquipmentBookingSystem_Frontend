import { HttpClient } from '@angular/common/http'
import { Injectable, inject } from '@angular/core'
import {
  BehaviorSubject,
  Observable,
  filter,
  map,
  of,
  switchMap,
  take,
  tap,
  throwError,
} from 'rxjs'
import { env } from '../config/env'
import { TokenStorage } from './token-storage'
import type {
  AuthTokens,
  AuthUser,
  LoginPayload,
  ResetPasswordPayload,
  UserStatus,
} from './auth.types'

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient)
  private readonly tokens = inject(TokenStorage)
  private readonly baseUrl = `${env.apiBaseUrl}/Auth`

  private isRefreshing = false
  private refreshTokenSubject = new BehaviorSubject<string | null>(null)

  login(payload: LoginPayload): Observable<AuthTokens> {
    return this.http.post<AuthTokens>(`${this.baseUrl}/login`, payload)
  }

  me(): Observable<AuthUser> {
    return this.http
      .get<AuthUser>(`${this.baseUrl}/me`)
      .pipe(map((user) => ({ ...user, status: normalizeUserStatus(user.status) })))
  }

  refresh(): Observable<AuthTokens> {
    if (this.isRefreshing) {
      return this.refreshTokenSubject.pipe(
        filter((token): token is string => token !== null),
        take(1),
        switchMap((accessToken) =>
          of<AuthTokens>({
            accessToken,
            refreshToken: this.tokens.refresh ?? '',
          } as AuthTokens),
        ),
      )
    }

    this.isRefreshing = true
    this.refreshTokenSubject.next(null)

    const refreshToken = this.tokens.refresh
    if (!refreshToken) {
      this.isRefreshing = false
      return throwError(() => new Error('Không tìm thấy refresh token'))
    }

    return this.http.post<AuthTokens>(`${this.baseUrl}/refresh`, { refreshToken }).pipe(
      tap((res) => {
        this.isRefreshing = false
        this.tokens.set(res.accessToken, res.refreshToken)
        this.refreshTokenSubject.next(res.accessToken)
      }),
    )
  }

  logout(refreshToken: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/logout`, { refreshToken })
  }

  forgotPassword(
    email: string,
    resetLink?: string,
  ): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.baseUrl}/forgot-password`,
      { email, resetLink },
    )
  }

  resetPassword(payload: ResetPasswordPayload): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/reset-password`, payload)
  }
}

function normalizeUserStatus(value: UserStatus): Exclude<UserStatus, number> {
  if (typeof value === 'string') return value
  return (
    (
      {
        1: 'Active',
        2: 'Inactive',
        3: 'Restricted',
        4: 'Locked',
      } as Record<number, Exclude<UserStatus, number>>
    )[value] ?? 'Inactive'
  )
}
