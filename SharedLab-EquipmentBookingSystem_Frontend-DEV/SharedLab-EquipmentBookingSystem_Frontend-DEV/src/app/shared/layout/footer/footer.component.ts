import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterLink } from '@angular/router'
import { TranslatePipe } from '../../../core/i18n/translate.pipe'

interface FooterLink {
  label: string
  fragment: string
}

interface SocialLink {
  icon: 'facebook' | 'twitter' | 'linkedin' | 'youtube'
  url: string
}

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './footer.component.html',
})
export class FooterComponent {
  currentYear = new Date().getFullYear()

  quickLinks: FooterLink[] = [
    { label: 'header.nav.home', fragment: 'hero' },
    { label: 'header.nav.about', fragment: 'about' },
    { label: 'header.nav.feature', fragment: 'feature' },
    { label: 'header.nav.workflow', fragment: 'workflow' },
    { label: 'header.nav.statistics', fragment: 'statistics' },
    { label: 'header.nav.contact', fragment: 'cta' },
  ]

  socialLinks: SocialLink[] = [
    { icon: 'facebook', url: 'https://facebook.com' },
    { icon: 'twitter', url: 'https://twitter.com' },
    { icon: 'linkedin', url: 'https://linkedin.com' },
    { icon: 'youtube', url: 'https://youtube.com' },
  ]
}
