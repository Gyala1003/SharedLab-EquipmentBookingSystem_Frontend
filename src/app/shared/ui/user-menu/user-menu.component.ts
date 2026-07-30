import { Component, ElementRef, HostListener, computed, inject, signal } from '@angular/core'
import { Router } from '@angular/router'
import { AuthStore } from '../../../core/auth/auth.store'
import { TranslatePipe } from '../../../core/i18n/translate.pipe'
import { LetterAvatarComponent } from '../letter-avatar/letter-avatar.component'

@Component({
  selector: 'app-user-menu',
  standalone: true,
  imports: [TranslatePipe, LetterAvatarComponent],
  templateUrl: './user-menu.component.html',
})
export class UserMenuComponent {
  private readonly store = inject(AuthStore)
  private readonly router = inject(Router)
  private readonly host = inject(ElementRef<HTMLElement>)

  protected readonly isOpen = signal(false)
  protected readonly isLoggingOut = signal(false)
  protected readonly user = this.store.user
  protected readonly displayName = computed(() => this.user()?.fullName ?? '')

  toggle(): void {
    this.isOpen.update((value) => !value)
  }

  close(): void {
    this.isOpen.set(false)
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isOpen()) return
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.close()
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close()
  }

  async onLogout(): Promise<void> {
    this.isLoggingOut.set(true)
    try {
      await this.store.logout()
      this.close()
      void this.router.navigateByUrl('/login')
    } catch {
      this.close()
      void this.router.navigateByUrl('/login')
    } finally {
      this.isLoggingOut.set(false)
    }
  }
}
