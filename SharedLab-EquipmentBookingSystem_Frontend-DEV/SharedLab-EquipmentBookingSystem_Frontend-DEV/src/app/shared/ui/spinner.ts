import { Component, input } from '@angular/core'

@Component({
  selector: 'app-spinner',
  template: `
    <span
      class="border-brand-500 inline-block animate-spin rounded-full border-2 border-t-transparent"
      [style.width.px]="size()"
      [style.height.px]="size()"
      role="status"
      aria-label="loading"
    ></span>
  `,
})
export class SpinnerComponent {
  readonly size = input(20)
}
