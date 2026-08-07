import { Injectable, inject } from '@angular/core'
import { catchError, of } from 'rxjs'
import { AuthStore } from '../auth/auth.store'
import { SystemService } from './system.service'
import { ToastService } from '../../shared/ui/toast.service'
import type { BookingResponse } from './system.models'

// SimulatedEmail đã được xóa bỏ.
// BE BookingReminderBackgroundService (chạy mỗi phút) xử lý email thật qua Brevo.
// FE chỉ hiển thị toast thông báo trong app khi người dùng đang online.

@Injectable({ providedIn: 'root' })
export class BookingReminderService {
  private readonly store = inject(AuthStore)
  private readonly api = inject(SystemService)
  private readonly toast = inject(ToastService)

  private timer: any = null
  private consecutiveErrors = 0
  private readonly sentReminders = new Set<string>()

  init(): void {
    if (this.timer) return
    this.checkReminders()
    // Poll every 300 seconds (5 mins) to preserve database connection pool
    this.timer = setInterval(() => this.checkReminders(), 300_000)
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

    // Removed fetching ALL bookings for Manager/Admin to prevent massive DB overhead.
    // Managers will rely on Backend Background Service for notifications.
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

      if (isApproachingCheckin && !this.sentReminders.has(key) && !sessionStorage.getItem(key)) {
        this.sentReminders.add(key)
        sessionStorage.setItem(key, 'true')

        // Show in-app toast only (BE handles actual notification + email via Brevo)
        this.toast.info(
          `Nhắc nhở Check-in #${booking.bookingId}`,
          `Khung giờ Check-in đã mở. Nhấp để truy cập.`,
        )
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

      if (isApproachingCheckout && !this.sentReminders.has(key) && !sessionStorage.getItem(key)) {
        this.sentReminders.add(key)
        sessionStorage.setItem(key, 'true')

        // Show in-app toast only (BE handles actual notification + email via Brevo)
        this.toast.info(
          `Nhắc nhở Check-out #${booking.bookingId}`,
          `Sắp đến giờ kết thúc. Vui lòng Check-out đúng giờ.`,
        )
      }
    }
  }
}
