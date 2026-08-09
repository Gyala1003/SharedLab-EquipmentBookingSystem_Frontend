import { inject } from '@angular/core'
import { CanActivateFn, Router } from '@angular/router'
import { AuthStore } from './auth.store'
import { ROLE } from './auth.types'
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
  const normalized = role
    ?.trim()
    .replace(/[\s_]+/g, '')
    .toLowerCase()
  if (normalized === ROLE.Admin.toLowerCase()) return '/app/dashboard'
  if (normalized === ROLE.LabManager.toLowerCase()) return '/app/calendar'
  return '/app/home'
}
