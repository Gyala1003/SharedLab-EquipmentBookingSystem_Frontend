import { Component, OnInit, computed, inject, signal } from '@angular/core'
import { of } from 'rxjs'
import { catchError } from 'rxjs/operators'
import { SystemService } from '../../core/api/system.service'
import type { PolicyResponse } from '../../core/api/system.models'
import { AuthStore } from '../../core/auth/auth.store'
import { LanguageStore } from '../../core/i18n/language.store'
import { TranslatePipe } from '../../core/i18n/translate.pipe'
import { IconComponent } from '../../shared/ui/icon'
import { PageHeaderComponent } from '../../shared/ui/page-header'
import { ToastService } from '../../shared/ui/toast.service'

const SEED_POLICY_VI: PolicyResponse = {
  generalRules: [
    'Xác thực qua người duyệt: Mọi lượt Check-in (Nhận) và Check-out (Trả) đúng giờ chỉ được tính là hoàn thành sau khi có sự xác thực/phê duyệt trực tiếp từ Bộ phận Quản lý.',
    'Kiểm tra đầu giờ (Check-in): Ngay sau khi Check-in, người mượn có trách nhiệm kiểm tra toàn bộ tình trạng phòng và thiết bị. Báo ngay hỏng hóc/sự cố có sẵn cho Bộ phận duyệt trong 5–10 phút đầu.',
    'Quy định Check-out & Mất tài sản: Trả phòng/thiết bị đúng thời gian đã đăng ký. Check-out muộn quá 02 tuần sẽ tự động ghi nhận là LÀM MẤT TÀI SẢN và bị ĐÓNG BĂNG/KHÓA TÀI KHOẢN HOÀN TOÀN.',
    'Trách nhiệm bảo quản & Hỏng hóc: Người mượn chịu trách nhiệm toàn bộ đối với phòng học và thiết bị. Nếu bị hư hỏng mà không có chứng minh lý do khách quan, người mượn phải bồi thường toàn bộ chi phí.',
    'Quản lý tài khoản & Nghiêm cấm tráo đổi: Nghiêm cấm tự ý tháo lắp, thay thế, tráo đổi linh kiện hoặc cho mượn/dùng chung tài khoản. Chủ tài khoản phải chịu trách nhiệm trước nhà trường.',
  ],
  categories: [
    {
      name: '1. QUY TRÌNH CHECK-IN & CHECK-OUT (XÁC THỰC 2 BƯỚC)',
      items: [
        {
          description: 'Xác thực qua người duyệt',
          penalty:
            'Mọi lượt Check-in (Nhận) và Check-out (Trả) đúng giờ chỉ được tính là hoàn thành sau khi có sự xác thực/phê duyệt trực tiếp từ Bộ phận Quản lý.',
        },
        {
          description: 'Kiểm tra đầu giờ (Check-in)',
          penalty:
            'Ngay sau khi Check-in, người mượn có trách nhiệm kiểm tra toàn bộ tình trạng phòng và thiết bị. Nếu phát hiện bất kỳ hỏng hóc, mất mát hoặc sự cố có sẵn, người mượn phải báo ngay cho Bộ phận duyệt trong vòng 5–10 phút đầu để ghi nhận và xử lý.',
        },
        {
          description: 'Quy định Check-out & Mất tài sản',
          penalty:
            'Người mượn phải trả phòng và thiết bị đúng thời gian đã đăng ký. Trường hợp Check-out muộn quá 02 tuần: Hệ thống sẽ tự động ghi nhận là LÀM MẤT TÀI SẢN. Khi bị ghi nhận làm mất đồ, tài khoản người dùng sẽ bị ĐÓNG BĂNG/KHÓA HOÀN TOÀN, không thể tiếp tục mượn hoặc sử dụng hệ thống cho đến khi hoàn tất đền bù.',
        },
      ],
    },
    {
      name: '2. TRÁCH NHIỆM BẢO QUẢN & QUY TẮC TÀI KHOẢN',
      items: [
        {
          description: 'Trách nhiệm trong thời gian mượn',
          penalty:
            'Người mượn chịu trách nhiệm toàn bộ đối với không gian phòng học và các thiết bị bên trong suốt khoảng thời gian từ lúc Check-in đến khi Check-out thành công.',
        },
        {
          description: 'Xử lý sự cố / Hỏng hóc',
          penalty:
            'Nếu thiết bị bị hư hỏng trong thời gian mượn mà không có bằng chứng/chứng minh được do tác nhân khách quan bên ngoài gây ra, người mượn phải chịu trách nhiệm hoàn toàn (bao gồm chi phí sửa chữa hoặc bồi thường).',
        },
        {
          description: 'Nghiêm cấm tráo đổi thiết bị',
          penalty:
            'Nghiêm cấm mọi hành vi tự ý tháo lắp, thay thế, hoán đổi linh kiện/thiết bị hoặc gây hư hỏng cố ý.',
        },
        {
          description: 'Quản lý tài khoản cá nhân',
          penalty:
            'Nghiêm cấm cho mượn hoặc dùng chung tài khoản. Mọi hoạt động, sự cố phát sinh dưới tên tài khoản nào thì chủ tài khoản đó phải chịu trách nhiệm trước nhà trường/đơn vị quản lý.',
        },
      ],
    },
  ],
}

