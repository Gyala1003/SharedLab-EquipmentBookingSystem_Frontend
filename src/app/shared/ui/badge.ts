import { Component, computed, input } from '@angular/core'

export type BadgeTone = 'green' | 'red' | 'amber' | 'slate' | 'blue'

const TONE_CLASSES: Record<BadgeTone, string> = {
  green: 'bg-emerald-50 text-emerald-700',
  red: 'bg-red-50 text-red-700',
  amber: 'bg-amber-50 text-amber-700',
  slate: 'bg-slate-100 text-slate-600',
  blue: 'bg-brand-50 text-brand-700',
}

const DOT_CLASSES: Record<BadgeTone, string> = {
  green: 'bg-emerald-500',
  red: 'bg-red-500',
  amber: 'bg-amber-500',
  slate: 'bg-slate-400',
  blue: 'bg-brand-500',
}

@Component({
  selector: 'app-badge',
  template: `
    <span
      class="inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap"
      [class]="classes()"
    >
      <span class="h-1.5 w-1.5 shrink-0 rounded-full" [class]="dot()"></span>
      <ng-content />
    </span>
  `,
})
export class BadgeComponent {
  readonly tone = input<BadgeTone>('slate')
  protected readonly classes = computed(() => TONE_CLASSES[this.tone()])
  protected readonly dot = computed(() => DOT_CLASSES[this.tone()])
}
