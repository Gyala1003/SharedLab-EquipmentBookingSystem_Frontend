import { Injectable, inject, signal } from '@angular/core'
import { TranslateService } from '@ngx-translate/core'
import { env } from '../config/env'
import { clearTranslationCache, findTranslation, translateDynamicLocation } from './translate.pipe'
import { translations } from './translations'

export type SupportedLocale = 'vi' | 'en'

@Injectable({ providedIn: 'root' })
export class LanguageStore {
  private readonly translate = inject(TranslateService, { optional: true })
  private readonly key = 'app.lang'

  readonly lang = signal<SupportedLocale>(this.resolveInitialLang())

  constructor() {
    this.apply(this.lang())
  }

  setLang(l: SupportedLocale): void {
    clearTranslationCache()
    if (this.lang() === l) return
    this.lang.set(l)
    this.apply(l)
  }

  toggleLang(): void {
    this.setLang(this.lang() === 'vi' ? 'en' : 'vi')
  }

  t(key: string, params?: Record<string, string | number>): string {
    if (!key) return ''
    const currentLang = this.lang()
    let result = findTranslation(key, currentLang)

    if (!result || result === key) {
      result = translateDynamicLocation(key, currentLang)
    }

    if (params && result) {
      for (const [k, v] of Object.entries(params)) {
        result = result.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v))
      }
    }
    return result || key
  }

  private apply(l: SupportedLocale): void {
    try {
      localStorage.setItem(this.key, l)
      localStorage.setItem('app.locale', l)
    } catch {}
    document.documentElement.lang = l
    if (this.translate) {
      this.translate.use(l)
    }
  }

  private resolveInitialLang(): SupportedLocale {
    try {
      const stored = (localStorage.getItem('app.lang') ||
        localStorage.getItem('app.locale')) as SupportedLocale
      if (stored === 'vi' || stored === 'en') return stored
    } catch {}
    const defaultLoc = (env.defaultLocale as SupportedLocale) || 'vi'
    return defaultLoc === 'vi' || defaultLoc === 'en' ? defaultLoc : 'vi'
  }
}
