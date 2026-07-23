import { Injectable, inject } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { env } from '../config/env'
import type {
  AuthUser,
  CreateUserPayload,
  ForgotPasswordRequest,
  LoginPayload,
  LoginResponse,
  RefreshTokenRequest,
  ResetPasswordRequest,
  UpdateProfilePayload,
} from './auth.types'

/**
 * Talks to the backend's /auth endpoints. Pure API calls only — session
 * side effects (token storage, current-user signal) live in AuthStore.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient)
  private readonly base = `${env.apiBaseUrl}/auth`

  login(payload: LoginPayload): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.base}/login`, payload)
  }

  /** Fetch the currently authenticated user's profile. */
  getMe(): Observable<AuthUser> {
    return this.http.get<AuthUser>(`${this.base}/me`)
  }

  refreshToken(request: RefreshTokenRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.base}/refresh`, request)
  }

  logout(refreshToken: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.base}/logout`, {
      refreshToken,
    })
  }

  createUser(payload: CreateUserPayload): Observable<AuthUser> {
    return this.http.post<AuthUser>(`${this.base}/create-user`, payload)
  }

  forgotPassword(request: ForgotPasswordRequest): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.base}/forgot-password`,
      request,
    )
  }

  resetPassword(request: ResetPasswordRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.base}/reset-password`, request)
  }

  updateProfile(payload: UpdateProfilePayload): Observable<AuthUser> {
    return this.http.put<AuthUser>(`${this.base}/profile`, payload)
  }
}
