import { Component, inject } from '@angular/core'
import { RouterLink } from '@angular/router'
import { TranslatePipe } from '@ngx-translate/core'
import { AuthStore } from '../../../../core/auth/auth.store'
import { landingPath } from '../../../../core/auth/auth.guard'

interface ScheduleSlot {
  start: number
  width: number
  status: 'booked' | 'maintenance'
}

interface EquipmentRow {
  nameKey: string
  slots: ScheduleSlot[]
}

@Component({
  selector: 'app-hero',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './hero.component.html',
})
export class HeroComponent {
  protected readonly store = inject(AuthStore)

  protected get targetLink(): string {
    return this.store.isAuthenticated() ? landingPath(this.store.role()) : '/auth/login'
  }

  readonly hours: string[] = ['08:00', '10:00', '12:00', '14:00', '16:00']

  readonly equipmentRows: EquipmentRow[] = [
    {
      nameKey: 'home.hero.mockup.equipment.centrifuge',
      slots: [
        { start: 8, width: 18, status: 'booked' },
        { start: 55, width: 14, status: 'booked' },
      ],
    },
    {
      nameKey: 'home.hero.mockup.equipment.incubator',
      slots: [{ start: 30, width: 22, status: 'maintenance' }],
    },
    {
      nameKey: 'home.hero.mockup.equipment.autoclave',
      slots: [
        { start: 5, width: 12, status: 'booked' },
        { start: 70, width: 20, status: 'booked' },
      ],
    },
    {
      nameKey: 'home.hero.mockup.equipment.microscope',
      slots: [{ start: 45, width: 16, status: 'booked' }],
    },
    {
      nameKey: 'home.hero.mockup.equipment.spectrophotometer',
      slots: [],
    },
  ]
}