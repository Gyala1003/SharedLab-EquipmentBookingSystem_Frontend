import { Component, inject } from '@angular/core'
import { TranslatePipe } from '@ngx-translate/core'
import { AuthStore } from '../../core/auth/auth.store'

@Component({
  selector: 'app-dashboard-page',
  imports: [TranslatePipe],
  template: `
    <section class="flex flex-col gap-4">
      <div class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 class="text-xl font-bold text-gray-900">{{ 'dashboard.title' | translate }}</h1>
        <p class="mt-2 text-sm text-gray-600">
          {{ 'dashboard.welcome' | translate }} {{ store.user()?.fullName }}
        </p>
      </div>
    </section>
  `,
})
export class DashboardPage {
  protected readonly store = inject(AuthStore)
}