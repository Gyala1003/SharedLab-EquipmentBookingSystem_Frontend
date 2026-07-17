import { Component, inject } from '@angular/core'
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'
import { Router } from '@angular/router'
import { TranslatePipe } from '@ngx-translate/core'
import { AuthStore } from '../../core/auth/auth.store'
import { ButtonComponent } from '../../shared/ui/button'
import { CardComponent } from '../../shared/ui/card'

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule, TranslatePipe, ButtonComponent, CardComponent],
  template: `
    <div class="mx-auto mt-10 max-w-sm">
      <app-card [title]="'auth.loginTitle' | translate">
        <form class="flex flex-col gap-4" [formGroup]="form" (ngSubmit)="submit()">
          <label class="flex flex-col gap-1 text-sm">
            {{ 'auth.email' | translate }}
            <input
              type="email"
              formControlName="email"
              class="rounded-card border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            />
          </label>

          <label class="flex flex-col gap-1 text-sm">
            {{ 'auth.password' | translate }}
            <input
              type="password"
              formControlName="password"
              class="rounded-card border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            />
          </label>

          @if (store.error()) {
            <p class="text-sm text-red-600">{{ 'auth.error' | translate }}</p>
          }

          <app-button type="submit" [loading]="store.status() === 'loading'" [disabled]="form.invalid">
            {{ 'auth.submit' | translate }}
          </app-button>
        </form>
      </app-card>
    </div>
  `,
})
export class LoginPage {
  protected readonly store = inject(AuthStore)
  private readonly fb = inject(FormBuilder)
  private readonly router = inject(Router)

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  })

  async submit(): Promise<void> {
    if (this.form.invalid) return
    try {
      await this.store.login(this.form.getRawValue())
      void this.router.navigateByUrl('/')
    } catch {
      /* error surfaced via store */
    }
  }
}
