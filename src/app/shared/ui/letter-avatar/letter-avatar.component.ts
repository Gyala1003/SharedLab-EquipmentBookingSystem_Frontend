import { Component, computed, input } from '@angular/core'

const GRADIENTS = [
  'from-blue-500 to-indigo-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-pink-500 to-rose-600',
  'from-purple-500 to-violet-600',
  'from-cyan-500 to-sky-600',
]

/** Deterministic initials avatar — same name always renders the same color. */
@Component({
  selector: 'app-letter-avatar',
  standalone: true,
  template: `
    <span
      class="flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-semibold text-white"
      [class]="gradientClass()"
      [style.width.px]="size()"
      [style.height.px]="size()"
      [style.fontSize.px]="size() * 0.4"
    >
      {{ initials() }}
    </span>
  `,
})
export class LetterAvatarComponent {
  readonly fullName = input.required<string>()
  readonly size = input<number>(36)

  protected readonly initials = computed(() => {
    const parts = this.fullName().trim().split(/\s+/).filter(Boolean)
    if (parts.length === 0) return '?'
    if (parts.length === 1) return parts[0]!.charAt(0).toUpperCase()
    return (parts[0]!.charAt(0) + parts[parts.length - 1]!.charAt(0)).toUpperCase()
  })

  protected readonly gradientClass = computed(() => {
    const name = this.fullName()
    let hash = 0
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    return GRADIENTS[Math.abs(hash) % GRADIENTS.length]
  })
}