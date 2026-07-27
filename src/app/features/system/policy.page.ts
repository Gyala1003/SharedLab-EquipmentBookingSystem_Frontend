import { Component, OnInit, inject, signal } from '@angular/core'
import { SystemService } from '../../core/api/system.service'
import type { PolicyResponse } from '../../core/api/system.models'
import { AuthStore } from '../../core/auth/auth.store'
import { IconComponent } from '../../shared/ui/icon'
import { PageHeaderComponent } from '../../shared/ui/page-header'
import { ToastService } from '../../shared/ui/toast.service'

const SEED_POLICY: PolicyResponse = {
  generalRules: [
    'Mỗi sinh viên có tối đa 05 điểm vi phạm trong một học kỳ.',
    'Mọi hành vi vi phạm đều được ghi nhận vào hệ thống quản lý phòng Lab.',
    'Điểm vi phạm được cộng dồn trong suốt học kỳ.',
    'Trường hợp có lý do chính đáng (ốm đau, tai nạn, có xác nhận của giảng viên...) có thể được xem xét miễn hoặc giảm điểm vi phạm.',
    'Các hành vi cố ý gây thiệt hại tài sản ngoài việc bị trừ điểm còn phải bồi thường theo quy định.',
  ],
  categories: [
    {
      name: 'Đi muộn',
      items: [
        { description: 'Đi muộn dưới 15 phút', penalty: 'Trừ 01 điểm vi phạm' },
        { description: 'Đi muộn từ 15 đến dưới 30 phút', penalty: 'Trừ 02 điểm vi phạm' },
        { description: 'Đi muộn từ 30 phút trở lên', penalty: 'Được xem là vắng buổi học' },
      ],
    },
    {
      name: 'Tài sản',
      items: [
        { description: 'Tự ý di chuyển thiết bị', penalty: 'Trừ 02 điểm' },
        { description: 'Làm hỏng thiết bị do bất cẩn', penalty: 'Trừ 03 điểm và bồi thường' },
        { description: 'Làm mất thiết bị', penalty: 'Trừ 05 điểm và bồi thường' },
        { description: 'Cố ý phá hoại tài sản', penalty: 'Trừ 05 điểm, bồi thường và xử lý kỷ luật' },
        { description: 'Mang tài sản phòng Lab ra ngoài khi chưa được phép', penalty: 'Trừ 05 điểm' },
      ],
    },
    {
      name: 'Vệ sinh',
      items: [
        { description: 'Ăn uống trong phòng Lab', penalty: 'Trừ 01 điểm' },
        { description: 'Xả rác không đúng nơi quy định', penalty: 'Trừ 01 điểm' },
        { description: 'Không sắp xếp ghế sau khi sử dụng', penalty: 'Trừ 01 điểm' },
      ],
    },
  ],
}

@Component({
  selector: 'app-policy-page',
  imports: [IconComponent, PageHeaderComponent],
  template: `
    <section class="space-y-6">
      <app-page-header title="Chính sách phòng Lab" subtitle="Quy định chung và hình thức xử lý vi phạm áp dụng cho toàn bộ người dùng.">
        @if (store.isAdmin()) { <button type="button" class="btn-primary" [disabled]="saving()" (click)="save()"><app-icon name="save" [size]="17" /> {{ saving() ? 'Đang lưu...' : 'Lưu thay đổi' }}</button> }
      </app-page-header>

      @if (loading()) {
        <div class="card-surface p-7"><div class="skeleton h-8 w-1/3 rounded"></div><div class="skeleton mt-5 h-60 rounded-3xl"></div></div>
      } @else {
        <article class="card-surface overflow-hidden">
          <header class="border-b border-slate-100 px-5 py-5 sm:px-6"><h2 class="text-lg font-black text-slate-950">Quy định chung</h2><p class="mt-1 text-xs text-slate-400">Áp dụng cho toàn bộ người dùng phòng Lab</p></header>
          <div class="p-5 sm:p-6">
            @if (!store.isAdmin()) {
              <ol class="list-decimal space-y-3 pl-5 text-sm leading-6 text-slate-700">
                @for (rule of policy().generalRules; track $index) { <li>{{ rule }}</li> }
              </ol>
            } @else {
              <div class="space-y-3">
                @for (rule of policy().generalRules; track $index) {
                  <div class="flex items-center gap-2">
                    <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs font-black text-slate-500">{{ $index + 1 }}</span>
                    <input class="input-shell" type="text" [value]="rule" (input)="onGeneralRuleInput($index, $event)" />
                    <button type="button" class="shrink-0 rounded-xl p-2 text-rose-500 hover:bg-rose-50" title="Xóa" (click)="removeGeneralRule($index)"><app-icon name="trash" [size]="17" /></button>
                  </div>
                }
                <button type="button" class="btn-secondary" (click)="addGeneralRule()"><app-icon name="plus" [size]="16" /> Thêm quy định</button>
              </div>
            }
          </div>
        </article>

        <div class="grid gap-6 lg:grid-cols-2">
          @for (category of policy().categories; track $index; let categoryIndex = $index) {
            <article class="card-surface overflow-hidden">
              <header class="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-5">
                @if (!store.isAdmin()) {
                  <h2 class="text-lg font-black text-slate-950">{{ category.name }}</h2>
                } @else {
                  <input class="input-shell" type="text" placeholder="Tên hạng mục" [value]="category.name" (input)="onCategoryNameInput(categoryIndex, $event)" />
                  <button type="button" class="shrink-0 rounded-xl p-2 text-rose-500 hover:bg-rose-50" title="Xóa hạng mục" (click)="removeCategory(categoryIndex)"><app-icon name="trash" [size]="17" /></button>
                }
              </header>
              <div class="divide-y divide-slate-100">
                @for (item of category.items; track $index; let itemIndex = $index) {
                  <div class="p-5">
                    @if (!store.isAdmin()) {
                      <p class="text-sm font-bold text-slate-800">{{ item.description }}</p>
                      <p class="mt-1 text-xs font-semibold text-rose-600">{{ item.penalty }}</p>
                    } @else {
                      <div class="grid gap-2 sm:grid-cols-[1fr_1fr_auto] sm:items-center">
                        <input class="input-shell" type="text" placeholder="Mô tả hành vi" [value]="item.description" (input)="onItemInput(categoryIndex, itemIndex, 'description', $event)" />
                        <input class="input-shell" type="text" placeholder="Hình thức xử lý" [value]="item.penalty" (input)="onItemInput(categoryIndex, itemIndex, 'penalty', $event)" />
                        <button type="button" class="shrink-0 rounded-xl p-2 text-rose-500 hover:bg-rose-50" title="Xóa" (click)="removeItem(categoryIndex, itemIndex)"><app-icon name="trash" [size]="17" /></button>
                      </div>
                    }
                  </div>
                } @empty {
                  <div class="p-5 text-center text-xs font-semibold text-slate-400">Chưa có hành vi nào trong hạng mục này.</div>
                }
              </div>
              @if (store.isAdmin()) { <div class="border-t border-slate-100 p-4"><button type="button" class="btn-secondary w-full" (click)="addItem(categoryIndex)"><app-icon name="plus" [size]="16" /> Thêm hành vi</button></div> }
            </article>
          } @empty {
            <p class="text-sm font-semibold text-slate-400">Chưa có hạng mục chính sách nào.</p>
          }
        </div>

        @if (store.isAdmin()) { <button type="button" class="btn-secondary" (click)="addCategory()"><app-icon name="plus" [size]="16" /> Thêm hạng mục</button> }
      }
    </section>
  `,
})
export class PolicyPage implements OnInit {
  protected readonly store = inject(AuthStore)
  private readonly api = inject(SystemService)
  private readonly toast = inject(ToastService)
  protected readonly loading = signal(true)
  protected readonly saving = signal(false)
  protected readonly policy = signal<PolicyResponse>(SEED_POLICY)

