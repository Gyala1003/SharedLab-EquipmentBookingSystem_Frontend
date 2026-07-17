import { Component } from '@angular/core'
import { TranslatePipe } from '@ngx-translate/core'
import { CardComponent } from '../../shared/ui/card'

@Component({
  selector: 'app-home-page',
  imports: [TranslatePipe, CardComponent],
  template: `
    <app-card>
      <h1 class="text-2xl font-semibold text-slate-900">{{ 'home.title' | translate }}</h1>
      <p class="mt-2 text-slate-600">{{ 'home.subtitle' | translate }}</p>
    </app-card>
  `,
})
export class HomePage {}
