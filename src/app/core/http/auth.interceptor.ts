import { HttpInterceptorFn } from '@angular/common/http'
import { inject } from '@angular/core'
import { TokenStorage } from '../auth/token-storage'
import { env } from '../config/env'

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(TokenStorage).access
  if (!token) return next(req)
  // Chỉ gắn Bearer token cho request tới API backend.
  // Không gửi token ra ngoài (i18n assets, Unsplash CDN, domain khác).
  const isApiRequest = req.url.startsWith(env.apiBaseUrl)
  if (!isApiRequest) return next(req)
  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }))
}
