import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core'
import { provideRouter, withComponentInputBinding } from '@angular/router'
import { provideHttpClient, withInterceptors } from '@angular/common/http'
import { provideTranslateService, TranslateLoader, TranslateService } from '@ngx-translate/core'
import { Observable, firstValueFrom, of } from 'rxjs'

import { AuthStore } from './core/auth/auth.store'

import { routes } from './app.routes'
import { env } from './core/config/env'
import { getDictionary } from './core/i18n/translations'
import { authInterceptor } from './core/http/auth.interceptor'
import { errorInterceptor } from './core/http/error.interceptor'

class UnifiedTranslateLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<Record<string, any>> {
    return of(getDictionary(lang === 'en' ? 'en' : 'vi'))
  }
}

function resolveInitialLocale(): string {
  const stored = localStorage.getItem('app.locale') || localStorage.getItem('app.lang')
  if (stored && (env.supportedLocales as readonly string[]).includes(stored)) {
    return stored
  }
  return env.defaultLocale
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    provideTranslateService({
      fallbackLang: env.defaultLocale,
      loader: { provide: TranslateLoader, useClass: UnifiedTranslateLoader },
    }),
    // Load the initial language before the app renders to avoid flashes.
    provideAppInitializer(() => {
      const translate = inject(TranslateService)
      const authStore = inject(AuthStore)
      const locale = resolveInitialLocale()
      document.documentElement.lang = locale
      return Promise.all([firstValueFrom(translate.use(locale)), authStore.hydrate()])
    }),
  ],
}
