import { Component, computed, inject, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { Router, RouterLink } from '@angular/router'
import { SystemService } from '../../core/api/system.service'
import { AuthService } from '../../core/auth/auth.service'
import { AuthStore } from '../../core/auth/auth.store'
import { LanguageStore } from '../../core/i18n/language.store'
import { TranslatePipe } from '../../core/i18n/translate.pipe'
import { IconComponent } from '../../shared/ui/icon'
import { StatusBadgeComponent } from '../../shared/ui/status-badge'
import { ToastService } from '../../shared/ui/toast.service'
import { labelOf } from '../../shared/utils/presentation'

@Component({
  selector: 'app-profile-page',
  imports: [FormsModule, RouterLink, IconComponent, StatusBadgeComponent, TranslatePipe],
  template: `
    <section class="space-y-6">
      @if (store.user(); as user) {
        <header
          class="flex flex-col justify-between gap-4 rounded-[28px] border border-cyan-100/80 bg-white p-6 shadow-sm shadow-cyan-950/5 md:flex-row md:items-center"
        >
          <div>
            <div
              class="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50/80 px-3 py-1 text-xs font-semibold text-cyan-800"
            >
              <span class="h-2 w-2 rounded-full bg-cyan-500"></span>
              {{ 'profile.badgeText' | t }}
            </div>
            <h1 class="mt-2 text-3xl font-bold tracking-[-0.035em] text-slate-950 sm:text-4xl">
              {{ 'profile.title' | t }}
            </h1>
            <p class="mt-2 text-sm text-slate-500">{{ 'profile.subtitle' | t }}</p>
          </div>
        </header>

        <div class="grid gap-6 xl:grid-cols-[340px_1fr]">
          <aside class="space-y-6">
            <article class="card-surface p-6">
              <div class="flex flex-col items-center text-center">
                <div
                  class="flex h-24 w-24 items-center justify-center rounded-[32px] bg-gradient-to-br from-cyan-600 via-teal-500 to-indigo-600 text-3xl font-black text-white shadow-xl shadow-cyan-500/20"
                >
                  {{ initials(user.fullName) }}
                </div>
                <h2 class="mt-4 text-xl font-bold text-slate-950">{{ user.fullName }}</h2>
                <p class="mt-1 text-xs font-semibold text-slate-400">&#64;{{ user.username }}</p>
                <div class="mt-3 flex flex-wrap justify-center gap-2">
                  <span class="rounded-full bg-cyan-50 px-3 py-1 text-xs font-bold text-cyan-700">{{
                    roleLabel(user.roleName)
                  }}</span>
                  <app-status-badge [value]="statusText()" domain="user" />
                </div>
              </div>

              <div class="mt-6 space-y-4 border-t border-slate-100 pt-5 text-left">
                <div>
                  <label class="field-label">{{ 'profile.fullName' | t }}</label
                  ><input class="input-shell" type="text" [value]="user.fullName" readonly />
                </div>
                <div>
                  <label class="field-label">{{ 'profile.username' | t }}</label
                  ><input class="input-shell" type="text" [value]="user.username" readonly />
                </div>
                <div>
                  <label class="field-label">{{ 'profile.email' | t }}</label
                  ><input class="input-shell" type="email" [value]="user.email" readonly />
                </div>
                @if (user.roleName !== 'Admin') {
                  <div>
                    <label class="field-label">{{ 'profile.department' | t }}</label
                    ><input
                      class="input-shell"
                      type="text"
                      [value]="user.departmentName || ('profile.notUpdated' | t)"
                      readonly
                    />
                  </div>
                }
              </div>

              <div class="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">
                <button
                  type="button"
                  class="inline-flex items-center gap-2 text-xs font-bold text-rose-600 hover:text-rose-700"
                  (click)="logout()"
                >
                  <app-icon name="logout" [size]="16" /> {{ 'profile.logout' | t }}
                </button>
              </div>
            </article>

            <article
              class="rounded-[24px] bg-[#111a3a] p-6 text-white shadow-xl shadow-slate-900/15"
            >
              <div
                class="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-cyan-300"
              >
                <app-icon name="shield" [size]="21" />
              </div>
              <h3 class="mt-5 text-lg font-bold">{{ 'profile.accountSecurity' | t }}</h3>
              <p class="mt-2 text-sm leading-6 text-white/55">{{ 'profile.securityDesc' | t }}</p>
              <a
                routerLink="/app/profile/reset-password"
                class="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-white px-4 text-xs font-bold text-[#111a3a] hover:bg-cyan-50"
              >
                {{ 'profile.resetPassword' | t }}
                <app-icon name="arrow-right" [size]="16" />
              </a>
            </article>
          </aside>

          <div class="space-y-6">
            <article class="card-surface overflow-hidden">
              <div
                class="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-6"
              >
                <div>
                  <h2 class="text-lg font-bold text-slate-950">{{ 'profile.accountInfo' | t }}</h2>
                  <p class="mt-1 text-xs text-slate-400">{{ 'profile.accountInfoSub' | t }}</p>
                </div>
                <span
                  class="rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-bold tracking-wider text-slate-500 uppercase"
                  >ReadOnly</span
                >
              </div>

              <div class="divide-y divide-slate-100">
                @for (item of profileItems(user); track item.label) {
                  <div
                    class="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                  >
                    <div class="flex items-center gap-3">
                      <span
                        class="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-500"
                        ><app-icon [name]="item.icon" [size]="18"
                      /></span>
                      <div>
                        <p class="text-xs font-bold tracking-wider text-slate-400 uppercase">
                          {{ item.label }}
                        </p>
                        <p class="mt-0.5 font-bold text-slate-900">{{ item.value }}</p>
                      </div>
                    </div>
                    <span
                      class="self-start rounded-xl border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600 sm:self-auto"
                      >{{ 'profile.verified' | t }}</span
                    >
                  </div>
                }
              </div>
            </article>

            <article class="grid gap-6 md:grid-cols-2">
              <div class="card-surface p-6">
                <div class="flex items-center justify-between">
                  <div>
                    <h2 class="font-bold text-slate-950">{{ 'profile.activeStatusTitle' | t }}</h2>
                    <p class="text-xs text-slate-400">{{ 'profile.activeStatusSub' | t }}</p>
                  </div>
                  <app-status-badge [value]="statusText()" domain="user" />
                </div>
                <p class="mt-4 text-xs leading-5 text-slate-500">
                  {{ statusDescription(statusText()) }}
                </p>
              </div>

              <div class="card-surface p-6">
                <div class="flex items-center justify-between">
                  <div>
                    <h2 class="font-bold text-slate-950">{{ 'profile.legitScore' | t }}</h2>
                    <p class="text-xs text-slate-400">
                      {{ 'profile.penaltyPoints' | t }}: {{ user.penaltyPoints }}
                    </p>
                  </div>
                  <span
                    class="text-2xl font-black"
                    [class.text-emerald-600]="user.penaltyPoints === 0"
                    [class.text-amber-500]="user.penaltyPoints > 0 && user.penaltyPoints < 10"
                    [class.text-rose-600]="user.penaltyPoints >= 10"
                  >
                    {{ legitPoint(user) }}/100
                  </span>
                </div>
                <div class="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    class="h-full rounded-full transition-all duration-500"
                    [style.width.%]="legitPoint(user)"
                    [class.bg-emerald-500]="user.penaltyPoints === 0"
                    [class.bg-amber-500]="user.penaltyPoints > 0 && user.penaltyPoints < 10"
                    [class.bg-rose-500]="user.penaltyPoints >= 10"
                  ></div>
                </div>
              </div>
            </article>

            <article class="card-surface p-6">
              <div class="flex items-center justify-between">
                <div>
                  <h2 class="font-bold text-slate-950">{{ 'profile.restrictionTitle' | t }}</h2>
                  <p class="text-xs text-slate-400">{{ 'profile.restrictionSub' | t }}</p>
                </div>
                <span
                  class="rounded-full px-3 py-1 text-xs font-bold"
                  [class.bg-emerald-50]="!user.restrictionUntil"
                  [class.text-emerald-700]="!user.restrictionUntil"
                  [class.bg-rose-50]="!!user.restrictionUntil"
                  [class.text-rose-700]="!!user.restrictionUntil"
                >
                  {{ user.restrictionUntil ? ('profile.restricted' | t) : ('profile.normal' | t) }}
                </span>
              </div>

              <div class="mt-5 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                @if (user.restrictionUntil) {
                  <p class="font-bold text-rose-700">
                    {{ 'profile.restrictedUntil' | t }}: {{ user.restrictionUntil }}
                  </p>
                  <p class="mt-1 text-xs text-slate-500">{{ 'profile.restrictionDetail' | t }}</p>
                } @else {
                  <p class="text-lg font-bold text-slate-800">{{ 'profile.noRestriction' | t }}</p>
                  <p class="mt-2 text-xs leading-5 text-slate-400">
                    {{ 'profile.noRestrictionDesc' | t }}
                  </p>
                }
              </div>
            </article>
          </div>
        </div>
      }
    </section>
  `,
})
export class ProfilePage {
  protected readonly store = inject(AuthStore)
  protected readonly languageStore = inject(LanguageStore)
  private readonly api = inject(SystemService)
  private readonly authService = inject(AuthService)
  private readonly toast = inject(ToastService)
  private readonly router = inject(Router)

  protected readonly sendingReset = signal(false)

  protected readonly statusText = computed(() => {
    const status = this.store.user()?.status
    if (typeof status === 'string') return status
    return (
      ({ 1: 'Active', 2: 'Restricted', 3: 'Inactive', 4: 'Locked' } as Record<number, string>)[
        status ?? 1
      ] ?? 'Active'
    )
  })

  protected legitPoint(user: { penaltyPoints: number }): number {
    return Math.max(0, 100 - user.penaltyPoints)
  }

  protected requestPasswordReset(): void {
    const user = this.store.user()
    if (!user?.email) return
    this.sendingReset.set(true)
    const resetLink = `${window.location.origin}/reset-password`
    this.authService.forgotPassword(user.email, resetLink).subscribe({
      next: () => {
        this.sendingReset.set(false)
        this.toast.success(
          'Đã gửi email đặt lại mật khẩu',
          `Vui lòng kiểm tra hộp thư (${user.email}) để nhận liên kết tạo mật khẩu mới.`,
        )
      },
      error: () => {
        this.sendingReset.set(false)
        this.toast.error(
          'Không thể gửi yêu cầu đặt lại mật khẩu',
          'Vui lòng thử lại sau hoặc liên hệ quản trị viên.',
        )
      },
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
      return (
        (
          {
            Active: 'Full access to all system features according to assigned role.',
            Restricted: 'Some operations like creating new bookings may be restricted.',
            Inactive: 'Account is inactive on the system.',
            Locked: 'Account is locked and requires Admin to unlock.',
          } as Record<string, string>
        )[status] ?? 'Unknown account status.'
      )
    }
    return (
      (
        {
          Active: 'Được quyền truy cập đầy đủ các chức năng theo vai trò được cấp.',
          Restricted: 'Tài khoản đang bị hạn chế một số thao tác (ví dụ: đặt lịch mới).',
          Inactive: 'Tài khoản chưa được kích hoạt trên hệ thống.',
          Locked: 'Tài khoản đã bị khóa, cần liên hệ Admin để mở khóa.',
        } as Record<string, string>
      )[status] ?? 'Trạng thái tài khoản không xác định.'
    )
  }

  protected profileItems(user: {
    userId: number
    fullName: string
    username: string
    email: string
    roleName: string
    departmentName: string | null
  }): Array<{ label: string; value: string; icon: string }> {
    return [
      { label: this.languageStore.t('profile.fullName'), value: user.fullName, icon: 'user' },
      { label: this.languageStore.t('profile.username'), value: user.username, icon: 'shield' },
      { label: this.languageStore.t('profile.email'), value: user.email, icon: 'mail' },
      {
        label: this.languageStore.t('profile.role'),
        value: this.roleLabel(user.roleName),
        icon: 'shield',
      },
      ...(user.roleName !== 'Admin'
        ? [
            {
              label: this.languageStore.t('profile.department'),
              value:
                labelOf('department', user.departmentName, this.languageStore.lang()) ||
                this.languageStore.t('profile.notUpdated'),
              icon: 'building',
            },
          ]
        : []),
    ]
  }
}
