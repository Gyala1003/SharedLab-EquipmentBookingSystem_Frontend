import { Component, OnInit, inject } from '@angular/core'
import { TranslatePipe } from '@ngx-translate/core'
import { BadgeComponent } from '../../shared/ui/badge'
import { SpinnerComponent } from '../../shared/ui/spinner'
import { PoliciesStore } from './policies.store'
import { ButtonComponent } from '../../shared/ui/button'
import { IconComponent } from '../../shared/ui/icon'

@Component({
  selector: 'app-user-policy-list-page',
  imports: [TranslatePipe, BadgeComponent, SpinnerComponent, ButtonComponent, IconComponent],
  template: `
    <section class="flex flex-col gap-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 class="text-xl font-semibold text-slate-900">{{ 'policies.title' | translate }}</h1>
          <p class="text-sm text-slate-500">{{ 'policies.subtitle' | translate }}</p>
        </div>
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

      <div class="mt-4">
        <h2 class="mb-3 text-lg font-bold text-slate-800">Các quy định cụ thể khác</h2>
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
            <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              @for (p of activePolicies(); track p.policyId) {
                <div class="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div class="flex items-start justify-between">
                    <h3 class="font-medium text-slate-900">{{ p.title }}</h3>
                    <app-badge tone="blue">{{ p.labName ?? ('policies.allLabs' | translate) }}</app-badge>
                  </div>
                  <p class="text-sm text-slate-600 flex-1">{{ p.description }}</p>
                  <div class="mt-2 border-t border-slate-100 pt-3 text-xs text-slate-500 flex flex-col gap-1">
                    <div class="flex justify-between">
                      <span>{{ 'policies.maxViolations' | translate }}:</span>
                      <span class="font-medium text-red-600">{{ p.maxViolations }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span>{{ 'policies.lockDuration' | translate }}:</span>
                      <span class="font-medium text-amber-600">{{ p.lockDurationDays }} {{ 'policies.days' | translate }}</span>
                    </div>
                  </div>
                </div>
              }
            </div>
          }
        }
      }
    </section>
  `,
})
export class UserPolicyListPage implements OnInit {
  protected readonly store = inject(PoliciesStore)

  protected activePolicies() {
    return this.store.items().filter((p) => p.isActive)
  }

  async ngOnInit(): Promise<void> {
    await this.store.load()
  }
}
