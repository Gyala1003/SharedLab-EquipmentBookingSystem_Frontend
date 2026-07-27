import { Injectable, signal } from '@angular/core'
import { translations } from './translations'

@Injectable({ providedIn: 'root' })
export class LanguageStore {
  private readonly key = 'app.lang'
  readonly lang = signal<'vi' | 'en'>((localStorage.getItem(this.key) as 'vi' | 'en') || 'vi')

  setLang(l: 'vi' | 'en'): void {
    this.lang.set(l)
    localStorage.setItem(this.key, l)
  }

  t(key: string): string {
    const item = translations[key]
    if (!item) return key
    return item[this.lang()] || item.vi || key
  }
}
