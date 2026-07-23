import { Component, OnInit, inject, signal } from '@angular/core'
import { TranslatePipe } from '@ngx-translate/core'
import { BadgeComponent } from '../../shared/ui/badge'
import { ButtonComponent } from '../../shared/ui/button'
import { IconComponent } from '../../shared/ui/icon'
import { SpinnerComponent } from '../../shared/ui/spinner'
import { PoliciesStore } from './policies.store'
import { PolicyFormDialog } from './policy-form.dialog'
import type { CreatePolicyInput, Policy, UpdatePolicyInput } from './policies.types'

@Component({
  selector: 'app-policy-list-page',
  imports: [TranslatePipe, BadgeComponent, ButtonComponent, IconComponent, SpinnerComponent, PolicyFormDialog],
  template: `
    <section class="flex flex-col gap-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 class="text-xl font-semibold text-slate-900">{{ 'policies.title' | translate }}</h1>
          <p class="text-sm text-slate-500">{{ 'policies.subtitle' | translate }}</p>
        </div>
        <app-button (click)="openCreate()">
          <app-icon name="plus" [size]="16" />
          {{ 'policies.add' | translate }}
        </app-button>
      </div>

      <!-- Mandatory Hardcoded Policies -->
      <div class="rounded-xl border-l-4 border-l-red-500 border-y border-r border-slate-200 bg-white p-5 shadow-sm">
        <h2 class="mb-3 flex items-center gap-2 text-lg font-bold text-slate-800">
          <app-icon name="alert" class="h-6 w-6 text-red-500" />
          Nội quy bắt buộc khi sử dụng & rời khỏi phòng Lab
        </h2>
        <ul class="list-inside list-disc space-y-2 text-sm text-slate-700 marker:text-red-500">
          <li><strong>Không phá hoại tài sản:</strong> Mọi hành vi cố tình làm hư hỏng, thay đổi cấu trúc hoặc mang tài sản của phòng Lab ra ngoài đều bị nghiêm cấm và sẽ bị xử lý kỷ luật.</li>
          <li><strong>Check-in / Check-out đúng giờ:</strong> Phải thực hiện thao tác check-in khi bắt đầu ca và check-out khi kết thúc. Việc quên check-out hoặc quá giờ sẽ bị tự động ghi nhận lỗi <i>No-show</i> hoặc <i>Quá giờ</i>.</li>
          <li><strong>Vệ sinh gọn gàng:</strong> Thu dọn rác, sắp xếp lại ghế ngồi và thiết bị về đúng vị trí ban đầu trước khi rời khỏi phòng.</li>
          <li><strong>An toàn thiết bị:</strong> Tắt toàn bộ thiết bị điện không cần thiết và đảm bảo đã đăng xuất khỏi các máy tính dùng chung.</li>
          <li><strong>Báo cáo sự cố:</strong> Nếu phát hiện thiết bị hư hỏng hoặc có dấu hiệu bất thường, phải tạo ngay báo cáo Sự cố (Incident) trên hệ thống trước khi rời đi.</li>
        </ul>
      </div>

      <div class="mt-4 flex items-center justify-between">
        <h2 class="text-lg font-bold text-slate-800">Các quy định tùy chỉnh (Dành cho Manager)</h2>
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
              {{ 'policies.empty' | translate }}
            </div>
          } @else {
            <div class="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <table class="w-full text-left text-sm">
                <thead class="bg-slate-50 text-slate-500">
                  <tr>
                    <th class="px-4 py-3 font-medium">{{ 'policies.name' | translate }}</th>
                    <th class="px-4 py-3 font-medium">{{ 'policies.labScope' | translate }}</th>
                    <th class="px-4 py-3 font-medium">{{ 'policies.maxViolations' | translate }}</th>
                    <th class="px-4 py-3 font-medium">{{ 'policies.lockDuration' | translate }}</th>
                    <th class="px-4 py-3 font-medium">{{ 'policies.status' | translate }}</th>
                    <th class="px-4 py-3 text-right font-medium">{{ 'common.actions' | translate }}</th>
                  </tr>
                </thead>
                <tbody>
                  @for (p of store.items(); track p.policyId) {
                    <tr class="border-t border-slate-100">
                      <td class="px-4 py-3">
                        <p class="font-medium text-slate-900">{{ p.title }}</p>
                        <p class="text-xs text-slate-500 line-clamp-1">{{ p.description }}</p>
                      </td>
                      <td class="px-4 py-3 text-slate-600">
                        {{ p.labName ?? ('policies.allLabs' | translate) }}
                      </td>
                      <td class="px-4 py-3 text-slate-600">{{ p.maxViolations }}</td>
                      <td class="px-4 py-3 text-slate-600">{{ p.lockDurationDays }} {{ 'policies.days' | translate }}</td>
                      <td class="px-4 py-3">
                        <app-badge [tone]="p.isActive ? 'green' : 'slate'">
                          {{ (p.isActive ? 'policies.active' : 'policies.inactive') | translate }}
                        </app-badge>
                      </td>
                      <td class="px-4 py-3 text-right">
                        <button class="mr-3 font-medium text-brand-600 hover:underline" (click)="openEdit(p)">
                          {{ 'common.edit' | translate }}
                        </button>
                        <button class="font-medium text-red-600 hover:underline" (click)="confirmDelete(p.policyId)">
                          {{ 'common.delete' | translate }}
                        </button>
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

    <app-policy-form-dialog
      [open]="dialogOpen()"
      [editingPolicy]="editingPolicy()"
      [submitting]="store.mutating()"
      (close)="dialogOpen.set(false)"
      (save)="onSave($event)"
    />
  `,
})
export class PolicyListPage implements OnInit {
  protected readonly store = inject(PoliciesStore)
  protected readonly dialogOpen = signal(false)
  protected readonly editingPolicy = signal<Policy | null>(null)

  async ngOnInit(): Promise<void> {
    await this.store.load()
  }

  openCreate(): void {
    this.editingPolicy.set(null)
    this.dialogOpen.set(true)
  }

  openEdit(policy: Policy): void {
    this.editingPolicy.set(policy)
    this.dialogOpen.set(true)
  }

  async onSave(data: CreatePolicyInput | UpdatePolicyInput): Promise<void> {
    const editing = this.editingPolicy()
    if (editing) {
      await this.store.update(editing.policyId, data as UpdatePolicyInput)
    } else {
      await this.store.create(data as CreatePolicyInput)
    }
    this.dialogOpen.set(false)
  }

  async confirmDelete(id: number): Promise<void> {
    if (confirm('Bạn có chắc muốn xóa chính sách này?')) {
      await this.store.remove(id)
    }
  }
}
