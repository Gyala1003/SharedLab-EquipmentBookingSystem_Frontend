import { Injectable, inject } from '@angular/core'
import { LanguageStore, SupportedLocale } from './language.store'

export type { SupportedLocale }

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly store = inject(LanguageStore)
  readonly currentLang = this.store.lang

  setLanguage(lang: SupportedLocale): void {
    this.store.setLang(lang)
  }

  toggleLanguage(): void {
    this.store.toggleLang()
  }
}

