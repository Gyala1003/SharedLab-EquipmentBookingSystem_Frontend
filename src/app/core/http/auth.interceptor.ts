import { inject } from '@angular/core'
import { HttpInterceptorFn } from '@angular/common/http'
import { TokenStorage } from '../auth/token-storage'
import { env } from '../config/env'

/** Attaches the bearer token to every request that targets our own API. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(env.apiBaseUrl)) return next(req)

  const token = inject(TokenStorage).access
  if (!token) return next(req)

  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }))
}
