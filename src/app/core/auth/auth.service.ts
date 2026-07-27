import { Injectable, inject } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { env } from '../config/env'
import type { LoginPayload, LoginResponse, ResetPasswordPayload } from './auth.types'

/**
 * Talks to the backend's /auth endpoints. Pure API calls only — session
 * side effects (token storage, current-user signal) live in AuthStore.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient)

  login(payload: LoginPayload): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${env.apiBaseUrl}/auth/login`, payload)
  }

  logout(refreshToken: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${env.apiBaseUrl}/auth/logout`, { refreshToken })
  }

  forgotPassword(email: string, resetLink: string): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${env.apiBaseUrl}/auth/forgot-password`,
      { email, resetLink },
    )
  }

  resetPassword(payload: ResetPasswordPayload): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${env.apiBaseUrl}/auth/reset-password`, payload)
  }
}