const SEED_POLICY_EN: PolicyResponse = {
  generalRules: [
    '2-Step Verification: All Check-in (Receive) and Check-out (Return) entries are completed only upon direct verification/approval from Management.',
    'Initial Inspection: Immediately inspect all room and equipment conditions upon Check-in. Report any pre-existing damage within 5–10 minutes.',
    'Overdue & Lost Asset: Overdue Checkout >2 weeks is automatically logged as LOST ASSET, causing an immediate ACCOUNT FREEZE/LOCK until compensated.',
    'Asset Care Responsibility: Borrowers bear full responsibility for room spaces and equipment, including full repair/replacement costs for unverified damage.',
    'Account Integrity & Anti-Swapping: Component swapping and account sharing are strictly prohibited; account owners bear full institutional liability.',
  ],
  categories: [
    {
      name: '1. CHECK-IN & CHECK-OUT PROCESS (2-STEP VERIFICATION)',
      items: [
        {
          description: 'Management Approval Verification',
          penalty:
            'All on-time Check-in and Check-out entries are completed only after direct verification/approval by the Management Department.',
        },
        {
          description: 'Initial Inspection (Check-in)',
          penalty:
            'Immediately after Check-in, borrowers are responsible for inspecting room and equipment conditions. Any pre-existing damage, loss, or issues must be reported within 5–10 minutes for logging and handling.',
        },
        {
          description: 'Check-out & Lost Asset Regulations',
          penalty:
            'Borrowers must return rooms and equipment on schedule. Late Check-out exceeding 02 weeks will automatically be recorded as LOST ASSET and result in an ACCOUNT FREEZE/LOCK until full compensation is completed.',
        },
      ],
    },
    {
      name: '2. ASSET CARE RESPONSIBILITY & ACCOUNT RULES',
      items: [
        {
          description: 'Borrowing Duration Responsibility',
          penalty:
            'Borrowers bear total responsibility for classroom spaces and internal equipment throughout the entire duration from Check-in until successful Check-out.',
        },
        {
          description: 'Incident & Damage Handling',
          penalty:
            'If equipment is damaged during the borrowing period without proof of external objective causes, the borrower must take full responsibility (including repair or replacement costs).',
        },
        {
          description: 'Prohibition of Component Swapping',
          penalty:
            'Any unauthorized disassembly, replacement, component swapping, or intentional damage to equipment is strictly prohibited.',
        },
        {
          description: 'Personal Account Management',
          penalty:
            'Lending or sharing accounts is strictly forbidden. The account owner is held fully liable before school/management authorities for all activities and incidents registered under their account name.',
        },
      ],
    },
  ],
}

