import {
  ApplicationConfig,
  ErrorHandler,
  Injectable,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core'
import { provideRouter, withComponentInputBinding } from '@angular/router'
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http'
import { provideTranslateService, TranslateLoader, TranslateService } from '@ngx-translate/core'
import { Observable, firstValueFrom, catchError, of } from 'rxjs'
import { map } from 'rxjs/operators'

import { AuthStore } from './core/auth/auth.store'

import { routes } from './app.routes'
import { env } from './core/config/env'
import { getDictionary } from './core/i18n/translations'
import { authInterceptor } from './core/http/auth.interceptor'
import { errorInterceptor } from './core/http/error.interceptor'
import { GlobalErrorHandler } from './core/http/global-error-handler'

function mergeDeep(target: Record<string, any>, source: Record<string, any>): Record<string, any> {
  for (const key of Object.keys(source)) {
    const sourceValue = source[key]
    const targetValue = target[key]

    if (
      sourceValue &&
      typeof sourceValue === 'object' &&
      !Array.isArray(sourceValue) &&
      targetValue &&
      typeof targetValue === 'object' &&
      !Array.isArray(targetValue)
    ) {
      target[key] = mergeDeep({ ...targetValue }, sourceValue)
    } else {
      target[key] = sourceValue
    }
  }
  return target
}

@Injectable()
class UnifiedTranslateLoader implements TranslateLoader {
  constructor(private readonly http: HttpClient) {}

  getTranslation(lang: string): Observable<Record<string, any>> {
    const locale = lang === 'en' ? 'en' : 'vi'
    const defaultDictionary = getDictionary(locale)
    return this.http.get<Record<string, any>>(`/i18n/${locale}.json`).pipe(
      map((json) => mergeDeep({ ...defaultDictionary }, json)),
      catchError(() => of(defaultDictionary)),
    )
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
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
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
