import { inject } from '@angular/core'
import { CanActivateFn, Router } from '@angular/router'
import { AuthStore } from './auth.store'
import { SystemMaintenanceStore } from '../system/system-maintenance.store'

export const systemMaintenanceGuard: CanActivateFn = (_route, _state) => {
  const authStore = inject(AuthStore)
  const maintenanceStore = inject(SystemMaintenanceStore)
  const router = inject(Router)

  if (maintenanceStore.isMaintenanceActive()) {
    // Admin bypasses system maintenance guard to allow maintenance management
    if (authStore.isAdmin()) {
      return true
    }
    // Redirect Requesters & Managers to system maintenance notice page
    return router.createUrlTree(['/system-maintenance'])
  }

  return true
}
