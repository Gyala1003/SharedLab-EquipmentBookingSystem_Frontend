import { Component } from '@angular/core'
import { TranslatePipe } from '@ngx-translate/core'

type EquipmentStatus = 'available' | 'booked' | 'maintenance'

interface EquipmentCard {
  nameKey: string
  typeKey: string
  status: EquipmentStatus
  icon: 'microscope' | 'centrifuge' | 'incubator' | 'spectrophotometer'
}

@Component({
  selector: 'app-preview',
  imports: [TranslatePipe],
  templateUrl: './preview.component.html',
})
export class PreviewComponent {
  readonly equipmentList: EquipmentCard[] = [
    {
      nameKey: 'home.preview.items.microscope.name',
      typeKey: 'home.preview.items.microscope.type',
      status: 'available',
      icon: 'microscope',
    },
    {
      nameKey: 'home.preview.items.centrifuge.name',
      typeKey: 'home.preview.items.centrifuge.type',
      status: 'booked',
      icon: 'centrifuge',
    },
    {
      nameKey: 'home.preview.items.incubator.name',
      typeKey: 'home.preview.items.incubator.type',
      status: 'maintenance',
      icon: 'incubator',
    },
    {
      nameKey: 'home.preview.items.spectrophotometer.name',
      typeKey: 'home.preview.items.spectrophotometer.type',
      status: 'available',
      icon: 'spectrophotometer',
    },
  ]

  statusLabelKey(status: EquipmentStatus): string {
    return `home.preview.status.${status}`
  }
}