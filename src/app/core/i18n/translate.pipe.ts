import { Pipe, PipeTransform, inject } from '@angular/core'
import { LanguageStore } from './language.store'
import { translations } from './translations'

@Pipe({ name: 't', standalone: true, pure: false })
export class TranslatePipe implements PipeTransform {
  private readonly languageStore = inject(LanguageStore)

  transform(key: string, params?: Record<string, string | number>): string {
    const entry = translations[key]
    let result = entry ? entry[this.languageStore.lang()] || entry.vi || key : key
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        result = result.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v))
      }
    }
    return result
  }
}
