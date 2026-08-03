import {
  Component,
  HostListener,
  Output,
  EventEmitter,
  inject,
  signal,
  computed,
} from '@angular/core'
import { NgClass } from '@angular/common'
import { Router, RouterLink } from '@angular/router'
import { AuthStore } from '../../../core/auth/auth.store'
import { LanguageStore } from '../../../core/i18n/language.store'
import { NotificationBadgeService } from '../../../core/api/notification-badge.service'
import { TranslatePipe } from '../../../core/i18n/translate.pipe'
import { IconComponent } from '../../ui/icon'
import { ToastService } from '../../ui/toast.service'

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [NgClass, RouterLink, IconComponent, TranslatePipe],
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  protected readonly store = inject(AuthStore)
  protected readonly lang = inject(LanguageStore)
  protected readonly badge = inject(NotificationBadgeService)
  private readonly router = inject(Router)
  private readonly toast = inject(ToastService)

  @Output() toggleSidebar = new EventEmitter<void>()

  protected isScrolled = signal(false)
  protected userMenuOpen = signal(false)
  protected currentLang = computed(() => this.lang.lang())

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

  protected toggleUserMenu(): void {
    this.userMenuOpen.update((v) => !v)
  }

  protected initials(name: string): string {
    return name
      .trim()
      .split(/\s+/)
      .slice(-2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('')
  }

  protected onSupportClick(): void {
    this.userMenuOpen.set(false)
    this.toast.info(
      'Trung tâm hỗ trợ',
      'Liên hệ Admin qua email admin@sharedlab.vn hoặc hotline 1900-xxxx.',
    )
  }

  protected async logout(): Promise<void> {
    this.userMenuOpen.set(false)
    await this.store.logout()
    void this.router.navigate(['/login'])
  }
}
