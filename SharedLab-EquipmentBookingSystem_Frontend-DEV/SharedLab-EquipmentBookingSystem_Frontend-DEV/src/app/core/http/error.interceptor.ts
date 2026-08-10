import { HttpBackend, HttpClient, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http'
import { inject } from '@angular/core'
import { Router } from '@angular/router'
import {
  BehaviorSubject,
  catchError,
  filter,
  finalize,
  retry,
  switchMap,
  take,
  tap,
  throwError,
  timer,
} from 'rxjs'
import { TokenStorage } from '../auth/token-storage'
import { AuthStore } from '../auth/auth.store'
import type { AuthTokens } from '../auth/auth.types'
import { env } from '../config/env'
import { ApiError } from './api-error'
import { ErrorStateService } from './error-state.service'
import { ToastService } from '../../shared/ui/toast.service'

let isRefreshing = false
let is401ToastShown = false
const refreshTokenSubject = new BehaviorSubject<string | null>(null)

function handle401ExpiredSession(
  authStore: AuthStore,
  toast: ToastService,
  router: Router,
  title: string,
  body: string,
): void {
  authStore.clear()
  if (!is401ToastShown) {
    is401ToastShown = true
    toast.error(title, body)
    setTimeout(() => {
      is401ToastShown = false
    }, 4000)
  }
  void router.navigate(['/login'])
}

export function isCanceledRequest(error: any): boolean {
  if (!error) return false
  if (error.name === 'AbortError' || error.error?.name === 'AbortError') return true
  if (error.error instanceof DOMException && error.error.name === 'AbortError') return true
  if (
    error.status === 0 &&
    (error.statusText === 'Unknown Error' ||
      error.message?.includes('Unknown Error') ||
      error.message?.includes('abort') ||
      error.message?.includes('canceled') ||
      error.message?.includes('cancelled'))
  ) {
    return true
  }
  return false
}

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router)
  const tokens = inject(TokenStorage)
  const authStore = inject(AuthStore)
  const errorState = inject(ErrorStateService)
  const toast = inject(ToastService)
  const http = new HttpClient(inject(HttpBackend))

  return next(req).pipe(
    retry({
      count: 2,
      delay: (error: any, retryCount: number) => {
        const isAuthEndpoint =
          /\/Auth\/(login|refresh|forgot-password|reset-password|logout)$/i.test(req.url)
        const isSafeMethod = req.method === 'GET' || req.method === 'HEAD'
        if (
          !isCanceledRequest(error) &&
          isSafeMethod &&
          !isAuthEndpoint &&
          (error?.status >= 500 || error?.status === 0) &&
          retryCount <= 2
        ) {
          return timer(retryCount * 350)
        }
        return throwError(() => error)
      },
    }),
    catchError((error: HttpErrorResponse) => {
      // 1. If request was actively canceled/aborted on Frontend, suppress all toasts & errorState
      if (isCanceledRequest(error)) {
        return throwError(() => normalize(error))
      }

      const isAuthEndpoint = /\/Auth\/(login|refresh|forgot-password|reset-password|logout)$/i.test(
        req.url,
      )
      const currentToken = tokens.access
      const refreshToken = tokens.refresh

      // 2. Handle Auth Errors (401 / 403)
      if ((error.status === 401 || error.status === 403) && !isAuthEndpoint) {
        if (error.status === 401) {
          const reqAuthHeader = req.headers.get('Authorization')
          const reqToken = reqAuthHeader?.replace(/^Bearer\s+/i, '')

          if (currentToken && reqToken && reqToken !== currentToken) {
            return next(req.clone({ setHeaders: { Authorization: `Bearer ${currentToken}` } }))
          }

          if (!refreshToken) {
            handle401ExpiredSession(
              authStore,
              toast,
              router,
              'Phiên đăng nhập hết hạn',
              'Vui lòng đăng nhập lại để tiếp tục.',
            )
            return throwError(() => normalize(error))
          }

          if (!isRefreshing) {
            isRefreshing = true
            refreshTokenSubject.next(null)

            return http
              .post<AuthTokens>(`${env.apiBaseUrl}/Auth/refresh`, {
                accessToken: currentToken || '',
                refreshToken,
              })
              .pipe(
                tap((fresh) => {
                  tokens.set(fresh.accessToken, fresh.refreshToken, tokens.isRemembered)
                  refreshTokenSubject.next(fresh.accessToken)
                }),
                catchError((refreshError: HttpErrorResponse) => {
                  isRefreshing = false
                  refreshTokenSubject.next(null)
                  handle401ExpiredSession(
                    authStore,
                    toast,
                    router,
                    'Phiên làm việc hết hạn',
                    'Không thể gia hạn phiên đăng nhập. Vui lòng đăng nhập lại.',
                  )
                  return throwError(() => normalize(refreshError))
                }),
                switchMap((fresh) => {
                  return next(
                    req.clone({ setHeaders: { Authorization: `Bearer ${fresh.accessToken}` } }),
                  ).pipe(
                    catchError((retriedErr: HttpErrorResponse) =>
                      throwError(() => normalize(retriedErr)),
                    ),
                  )
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
                return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })).pipe(
                  catchError((retriedErr: HttpErrorResponse) =>
                    throwError(() => normalize(retriedErr)),
                  ),
                )
              }),
            )
          }
        } else if (error.status === 403) {
          // 403 Forbidden: Concise warning toast without destroying user session
          const normalizedErr = normalize(error)
          toast.error(
            'Không có quyền thực hiện',
            normalizedErr.message || 'Bạn không có quyền thực hiện thao tác này trên tài nguyên đã chọn.',
          )
          return throwError(() => normalizedErr)
        }
      }

      const normalizedErr = normalize(error)

      // 3. 409 Conflict: Trùng lịch đặt phòng/thiết bị
      if (error.status === 409) {
        toast.error(
          'Trùng lịch đặt phòng / thiết bị',
          'Khung giờ này đã có người đặt, vui lòng chọn khung giờ khác.',
        )
      }

      // 4. 400 Validation Error
      if (error.status === 400) {
        let validationMsg = normalizedErr.message || 'Thông tin nhập vào không hợp lệ.'
        if (normalizedErr.fieldErrors && Object.keys(normalizedErr.fieldErrors).length > 0) {
          const details = Object.entries(normalizedErr.fieldErrors)
            .map(([field, msgs]) => `${field}: ${msgs.join(', ')}`)
            .join(' | ')
          validationMsg = `${validationMsg} (${details})`
        }
        toast.error('Lỗi dữ liệu nhập (400)', validationMsg)
      }

      // 5. 500 Server Error
      if (error.status >= 500) {
        toast.error('Hệ thống đang bận', 'Hệ thống đang bận, vui lòng thử lại sau.')
        errorState.setError({
          status: error.status,
          statusText: `Backend Error (HTTP ${error.status})`,
          message: 'Hệ thống Backend gặp sự cố trong quá trình xử lý yêu cầu.',
          url: req.url,
          timestamp: new Date(),
          details: normalizedErr.fieldErrors,
        })
      } else if (error.status === 0) {
        // Real network failure
        toast.error('Mất kết nối Server', 'Kết nối mạng bị gián đoạn, vui lòng kiểm tra kết nối.')
      }

      return throwError(() => normalizedErr)
    }),
  )
}

function normalize(error: HttpErrorResponse): ApiError {
  const body = error.error as
    | {
        message?: string
        title?: string
        detail?: string
        error?: string
        code?: string
        errors?: Record<string, string[]>
      }
    | string
    | undefined
  const message =
    typeof body === 'string'
      ? body
      : (body?.detail ??
        body?.message ??
        body?.error ??
        body?.title ??
        error.message ??
        'Đã xảy ra lỗi kết nối với Backend.')
  return new ApiError(
    error.status,
    message,
    typeof body === 'object' ? body?.code : undefined,
    typeof body === 'object' ? body?.errors : undefined,
    // Preserve the full raw body so consumers can access custom fields (e.g. suggestedSlots)
    typeof body === 'object' && body !== null ? body : undefined,
  )
}
