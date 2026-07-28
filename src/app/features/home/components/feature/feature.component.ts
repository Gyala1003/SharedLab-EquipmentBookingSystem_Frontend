import { Component } from '@angular/core'
import { TranslatePipe } from '@ngx-translate/core'

interface FeatureItem {
  icon: 'room' | 'equipment' | 'schedule' | 'notification' | 'users' | 'report'
  titleKey: string
  descriptionKey: string
}

@Component({
  selector: 'app-feature',
  imports: [TranslatePipe],
  templateUrl: './feature.component.html',
})
export class FeatureComponent {
  readonly features: FeatureItem[] = [
    { icon: 'room', titleKey: 'home.feature.room.title', descriptionKey: 'home.feature.room.description' },
    {
      icon: 'equipment',
      titleKey: 'home.feature.equipment.title',
      descriptionKey: 'home.feature.equipment.description',
    },
    {
      icon: 'schedule',
      titleKey: 'home.feature.schedule.title',
      descriptionKey: 'home.feature.schedule.description',
    },
    {
      icon: 'notification',
      titleKey: 'home.feature.notification.title',
      descriptionKey: 'home.feature.notification.description',
    },
    { icon: 'users', titleKey: 'home.feature.users.title', descriptionKey: 'home.feature.users.description' },
    { icon: 'report', titleKey: 'home.feature.report.title', descriptionKey: 'home.feature.report.description' },
  ]
}