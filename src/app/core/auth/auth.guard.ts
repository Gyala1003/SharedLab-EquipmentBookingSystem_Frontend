import { inject } from '@angular/core'
import { CanActivateFn, Router } from '@angular/router'
import { AuthStore } from './auth.store'

/** Blocks protected routes; redirects to /auth/login preserving the target URL. */
export const authGuard: CanActivateFn = (_route, state) => {
  const store = inject(AuthStore)
  const router = inject(Router)

  if (store.isAuthenticated()) return true
  return router.createUrlTree(['/auth/login'], {
    queryParams: { redirect: state.url },
  })
}

/** Keeps authenticated users away from /auth/login. */
export const guestGuard: CanActivateFn = () => {
  const store = inject(AuthStore)
  const router = inject(Router)
  return store.isAuthenticated() ? router.createUrlTree(['/']) : true
}

/** Restricts admin-only screens to the 'Admin' role. */
export const adminGuard: CanActivateFn = () => {
  const store = inject(AuthStore)
  const router = inject(Router)

  if (!store.isAuthenticated()) {
    return router.createUrlTree(['/auth/login'])
  }
  return store.isAdmin() ? true : router.createUrlTree(['/'])
}

/** Restricts management screens to 'Admin' or 'LabManager' roles. */
export const managerGuard: CanActivateFn = () => {
  const store = inject(AuthStore)
  const router = inject(Router)

  if (!store.isAuthenticated()) {
    return router.createUrlTree(['/auth/login'])
  }
  return store.isAdminOrManager() ? true : router.createUrlTree(['/'])
}

/** Restricts screens to 'LabManager' role only (excludes Admin). */
export const labManagerGuard: CanActivateFn = () => {
  const store = inject(AuthStore)
  const router = inject(Router)

  if (!store.isAuthenticated()) {
    return router.createUrlTree(['/auth/login'])
  }
  return store.isLabManager() ? true : router.createUrlTree(['/'])
}
