import { Component, computed, input } from '@angular/core'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-brand-500 text-white hover:bg-brand-600',
  secondary: 'bg-white text-brand-700 border border-brand-300 hover:bg-brand-50',
  ghost: 'bg-transparent text-slate-700 hover:bg-slate-100',
  danger: 'bg-red-600 text-white hover:bg-red-700',
}

@Component({
  selector: 'app-button',
  template: `
    <button
      [type]="type()"
      [disabled]="disabled() || loading()"
      class="rounded-card inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60"
      [class]="classes()"
    >
      @if (loading()) {
        <span
          class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
        ></span>
      }
      <ng-content />
    </button>
  `,
})
export class ButtonComponent {
  readonly variant = input<Variant>('primary')
  readonly loading = input(false)
  readonly disabled = input(false)
  readonly type = input<'button' | 'submit' | 'reset'>('button')

  protected readonly classes = computed(() => VARIANTS[this.variant()])
}
