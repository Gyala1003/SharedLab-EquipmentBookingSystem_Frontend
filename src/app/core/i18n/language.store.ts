import { Injectable, inject, signal } from '@angular/core'
import { TranslateService } from '@ngx-translate/core'
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
    if (this.lang() === l) return
    this.lang.set(l)
    this.apply(l)
  }

  toggleLang(): void {
    this.setLang(this.lang() === 'vi' ? 'en' : 'vi')
  }

  t(key: string, params?: Record<string, string | number>): string {
    const item = translations[key]
    let result = item ? item[this.lang()] || item.vi || key : key
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        result = result.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v))
      }
    }
    return result
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
    const nav = typeof navigator !== 'undefined' ? (navigator.language.split('-')[0] ?? '') : ''
    return nav === 'vi' ? 'vi' : 'en'
  }
}
