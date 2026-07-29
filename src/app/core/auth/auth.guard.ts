import { inject } from '@angular/core'
import { CanActivateFn, Router } from '@angular/router'
import { AuthStore } from './auth.store'
import type { UserRole } from './auth.types'

export const authGuard: CanActivateFn = (_route, state) => {
  const store = inject(AuthStore)
  const router = inject(Router)

  if (store.isAuthenticated()) return true
  return router.createUrlTree(['/login'], { queryParams: { redirect: state.url } })
}

export const guestGuard: CanActivateFn = () => {
  const store = inject(AuthStore)
  const router = inject(Router)
  return store.isAuthenticated() ? router.createUrlTree([landingPath(store.role())]) : true
}

export const roleGuard = (roles: readonly UserRole[]): CanActivateFn => () => {
  const store = inject(AuthStore)
  const router = inject(Router)
  return store.hasRole(roles) ? true : router.createUrlTree(['/403'])
}

export const landingGuard: CanActivateFn = () => {
  const store = inject(AuthStore)
  const router = inject(Router)
  return router.createUrlTree([landingPath(store.role())])
}

export function landingPath(role: string): string {
  // Chuẩn hóa role về chữ hoa/thường nếu cần
  const formattedRole = role?.trim()

  if (formattedRole === 'Admin') return '/app/dashboard'
  if (formattedRole === 'LabManager') return '/app/management/bookings/pending'

  // Sửa '/app/home' (không tồn tại trong routes) thành route mặc định hợp lệ của ứng dụng
  return '/app/labs'
}
