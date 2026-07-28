import { Component } from '@angular/core'
import { TranslatePipe } from '@ngx-translate/core'

interface WorkflowStep {
  order: number
  titleKey: string
  descriptionKey: string
}

@Component({
  selector: 'app-workflow',
  imports: [TranslatePipe],
  templateUrl: './workflow.component.html',
})
export class WorkflowComponent {
  readonly steps: WorkflowStep[] = [
    { order: 1, titleKey: 'home.workflow.login.title', descriptionKey: 'home.workflow.login.description' },
    {
      order: 2,
      titleKey: 'home.workflow.selectRoom.title',
      descriptionKey: 'home.workflow.selectRoom.description',
    },
    {
      order: 3,
      titleKey: 'home.workflow.selectEquipment.title',
      descriptionKey: 'home.workflow.selectEquipment.description',
    },
    { order: 4, titleKey: 'home.workflow.booking.title', descriptionKey: 'home.workflow.booking.description' },
    {
      order: 5,
      titleKey: 'home.workflow.confirmation.title',
      descriptionKey: 'home.workflow.confirmation.description',
    },
  ]
}