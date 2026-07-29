import { Component, effect, input, output } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { TranslatePipe } from '@ngx-translate/core'
import { ButtonComponent } from '../../shared/ui/button'
import type { UpsertUserInput, User } from './users.types'

@Component({
  selector: 'app-user-form-dialog',
  imports: [FormsModule, TranslatePipe, ButtonComponent],
  template: `
    @if (open()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
        <div class="rounded-card w-full max-w-md bg-white p-5 shadow-xl">
          <h3 class="mb-4 text-base font-semibold text-slate-900">
            {{ (initial() ? 'users.edit' : 'users.add') | translate }}
          </h3>

          <form class="flex flex-col gap-4" (ngSubmit)="save.emit({ ...form, id: initial()?.id })">
            <label class="flex flex-col gap-1 text-sm">
              {{ 'users.name' | translate }}
              <input
                [(ngModel)]="form.fullName"
                name="fullName"
                required
                class="rounded-card focus:border-brand-500 border border-slate-300 px-3 py-2 text-sm focus:outline-none"
              />
            </label>

            <label class="flex flex-col gap-1 text-sm">
              {{ 'users.email' | translate }}
              <input
                [(ngModel)]="form.email"
                name="email"
                type="email"
                required
                class="rounded-card focus:border-brand-500 border border-slate-300 px-3 py-2 text-sm focus:outline-none"
              />
            </label>

            <label class="flex flex-col gap-1 text-sm">
              {{ 'users.role' | translate }}
              <input
                [(ngModel)]="form.role"
                name="role"
                required
                class="rounded-card focus:border-brand-500 border border-slate-300 px-3 py-2 text-sm focus:outline-none"
              />
            </label>

            <div class="mt-2 flex justify-end gap-2">
              <app-button type="button" variant="ghost" (click)="close.emit()">
                {{ 'users.cancel' | translate }}
              </app-button>
              <app-button type="submit" [loading]="submitting()">
                {{ 'users.save' | translate }}
              </app-button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
})
export class UserFormDialog {
  readonly open = input(false)
  readonly initial = input<User | null>(null)
  readonly submitting = input(false)
  readonly close = output<void>()
  readonly save = output<UpsertUserInput>()

  protected form: Omit<UpsertUserInput, 'id'> = { fullName: '', email: '', role: '' }

  constructor() {
    // Reset the form whenever the dialog opens or the edit target changes.
    effect(() => {
      const u = this.initial()
      this.open()
      this.form = {
        fullName: u?.fullName ?? '',
        email: u?.email ?? '',
        role: u?.role ?? '',
      }
    })
  }
}
