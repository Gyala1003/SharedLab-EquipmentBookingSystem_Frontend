import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core'
import { TranslatePipe } from '@ngx-translate/core'

interface StatItem {
  labelKey: string
  target: number
  suffix: string
  value: ReturnType<typeof signal<number>>
}

@Component({
  selector: 'app-statistics',
  imports: [TranslatePipe],
  templateUrl: './statistics.component.html',
})
export class StatisticsComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef)

  readonly stats: StatItem[] = [
    { labelKey: 'home.statistics.labs', target: 42, suffix: '+', value: signal(0) },
    { labelKey: 'home.statistics.equipment', target: 860, suffix: '+', value: signal(0) },
    { labelKey: 'home.statistics.bookings', target: 15400, suffix: '+', value: signal(0) },
    { labelKey: 'home.statistics.users', target: 3200, suffix: '+', value: signal(0) },
  ]

  ngOnInit(): void {
    const totalSteps = 40
    const intervalMs = 1400 / totalSteps
    let currentStep = 0

    const interval = setInterval(() => {
      currentStep++
      const progress = Math.min(currentStep / totalSteps, 1)
      for (const stat of this.stats) {
        stat.value.set(Math.round(stat.target * progress))
      }
      if (progress >= 1) clearInterval(interval)
    }, intervalMs)

    this.destroyRef.onDestroy(() => clearInterval(interval))
  }

  formatValue(value: number): string {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }
}