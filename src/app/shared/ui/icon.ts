import { Component, computed, input } from '@angular/core'

export type IconName =
  | 'dashboard'
  | 'catalog'
  | 'calendar'
  | 'bookings'
  | 'report'
  | 'admin'
  | 'users'
  | 'logout'
  | 'search'
  | 'plus'
  | 'chevronDown'
  | 'chevronRight'
  | 'back'
  | 'check'
  | 'close'
  | 'clock'
  | 'mapPin'
  | 'wrench'
  | 'box'

/** Minimal outline icon set (24x24, stroke-based) so we don't pull in an icon package. */
const PATHS: Record<IconName, string> = {
  dashboard: 'M3 13h8V3H3v10Zm10 8h8V11h-8v10ZM3 21h8v-6H3v6Zm10-14h8V3h-8v4Z',
  catalog: 'M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h6v6h-6v-6Z',
  calendar:
    'M7 2v3M17 2v3M3 9h18M4 5h16a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z',
  bookings:
    'M8 4h8a2 2 0 0 1 2 2v14l-5-3-5 3V6a2 2 0 0 1 2-2Z M9 9h6 M9 13h4',
  report:
    'M12 9v4M12 17h.01M10.29 3.86 1.82 18a1 1 0 0 0 .86 1.5h18.64a1 1 0 0 0 .86-1.5L13.71 3.86a1 1 0 0 0-1.72 0Z',
  admin: 'M12 2 4 6v6c0 5 3.6 8.5 8 10 4.4-1.5 8-5 8-10V6l-8-4Z M9 12l2 2 4-4',
  users:
    'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm12 10v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  logout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm10 2-4.35-4.35',
  plus: 'M12 5v14M5 12h14',
  chevronDown: 'm6 9 6 6 6-6',
  chevronRight: 'm9 6 6 6-6 6',
  back: 'm15 18-6-6 6-6',
  check: 'M20 6 9 17l-5-5',
  close: 'M18 6 6 18M6 6l18 18',
  clock: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm0-14v6l4 2',
  mapPin: 'M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21Zm0-8.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  wrench:
    'M14.7 6.3a4 4 0 0 1-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 1 5.4-5.4L14.7 6.3Z',
  box: 'm21 8-9-5-9 5 9 5 9-5Zm0 0v8l-9 5-9-5V8m9 5v8',
}

@Component({
  selector: 'app-icon',
  template: `
    <svg
      [attr.width]="size()"
      [attr.height]="size()"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path [attr.d]="path()" />
    </svg>
  `,
})
export class IconComponent {
  readonly name = input.required<IconName>()
  readonly size = input(20)
  protected readonly path = computed(() => PATHS[this.name()])
}
