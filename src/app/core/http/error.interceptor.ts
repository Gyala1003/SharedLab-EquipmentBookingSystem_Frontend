import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http'
import { inject } from '@angular/core'
import { Router } from '@angular/router'
import { catchError, retry, switchMap, throwError, timer } from 'rxjs'
import { AuthService } from '../auth/auth.service'
import { AuthStore } from '../auth/auth.store'
import { ApiError } from './api-error'
import { ErrorStateService } from './error-state.service'

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router)
  const authService = inject(AuthService)
  const authStore = inject(AuthStore)
  const errorState = inject(ErrorStateService)

  return next(req).pipe(
    retry({
      count: 2,
      delay: (error: any, retryCount: number) => {
        const isAuthEndpoint = /\/Auth\/(login|refresh|forgot-password|reset-password)$/i.test(req.url)
        if (!isAuthEndpoint && (error?.status >= 500 || error?.status === 0) && retryCount <= 2) {
          return timer(retryCount * 350)
        }
        return throwError(() => error)
      },
    }),
    catchError((error: HttpErrorResponse) => {
      const isAuthEndpoint = /\/Auth\/(login|refresh|forgot-password|reset-password)$/i.test(req.url)

      if (error.status === 401 && !isAuthEndpoint) {
        return authService.refresh().pipe(
          switchMap((fresh) => {
            return next(
              req.clone({ setHeaders: { Authorization: `Bearer ${fresh.accessToken}` } }),
            )
          }),
          catchError((refreshError: HttpErrorResponse) => {
            // Không logout nếu lỗi do mất mạng (0) hoặc Server BE đứt kết nối (5xx)
            if (refreshError.status === 0 || refreshError.status >= 500) {
              return throwError(() => normalize(refreshError))
            }

            // BE từ chối Refresh Token -> Gọi hàm clear chung của AuthStore & về Login
            authStore.clear()
            void router.navigate(['/login'])
            return throwError(() => normalize(refreshError))
          }),
        )
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
  )
}