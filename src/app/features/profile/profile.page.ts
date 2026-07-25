import { DatePipe } from '@angular/common'
import { Component, computed, inject, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { Router, RouterLink } from '@angular/router'
import { TranslatePipe } from '@ngx-translate/core'
import { SystemService } from '../../core/api/system.service'
import { AuthStore } from '../../core/auth/auth.store'
import { IconComponent } from '../../shared/ui/icon'
import { ModalComponent } from '../../shared/ui/modal'
import { ToastService } from '../../shared/ui/toast.service'

@Component({
  selector: 'app-profile-page',
  imports: [DatePipe, FormsModule, RouterLink, IconComponent, ModalComponent, TranslatePipe],
  template: `
    <section class="space-y-6">
      <header>
        <div class="flex items-center gap-2 text-sm font-semibold text-indigo-600">
          <span class="h-2 w-2 rounded-full bg-emerald-500"></span>
          Hồ sơ cá nhân
        </div>
        <h1 class="mt-2 text-3xl font-bold tracking-[-0.035em] text-slate-950 sm:text-4xl">{{ 'profile.title' | translate }}</h1>
        <p class="mt-2 text-sm text-slate-500">{{ 'profile.subtitle' | translate }}</p>
      </header>

      @if (store.user(); as user) {
        <div class="grid gap-6 xl:grid-cols-[360px_1fr]">
          <aside class="space-y-6">
            <article class="card-surface p-6">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2"><app-icon name="user" [size]="20" /><span class="text-lg font-bold text-slate-950">My Profile</span></div>
                <span class="rounded-full bg-gradient-to-r from-cyan-50 to-indigo-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">ShareLab</span>
              </div>

              <div class="mt-6 space-y-4">
                <div><label class="field-label">{{ 'profile.fullName' | translate }}</label><input class="input-shell" type="text" [value]="user.fullName" readonly /></div>
                <div><label class="field-label">{{ 'profile.email' | translate }}</label><input class="input-shell" type="text" [value]="user.email" readonly /></div>
                <div>
                  <label class="field-label">Legit Point</label>
                  <div class="h-3 w-full overflow-hidden rounded-full bg-slate-100"><div class="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-600" [style.width.%]="legitPoint(user)"></div></div>
                  <p class="mt-1.5 text-xs font-semibold text-slate-400">{{ legitPoint(user) }} / 100</p>
                </div>
                <div>
                  <label class="field-label">Ngày tạo tài khoản</label>
                  <div class="input-shell flex items-center gap-2 text-slate-400"><app-icon name="calendar" [size]="16" /> Chưa cập nhật</div>
                </div>
                <div>
                  <label class="field-label">Địa chỉ</label>
                  <div class="input-shell flex items-center gap-2 text-slate-400"><app-icon name="map-pin" [size]="16" /> Chưa cập nhật</div>
                </div>
                <div><label class="field-label">{{ 'profile.department' | translate }}</label><input class="input-shell" type="text" [value]="user.departmentName || 'Chưa cập nhật'" readonly /></div>
              </div>

              <div class="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">
                <button type="button" class="inline-flex items-center gap-2 text-xs font-bold text-rose-600 hover:text-rose-700" (click)="logout()"><app-icon name="logout" [size]="16" /> {{ 'header.logout' | translate }}</button>
                <div class="flex gap-2">
                  <a routerLink="/app/bookings/my" class="btn-secondary"><app-icon name="book-open" [size]="16" /> Booking History</a>
                  <button type="button" class="btn-secondary" (click)="openEdit(user)"><app-icon name="edit" [size]="16" /> Edit Profile</button>
                </div>
              </div>
            </article>

            <article class="rounded-[24px] bg-[#111a3a] p-6 text-white shadow-xl shadow-slate-900/15">
              <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-cyan-300"><app-icon name="shield" [size]="21" /></div>
              <h3 class="mt-5 text-lg font-bold">Bảo mật tài khoản</h3>
              <p class="mt-2 text-sm leading-6 text-white/55">Backend hiện chưa có API đổi mật khẩu khi đang đăng nhập. Bạn có thể dùng luồng đặt lại qua email.</p>
              <a routerLink="/forgot-password" class="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-white px-4 text-xs font-bold text-[#111a3a] hover:bg-cyan-50">
                {{ 'auth.forgotPassword' | translate }}
                <app-icon name="arrow-right" [size]="16" />
              </a>
            </article>
          </aside>

          <div class="space-y-6">
            <article class="card-surface overflow-hidden">
              <div class="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-6">
                <div>
                  <h2 class="text-lg font-bold text-slate-950">Thông tin tài khoản</h2>
                  <p class="mt-1 text-xs text-slate-400">Dữ liệu được đồng bộ từ hồ sơ hệ thống</p>
                </div>
                <span class="rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">Chỉ xem</span>
              </div>
              <div class="grid gap-px bg-slate-100 sm:grid-cols-2">
                @for (item of profileItems(user); track item.label) {
                  <div class="bg-white p-5 sm:p-6">
                    <div class="flex items-start gap-4">
                      <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600"><app-icon [name]="item.icon" [size]="19" /></div>
                      <div class="min-w-0">
                        <p class="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">{{ item.label }}</p>
                        <p class="mt-2 break-words text-sm font-semibold text-slate-800">{{ item.value }}</p>
                      </div>
                    </div>
                  </div>
                }
              </div>
            </article>

            <div class="grid gap-6 lg:grid-cols-2">
              <article class="card-surface p-5 sm:p-6">
                <div class="flex items-center gap-3">
                  <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600"><app-icon name="activity" [size]="21" /></div>
                  <div><h2 class="font-bold text-slate-950">Trạng thái hoạt động</h2><p class="text-xs text-slate-400">Quyền sử dụng hệ thống hiện tại</p></div>
                </div>
                <div class="mt-6 rounded-2xl border p-5" [class.border-emerald-100]="statusText() === 'Active'" [class.bg-emerald-50]="statusText() === 'Active'" [class.border-amber-100]="statusText() === 'Restricted'" [class.bg-amber-50]="statusText() === 'Restricted'" [class.border-rose-100]="statusText() === 'Locked' || statusText() === 'Inactive'" [class.bg-rose-50]="statusText() === 'Locked' || statusText() === 'Inactive'">
                  <div class="flex items-center justify-between gap-4">
                    <div>
                      <p class="text-sm font-bold" [class.text-emerald-800]="statusText() === 'Active'" [class.text-amber-800]="statusText() === 'Restricted'" [class.text-rose-800]="statusText() === 'Locked' || statusText() === 'Inactive'">{{ statusLabel(statusText()) }}</p>
                      <p class="mt-1 text-xs leading-5" [class.text-emerald-700]="statusText() === 'Active'" [class.text-amber-700]="statusText() === 'Restricted'" [class.text-rose-700]="statusText() === 'Locked' || statusText() === 'Inactive'">{{ statusDescription(statusText()) }}</p>
                    </div>
                    <app-icon [name]="statusText() === 'Active' ? 'check' : 'alert'" [size]="26" />
                  </div>
                </div>
              </article>

              <article class="card-surface p-5 sm:p-6">
                <div class="flex items-center gap-3">
                  <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600"><app-icon name="clock" [size]="21" /></div>
                  <div><h2 class="font-bold text-slate-950">Thời hạn hạn chế</h2><p class="text-xs text-slate-400">Áp dụng khi tài khoản Restricted</p></div>
                </div>
                <div class="mt-6 rounded-2xl bg-slate-50 p-5">
                  @if (user.restrictionUntil) {
                    <p class="text-2xl font-bold tracking-[-0.03em] text-slate-950">{{ user.restrictionUntil | date: 'HH:mm' }}</p>
                    <p class="mt-1 text-sm font-semibold text-slate-600">{{ user.restrictionUntil | date: 'dd/MM/yyyy' }}</p>
                    <p class="mt-3 text-xs leading-5 text-slate-400">Sau thời điểm này, backend sẽ tự mở hạn chế nếu không có điều kiện chặn khác.</p>
                  } @else {
                    <p class="text-lg font-bold text-slate-800">Không có thời hạn hạn chế</p>
                    <p class="mt-2 text-xs leading-5 text-slate-400">Tài khoản hiện không lưu RestrictionUntil.</p>
                  }
                </div>
              </article>
            </div>

            <article class="flex flex-col gap-4 rounded-3xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-violet-50 p-5 sm:flex-row sm:items-center sm:p-6">
              <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm"><app-icon name="mail" [size]="22" /></div>
              <div class="min-w-0 flex-1">
                <p class="font-bold text-indigo-950">Cần cập nhật thông tin?</p>
                <p class="mt-1 text-sm leading-6 text-indigo-700/70">Hiện chưa có API tự sửa hồ sơ. Hãy liên hệ Admin để thay đổi họ tên, email, khoa/phòng ban hoặc vai trò.</p>
              </div>
            </article>
          </div>
        </div>

        <app-modal [open]="editOpen()" title="Chỉnh sửa thông tin cá nhân" subtitle="Một số trường quan trọng có thể cần Admin duyệt lại." (close)="editOpen.set(false)">
          <form class="grid gap-4" (ngSubmit)="saveProfile()">
            <div><label class="field-label">Họ và tên *</label><input class="input-shell" [(ngModel)]="editForm.fullName" name="fullName" required /></div>
            <div><label class="field-label">Username *</label><input class="input-shell" [(ngModel)]="editForm.username" name="username" required /></div>
            <div><label class="field-label">Email *</label><input class="input-shell" type="email" [(ngModel)]="editForm.email" name="email" required /></div>
            <div class="flex justify-end gap-2"><button type="button" class="btn-secondary" (click)="editOpen.set(false)">{{ 'common.cancel' | translate }}</button><button class="btn-primary" [disabled]="saving()">{{ saving() ? ('common.loading' | translate) : ('common.save' | translate) }}</button></div>
          </form>
        </app-modal>
      }
    </section>
  `,
})
export class ProfilePage {
  protected readonly store = inject(AuthStore)
  private readonly api = inject(SystemService)
  private readonly toast = inject(ToastService)
  private readonly router = inject(Router)
  protected readonly editOpen = signal(false)
  protected readonly saving = signal(false)
  protected editForm = { fullName: '', username: '', email: '' }

  protected readonly statusText = computed(() => {
    const status = this.store.user()?.status
    if (typeof status === 'string') return status
    return ({ 1: 'Active', 2: 'Restricted', 3: 'Inactive', 4: 'Locked' } as Record<number, string>)[status ?? 1] ?? 'Active'
  })

  protected legitPoint(user: { penaltyPoints: number }): number {
    return Math.max(0, 100 - user.penaltyPoints)
  }

  protected openEdit(user: { fullName: string; username: string; email: string }): void {
    this.editForm = { fullName: user.fullName, username: user.username, email: user.email }
    this.editOpen.set(true)
  }

  protected saveProfile(): void {
    const user = this.store.user()
    if (!user) return
    this.saving.set(true)
    this.api.updateUser(user.userId, { fullName: this.editForm.fullName, username: this.editForm.username, email: this.editForm.email }).subscribe({
      next: () => { this.saving.set(false); this.editOpen.set(false); this.toast.success('Đã cập nhật thông tin cá nhân'); void this.store.hydrate() },
      error: () => { this.saving.set(false); this.editOpen.set(false); this.toast.error('Không thể tự cập nhật hồ sơ', 'Tài khoản của bạn có thể chưa được cấp quyền tự sửa thông tin, vui lòng liên hệ Admin.') },
    })
  }

  protected async logout(): Promise<void> {
    await this.store.logout()
    void this.router.navigate(['/login'])
  }

  protected roleLabel(role: string): string {
    if (role === 'Admin') return 'Quản trị viên'
    if (role === 'LabManager') return 'Quản lý phòng lab'
    return 'Người đặt lịch'
  }

  protected statusLabel(status: string): string {
    return ({ Active: 'Đang hoạt động', Restricted: 'Đang hạn chế', Inactive: 'Ngừng hoạt động', Locked: 'Đã khóa' } as Record<string, string>)[status] ?? status
  }

  protected statusDescription(status: string): string {
    return ({
      Active: 'Bạn có thể sử dụng đầy đủ các chức năng theo vai trò được cấp.',
      Restricted: 'Một số thao tác như tạo booking mới có thể bị hạn chế.',
      Inactive: 'Tài khoản không còn hoạt động trên hệ thống.',
      Locked: 'Tài khoản đã bị khóa và cần Admin mở lại.',
    } as Record<string, string>)[status] ?? 'Không xác định trạng thái tài khoản.'
  }

  protected profileItems(user: {
    userId: number
    fullName: string
    username: string
    email: string
    roleName: string
    departmentName: string
  }): { label: string; value: string; icon: string }[] {
    return [
      { label: 'Mã người dùng', value: `#${user.userId}`, icon: 'user' },
      { label: 'Họ và tên', value: user.fullName, icon: 'user' },
      { label: 'Username', value: user.username, icon: 'shield' },
      { label: 'Email', value: user.email, icon: 'mail' },
      { label: 'Vai trò', value: this.roleLabel(user.roleName), icon: 'shield' },
      { label: 'Khoa / phòng ban', value: user.departmentName || 'Chưa cập nhật', icon: 'building' },
    ]
  }
}