  ngOnInit(): void {
    this.load()
  }

  protected onGeneralRuleInput(index: number, event: Event): void {
    this.updateGeneralRule(index, (event.target as HTMLInputElement).value)
  }

  protected onCategoryNameInput(categoryIndex: number, event: Event): void {
    this.updateCategoryName(categoryIndex, (event.target as HTMLInputElement).value)
  }

  protected onItemInput(categoryIndex: number, itemIndex: number, field: 'description' | 'penalty', event: Event): void {
    this.updateItem(categoryIndex, itemIndex, field, (event.target as HTMLInputElement).value)
  }

  protected addGeneralRule(): void {
    this.policy.update((p) => ({ ...p, generalRules: [...p.generalRules, ''] }))
  }

  protected removeGeneralRule(index: number): void {
    this.policy.update((p) => ({ ...p, generalRules: p.generalRules.filter((_, i) => i !== index) }))
  }

  protected updateGeneralRule(index: number, value: string): void {
    this.policy.update((p) => ({ ...p, generalRules: p.generalRules.map((rule, i) => (i === index ? value : rule)) }))
  }

  protected addCategory(): void {
    this.policy.update((p) => ({ ...p, categories: [...p.categories, { name: '', items: [] }] }))
  }

  protected removeCategory(index: number): void {
    this.policy.update((p) => ({ ...p, categories: p.categories.filter((_, i) => i !== index) }))
  }

  protected updateCategoryName(index: number, value: string): void {
    this.policy.update((p) => ({ ...p, categories: p.categories.map((cat, i) => (i === index ? { ...cat, name: value } : cat)) }))
  }

  protected addItem(categoryIndex: number): void {
    this.policy.update((p) => ({ ...p, categories: p.categories.map((cat, i) => (i === categoryIndex ? { ...cat, items: [...cat.items, { description: '', penalty: '' }] } : cat)) }))
  }

  protected removeItem(categoryIndex: number, itemIndex: number): void {
    this.policy.update((p) => ({ ...p, categories: p.categories.map((cat, i) => (i === categoryIndex ? { ...cat, items: cat.items.filter((_, j) => j !== itemIndex) } : cat)) }))
  }

  protected updateItem(categoryIndex: number, itemIndex: number, field: 'description' | 'penalty', value: string): void {
    this.policy.update((p) => ({
      ...p,
      categories: p.categories.map((cat, i) => (i === categoryIndex ? { ...cat, items: cat.items.map((item, j) => (j === itemIndex ? { ...item, [field]: value } : item)) } : cat)),
    }))
  }

  protected save(): void {
    this.saving.set(true)
    this.api.updatePolicy(this.policy()).subscribe({
      next: () => { this.saving.set(false); this.toast.success('Đã lưu chính sách phòng Lab') },
      error: () => { this.saving.set(false); this.toast.error('Chưa lưu được, có thể do Backend chưa hỗ trợ API này') },
    })
  }

  private load(): void {
    this.loading.set(true)
    this.api.getPolicy().subscribe({
      next: (data) => { this.policy.set(data); this.loading.set(false) },
      error: () => { this.policy.set(SEED_POLICY); this.loading.set(false) },
    })
  }
}
