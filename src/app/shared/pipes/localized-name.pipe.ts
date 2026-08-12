import { Pipe, PipeTransform, inject } from '@angular/core'
import { LanguageService } from '../../core/i18n/language.service'
import { UI_EN_LITERAL_MAP } from '../../core/i18n/ui-literal-map'

@Pipe({
  name: 'localizedName',
  standalone: true,
  pure: false,
})
export class LocalizedNamePipe implements PipeTransform {
  private readonly languageService = inject(LanguageService)

  transform(value: string | null | undefined): string {
    if (!value) return ''
    if (this.languageService.locale() !== 'en') return value

    const key = value.trim()
    return UI_EN_LITERAL_MAP[key] ?? value
  }
}
