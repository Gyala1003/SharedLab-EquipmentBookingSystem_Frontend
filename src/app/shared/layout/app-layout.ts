import { Component, inject } from '@angular/core'
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router'
import { TranslatePipe, TranslateService } from '@ngx-translate/core'
import { AuthStore } from '../../core/auth/auth.store'
import { env } from '../../core/config/env'
import { ButtonComponent } from '../ui/button'
import { FooterComponent } from './footer/footer.component'



@Component({
  selector: 'app-layout',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, TranslatePipe, ButtonComponent, FooterComponent  ],
  template: `
    <div class="min-h-screen bg-surface-light">
      <header class="border-b border-slate-200 bg-white">
        <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <nav class="flex items-center gap-4">
            <a
              routerLink="/"
              routerLinkActive="text-brand-700"
              [routerLinkActiveOptions]="{ exact: true }"
              class="text-lg font-semibold text-brand-600"
              >{{ 'app.name' | translate }}</a
            >
            @if (store.isAuthenticated()) {
              <a
                routerLink="/users"
                routerLinkActive="text-brand-700"
                class="text-sm text-slate-600 hover:text-brand-600"
                >{{ 'nav.users' | translate }}</a
              >
            }
          </nav>

          <div class="flex items-center gap-3">
            <select
              aria-label="Language"
              [value]="translate.getCurrentLang()"
              (change)="onLocaleChange($event)"
              class="rounded-card border border-slate-300 bg-white px-2 py-1 text-sm"
            >
              @for (l of locales; track l) {
                <option [value]="l">{{ l.toUpperCase() }}</option>
              }
            </select>

            @if (store.isAuthenticated()) {
              <span class="text-sm text-slate-600">{{ store.user()?.fullName }}</span>
              <app-button variant="ghost" (click)="logout()">
                {{ 'nav.logout' | translate }}
              </app-button>
            } @else {
              <a
                routerLink="/auth/login"
                class="text-sm font-medium text-brand-600 hover:underline"
              >
                {{ 'nav.login' | translate }}
              </a>
            }
          </div>
        </div>
      </header>

      <main class="mx-auto max-w-6xl px-4 py-6">
        <router-outlet />
      </main>
  <app-footer />

    </div>
  `,
})
export class AppLayoutComponent {
  protected readonly store = inject(AuthStore)
  protected readonly translate = inject(TranslateService)
  private readonly router = inject(Router)
  protected readonly locales = env.supportedLocales

  onLocaleChange(event: Event): void {
    const lang = (event.target as HTMLSelectElement).value
    this.translate.use(lang)
    localStorage.setItem('app.locale', lang)
    document.documentElement.lang = lang
  }

  logout(): void {
    this.store.logout()
    void this.router.navigate(['/auth/login'])
  }


  
}
