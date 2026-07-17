import { Injectable, inject } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { env } from '../config/env'
import type { LoginPayload, LoginResponse } from './auth.types'

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
}
