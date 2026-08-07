import { HttpBackend, HttpClient, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http'
import { inject } from '@angular/core'
import { Router } from '@angular/router'
import { BehaviorSubject, catchError, filter, finalize, retry, switchMap, take, tap, throwError, timer } from 'rxjs'
import { TokenStorage } from '../auth/token-storage'
import { AuthStore } from '../auth/auth.store'
import type { AuthTokens } from '../auth/auth.types'
import { env } from '../config/env'
import { ApiError } from './api-error'
import { ErrorStateService } from './error-state.service'

let isRefreshing = false
const refreshTokenSubject = new BehaviorSubject<string | null>(null)

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router)
  const tokens = inject(TokenStorage)
  const authStore = inject(AuthStore)
  const errorState = inject(ErrorStateService)
  const http = new HttpClient(inject(HttpBackend))

  return next(req).pipe(
    retry({
      count: 2,
      delay: (error: any, retryCount: number) => {
        const isAuthEndpoint = /\/Auth\/(login|refresh|forgot-password|reset-password|logout)$/i.test(req.url)
        // Chỉ retry các request an toàn (GET/HEAD) — không retry mutation vì POST/PUT/DELETE
        // không idempotent và có thể tạo trùng dữ liệu nếu BE đã xử lý nhưng response bị mất.
        const isSafeMethod = req.method === 'GET' || req.method === 'HEAD'
        if (isSafeMethod && !isAuthEndpoint && (error?.status >= 500 || error?.status === 0) && retryCount <= 2) {
          return timer(retryCount * 350)
        }
        return throwError(() => error)
      },
    }),
    catchError((error: HttpErrorResponse) => {
      const isAuthEndpoint = /\/Auth\/(login|refresh|forgot-password|reset-password|logout)$/i.test(req.url)
      const currentToken = tokens.access
      const refreshToken = tokens.refresh

      if (error.status === 401 && !isAuthEndpoint) {
        const reqAuthHeader = req.headers.get('Authorization')
        const reqToken = reqAuthHeader?.replace(/^Bearer\s+/i, '')

        if (currentToken && reqToken && reqToken !== currentToken) {
          return next(
            req.clone({ setHeaders: { Authorization: `Bearer ${currentToken}` } }),
          )
        }

        if (!refreshToken) {
          authStore.clear()
          void router.navigate(['/login'])
          return throwError(() => normalize(error))
        }

        if (!isRefreshing) {
          isRefreshing = true
          refreshTokenSubject.next(null)

          return http
            .post<AuthTokens>(`${env.apiBaseUrl}/Auth/refresh`, { refreshToken })
            .pipe(
              tap((fresh) => {
                tokens.set(fresh.accessToken, fresh.refreshToken, tokens.isRemembered)
                refreshTokenSubject.next(fresh.accessToken)
              }),
              switchMap((fresh) => {
                return next(
                  req.clone({ setHeaders: { Authorization: `Bearer ${fresh.accessToken}` } }),
                )
              }),
              catchError((refreshError: HttpErrorResponse) => {
                isRefreshing = false
                refreshTokenSubject.next(null)
                if (refreshError.status === 0 || refreshError.status >= 500) {
                  return throwError(() => normalize(refreshError))
                }
                authStore.clear()
                void router.navigate(['/login'])
                return throwError(() => normalize(refreshError))
              }),
              finalize(() => {
                isRefreshing = false
              }),
            )
        } else {
          return refreshTokenSubject.pipe(
            filter((token): token is string => token !== null),
            take(1),
            switchMap((token) => {
              return next(
                req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }),
              )
            }),
          )
        }
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

      if (error.status >= 500 || error.status === 0) {
        errorState.setError({
          status: error.status || 500,
          statusText: error.status === 0 ? 'Mất kết nối Server BE / Lỗi mạng' : `Backend Error (HTTP ${error.status})`,
          message: normalizedErr.message || 'Hệ thống Backend gặp sự cố trong quá trình xử lý yêu cầu.',
          url: req.url,
          timestamp: new Date(),
          details: normalizedErr.fieldErrors,
        })
      }

      // 409 Conflict (PostgreSQL trigger / uniqueness constraint) and
      // 422 Unprocessable Entity (BE validation) are intentionally NOT set on errorState —
      // they are business-logic errors that individual feature components handle themselves
      // by reading ApiError.status and ApiError.details from the thrown error.
      return throwError(() => normalizedErr)

    }),
  )
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
    // Preserve the full raw body so consumers can access custom fields (e.g. suggestedSlots)
    typeof body === 'object' && body !== null ? body : undefined,
  )
}
