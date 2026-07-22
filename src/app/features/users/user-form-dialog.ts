import { Component, effect, input, output } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { TranslatePipe } from '@ngx-translate/core'
import { ButtonComponent } from '../../shared/ui/button'
import type { UpdateUserInput, User, RoleName } from './users.types'
import type { CreateUserPayload } from '../../core/auth/auth.types'

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

          <form class="flex flex-col gap-4" (ngSubmit)="submit()">
            <label class="flex flex-col gap-1 text-sm">
              {{ 'users.name' | translate }}
              <input [(ngModel)]="form.fullName" name="fullName" required
                class="rounded-card border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
            </label>

            <label class="flex flex-col gap-1 text-sm">
              {{ 'users.username' | translate }}
              <input [(ngModel)]="form.username" name="username" required
                class="rounded-card border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
            </label>

            <label class="flex flex-col gap-1 text-sm">
              {{ 'users.email' | translate }}
              <input [(ngModel)]="form.email" name="email" type="email" required
                class="rounded-card border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
            </label>

            @if (!initial()) {
              <label class="flex flex-col gap-1 text-sm">
                {{ 'users.password' | translate }}
                <input [(ngModel)]="createForm.password" name="password" type="password" required minlength="6"
                  class="rounded-card border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
              </label>

              <label class="flex flex-col gap-1 text-sm">
                {{ 'users.role' | translate }}
                <select [(ngModel)]="createForm.role" name="role" required
                  class="rounded-card border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none">
                  <option value="Admin">Admin</option>
                  <option value="LabManager">Lab Manager</option>
                  <option value="Requester">Requester</option>
                </select>
              </label>

              <label class="flex flex-col gap-1 text-sm">
                {{ 'users.departmentId' | translate }}
                <input [(ngModel)]="createForm.departmentId" name="departmentId" type="number" required
                  class="rounded-card border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
              </label>
            }

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
  readonly save = output<UpdateUserInput>()
  readonly createUser = output<CreateUserPayload>()

  protected form: UpdateUserInput = { fullName: '', username: '', email: '' }
  protected createForm = { password: '', role: 'Requester' as RoleName, departmentId: 1 }

  constructor() {
    effect(() => {
      const u = this.initial()
      this.open()
      this.form = {
        fullName: u?.fullName ?? '',
        username: u?.username ?? '',
        email: u?.email ?? '',
      }
      this.createForm = { password: '', role: 'Requester', departmentId: 1 }
    })
  }

  submit(): void {
    if (this.initial()) {
      this.save.emit(this.form)
    } else {
      this.createUser.emit({
        ...this.form,
        password: this.createForm.password,
        role: this.createForm.role,
        departmentId: this.createForm.departmentId,
      })
    }
  }
}
