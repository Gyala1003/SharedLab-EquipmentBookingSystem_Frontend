import { DatePipe, NgClass } from '@angular/common'
import { Component, inject } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { Policy, PolicyStoreService } from '../../core/state/policy.store'
import { DataStateComponent } from '../../shared/ui/data-state'
import { IconComponent } from '../../shared/ui/icon'
import { PageHeaderComponent } from '../../shared/ui/page-header'
import { searchIncludes, validateKeyword } from '../../shared/utils/search'

@Component({
  selector: 'app-policies-view-page',
  imports: [
    DatePipe,
    NgClass,
    FormsModule,
    PageHeaderComponent,
    IconComponent,
    DataStateComponent,
  ],
  template: `
    <section class="space-y-6">
      <app-page-header
        title="Chính sách & Nội quy vận hành"
        subtitle="Quy định sử dụng phòng lab & thiết bị dùng để tham chiếu khi duyệt booking và xử lý vi phạm."
      />

      <div class="filter-bar md:grid-cols-2 xl:grid-cols-[2fr_1fr_auto]">
        <div>
          <label class="field-label">Tìm kiếm nội quy</label>
          <div class="relative flex items-center">
            <span
              class="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-slate-400"
            >
              <app-icon name="search" [size]="18" />
            </span>
            <input
              type="search"
              class="input-shell search-input pr-10 !pl-11"
              maxlength="100"
              [(ngModel)]="keyword"
              placeholder="Tiêu đề hoặc nội dung chính sách..."
            />
            @if (keyword) {
              <button
                type="button"
                class="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-700"
                aria-label="Xóa từ khóa"
                (click)="keyword = ''"
              >
                <app-icon name="x" [size]="16" />
              </button>
            }
          </div>
        </div>

        <div>
          <label class="field-label">Danh mục</label>
          <select class="input-shell" [(ngModel)]="categoryFilter">
            <option value="all">Tất cả danh mục</option>
            <option value="LabRoom">Phòng lab</option>
            <option value="Equipment">Thiết bị</option>
            <option value="General">Nội quy chung</option>
          </select>
        </div>

        <div class="flex items-end">
          <button class="btn-secondary w-full" (click)="resetFilters()">
            <app-icon name="refresh" [size]="17" /> Đặt lại
          </button>
        </div>
      </div>

      @if (filteredPolicies().length === 0) {
        <app-data-state
          icon="file-text"
          title="Không tìm thấy chính sách phù hợp"
          message="Hãy thử thay đổi từ khóa hoặc bộ lọc danh mục."
        />
      } @else {
        <div class="grid gap-5 md:grid-cols-2">
          @for (item of filteredPolicies(); track item.policyId) {
            <article class="card-surface flex flex-col justify-between p-6">
              <div>
                <div class="flex items-start justify-between gap-3">
                  <span
                    class="rounded-full px-3 py-1 text-xs font-black"
                    [ngClass]="categoryBadgeClass(item.category)"
                  >
                    {{ categoryLabel(item.category) }}
                  </span>
                  <span class="text-xs font-bold text-slate-400"> #POL-{{ item.policyId }} </span>
                </div>

                <h3 class="mt-4 text-lg font-black text-slate-950">
                  {{ item.title }}
                </h3>

                <p class="mt-3 text-sm leading-6 text-slate-600 whitespace-pre-line">
                  {{ item.content }}
                </p>
              </div>

              <div class="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                <span class="text-xs font-bold text-slate-400">
                  Cập nhật gần nhất: {{ item.updatedAt | date: 'dd/MM/yyyy HH:mm' }}
                </span>
                <span class="text-xs font-bold text-indigo-600"> Đang hiệu lực </span>
              </div>
            </article>
          }
        </div>
      }
    </section>
  `,
})
export class PoliciesViewPage {
  private readonly policyStore = inject(PolicyStoreService)

  protected keyword = ''
  protected categoryFilter = 'all'

  protected filteredPolicies(): Policy[] {
    const kv = validateKeyword(this.keyword)
    const safeKeyword = kv.valid ? kv.trimmed : ''

    return this.policyStore.list().filter((item) => {
      const matchCategory =
        this.categoryFilter === 'all' || item.category === this.categoryFilter
      const matchKeyword = searchIncludes(safeKeyword, item.title, item.content)
      return matchCategory && matchKeyword
    })
  }

  protected categoryLabel(cat: string): string {
    switch (cat) {
      case 'LabRoom':
        return 'Phòng lab'
      case 'Equipment':
        return 'Thiết bị'
      default:
        return 'Nội quy chung'
    }
  }

  protected categoryBadgeClass(cat: string): string {
    switch (cat) {
      case 'LabRoom':
        return 'bg-violet-50 text-violet-700 border border-violet-200'
      case 'Equipment':
        return 'bg-cyan-50 text-cyan-700 border border-cyan-200'
      default:
        return 'bg-amber-50 text-amber-700 border border-amber-200'
    }
  }

  protected resetFilters(): void {
    this.keyword = ''
    this.categoryFilter = 'all'
  }
}
