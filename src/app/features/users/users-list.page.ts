import { Component, OnInit, inject, signal } from '@angular/core'
import { TranslatePipe } from '@ngx-translate/core'
import { UsersStore } from './users.store'
import { UserFormDialog } from './user-form-dialog'
import { ButtonComponent } from '../../shared/ui/button'
import { CardComponent } from '../../shared/ui/card'
import { SpinnerComponent } from '../../shared/ui/spinner'
import type { UpsertUserInput, User } from './users.types'

@Component({
  selector: 'app-users-list-page',
  imports: [TranslatePipe, UserFormDialog, ButtonComponent, CardComponent, SpinnerComponent],
  template: `
    <section class="flex flex-col gap-4">
      <div class="flex items-center justify-between gap-4">
        <h1 class="text-xl font-semibold text-slate-900">{{ 'users.title' | translate }}</h1>
        <app-button (click)="openCreate()">{{ 'users.add' | translate }}</app-button>
      </div>

      @switch (store.status()) {
        @case ('loading') {
          <div class="flex justify-center py-10">
            <app-spinner />
          </div>
        }
        @case ('error') {
          <div class="flex flex-col items-center gap-3 p-8">
            <p class="text-red-600">{{ 'common.error' | translate }}</p>
            <app-button variant="secondary" (click)="store.load()">
              {{ 'common.retry' | translate }}
            </app-button>
          </div>
        }
        @default {
          <app-card>
            @if (store.isEmpty()) {
              <p class="py-6 text-center text-sm text-slate-500">
                {{ 'users.empty' | translate }}
              </p>
            } @else {
              <table class="w-full text-left text-sm">
                <thead>
                  <tr class="border-b border-slate-200 text-slate-500">
                    <th class="py-2 font-medium">{{ 'users.name' | translate }}</th>
                    <th class="py-2 font-medium">{{ 'users.email' | translate }}</th>
                    <th class="py-2 font-medium">{{ 'users.role' | translate }}</th>
                    <th class="py-2 text-right font-medium">
                      {{ 'users.actions' | translate }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  @for (u of store.items(); track u.id) {
                    <tr class="border-b border-slate-100 last:border-0">
                      <td class="py-2">{{ u.fullName }}</td>
                      <td class="py-2 text-slate-500">{{ u.email }}</td>
                      <td class="py-2 text-slate-500">{{ u.role }}</td>
                      <td class="py-2 text-right">
                        <button class="text-brand-600 mr-3 hover:underline" (click)="openEdit(u)">
                          {{ 'users.edit' | translate }}
                        </button>
                        <button class="text-red-600 hover:underline" (click)="store.remove(u.id)">
                          {{ 'users.delete' | translate }}
                        </button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            }
          </app-card>
        }
      }

      <app-user-form-dialog
        [open]="dialogOpen()"
        [initial]="editing()"
        [submitting]="store.mutating()"
        (close)="dialogOpen.set(false)"
        (save)="handleSave($event)"
      />
    </section>
  `,
})
export class UsersListPage implements OnInit {
  protected readonly store = inject(UsersStore)
  protected readonly dialogOpen = signal(false)
  protected readonly editing = signal<User | null>(null)

  ngOnInit(): void {
    void this.store.load()
  }

  openCreate(): void {
    this.editing.set(null)
    this.dialogOpen.set(true)
  }

  openEdit(user: User): void {
    this.editing.set(user)
    this.dialogOpen.set(true)
  }

  async handleSave(input: UpsertUserInput): Promise<void> {
    const current = this.editing()
    if (current) await this.store.update(current.id, input)
    else await this.store.create(input)
    this.dialogOpen.set(false)
  }
}
