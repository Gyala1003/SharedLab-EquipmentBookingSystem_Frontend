import { Component, input } from '@angular/core'

@Component({
  selector: 'app-card',
  template: `
    <div class="rounded-card border border-slate-200 bg-white p-5 shadow-[var(--shadow-card)]">
      @if (title()) {
        <h3 class="mb-3 text-base font-semibold text-slate-900">{{ title() }}</h3>
      }
      <ng-content />
    </div>
  `,
})
export class CardComponent {
  readonly title = input<string>()
}
