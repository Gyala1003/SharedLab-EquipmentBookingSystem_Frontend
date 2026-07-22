import { Component, OnInit, inject, signal } from '@angular/core'
import { TranslatePipe } from '@ngx-translate/core'
import { AuthService } from '../../core/auth/auth.service'
import { UsersStore } from './users.store'
import { UserFormDialog } from './user-form-dialog'
import { BadgeComponent, BadgeTone } from '../../shared/ui/badge'
import { ButtonComponent } from '../../shared/ui/button'
import { CardComponent } from '../../shared/ui/card'
import { SpinnerComponent } from '../../shared/ui/spinner'
import type { UpdateUserInput, User } from './users.types'
import type { CreateUserPayload } from '../../core/auth/auth.types'
import { firstValueFrom } from 'rxjs'

const STATUS_TONE: Record<string, BadgeTone> = {
  Active: 'green',
  Inactive: 'slate',
  Restricted: 'amber',
  Locked: 'red',
}

@Component({
  selector: 'app-users-list-page',
  imports: [TranslatePipe, UserFormDialog, BadgeComponent, ButtonComponent, CardComponent, SpinnerComponent],
  template: `
    <section class="flex flex-col gap-4">
      <div class="flex items-center justify-between gap-4">
        <h1 class="text-xl font-semibold text-slate-900">{{ 'users.title' | translate }}</h1>
        <app-button (click)="openCreate()">{{ 'users.add' | translate }}</app-button>
      </div>

      @switch (store.status()) {
        @case ('loading') {
          <div class="flex justify-center py-10"><app-spinner /></div>
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
                    <th class="py-2 font-medium">{{ 'users.department' | translate }}</th>
                    <th class="py-2 font-medium">{{ 'users.statusLabel' | translate }}</th>
                    <th class="py-2 font-medium">{{ 'users.penalty' | translate }}</th>
                    <th class="py-2 text-right font-medium">{{ 'users.actions' | translate }}</th>
                  </tr>
                </thead>
                <tbody>
                  @for (u of store.items(); track u.userId) {
                    <tr class="border-b border-slate-100 last:border-0">
                      <td class="py-2">{{ u.fullName }}</td>
                      <td class="py-2 text-slate-500">{{ u.email }}</td>
                      <td class="py-2 text-slate-500">{{ u.roleName }}</td>
                      <td class="py-2 text-slate-500">{{ u.departmentName }}</td>
                      <td class="py-2">
                        <app-badge [tone]="STATUS_TONE[u.status] ?? 'slate'">{{ u.status }}</app-badge>
                      </td>
                      <td class="py-2 text-slate-500">{{ u.penaltyPoints }}</td>
                      <td class="py-2 text-right">
                        <button class="mr-2 text-brand-600 hover:underline" (click)="openEdit(u)">
                          {{ 'users.edit' | translate }}
                        </button>
                        @if (u.status === 'Locked') {
                          <button class="mr-2 text-emerald-600 hover:underline" (click)="store.unlock(u.userId)">
                            {{ 'users.unlock' | translate }}
                          </button>
                        } @else if (u.status === 'Active') {
                          <button class="mr-2 text-amber-600 hover:underline" (click)="store.lock(u.userId)">
                            {{ 'users.lock' | translate }}
                          </button>
                        }
                        @if (u.status !== 'Inactive') {
                          <button class="text-red-600 hover:underline" (click)="store.deactivate(u.userId)">
                            {{ 'users.deactivate' | translate }}
                          </button>
                        } @else {
                          <button class="text-emerald-600 hover:underline" (click)="store.activate(u.userId)">
                            {{ 'users.activate' | translate }}
                          </button>
                        }
                      </td>
                    </tr>
                  }
                </tbody>
              </table>

              <!-- Pagination -->
              @if (store.totalPages() > 1) {
                <div class="mt-4 flex items-center justify-between border-t border-slate-200 pt-3">
                  <p class="text-xs text-slate-500">
                    {{ store.totalCount() }} {{ 'users.totalUsers' | translate }}
                  </p>
                  <div class="flex gap-1">
                    @for (p of pages(); track p) {
                      <button
                        class="rounded px-3 py-1 text-sm"
                        [class]="p === store.pageNumber() ? 'bg-brand-500 text-white' : 'text-slate-600 hover:bg-slate-100'"
                        (click)="goToPage(p)"
                      >
                        {{ p }}
                      </button>
                    }
                  </div>
                </div>
              }
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
        (createUser)="handleCreate($event)"
      />
    </section>
  `,
})
export class UsersListPage implements OnInit {
  protected readonly store = inject(UsersStore)
  private readonly authService = inject(AuthService)
  protected readonly dialogOpen = signal(false)
  protected readonly editing = signal<User | null>(null)
  protected readonly STATUS_TONE = STATUS_TONE

  ngOnInit(): void {
    void this.store.load()
  }

  protected pages() {
    const total = this.store.totalPages()
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  goToPage(page: number): void {
    void this.store.load({ pageNumber: page })
  }

  openCreate(): void {
    this.editing.set(null)
    this.dialogOpen.set(true)
  }

  openEdit(user: User): void {
    this.editing.set(user)
    this.dialogOpen.set(true)
  }

  async handleSave(input: UpdateUserInput): Promise<void> {
    const current = this.editing()
    if (current) {
      await this.store.update(current.userId, input)
    }
    this.dialogOpen.set(false)
  }

  async handleCreate(payload: CreateUserPayload): Promise<void> {
    await firstValueFrom(this.authService.createUser(payload))
    this.dialogOpen.set(false)
    void this.store.load()
  }
}
