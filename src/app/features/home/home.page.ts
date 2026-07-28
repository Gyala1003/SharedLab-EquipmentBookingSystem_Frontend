import { Component } from '@angular/core'
import { HeroComponent } from './components/hero/hero.component'
import { AboutComponent } from './components/about/about.component'
import { FeatureComponent } from './components/feature/feature.component'
import { WorkflowComponent } from './components/workflow/workflow.component'
import { StatisticsComponent } from './components/statistics/statistics.component'
import { PreviewComponent } from './components/preview/preview.component'
import { CtaComponent } from './components/cta/cta.component'

@Component({
  selector: 'app-home-page',
  imports: [
    HeroComponent,
    AboutComponent,
    FeatureComponent,
    WorkflowComponent,
    StatisticsComponent,
    PreviewComponent,
    CtaComponent,
  ],
  templateUrl: './home.page.html',
})
export class HomePage {}