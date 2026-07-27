import { Pipe, PipeTransform, inject } from '@angular/core'
import { LanguageStore } from './language.store'
import { translations } from './translations'

@Pipe({ name: 't', standalone: true, pure: false })
export class TranslatePipe implements PipeTransform {
  private readonly languageStore = inject(LanguageStore)

  transform(key: string): string {
    const entry = translations[key]
    if (!entry) return key
    return entry[this.languageStore.lang()]
  }
}
