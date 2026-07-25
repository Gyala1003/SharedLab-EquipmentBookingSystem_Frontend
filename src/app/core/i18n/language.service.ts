import { Injectable, inject, signal } from '@angular/core'
import { TranslateService } from '@ngx-translate/core'
import { env } from '../config/env'

export type SupportedLocale = 'vi' | 'en'

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly translate = inject(TranslateService)
  readonly currentLang = signal<SupportedLocale>(this.resolveLocale())

  constructor() {
    this.applyLanguage(this.currentLang())
  }

  setLanguage(lang: SupportedLocale): void {
    if (this.currentLang() === lang) return
    this.currentLang.set(lang)
    this.applyLanguage(lang)
  }

  toggleLanguage(): void {
    const next = this.currentLang() === 'vi' ? 'en' : 'vi'
    this.setLanguage(next)
  }

  private applyLanguage(lang: SupportedLocale): void {
    localStorage.setItem('app.locale', lang)
    document.documentElement.lang = lang
    this.translate.use(lang)
  }

  private resolveLocale(): SupportedLocale {
    const stored = localStorage.getItem('app.locale')
    if (stored && (env.supportedLocales as readonly string[]).includes(stored)) {
      return stored as SupportedLocale
    }
    const nav = navigator.language.split('-')[0] ?? ''
    return (env.supportedLocales as readonly string[]).includes(nav)
      ? (nav as SupportedLocale)
      : (env.defaultLocale as SupportedLocale)
  }
}
