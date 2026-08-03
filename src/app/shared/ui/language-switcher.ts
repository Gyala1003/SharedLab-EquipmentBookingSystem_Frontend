import { Component, ElementRef, HostListener, inject, input, signal } from '@angular/core'
import { LanguageService, SupportedLocale } from '../../core/i18n/language.service'
import { IconComponent } from './icon'

@Component({
  selector: 'app-language-switcher',
  imports: [IconComponent],
  template: `
    <div class="relative inline-block text-left">
      @if (variant() === 'pill') {
        <button
          type="button"
          (click)="toggleOpen()"
          class="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:border-indigo-200 hover:bg-slate-50 hover:text-indigo-600 focus:outline-none"
        >
          <span class="text-base leading-none">{{ activeOption().flag }}</span>
          <span>{{ activeOption().shortLabel }}</span>
          <app-icon name="chevron-down" [size]="14" class="text-slate-400" />
        </button>
      } @else if (variant() === 'dark-pill') {
        <button
          type="button"
          (click)="toggleOpen()"
          class="flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-3.5 py-2 text-xs font-bold text-white shadow-sm backdrop-blur transition hover:bg-white/20 focus:outline-none"
        >
          <span class="text-base leading-none">{{ activeOption().flag }}</span>
          <span>{{ activeOption().shortLabel }}</span>
          <app-icon name="chevron-down" [size]="14" class="text-white/60" />
        </button>
      } @else {
        <button
          type="button"
          (click)="toggleOpen()"
          class="flex h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 shadow-sm transition hover:border-indigo-200 hover:text-indigo-600 focus:outline-none"
          title="Đổi ngôn ngữ / Change language"
        >
          <app-icon name="globe" [size]="17" class="text-indigo-500" />
          <span class="text-base leading-none">{{ activeOption().flag }}</span>
          <span class="hidden font-extrabold sm:inline">{{ activeOption().code }}</span>
          <app-icon name="chevron-down" [size]="13" class="text-slate-400" />
        </button>
      }

      @if (isOpen()) {
        <div
          class="absolute right-0 z-50 mt-2 w-44 origin-top-right rounded-2xl border border-slate-100 bg-white p-1.5 shadow-xl shadow-slate-900/10 ring-1 ring-black/5 backdrop-blur focus:outline-none"
        >
          @for (opt of options; track opt.value) {
            <button
              type="button"
              (click)="selectLanguage(opt.value)"
              class="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition"
              [class.bg-indigo-50]="langService.currentLang() === opt.value"
              [class.text-indigo-600]="langService.currentLang() === opt.value"
              [class.text-slate-700]="langService.currentLang() !== opt.value"
              [class.hover:bg-slate-50]="langService.currentLang() !== opt.value"
            >
              <div class="flex items-center gap-2.5">
                <span class="text-base leading-none">{{ opt.flag }}</span>
                <span>{{ opt.label }}</span>
              </div>
              @if (langService.currentLang() === opt.value) {
                <app-icon name="check" [size]="15" class="text-indigo-600" />
              }
            </button>
          }
        </div>
      }
    </div>
  `,
})
export class LanguageSwitcherComponent {
  protected readonly langService = inject(LanguageService)
  private readonly elementRef = inject(ElementRef)

  readonly variant = input<'header' | 'pill' | 'dark-pill'>('header')
  protected readonly isOpen = signal(false)

  protected readonly options: Array<{ value: SupportedLocale; label: string; shortLabel: string; code: string; flag: string }> = [
    { value: 'vi', label: 'Tiếng Việt', shortLabel: 'VIE', code: 'VI', flag: '🇻🇳' },
    { value: 'en', label: 'English', shortLabel: 'ENG', code: 'EN', flag: '🇬🇧' },
  ]

  protected activeOption() {
    const current = this.langService.currentLang()
    return this.options.find((o) => o.value === current) ?? this.options[0]
  }

  protected toggleOpen(): void {
    this.isOpen.update((v) => !v)
  }

  protected selectLanguage(lang: SupportedLocale): void {
    this.langService.setLanguage(lang)
    this.isOpen.set(false)
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false)
    }
  }
}