@Component({
  selector: 'app-policy-page',
  imports: [IconComponent, PageHeaderComponent, TranslatePipe],
  template: `
    <section class="space-y-6">
      <app-page-header [title]="'policy.title' | t" [subtitle]="'policy.subtitle' | t">
        @if (store.isAdmin()) {
          <button type="button" class="btn-primary" [disabled]="saving()" (click)="save()">
            <app-icon name="save" [size]="17" />
            {{ saving() ? ('common.saving' | t) : ('common.save' | t) }}
          </button>
        }
      </app-page-header>

      @if (loading()) {
        <div class="card-surface p-7">
          <div class="skeleton h-8 w-1/3 rounded"></div>
          <div class="skeleton mt-5 h-60 rounded-3xl"></div>
        </div>
      } @else {
        <article class="card-surface overflow-hidden">
          <header class="border-b border-slate-100 px-5 py-5 sm:px-6">
            <h2 class="text-lg font-black text-slate-950">{{ 'policy.generalRules' | t }}</h2>
            <p class="mt-1 text-xs text-slate-400">{{ 'policy.generalRulesSub' | t }}</p>
          </header>
          <div class="p-5 sm:p-6">
            @if (!store.isAdmin()) {
              <ol class="list-decimal space-y-3 pl-5 text-sm leading-6 text-slate-700">
                @for (rule of activePolicy().generalRules; track $index) {
                  <li>{{ rule }}</li>
                }
              </ol>
            } @else {
              <div class="space-y-3">
                @for (rule of activePolicy().generalRules; track $index) {
                  <div class="flex items-center gap-2">
                    <span
                      class="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs font-black text-slate-500"
                      >{{ $index + 1 }}</span
                    >
                    <input
                      class="input-shell"
                      type="text"
                      [value]="rule"
                      (input)="onGeneralRuleInput($index, $event)"
                    />
                    <button
                      type="button"
                      class="shrink-0 rounded-xl p-2 text-rose-500 hover:bg-rose-50"
                      title="Xóa"
                      (click)="removeGeneralRule($index)"
                    >
                      <app-icon name="trash" [size]="17" />
                    </button>
                  </div>
                }
                <button type="button" class="btn-secondary" (click)="addGeneralRule()">
                  <app-icon name="plus" [size]="16" /> {{ 'policy.addRule' | t }}
                </button>
              </div>
            }
          </div>
        </article>

        <div class="grid gap-6 lg:grid-cols-2">
          @for (category of activePolicy().categories; track $index; let categoryIndex = $index) {
            <article class="card-surface overflow-hidden">
              <header
                class="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-5"
              >
                @if (!store.isAdmin()) {
                  <h2 class="text-lg font-black text-slate-950">{{ category.name }}</h2>
                } @else {
                  <input
                    class="input-shell"
                    type="text"
                    placeholder="Tên hạng mục"
                    [value]="category.name"
                    (input)="onCategoryNameInput(categoryIndex, $event)"
                  />
                  <button
                    type="button"
                    class="shrink-0 rounded-xl p-2 text-rose-500 hover:bg-rose-50"
                    title="Xóa hạng mục"
                    (click)="removeCategory(categoryIndex)"
                  >
                    <app-icon name="trash" [size]="17" />
                  </button>
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
                        <input
                          class="input-shell"
                          type="text"
                          placeholder="Mô tả hành vi"
                          [value]="item.description"
                          (input)="onItemInput(categoryIndex, itemIndex, 'description', $event)"
                        />
                        <input
                          class="input-shell"
                          type="text"
                          placeholder="Hình thức xử lý"
                          [value]="item.penalty"
                          (input)="onItemInput(categoryIndex, itemIndex, 'penalty', $event)"
                        />
                        <button
                          type="button"
                          class="shrink-0 rounded-xl p-2 text-rose-500 hover:bg-rose-50"
                          title="Xóa"
                          (click)="removeItem(categoryIndex, itemIndex)"
                        >
                          <app-icon name="trash" [size]="17" />
                        </button>
                      </div>
                    }
                  </div>
                } @empty {
                  <div class="p-5 text-center text-xs font-semibold text-slate-400">
                    {{ 'Chưa có hành vi nào trong hạng mục này.' | t }}
                  </div>
                }
              </div>
              @if (store.isAdmin()) {
                <div class="border-t border-slate-100 p-4">
                  <button
                    type="button"
                    class="btn-secondary w-full"
                    (click)="addItem(categoryIndex)"
                  >
                    <app-icon name="plus" [size]="16" /> {{ 'policy.addItem' | t }}
                  </button>
                </div>
              }
            </article>
          } @empty {
            <p class="text-sm font-semibold text-slate-400">
              {{ 'Chưa có hạng mục chính sách nào.' | t }}
            </p>
          }
        </div>

        @if (store.isAdmin()) {
          <button type="button" class="btn-secondary" (click)="addCategory()">
            <app-icon name="plus" [size]="16" /> {{ 'policy.addCategory' | t }}
          </button>
        }
      }
    </section>
  `,
})
export class PolicyPage implements OnInit {
  protected readonly store = inject(AuthStore)
  protected readonly languageStore = inject(LanguageStore)
  private readonly api = inject(SystemService)
  private readonly toast = inject(ToastService)
  protected readonly loading = signal(true)
  protected readonly saving = signal(false)
  protected readonly customPolicy = signal<PolicyResponse | null>(null)

  protected readonly activePolicy = computed<PolicyResponse>(() => {
    const lang = this.languageStore.lang()
    const custom = this.customPolicy()
    if (custom) {
      const isViSeed =
        custom.generalRules[0]?.startsWith('Xác thực qua') ||
        !custom.categories ||
        custom.categories.length === 0
      const isEnSeed = custom.generalRules[0]?.startsWith('2-Step Verification')
      if (lang === 'en' && (isViSeed || isEnSeed)) return SEED_POLICY_EN
      if (lang === 'vi' && (isViSeed || isEnSeed)) return SEED_POLICY_VI
      return custom
    }
    return lang === 'en' ? SEED_POLICY_EN : SEED_POLICY_VI
  })

