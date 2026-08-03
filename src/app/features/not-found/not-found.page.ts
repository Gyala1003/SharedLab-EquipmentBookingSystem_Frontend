import { Component } from '@angular/core'
import { RouterLink } from '@angular/router'
import { TranslatePipe } from '@ngx-translate/core'

@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink, TranslatePipe],
  template: `
    <div class="mx-auto mt-16 max-w-md text-center">
      <h1 class="text-3xl font-semibold text-slate-900">404</h1>
      <p class="mt-2 text-slate-600">{{ 'notFound.title' | translate }}</p>
      <a routerLink="/" class="mt-4 inline-block text-brand-600 hover:underline">
        {{ 'notFound.back' | translate }}
      </a>
    </div>
  `,
})
export class NotFoundPage {}
