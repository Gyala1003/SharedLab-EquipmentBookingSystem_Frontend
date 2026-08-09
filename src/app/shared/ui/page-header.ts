import { Component, input } from '@angular/core'

@Component({
  selector: 'app-page-header',
  template: `
    <header
      class="relative overflow-hidden rounded-[30px] border border-blue-100/80 bg-white/95 px-5 py-6 shadow-[0_16px_50px_rgba(37,99,235,.06)] sm:px-7 sm:py-7"
    >
      <div
        class="pointer-events-none absolute -top-24 -right-16 h-56 w-56 rounded-full bg-blue-300/30 blur-3xl"
      ></div>
      <div
        class="pointer-events-none absolute top-6 right-24 h-32 w-32 rounded-full bg-indigo-300/25 blur-3xl"
      ></div>
      <div class="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div class="min-w-0">
          @if (eyebrow()) {
            <p class="text-[11px] font-black tracking-[.22em] text-blue-600 uppercase">
              {{ eyebrow() }}
            </p>
          }
          <h1 class="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
            {{ title() }}
          </h1>
          @if (subtitle()) {
            <p class="mt-2 max-w-3xl text-sm leading-6 text-slate-500">{{ subtitle() }}</p>
          }
        </div>
        <div class="flex shrink-0 flex-wrap items-center gap-2"><ng-content /></div>
      </div>
    </header>
  `,
})
export class PageHeaderComponent {
  readonly eyebrow = input('')
  readonly title = input.required<string>()
  readonly subtitle = input('')
}