  ngOnInit(): void {
    this.load()
  }

  protected onGeneralRuleInput(index: number, event: Event): void {
    this.updateGeneralRule(index, (event.target as HTMLInputElement).value)
  }

  protected onCategoryNameInput(categoryIndex: number, event: Event): void {
    this.updateCategoryName(categoryIndex, (event.target as HTMLInputElement).value)
  }

  protected onItemInput(
    categoryIndex: number,
    itemIndex: number,
    field: 'description' | 'penalty',
    event: Event,
  ): void {
    this.updateItem(categoryIndex, itemIndex, field, (event.target as HTMLInputElement).value)
  }

  private ensureCustomPolicy(): PolicyResponse {
    if (!this.customPolicy()) {
      const copy = JSON.parse(JSON.stringify(this.activePolicy()))
      this.customPolicy.set(copy)
    }
    return this.customPolicy()!
  }

  protected addGeneralRule(): void {
    this.ensureCustomPolicy()
    this.customPolicy.update((p) => (p ? { ...p, generalRules: [...p.generalRules, ''] } : null))
  }

  protected removeGeneralRule(index: number): void {
    this.ensureCustomPolicy()
    this.customPolicy.update((p) =>
      p ? { ...p, generalRules: p.generalRules.filter((_, i) => i !== index) } : null,
    )
  }

  protected updateGeneralRule(index: number, value: string): void {
    this.ensureCustomPolicy()
    this.customPolicy.update((p) =>
      p
        ? { ...p, generalRules: p.generalRules.map((rule, i) => (i === index ? value : rule)) }
        : null,
    )
  }

  protected addCategory(): void {
    this.ensureCustomPolicy()
    this.customPolicy.update((p) =>
      p ? { ...p, categories: [...p.categories, { name: '', items: [] }] } : null,
    )
  }

  protected removeCategory(index: number): void {
    this.ensureCustomPolicy()
    this.customPolicy.update((p) =>
      p ? { ...p, categories: p.categories.filter((_, i) => i !== index) } : null,
    )
  }

  protected updateCategoryName(index: number, value: string): void {
    this.ensureCustomPolicy()
    this.customPolicy.update((p) =>
      p
        ? {
            ...p,
            categories: p.categories.map((cat, i) => (i === index ? { ...cat, name: value } : cat)),
          }
        : null,
    )
  }

  protected addItem(categoryIndex: number): void {
    this.ensureCustomPolicy()
    this.customPolicy.update((p) =>
      p
        ? {
            ...p,
            categories: p.categories.map((cat, i) =>
              i === categoryIndex
                ? { ...cat, items: [...cat.items, { description: '', penalty: '' }] }
                : cat,
            ),
          }
        : null,
    )
  }

  protected removeItem(categoryIndex: number, itemIndex: number): void {
    this.ensureCustomPolicy()
    this.customPolicy.update((p) =>
      p
        ? {
            ...p,
            categories: p.categories.map((cat, i) =>
              i === categoryIndex
                ? { ...cat, items: cat.items.filter((_, j) => j !== itemIndex) }
                : cat,
            ),
          }
        : null,
    )
  }

  protected updateItem(
    categoryIndex: number,
    itemIndex: number,
    field: 'description' | 'penalty',
    value: string,
  ): void {
    this.ensureCustomPolicy()
    this.customPolicy.update((p) =>
      p
        ? {
            ...p,
            categories: p.categories.map((cat, i) =>
              i === categoryIndex
                ? {
                    ...cat,
                    items: cat.items.map((item, j) =>
                      j === itemIndex ? { ...item, [field]: value } : item,
                    ),
                  }
                : cat,
            ),
          }
        : null,
    )
  }

  protected save(): void {
    this.saving.set(true)
    this.api.updatePolicy(this.activePolicy()).subscribe({
      next: () => {
        this.saving.set(false)
        this.toast.success('Đã lưu chính sách phòng Lab')
      },
      error: () => {
        this.saving.set(false)
        this.toast.error('Chưa lưu được, có thể do Backend chưa hỗ trợ API này')
      },
    })
  }

  private load(): void {
    this.loading.set(true)
    this.api
      .getPolicy()
      .pipe(catchError(() => of(null)))
      .subscribe({
        next: (data) => {
          if (data) {
            this.customPolicy.set(data)
          }
          this.loading.set(false)
        },
        error: () => {
          this.loading.set(false)
        },
      })
  }
}
