import { Component, inject, signal } from '@angular/core'
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router'
import { TranslatePipe, TranslateService } from '@ngx-translate/core'
import { AuthStore } from '../../core/auth/auth.store'
import { ProfileEditDialog } from '../../core/auth/profile-edit.dialog'
import { env } from '../../core/config/env'
import { IconComponent } from '../ui/icon'

@Component({
  selector: 'app-layout',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, TranslatePipe, IconComponent, ProfileEditDialog],
  template: `
    <div class="flex min-h-screen bg-surface-light">
      <!-- Sidebar -->
      <aside class="flex w-60 shrink-0 flex-col bg-surface text-slate-300">
        <div class="flex items-center gap-2 px-5 py-5">
          <div
            class="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-sm font-bold text-white"
          >
            L
          </div>
          <span class="truncate text-sm font-semibold text-white">{{
            'app.name' | translate
          }}</span>
        </div>

        <nav class="flex flex-1 flex-col gap-1 px-3">
          <!-- Common: Dashboard -->
          <a
            routerLink="/"
            routerLinkActive="bg-brand-500 text-white"
            [routerLinkActiveOptions]="{ exact: true }"
            class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
          >
            <app-icon name="dashboard" [size]="18" />
            {{ 'nav.dashboard' | translate }}
          </a>

          <!-- Common: Lab Rooms -->
          <a
            routerLink="/lab-rooms"
            routerLinkActive="bg-brand-500 text-white"
            class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
          >
            <app-icon name="catalog" [size]="18" />
            {{ 'nav.labRooms' | translate }}
          </a>

          <!-- Common: Equipments -->
          <a
            routerLink="/equipments"
            routerLinkActive="bg-brand-500 text-white"
            class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
          >
            <app-icon name="equipment" [size]="18" />
            {{ 'nav.equipments' | translate }}
          </a>

          <!-- Common: Policies -->
          <a
            routerLink="/policies"
            routerLinkActive="bg-brand-500 text-white"
            class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
          >
            <app-icon name="shield" [size]="18" />
            {{ 'nav.policies' | translate }}
          </a>

          <!-- Requester only: My Bookings -->
          @if (store.isRequester()) {
            <a
              routerLink="/bookings/history"
              routerLinkActive="bg-brand-500 text-white"
              class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
            >
              <app-icon name="bookings" [size]="18" />
              {{ 'nav.myBookings' | translate }}
            </a>
          }

          <!-- Lab Manager Section -->
          @if (store.isLabManager()) {
            <p class="mt-5 mb-1 px-3 text-xs font-semibold tracking-wide text-slate-500 uppercase">
              {{ 'nav.managerSection' | translate }}
            </p>
            <a
              routerLink="/manager/approvals"
              routerLinkActive="bg-brand-500 text-white"
              class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
            >
              <app-icon name="clock" [size]="18" />
              {{ 'nav.waitingList' | translate }}
            </a>
            <a
              routerLink="/manager/incidents"
              routerLinkActive="bg-brand-500 text-white"
              class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
            >
              <app-icon name="alert" [size]="18" />
              {{ 'nav.incidents' | translate }}
            </a>
            <a
              routerLink="/manager/violations"
              routerLinkActive="bg-brand-500 text-white"
              class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
            >
              <app-icon name="violation" [size]="18" />
              {{ 'nav.violations' | translate }}
            </a>
            <a
              routerLink="/manager/maintenance"
              routerLinkActive="bg-brand-500 text-white"
              class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
            >
              <app-icon name="maintenance" [size]="18" />
              {{ 'nav.maintenance' | translate }}
            </a>
          }

          <!-- Admin Section -->
          @if (store.isAdmin()) {
            <p class="mt-5 mb-1 px-3 text-xs font-semibold tracking-wide text-slate-500 uppercase">
              {{ 'nav.adminSection' | translate }}
            </p>
            <a
              routerLink="/admin/policies"
              routerLinkActive="bg-brand-500 text-white"
              class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
            >
              <app-icon name="shield" [size]="18" />
              {{ 'nav.policies' | translate }}
            </a>
            <a
              routerLink="/lab-rooms/new"
              routerLinkActive="bg-brand-500 text-white"
              class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
            >
              <app-icon name="plus" [size]="18" />
              {{ 'nav.newLabRoom' | translate }}
            </a>
            <a
              routerLink="/users"
              routerLinkActive="bg-brand-500 text-white"
              class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
            >
              <app-icon name="users" [size]="18" />
              {{ 'nav.users' | translate }}
            </a>
          }
        </nav>

        <div class="border-t border-white/10 px-3 py-3">
          @if (store.isAuthenticated()) {
            <div class="flex items-center justify-between gap-2 px-2">
              <div class="min-w-0">
                <p class="truncate text-sm font-medium text-white">
                  {{ store.user()?.fullName }}
                </p>
                <p class="truncate text-xs text-slate-500">{{ store.user()?.roleName }}</p>
              </div>
              <div class="flex items-center gap-1">
                <button
                  class="shrink-0 rounded-md p-1.5 text-slate-400 hover:bg-white/5 hover:text-white"
                  title="Edit My Profile"
                  (click)="editProfileOpen.set(true)"
                >
                  <app-icon name="users" [size]="16" />
                </button>
                <button
                  class="shrink-0 rounded-md p-1.5 text-slate-400 hover:bg-white/5 hover:text-white"
                  [attr.aria-label]="'nav.logout' | translate"
                  (click)="logout()"
                >
                  <app-icon name="logout" [size]="16" />
                </button>
              </div>
            </div>
          } @else {
            <a
              routerLink="/auth/login"
              class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white"
            >
              {{ 'nav.login' | translate }}
            </a>
          }
        </div>
      </aside>

      <!-- Main column -->
      <div class="flex min-w-0 flex-1 flex-col">
        <header class="flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 py-3">
          <div class="relative w-full max-w-sm">
            <span class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400">
              <app-icon name="search" [size]="16" />
            </span>
            <input
              type="search"
              [placeholder]="'nav.search' | translate"
              class="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pr-3 pl-9 text-sm focus:border-brand-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div class="flex items-center gap-3">
            <select
              aria-label="Language"
              [value]="translate.getCurrentLang()"
              (change)="onLocaleChange($event)"
              class="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-600"
            >
              @for (l of locales; track l) {
                <option [value]="l">{{ l.toUpperCase() }}</option>
              }
            </select>
          </div>
        </header>

        <main class="flex-1 overflow-y-auto px-6 py-6">
          <router-outlet />
        </main>
      </div>
    </div>

    <app-profile-edit-dialog
      [open]="editProfileOpen()"
      (close)="editProfileOpen.set(false)"
    />
  `,
})
export class AppLayoutComponent {
  protected readonly store = inject(AuthStore)
  protected readonly translate = inject(TranslateService)
  private readonly router = inject(Router)
  protected readonly locales = env.supportedLocales
  protected readonly editProfileOpen = signal(false)

  onLocaleChange(event: Event): void {
    const lang = (event.target as HTMLSelectElement).value
    this.translate.use(lang)
    localStorage.setItem('app.locale', lang)
    document.documentElement.lang = lang
  }

  async logout(): Promise<void> {
    await this.store.logout()
    void this.router.navigate(['/auth/login'])
  }
}
