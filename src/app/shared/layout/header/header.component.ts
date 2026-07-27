import { Component, HostListener, inject, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { TranslatePipe, TranslateService } from '@ngx-translate/core'
import { RouterLink, RouterLinkActive } from '@angular/router'
import { AuthStore } from '../../../core/auth/auth.store'
import { UserMenuComponent } from '../../ui/user-menu/user-menu.component'

interface NavItem {
  label: string
  fragment: string
}

interface LanguageOption {
  code: string
  label: string
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, TranslatePipe, RouterLink, RouterLinkActive, UserMenuComponent],
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  private readonly translate = inject(TranslateService)
  protected readonly store = inject(AuthStore)

  isMobileMenuOpen = signal(false)
  isLangMenuOpen = signal(false)
  isScrolled = signal(false)

  currentLang = signal(this.translate.currentLang() || this.translate.getFallbackLang() || 'vi')

  navItems: NavItem[] = [
    { label: 'header.nav.home', fragment: 'hero' },
    { label: 'header.nav.about', fragment: 'about' },
    { label: 'header.nav.feature', fragment: 'feature' },
    { label: 'header.nav.workflow', fragment: 'workflow' },
    { label: 'header.nav.statistics', fragment: 'statistics' },
    { label: 'header.nav.contact', fragment: 'cta' },
  ]

  languages: LanguageOption[] = [
    { code: 'vi', label: 'Tiếng Việt' },
    { code: 'en', label: 'English' },
  ]

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.isScrolled.set(window.scrollY > 8)
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update((value) => !value)
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false)
  }

  toggleLangMenu(): void {
    this.isLangMenuOpen.update((value) => !value)
  }

  closeLangMenu(): void {
    this.isLangMenuOpen.set(false)
  }

  changeLanguage(code: string): void {
    this.translate.use(code)
    this.currentLang.set(code)
    this.isLangMenuOpen.set(false)
  }

  currentLanguageLabel(): string {
    const found = this.languages.find((lang) => lang.code === this.currentLang())
    return found ? found.label : ''
  }
}