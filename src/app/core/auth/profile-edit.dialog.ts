import { Component, effect, input, output, inject, signal, computed } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { Router } from '@angular/router'
import { IconComponent } from '../../shared/ui/icon'
import { AuthStore } from './auth.store'
import type { UpdateProfilePayload } from './auth.types'

@Component({
  selector: 'app-profile-edit-dialog',
  imports: [FormsModule, IconComponent],
  template: `
    @if (open()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
        <div class="w-full max-w-2xl bg-white p-6 shadow-2xl border border-slate-300 max-h-[90vh] overflow-y-auto">
          <!-- Header -->
          <div class="mb-8 flex items-start justify-between">
            <div class="flex items-center gap-3">
              <div class="flex h-12 w-12 items-center justify-center text-slate-900">
                <app-icon name="users" [size]="40" />
              </div>
              <h3 class="text-base font-medium text-slate-900">My Profile</h3>
            </div>
            
            <div class="flex items-start gap-4">
              <div class="border border-slate-300 px-4 py-2 font-bold text-blue-600 tracking-wider">
                SHARELAB
              </div>
              <button
                class="flex h-8 w-8 items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                (click)="close.emit()"
              >
                <app-icon name="close" [size]="20" />
              </button>
            </div>
          </div>

          <!-- Form Body -->
          <form class="flex flex-col gap-5 px-2" (ngSubmit)="onSubmit()">
            <!-- Họ và Tên -->
            <label class="grid grid-cols-[180px_1fr] items-center gap-4 text-sm text-slate-900">
              Họ và Tên
              <input
                type="text"
                [(ngModel)]="fullName"
                name="fullName"
                required
                placeholder="Nguyễn Văn A"
                class="w-full rounded border border-slate-400 px-3 py-1.5 focus:border-blue-500 focus:outline-none"
              />
            </label>

            <!-- Email -->
            <label class="grid grid-cols-[180px_1fr] items-center gap-4 text-sm text-slate-900">
              Email
              <input
                type="email"
                [(ngModel)]="email"
                name="email"
                required
                placeholder="nguyenvanA@gmail.com"
                class="w-full rounded border border-slate-400 px-3 py-1.5 focus:border-blue-500 focus:outline-none"
              />
            </label>

            <!-- Legit Point Indicator -->
            <div class="grid grid-cols-[180px_1fr] items-center gap-4 text-sm text-slate-900">
              <span>Legit Point</span>
              <div class="flex items-center gap-2">
                <div class="h-5 w-64 rounded-full border border-slate-400 flex overflow-hidden">
                  <div
                    class="h-full bg-slate-400 transition-all duration-500"
                    [style.width.%]="legitPoint()"
                  ></div>
                  <div class="flex-1 bg-white"></div>
                </div>
              </div>
            </div>

            <!-- Ngày tạo tài khoản -->
            <label class="grid grid-cols-[180px_1fr] items-center gap-4 text-sm text-slate-900">
              Ngày tạo tài khoản
              <div class="relative w-64">
                <input
                  type="text"
                  [value]="createdDate"
                  readonly
                  class="w-full rounded border border-slate-400 px-3 py-1.5 pr-8 bg-white outline-none cursor-not-allowed"
                />
                <app-icon name="calendar" [size]="16" class="absolute right-2 top-2 text-slate-600" />
              </div>
            </label>

            <!-- Địa chỉ -->
            <label class="grid grid-cols-[180px_1fr] items-center gap-4 text-sm text-slate-900">
              Địa chỉ
              <input
                type="text"
                [(ngModel)]="address"
                name="address"
                placeholder="Hà Nội Việt Nam"
                class="w-full rounded border border-slate-400 px-3 py-1.5 focus:border-blue-500 focus:outline-none"
              />
            </label>

            <!-- Phòng Ban(Department) -->
            <label class="grid grid-cols-[180px_1fr] items-center gap-4 text-sm text-slate-900">
              Phòng Ban(Department)
              <input
                type="text"
                [value]="departmentName"
                readonly
                class="w-full rounded border border-slate-400 px-3 py-1.5 bg-white outline-none cursor-not-allowed"
              />
            </label>

            <!-- Password (Mật khẩu mới) - Hidden normally unless requested, but kept for edit functionality -->
            <label class="grid grid-cols-[180px_1fr] items-center gap-4 text-sm text-slate-900">
              Password
              <input
                type="password"
                [(ngModel)]="password"
                name="password"
                placeholder="Nhập mật khẩu mới nếu muốn đổi"
                class="w-full rounded border border-slate-400 px-3 py-1.5 focus:border-blue-500 focus:outline-none"
              />
            </label>

            <!-- Footer Actions -->
            <div class="mt-8 flex items-end justify-between">
              <!-- Logout Button at bottom-left -->
              <button
                type="button"
                (click)="onLogout()"
                class="flex flex-col items-center gap-1 text-sm text-slate-900 hover:text-red-600 transition-colors"
              >
                <app-icon name="logout" [size]="24" />
                Đăng Xuất
              </button>

              <!-- Main action buttons -->
              <div class="flex items-center gap-4">
                <button
                  type="button"
                  (click)="goToBookingHistory()"
                  class="rounded bg-slate-200 border border-slate-400 px-6 py-2 text-sm text-slate-900 hover:bg-slate-300 transition-colors"
                >
                  Booking History
                </button>

                <button 
                  type="submit" 
                  [disabled]="submitting()"
                  class="rounded bg-slate-200 border border-slate-400 px-6 py-2 text-sm text-slate-900 hover:bg-slate-300 transition-colors disabled:opacity-50"
                >
                  Edit Profile
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    }
  `,
})
export class ProfileEditDialog {
  readonly open = input<boolean>(false)
  readonly close = output<void>()

  protected readonly store = inject(AuthStore)
  private readonly router = inject(Router)

  protected fullName = ''
  protected email = ''
  protected password = ''
  protected address = ''
  protected createdDate = '05/16/2026'
  protected departmentName = 'FPT ALPHA STUDENT'
  protected submitting = signal(false)

  protected legitPoint = computed(() => {
    const penalty = this.store.user()?.penaltyPoints ?? 0
    return Math.max(0, 100 - penalty * 10)
  })

  constructor() {
    effect(() => {
      if (this.open()) {
        const u = this.store.user()
        if (u) {
          this.fullName = u.fullName || ''
          this.email = u.email || ''
          this.address = u.address || 'Hà Nội Việt Nam'
          this.departmentName = u.departmentName || 'FPT ALPHA STUDENT'
          this.password = ''
        }
      }
    })
  }

  goToBookingHistory(): void {
    this.close.emit()
    void this.router.navigate(['/bookings'])
  }

  async onLogout(): Promise<void> {
    this.close.emit()
    await this.store.logout()
    void this.router.navigate(['/auth/login'])
  }

  async onSubmit(): Promise<void> {
    if (!this.fullName.trim() || !this.email.trim()) return

    this.submitting.set(true)
    try {
      const payload: UpdateProfilePayload = {
        fullName: this.fullName.trim(),
        email: this.email.trim(),
        password: this.password ? this.password.trim() : undefined,
        address: this.address.trim(),
      }

      await this.store.updateProfile(payload)
      this.close.emit()
    } finally {
      this.submitting.set(false)
    }
  }
}
