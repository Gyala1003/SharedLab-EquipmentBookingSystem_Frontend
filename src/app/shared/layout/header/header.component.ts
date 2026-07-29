import { Component, HostListener, inject, signal, computed } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterLink, RouterLinkActive } from '@angular/router'
import { AuthStore } from '../../../core/auth/auth.store'
import { LanguageStore } from '../../../core/i18n/language.store'
import { TranslatePipe } from '../../../core/i18n/translate.pipe'
import { UserMenuComponent } from '../../ui/user-menu/user-menu.component'

interface NavItem {
  label: string
  fragment: string
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink, 
    UserMenuComponent, 
    TranslatePipe
  ],templateUrl: './header.component.html',
})
export class HeaderComponent {
  protected readonly store = inject(AuthStore)
  protected readonly lang = inject(LanguageStore)

  currentLang = computed(() => this.lang.lang())

  isMobileMenuOpen = signal(false)
  isLangMenuOpen = signal(false)
  isScrolled = signal(false)

  navItems: NavItem[] = []

  languages = [
    { code: 'vi' as const, label: 'Tiếng Việt' },
    { code: 'en' as const, label: 'English' },
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

  changeLanguage(code: 'vi' | 'en'): void {
    this.lang.setLang(code)
    this.isLangMenuOpen.set(false)
  }

  currentLanguageLabel(): string {
    return this.languages.find((l) => l.code === this.lang.lang())?.label ?? ''
  }
}
