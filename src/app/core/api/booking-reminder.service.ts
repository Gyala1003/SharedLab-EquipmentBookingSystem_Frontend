import { Injectable, inject } from '@angular/core'
import { catchError, of } from 'rxjs'
import { AuthStore } from '../auth/auth.store'
import { SystemService } from './system.service'
import { ToastService } from '../../shared/ui/toast.service'
import type { BookingResponse } from './system.models'

@Injectable({ providedIn: 'root' })
export class BookingReminderService {
  private readonly store = inject(AuthStore)
  private readonly api = inject(SystemService)
  private readonly toast = inject(ToastService)

  private timer: any = null

  init(): void {
    if (this.timer) return
    this.timer = setInterval(() => this.checkReminders(), 120_000)
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  }

  private checkReminders(): void {
    const user = this.store.user()
    if (!user) return

    const userId = user.userId

    // 1. Fetch user's bookings
    this.api
      .bookingsByUser(userId)
      .pipe(catchError(() => of([])))
      .subscribe({
        next: (userBookings) => {
          this.processUserCheckinReminders(userBookings, user)
          this.processUserCheckoutReminders(userBookings, user)
        },
        error: () => {},
      })

    // 2. If Manager or Admin, fetch all active bookings to monitor check-out for all users
    if (this.store.isManager() || this.store.isAdmin()) {
      this.api
        .bookings()
        .pipe(catchError(() => of([])))
        .subscribe({
          next: (allBookings) => {
            this.processManagerCheckoutReminders(allBookings, user)
          },
          error: () => {},
        })
    }
  }

  /**
   * Check-in Reminder (15 mins before start time):
   * Show a toast UI notification for users who are currently online.
   * NOTE: The actual DB notification + email is handled by BE BookingReminderBackgroundService (every 1 min).
   * FE only adds a non-persistent toast for immediate in-app feedback.
   */
  private processUserCheckinReminders(bookings: BookingResponse[], user: any): void {
    const now = Date.now()
    const approved = bookings.filter((b) => b.status === 'Approved')

    for (const booking of approved) {
      const startTimeMs = new Date(booking.startTime).getTime()
      const isApproachingCheckin = now >= startTimeMs - 15 * 60_000 && now <= startTimeMs + 30 * 60_000
      const key = `checkin_toast_${booking.bookingId}_${user.userId}`

      if (isApproachingCheckin && !sessionStorage.getItem(key)) {
        this.api.usageLogsByBooking(booking.bookingId).subscribe((logs) => {
          const hasCheckedIn = logs.some((l) => l.actualCheckin !== null)
          if (hasCheckedIn) return

          sessionStorage.setItem(key, 'true')
          this.toast.info(
            `Nhắc nhở Check-in #${booking.bookingId}`,
            `Khung giờ Check-in đã mở. Mở chi tiết booking để thực hiện.`,
          )
        })
      }
    }
  }

  /**
   * Check-out Reminder for Users (when approaching or past endTime):
   * Show a toast UI notification for users who are currently online.
   * NOTE: The actual DB notification + email is handled by BE BookingReminderBackgroundService.
   */
  private processUserCheckoutReminders(bookings: BookingResponse[], user: any): void {
    const now = Date.now()
    const approved = bookings.filter((b) => b.status === 'Approved')

    for (const booking of approved) {
      const endTimeMs = new Date(booking.endTime).getTime()
      const isApproachingCheckout = now >= endTimeMs - 10 * 60_000 && now <= endTimeMs + 20 * 60_000
      const key = `checkout_toast_user_${booking.bookingId}_${user.userId}`

      if (isApproachingCheckout && !sessionStorage.getItem(key)) {
        this.api.usageLogsByBooking(booking.bookingId).subscribe((logs) => {
          const activeLog = logs.find((l) => l.actualCheckin && !l.actualCheckout)
          if (!activeLog) return

          sessionStorage.setItem(key, 'true')
          this.toast.info(
            `Nhắc nhở Check-out #${booking.bookingId}`,
            `Hãy mở booking và thực hiện Check-out trước khi quá hạn.`,
          )
        })
      }
    }
  }

  /**
   * Check-out Reminder for Manager (when a user is approaching or past endTime):
   * Show a toast UI notification for managers who are currently online.
   * NOTE: The actual DB notification + email is handled by BE BookingReminderBackgroundService.
   */
  private processManagerCheckoutReminders(allBookings: BookingResponse[], managerUser: any): void {
    const now = Date.now()
    const approved = allBookings.filter((b) => b.status === 'Approved')

    for (const booking of approved) {
      const endTimeMs = new Date(booking.endTime).getTime()
      const isManagerNoticeWindow = now >= endTimeMs - 5 * 60_000 && now <= endTimeMs + 30 * 60_000
      const key = `checkout_toast_mgr_${booking.bookingId}_${managerUser.userId}`

      if (isManagerNoticeWindow && !sessionStorage.getItem(key)) {
        this.api.usageLogsByBooking(booking.bookingId).subscribe((logs) => {
          const activeLog = logs.find((l) => l.actualCheckin && !l.actualCheckout)
          if (!activeLog) return

          sessionStorage.setItem(key, 'true')
          this.toast.info(
            `[Nhiệm vụ Quản lý] Booking #${booking.bookingId} đến giờ Check-out`,
            `Kiểm tra và hỗ trợ người dùng tại trang Booking.`,
          )
        })
      }
    }
  }

}
