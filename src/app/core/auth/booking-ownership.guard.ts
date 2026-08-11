import { inject } from '@angular/core'
import { CanActivateFn, Router } from '@angular/router'
import { catchError, map, of } from 'rxjs'
import { SystemService } from '../api/system.service'
import { AuthStore } from './auth.store'
import { ToastService } from '../../shared/ui/toast.service'

export const bookingOwnershipGuard: CanActivateFn = (route, _state) => {
  const store = inject(AuthStore)
  const router = inject(Router)
  const api = inject(SystemService)
  const toast = inject(ToastService)

  const bookingIdParam = route.paramMap.get('bookingId')
  if (!bookingIdParam) return true
  const bookingId = Number(bookingIdParam)
  if (isNaN(bookingId) || bookingId <= 0) return true

  // Admins and Lab Managers are authorized to view booking details
  if (store.isAdmin() || store.isManager()) {
    return true
  }

  const currentUserId = store.user()?.userId

  // Requester check: must be owner of the booking
  return api.booking(bookingId).pipe(
    map((booking) => {
      if (!booking) {
        toast.error('Không tìm thấy booking', 'Yêu cầu booking không tồn tại.')
        return router.createUrlTree(['/app/bookings/my'])
      }
      if (booking.userId === currentUserId) {
        return true
      }
      toast.error(
        'Không có quyền truy cập',
        'Bạn không có quyền truy cập vào thông tin booking của người khác.',
      )
      return router.createUrlTree(['/app/bookings/my'])
    }),
    catchError(() => {
      toast.error(
        'Không có quyền truy cập',
        'Bạn không có quyền truy cập vào thông tin booking của người khác.',
      )
      return of(router.createUrlTree(['/app/bookings/my']))
    }),
  )
}
