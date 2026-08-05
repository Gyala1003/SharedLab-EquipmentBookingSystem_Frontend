import { Injectable, inject } from '@angular/core'
import { Router } from '@angular/router'
import { catchError, of } from 'rxjs'
import { AuthStore } from '../auth/auth.store'
import { SystemService } from './system.service'
import { ToastService } from '../../shared/ui/toast.service'
import { NotificationBadgeService } from './notification-badge.service'
import { getCheckInWindowInfo } from '../../shared/utils/presentation'
import type { BookingResponse, UsageLogResponse } from './system.models'

export interface SimulatedEmail {
  id: string
  recipientEmail: string
  recipientName: string
  recipientRole: string
  subject: string
  body: string
  appLink: string
  sentAt: string
  type: 'checkin_reminder' | 'checkout_reminder_user' | 'checkout_reminder_manager'
  bookingId: number
}

@Injectable({ providedIn: 'root' })
export class BookingReminderService {
  private readonly store = inject(AuthStore)
  private readonly api = inject(SystemService)
  private readonly toast = inject(ToastService)
  private readonly router = inject(Router)
  private readonly badge = inject(NotificationBadgeService)

  private timer: any = null
  private consecutiveErrors = 0
  private readonly sentReminders = new Set<string>()

  init(): void {
    if (this.timer) return
    this.checkReminders()
    // Poll every 120 seconds (2 mins) to preserve PostgreSQL connection pool
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
   * Send notification & Email to user with a direct app link for 1-click check-in.
   */
  private processUserCheckinReminders(bookings: BookingResponse[], user: any): void {
    const now = Date.now()
    const approved = bookings.filter((b) => b.status === 'Approved')

    for (const booking of approved) {
      const startTimeMs = new Date(booking.startTime).getTime()
      const isApproachingCheckin = now >= startTimeMs - 15 * 60_000 && now <= startTimeMs + 30 * 60_000
      const key = `checkin_${booking.bookingId}_${user.userId}`

      if (isApproachingCheckin && !this.sentReminders.has(key) && !localStorage.getItem(key)) {
        this.api.usageLogsByBooking(booking.bookingId).subscribe((logs) => {
          const hasCheckedIn = logs.some((l) => l.actualCheckin !== null)
          if (hasCheckedIn) return

          this.sentReminders.add(key)
          localStorage.setItem(key, 'true')

          const appLink = `/app/bookings/${booking.bookingId}`
          const subject = `[SharedLab Mail] Nhắc nhở Check-in cho Booking #${booking.bookingId}`
          const body = `Xin chào ${user.fullName},\n\nLịch đặt phòng/thiết bị #${booking.bookingId} của bạn sắp bắt đầu lúc ${new Date(booking.startTime).toLocaleTimeString('vi-VN')} ngày ${new Date(booking.startTime).toLocaleDateString('vi-VN')}.\nKhung giờ điểm danh check-in mở từ 15 phút trước giờ bắt đầu.\nVui lòng nhấp vào đường dẫn bên dưới để tiện truy cập ứng dụng và thực hiện Check-in đúng giờ:\n${window.location.origin}${appLink}`

          this.api.sendNotification({
            userId: user.userId,
            title: `Nhắc nhở điểm danh (Check-in) #${booking.bookingId}`,
            message: `Lịch đặt #${booking.bookingId} sắp bắt đầu. Nhấp để truy cập và điểm danh ngay.`,
            notificationType: 1,
          }).subscribe()

          this.badge.set(this.badge.count() + 1)

          this.toast.info(
            `[EMAIL GỬI NGƯỜI DÙNG] Nhắc nhở Check-in #${booking.bookingId}`,
            `Khung giờ Check-in đã mở. Link ứng dụng: ${appLink}`,
          )

          this.saveSimulatedEmail({
            id: `email_${Date.now()}`,
            recipientEmail: user.email || 'requester@sharedlab.edu.vn',
            recipientName: user.fullName || 'Người dùng',
            recipientRole: user.role || 'Requester',
            subject,
            body,
            appLink,
            sentAt: new Date().toISOString(),
            type: 'checkin_reminder',
            bookingId: booking.bookingId,
          })
        })
      }
    }
  }

  /**
   * Check-out Reminder for Users (when approaching or past endTime):
   * Send notification & Email to user with policy warning (late checkout >15m = violation).
   */
  private processUserCheckoutReminders(bookings: BookingResponse[], user: any): void {
    const now = Date.now()
    const approved = bookings.filter((b) => b.status === 'Approved')

    for (const booking of approved) {
      const endTimeMs = new Date(booking.endTime).getTime()
      const isApproachingCheckout = now >= endTimeMs - 10 * 60_000 && now <= endTimeMs + 20 * 60_000
      const key = `checkout_user_${booking.bookingId}_${user.userId}`

      if (isApproachingCheckout && !this.sentReminders.has(key) && !localStorage.getItem(key)) {
        this.api.usageLogsByBooking(booking.bookingId).subscribe((logs) => {
          const activeLog = logs.find((l) => l.actualCheckin && !l.actualCheckout)
          if (!activeLog) return

          this.sentReminders.add(key)
          localStorage.setItem(key, 'true')

          const appLink = `/app/bookings/${booking.bookingId}`
          const subject = `[SharedLab Mail] Nhắc nhở Check-out cho Booking #${booking.bookingId}`
          const body = `Xin chào ${user.fullName},\n\nPhiên sử dụng phòng/thiết bị #${booking.bookingId} của bạn sắp/đã kết thúc lúc ${new Date(booking.endTime).toLocaleTimeString('vi-VN')}.\nVui lòng thực hiện Check-out đúng giờ để giải phóng tài nguyên. NẾU QUÁ 15 PHÚT SO VỚI GIỜ KẾT THÚC KHÔNG CHECK-OUT, HỆ THỐNG SẼ TỰ ĐỘNG GHI NHẬN SỰ CỐ VÀ ÁP DỤNG VI PHẠM TRẢ MUỘN (+5 ĐIỂM PHẠT).\n\nTruy cập đường dẫn bên dưới để Check-out ngay:\n${window.location.origin}${appLink}`

          this.api.sendNotification({
            userId: user.userId,
            title: `Nhắc nhở trả phòng (Check-out) #${booking.bookingId}`,
            message: `Phiên sử dụng đã đến giờ kết thúc. Vui lòng check-out ngay để tránh vi phạm quá hạn 15 phút.`,
            notificationType: 1,
          }).subscribe()

          this.badge.set(this.badge.count() + 1)

          this.toast.info(
            `[EMAIL GỬI NGƯỜI DÙNG] Nhắc nhở Check-out #${booking.bookingId}`,
            `Nội quy: Quá 15m sẽ bị tính vi phạm LateCheckout. Link: ${appLink}`,
          )

          this.saveSimulatedEmail({
            id: `email_${Date.now()}`,
            recipientEmail: user.email || 'requester@sharedlab.edu.vn',
            recipientName: user.fullName || 'Người dùng',
            recipientRole: user.role || 'Requester',
            subject,
            body,
            appLink,
            sentAt: new Date().toISOString(),
            type: 'checkout_reminder_user',
            bookingId: booking.bookingId,
          })
        })
      }
    }
  }

  /**
   * Check-out Reminder for Manager (when a user is approaching or past endTime):
   * Send notification to Manager so Manager can check out on behalf of the user if user forgets!
   */
  private processManagerCheckoutReminders(allBookings: BookingResponse[], managerUser: any): void {
    const now = Date.now()
    const approved = allBookings.filter((b) => b.status === 'Approved')

    for (const booking of approved) {
      const endTimeMs = new Date(booking.endTime).getTime()
      const isManagerNoticeWindow = now >= endTimeMs - 5 * 60_000 && now <= endTimeMs + 30 * 60_000
      const key = `checkout_mgr_${booking.bookingId}_${managerUser.userId}`

      if (isManagerNoticeWindow && !this.sentReminders.has(key) && !localStorage.getItem(key)) {
        this.api.usageLogsByBooking(booking.bookingId).subscribe((logs) => {
          const activeLog = logs.find((l) => l.actualCheckin && !l.actualCheckout)
          if (!activeLog) return

          this.sentReminders.add(key)
          localStorage.setItem(key, 'true')

          const appLink = `/app/bookings/${booking.bookingId}`
          const subject = `[THÔNG BÁO QUẢN LÝ] Nhắc nhở Check-out hỗ trợ người dùng - Booking #${booking.bookingId}`
          const body = `Kính gửi Quản lý ${managerUser.fullName},\n\nBooking #${booking.bookingId} của người dùng ID #${booking.userId} đã đến giờ kết thúc (${new Date(booking.endTime).toLocaleTimeString('vi-VN')}).\nNhiệm vụ Quản lý: Nếu người dùng quên check-out quá 15 phút, Quản lý có trách nhiệm bấm vào đường dẫn để thực hiện Check-out hỗ trợ người dùng trên hệ thống.\n\nLink quản lý:\n${window.location.origin}${appLink}`

          this.api.sendNotification({
            userId: managerUser.userId,
            title: `[Nhiệm vụ Quản lý] Hỗ trợ Check-out Booking #${booking.bookingId}`,
            message: `Booking #${booking.bookingId} của người dùng #${booking.userId} đến giờ kết thúc. Kiểm tra và check-out hộ nếu quên.`,
            notificationType: 1,
          }).subscribe()

          this.badge.set(this.badge.count() + 1)

          this.toast.info(
            `[THÔNG BÁO QUẢN LÝ] Booking #${booking.bookingId} đến giờ Check-out`,
            `Nhiệm vụ Quản lý: Check-out hộ nếu người dùng quên. Link: ${appLink}`,
          )

          this.saveSimulatedEmail({
            id: `email_${Date.now()}`,
            recipientEmail: managerUser.email || 'manager@sharedlab.edu.vn',
            recipientName: managerUser.fullName || 'Quản lý phòng Lab',
            recipientRole: managerUser.role || 'LabManager',
            subject,
            body,
            appLink,
            sentAt: new Date().toISOString(),
            type: 'checkout_reminder_manager',
            bookingId: booking.bookingId,
          })
        })
      }
    }
  }

  private saveSimulatedEmail(email: SimulatedEmail): void {
    try {
      const raw = localStorage.getItem('sharedlab_simulated_emails')
      const emails: SimulatedEmail[] = raw ? JSON.parse(raw) : []
      emails.unshift(email)
      localStorage.setItem('sharedlab_simulated_emails', JSON.stringify(emails.slice(0, 50)))
    } catch {}
  }
}
