import { Component } from '@angular/core'
import { TranslatePipe } from '@ngx-translate/core'

interface AudienceItem {
  key: string
}

@Component({
  selector: 'app-about',
  imports: [TranslatePipe],
  templateUrl: './about.component.html',
})
export class AboutComponent {
  readonly audiences: AudienceItem[] = [
    { key: 'student' },
    { key: 'lecturer' },
    { key: 'labManager' },
    { key: 'technician' },
    { key: 'administrator' },
  ]
}