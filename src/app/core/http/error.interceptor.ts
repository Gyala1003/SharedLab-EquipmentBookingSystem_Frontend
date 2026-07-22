import { inject } from '@angular/core'
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http'
import { Router } from '@angular/router'
import { catchError, throwError } from 'rxjs'
import { ApiError } from './api-error'
import { AuthStore } from '../auth/auth.store'

/**
 * Central error handling: normalizes every failure into an `ApiError` and,
 * on 401, clears the session and redirects to /auth/login.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router)
  const authStore = inject(AuthStore)

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        authStore.clear()
        void router.navigate(['/auth/login'])
      }
      return throwError(() => ApiError.fromUnknown(error.status, error.error))
    }),
  )
}
