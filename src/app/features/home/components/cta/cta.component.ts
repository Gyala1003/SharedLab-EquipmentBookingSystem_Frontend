import { Component } from '@angular/core'
import { RouterLink } from '@angular/router'
import { TranslatePipe } from '@ngx-translate/core'

@Component({
  selector: 'app-cta',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './cta.component.html',
})
export class CtaComponent {}