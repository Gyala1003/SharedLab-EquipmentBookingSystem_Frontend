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

export const roleGuard =
  (roles: readonly UserRole[]): CanActivateFn =>
  () => {
    const store = inject(AuthStore)
    const router = inject(Router)
    if (store.hasRole(roles)) return true
    return router.createUrlTree([landingPath(store.role())])
  }

export const landingGuard: CanActivateFn = () => {
  const store = inject(AuthStore)
  const router = inject(Router)
  return router.createUrlTree([landingPath(store.role())])
}

export function landingPath(role: string): string {
  const formattedRole = role?.trim().toLowerCase().replace(/[\s_]+/g, '')

  if (formattedRole === 'admin' || formattedRole === 'administrator') return '/app/dashboard'
  if (formattedRole === 'labmanager' || formattedRole === 'manager') return '/app/calendar'

  return '/app/home'
}
