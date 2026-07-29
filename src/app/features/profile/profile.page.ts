import { DatePipe } from '@angular/common'
import { Component, computed, inject, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { Router, RouterLink } from '@angular/router'
import { SystemService } from '../../core/api/system.service'
import { AuthStore } from '../../core/auth/auth.store'
import { LanguageStore } from '../../core/i18n/language.store'
import { TranslatePipe } from '../../core/i18n/translate.pipe'
import { IconComponent } from '../../shared/ui/icon'
import { ModalComponent } from '../../shared/ui/modal'
import { ToastService } from '../../shared/ui/toast.service'
import { labelOf } from '../../shared/utils/presentation'

@Component({
  selector: 'app-profile-page',
  imports: [DatePipe, FormsModule, RouterLink, IconComponent, ModalComponent, TranslatePipe],
  template: `
    <section class="space-y-6">
      <header>
        <div class="flex items-center gap-2 text-sm font-semibold text-indigo-600">
          <span class="h-2 w-2 rounded-full bg-emerald-500"></span>
          {{ 'profile.badgeText' | t }}
        </div>
        <h1 class="mt-2 text-3xl font-bold tracking-[-0.035em] text-slate-950 sm:text-4xl">{{ 'profile.title' | t }}</h1>
        <p class="mt-2 text-sm text-slate-500">{{ 'profile.subtitle' | t }}</p>
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
                <div><label class="field-label">{{ 'profile.fullName' | t }}</label><input class="input-shell" type="text" [value]="user.fullName" readonly /></div>
                <div><label class="field-label">Email</label><input class="input-shell" type="text" [value]="user.email" readonly /></div>
                <div>
                  <label class="field-label">Legit Point</label>
                  <!-- TODO: công thức Legit Point tạm tính = 100 - penaltyPoints, cần xác nhận công thức chính thức với Backend/Business -->
                  <div class="h-3 w-full overflow-hidden rounded-full bg-slate-100"><div class="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-600" [style.width.%]="legitPoint(user)"></div></div>
                  <p class="mt-1.5 text-xs font-semibold text-slate-400">{{ legitPoint(user) }} / 100</p>
                </div>
                <div>
                  <label class="field-label">{{ 'profile.createdAt' | t }}</label>
                  <!-- TODO: cần Backend bổ sung trường createdAt vào response GET /Auth/me và thêm vào AuthUser (core/auth/auth.types.ts) khi có -->
                  <div class="input-shell flex items-center gap-2 text-slate-400"><app-icon name="calendar" [size]="16" /> {{ 'profile.notUpdated' | t }}</div>
                </div>
                <div>
                  <label class="field-label">{{ 'profile.address' | t }}</label>
                  <!-- TODO: cần Backend bổ sung trường address vào response GET /Auth/me và thêm vào AuthUser (core/auth/auth.types.ts) khi có -->
                  <div class="input-shell flex items-center gap-2 text-slate-400"><app-icon name="map-pin" [size]="16" /> {{ 'profile.notUpdated' | t }}</div>
                </div>
                <div><label class="field-label">{{ 'profile.department' | t }}</label><input class="input-shell" type="text" [value]="user.departmentName || ('profile.notUpdated' | t)" readonly /></div>
              </div>

              <div class="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">
                <button type="button" class="inline-flex items-center gap-2 text-xs font-bold text-rose-600 hover:text-rose-700" (click)="logout()"><app-icon name="logout" [size]="16" /> {{ 'profile.logout' | t }}</button>
              </div>
            </article>

            <article class="rounded-[24px] bg-[#111a3a] p-6 text-white shadow-xl shadow-slate-900/15">
              <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-cyan-300"><app-icon name="shield" [size]="21" /></div>
              <h3 class="mt-5 text-lg font-bold">{{ 'profile.accountSecurity' | t }}</h3>
              <p class="mt-2 text-sm leading-6 text-white/55">{{ 'profile.securityNote' | t }}</p>
              <a routerLink="/forgot-password" class="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-white px-4 text-xs font-bold text-[#111a3a] hover:bg-cyan-50">
                {{ 'profile.resetPassword' | t }}
                <app-icon name="arrow-right" [size]="16" />
              </a>
            </article>
          </aside>

          <div class="space-y-6">
            <article class="card-surface overflow-hidden">
              <div class="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-6">
                <div>
                  <h2 class="text-lg font-bold text-slate-950">{{ 'profile.accountInfo' | t }}</h2>
                  <p class="mt-1 text-xs text-slate-400">{{ 'profile.accountInfoSub' | t }}</p>
                </div>
                <span class="rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">ReadOnly</span>
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
                  <div><h2 class="font-bold text-slate-950">{{ 'profile.activeStatusTitle' | t }}</h2><p class="text-xs text-slate-400">{{ 'profile.activeStatusSub' | t }}</p></div>
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
                  <div><h2 class="font-bold text-slate-950">{{ 'profile.restrictionTitle' | t }}</h2><p class="text-xs text-slate-400">{{ 'profile.restrictionSub' | t }}</p></div>
                </div>
                <div class="mt-6 rounded-2xl bg-slate-50 p-5">
                  @if (user.restrictionUntil) {
                    <p class="text-2xl font-bold tracking-[-0.03em] text-slate-950">{{ user.restrictionUntil | date: 'HH:mm' }}</p>
                    <p class="mt-1 text-sm font-semibold text-slate-600">{{ user.restrictionUntil | date: 'dd/MM/yyyy' }}</p>
                    <p class="mt-3 text-xs leading-5 text-slate-400">{{ 'violations.restrictedUntil' | t }}</p>
                  } @else {
                    <p class="text-lg font-bold text-slate-800">{{ 'profile.noRestriction' | t }}</p>
                    <p class="mt-2 text-xs leading-5 text-slate-400">{{ 'profile.noRestrictionDesc' | t }}</p>
                  }
                </div>
              </article>
            </div>

            <article class="flex flex-col gap-4 rounded-3xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-violet-50 p-5 sm:flex-row sm:items-center sm:p-6">
              <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm"><app-icon name="mail" [size]="22" /></div>
              <div class="min-w-0 flex-1">
                <p class="font-bold text-indigo-950">{{ 'profile.needUpdateTitle' | t }}</p>
                <p class="mt-1 text-sm leading-6 text-indigo-700/70">{{ 'profile.needUpdateSub' | t }}</p>
              </div>
            </article>
          </div>
        </div>
        <app-modal [open]="editOpen()" title="Chỉnh sửa thông tin cá nhân" subtitle="Một số trường quan trọng có thể cần Admin duyệt lại." (close)="editOpen.set(false)">
          <form class="grid gap-4" (ngSubmit)="saveProfile()">
            <div><label class="field-label">Họ và tên *</label><input class="input-shell" [(ngModel)]="editForm.fullName" name="fullName" required /></div>
            <div><label class="field-label">Username *</label><input class="input-shell" [(ngModel)]="editForm.username" name="username" required /></div>
            <div><label class="field-label">Email *</label><input class="input-shell" type="email" [(ngModel)]="editForm.email" name="email" required /></div>
            <div class="flex justify-end gap-2"><button type="button" class="btn-secondary" (click)="editOpen.set(false)">{{ 'common.cancel' | t }}</button><button class="btn-primary" [disabled]="saving()">{{ saving() ? '...' : 'Save' }}</button></div>
          </form>
        </app-modal>
      }
    </section>
  `,
})
export class ProfilePage {
  protected readonly store = inject(AuthStore)
  protected readonly languageStore = inject(LanguageStore)
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

  protected initials(name: string): string {
    return name
      .trim()
      .split(/\s+/)
      .slice(-2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('')
  }

  protected roleLabel(role: string): string {
    return labelOf('userRole', role, this.languageStore.lang())
  }

  protected statusLabel(status: string): string {
    return labelOf('user', status, this.languageStore.lang())
  }

  protected statusDescription(status: string): string {
    if (this.languageStore.lang() === 'en') {
      return ({
        Active: 'Full access to all system features according to assigned role.',
        Restricted: 'Some operations like creating new bookings may be restricted.',
        Inactive: 'Account is inactive on the system.',
        Locked: 'Account is locked and requires Admin to unlock.',
      } as Record<string, string>)[status] ?? 'Unknown account status.'
    }
    return ({
      Active: 'Có thể sử dụng đầy đủ các chức năng theo vai trò được cấp.',
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
      { label: this.languageStore.t('profile.userId'), value: `#${user.userId}`, icon: 'user' },
      { label: this.languageStore.t('profile.fullName'), value: user.fullName, icon: 'user' },
      { label: this.languageStore.t('profile.username'), value: user.username, icon: 'shield' },
      { label: this.languageStore.t('profile.email'), value: user.email, icon: 'mail' },
      { label: this.languageStore.t('profile.role'), value: this.roleLabel(user.roleName), icon: 'shield' },
      { label: this.languageStore.t('profile.department'), value: user.departmentName || this.languageStore.t('profile.notUpdated'), icon: 'building' },
    ]
  }
}
