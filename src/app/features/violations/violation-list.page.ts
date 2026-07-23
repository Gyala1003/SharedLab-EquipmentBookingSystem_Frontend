import { Component, OnInit, inject, signal } from '@angular/core'
import { DatePipe } from '@angular/common'
import { TranslatePipe } from '@ngx-translate/core'
import { BadgeComponent, BadgeTone } from '../../shared/ui/badge'
import { ButtonComponent } from '../../shared/ui/button'
import { IconComponent } from '../../shared/ui/icon'
import { SpinnerComponent } from '../../shared/ui/spinner'
import { ViolationsStore } from './violations.store'
import { ViolationFormDialog } from './violation-form.dialog'
import type { CreateViolationInput, Violation } from './violations.types'

@Component({
  selector: 'app-violation-list-page',
  imports: [DatePipe, TranslatePipe, BadgeComponent, ButtonComponent, IconComponent, SpinnerComponent, ViolationFormDialog],
  template: `
    <section class="flex flex-col gap-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 class="text-xl font-semibold text-slate-900">{{ 'violations.title' | translate }}</h1>
          <p class="text-sm text-slate-500">{{ 'violations.subtitle' | translate }}</p>
        </div>
        <app-button (click)="dialogOpen.set(true)">
          <app-icon name="plus" [size]="16" />
          {{ 'violations.add' | translate }}
        </app-button>
      </div>

      @switch (store.status()) {
        @case ('loading') {
          <div class="flex justify-center py-16"><app-spinner /></div>
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
          @if (store.isEmpty()) {
            <div class="rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center text-sm text-slate-500">
              {{ 'violations.empty' | translate }}
            </div>
          } @else {
            <div class="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <table class="w-full text-left text-sm">
                <thead class="bg-slate-50 text-slate-500">
                  <tr>
                    <th class="px-4 py-3 font-medium">ID</th>
                    <th class="px-4 py-3 font-medium">{{ 'violations.user' | translate }}</th>
                    <th class="px-4 py-3 font-medium">{{ 'violations.policy' | translate }}</th>
                    <th class="px-4 py-3 font-medium">{{ 'violations.description' | translate }}</th>
                    <th class="px-4 py-3 font-medium">{{ 'violations.count' | translate }}</th>
                    <th class="px-4 py-3 font-medium">{{ 'violations.action' | translate }}</th>
                    <th class="px-4 py-3 font-medium">{{ 'violations.date' | translate }}</th>
                    <th class="px-4 py-3 text-right font-medium">{{ 'common.actions' | translate }}</th>
                  </tr>
                </thead>
                <tbody>
                  @for (v of sorted(); track v.violationId) {
                    <tr class="border-t border-slate-100">
                      <td class="px-4 py-3 font-medium text-slate-900">#{{ v.violationId }}</td>
                      <td class="px-4 py-3 text-slate-600">{{ v.userName }}</td>
                      <td class="px-4 py-3 text-slate-600">{{ v.policyTitle }}</td>
                      <td class="px-4 py-3 text-slate-600 max-w-[200px] truncate">{{ v.description }}</td>
                      <td class="px-4 py-3">
                        <app-badge [tone]="v.violationCount >= 3 ? 'red' : 'amber'">
                          {{ v.violationCount }}
                        </app-badge>
                      </td>
                      <td class="px-4 py-3 text-slate-600">
                        @if (v.actionTaken) {
                          <span class="text-xs font-medium text-red-600">{{ v.actionTaken }}</span>
                        } @else {
                          <span class="text-xs text-slate-400">—</span>
                        }
                      </td>
                      <td class="px-4 py-3 text-slate-600">{{ v.createdAt | date: 'dd/MM/yy HH:mm' }}</td>
                      <td class="px-4 py-3 text-right">
                        @if (!v.actionTaken) {
                          <button
                            class="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 shadow-sm transition-colors"
                            (click)="lockBooking(v)"
                          >
                            <app-icon name="shield" [size]="13" />
                            Khoá đặt lịch 1 tuần
                          </button>
                        } @else {
                          <button
                            class="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 shadow-sm transition-colors"
                            (click)="unlockBooking(v)"
                          >
                            <app-icon name="check" [size]="13" />
                            Gỡ phạt / Mở khoá
                          </button>
                        }
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        }
      }
    </section>

    <app-violation-form-dialog
      [open]="dialogOpen()"
      [submitting]="store.mutating()"
      (close)="dialogOpen.set(false)"
      (save)="onSave($event)"
    />
  `,
})
export class ViolationListPage implements OnInit {
  protected readonly store = inject(ViolationsStore)
  protected readonly dialogOpen = signal(false)

  protected sorted() {
    return [...this.store.items()].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }

  isUserOverLimit(userId: number): boolean {
    const userViolations = this.store.items().filter((i: Violation) => i.userId === userId)
    const totalCount = userViolations.reduce((sum: number, item: Violation) => sum + (item.violationCount || 1), 0)
    return totalCount >= 3
  }

  lockBooking(v: Violation): void {
    if (confirm(`Bạn có chắc muốn áp dụng hình phạt KHOÁ ĐẶT LỊCH 1 TUẦN cho ${v.userName}?`)) {
      this.store.updateActionTaken(v.violationId, 'Khoá đặt lịch (1 tuần)')
    }
  }

  unlockBooking(v: Violation): void {
    if (confirm(`Mở khoá quyền đặt lịch cho ${v.userName}?`)) {
      this.store.updateActionTaken(v.violationId, null)
    }
  }

  async ngOnInit(): Promise<void> {
    await this.store.load()
  }

  async onSave(input: CreateViolationInput): Promise<void> {
    await this.store.create(input)
    this.dialogOpen.set(false)
  }
}
