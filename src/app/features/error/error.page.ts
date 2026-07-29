import { Component } from '@angular/core'
import { RouterLink } from '@angular/router'
import { TranslatePipe } from '@ngx-translate/core'

@Component({
  selector: 'app-error-page',
  imports: [RouterLink, TranslatePipe],
  template: `
    <section class="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-16">
      <div class="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-xl">
        <span class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
          <svg class="h-7 w-7" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.3 4.9L2.8 18C2.3 18.9 3 20 4 20H20C21 20 21.7 18.9 21.2 18L13.7 4.9C13.2 4 10.8 4 10.3 4.9Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>
            <path d="M12 9V13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
            <circle cx="12" cy="16.5" r="0.9" fill="currentColor"/>
          </svg>
        </span>

        <h1 class="mt-4 text-lg font-bold text-gray-900">{{ 'errorPage.title' | translate }}</h1>
        <p class="mt-2 text-sm text-gray-600">{{ 'errorPage.message' | translate }}</p>

        <div class="mt-6 flex flex-col gap-3">
          <button
            type="button"
            (click)="retry()"
            class="flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            {{ 'errorPage.retry' | translate }}
          </button>

          <a
            routerLink="/"
            class="flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
          >
            {{ 'errorPage.backHome' | translate }}
          </a>

          <a
            routerLink="/auth/login"
            class="flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
          >
            {{ 'errorPage.loginAgain' | translate }}
          </a>
        </div>
      </div>
    </section>
  `,
})
export class ErrorPage {
  retry(): void {
    window.location.reload()
  }
}