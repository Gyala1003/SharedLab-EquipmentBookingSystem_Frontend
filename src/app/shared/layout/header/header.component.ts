import {
  Component,
  HostListener,
  Output,
  EventEmitter,
  inject,
  signal,
  computed,
} from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterLink } from '@angular/router'
import { AuthStore } from '../../../core/auth/auth.store'
import { LanguageStore } from '../../../core/i18n/language.store'
import { NotificationBadgeService } from '../../../core/api/notification-badge.service'
import { TranslatePipe } from '../../../core/i18n/translate.pipe'
import { UserMenuComponent } from '../../ui/user-menu/user-menu.component'
import { IconComponent } from '../../ui/icon'

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, UserMenuComponent, IconComponent, TranslatePipe],
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  protected readonly store = inject(AuthStore)
  protected readonly lang = inject(LanguageStore)
  protected readonly badge = inject(NotificationBadgeService)

  @Output() toggleSidebar = new EventEmitter<void>()

  protected isScrolled = signal(false)
  protected currentLang = computed(() => this.lang.lang())

  protected languages = [
    { code: 'vi' as const, label: 'VN', flag: '🇻🇳' },
    { code: 'en' as const, label: 'EN', flag: '🇬🇧' },
  ]

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.isScrolled.set(window.scrollY > 8)
  }

  protected changeLanguage(code: 'vi' | 'en'): void {
    this.lang.setLang(code)
  }

  protected onToggleSidebar(): void {
    this.toggleSidebar.emit()
  }
}
