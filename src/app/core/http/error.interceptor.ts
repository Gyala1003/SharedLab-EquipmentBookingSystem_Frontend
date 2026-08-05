import { HttpBackend, HttpClient, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http'
import { inject } from '@angular/core'
import { Router } from '@angular/router'
import { catchError, switchMap, throwError } from 'rxjs'
import { TokenStorage } from '../auth/token-storage'
import type { AuthTokens } from '../auth/auth.types'
import { env } from '../config/env'
import { ApiError } from './api-error'
import { ErrorStateService } from './error-state.service'

const USER_KEY = 'auth.user'

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router)
  const tokens = inject(TokenStorage)
  const errorState = inject(ErrorStateService)
  const http = new HttpClient(inject(HttpBackend))

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const isAuthEndpoint = /\/Auth\/(login|refresh|forgot-password|reset-password)$/i.test(req.url)
      const refreshToken = tokens.refresh

      if (error.status === 401 && refreshToken && !isAuthEndpoint) {
        return http
          .post<AuthTokens>(`${env.apiBaseUrl}/Auth/refresh`, { refreshToken })
          .pipe(
            switchMap((fresh) => {
              tokens.set(fresh.accessToken, fresh.refreshToken)
              return next(
                req.clone({ setHeaders: { Authorization: `Bearer ${fresh.accessToken}` } }),
              )
            }),
            catchError((refreshError: HttpErrorResponse) => {
              clearSession(tokens)
              void router.navigate(['/login'])
              return throwError(() => normalize(refreshError))
            }),
          )
      }

      if (error.status === 401 && !isAuthEndpoint) {
        clearSession(tokens)
        void router.navigate(['/login'])
      }
      const normalizedErr = normalize(error)

      if (error.status === 403) {
        errorState.setError({
          status: 403,
          statusText: 'Forbidden / Không có quyền truy cập',
          message: normalizedErr.message || 'Bạn không có quyền truy cập vào tài nguyên này.',
          url: req.url,
          timestamp: new Date(),
          details: normalizedErr.fieldErrors,
        })
      }

      // Catch Backend Internal Server Error (5xx) or Connection Failure (0)
      if (error.status >= 500 || error.status === 0) {
        errorState.setError({
          status: error.status || 500,
          statusText: error.status === 0 ? 'Mất kết nối Server BE / Lỗi mạng' : `Backend Error (HTTP ${error.status})`,
          message: normalizedErr.message || 'Hệ thống Backend gặp sự cố trong quá trình xử lý yêu cầu.',
          url: req.url,
          timestamp: new Date(),
          details: normalizedErr.fieldErrors,
        })
        void router.navigate(['/error'])
      }

      return throwError(() => normalizedErr)
    }),
  )
}

function clearSession(tokens: TokenStorage): void {
  tokens.clear()
  localStorage.removeItem(USER_KEY)
  sessionStorage.removeItem(USER_KEY)
}

function normalize(error: HttpErrorResponse): ApiError {
  const body = error.error as
    | { message?: string; title?: string; detail?: string; error?: string; code?: string; errors?: Record<string, string[]> }
    | string
    | undefined
  const message =
    typeof body === 'string'
      ? body
      : body?.detail ?? body?.message ?? body?.error ?? body?.title ?? error.message ?? 'Đã xảy ra lỗi kết nối với Backend.'
  return new ApiError(
    error.status,
    message,
    typeof body === 'object' ? body?.code : undefined,
    typeof body === 'object' ? body?.errors : undefined,
  )
}
