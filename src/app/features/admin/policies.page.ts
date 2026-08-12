import { DatePipe, NgClass } from '@angular/common'
import { Component, OnInit, inject, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { Policy, PolicyStoreService } from '../../core/state/policy.store'
import { DataStateComponent } from '../../shared/ui/data-state'
import { IconComponent } from '../../shared/ui/icon'
import { ModalComponent } from '../../shared/ui/modal'
import { PageHeaderComponent } from '../../shared/ui/page-header'
import { ToastService } from '../../shared/ui/toast.service'
import { searchIncludes, validateKeyword } from '../../shared/utils/search'

@Component({
  selector: 'app-policies-page',
  imports: [
    DatePipe,
    NgClass,
    FormsModule,
    PageHeaderComponent,
    IconComponent,
    ModalComponent,
    DataStateComponent,
  ],
  template: `
    <section class="space-y-6">
      <app-page-header
        title="Chính sách & Nội quy"
        subtitle="Quản lý quy định sử dụng phòng thí nghiệm, thiết bị và nội quy chung trong hệ thống."
      >
        <button class="btn-primary" type="button" (click)="openCreate()">
          <app-icon name="plus" [size]="17" /> Thêm chính sách
        </button>
      </app-page-header>

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
                  Cập nhật: {{ item.updatedAt | date: 'dd/MM/yyyy HH:mm' }}
                </span>
                <div class="flex gap-2">
                  <button
                    type="button"
                    class="rounded-xl p-2 text-slate-400 hover:bg-violet-50 hover:text-violet-600"
                    title="Chỉnh sửa"
                    (click)="openEdit(item)"
                  >
                    <app-icon name="edit" [size]="17" />
                  </button>
                  <button
                    type="button"
                    class="rounded-xl p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                    title="Xóa"
                    (click)="confirmDelete(item)"
                  >
                    <app-icon name="trash" [size]="17" />
                  </button>
                </div>
              </div>
            </article>
          }
        </div>
      }

      <!-- Modal Create/Edit -->
      <app-modal
        [open]="formOpen()"
        [title]="editingId() ? 'Chỉnh sửa chính sách' : 'Thêm chính sách mới'"
        subtitle="Quy định sẽ được hiển thị cho tất cả thành viên trong hệ thống."
        (close)="formOpen.set(false)"
      >
        <form class="space-y-4" (ngSubmit)="save()">
          <div>
            <label class="field-label">Tiêu đề chính sách *</label>
            <input
              class="input-shell"
              required
              maxlength="150"
              [(ngModel)]="form.title"
              name="title"
              placeholder="Quy định Check-in & Check-out..."
            />
          </div>

          <div>
            <label class="field-label">Danh mục *</label>
            <select class="input-shell" [(ngModel)]="form.category" name="category">
              <option value="LabRoom">Phòng lab</option>
              <option value="Equipment">Thiết bị</option>
              <option value="General">Nội quy chung</option>
            </select>
          </div>

          <div>
            <label class="field-label">Nội dung chi tiết *</label>
            <textarea
              class="textarea-shell min-h-36"
              required
              maxlength="1000"
              [(ngModel)]="form.content"
              name="content"
              placeholder="Nhập nội dung quy định chi tiết..."
            ></textarea>
            <p class="mt-2 text-right text-[11px] font-bold text-slate-400">
              {{ form.content.length }}/1000
            </p>
          </div>

          <div class="flex justify-end gap-2 pt-2">
            <button type="button" class="btn-secondary" (click)="formOpen.set(false)">Hủy</button>
            <button
              class="btn-primary"
              [disabled]="!form.title.trim() || !form.content.trim()"
            >
              {{ editingId() ? 'Lưu thay đổi' : 'Tạo chính sách' }}
            </button>
          </div>
        </form>
      </app-modal>

      <!-- Modal Delete Confirmation -->
      <app-modal
        [open]="deleteTarget() !== null"
        title="Xác nhận xóa chính sách"
        [subtitle]="'Bạn có chắc chắn muốn xóa chính sách “' + deleteTarget()?.title + '”?'"
        width="500px"
        (close)="deleteTarget.set(null)"
      >
        <div class="flex justify-end gap-2 pt-2">
          <button class="btn-secondary" (click)="deleteTarget.set(null)">Quay lại</button>
          <button class="btn-primary bg-rose-600 hover:bg-rose-700" (click)="doDelete()">
            Xóa chính sách
          </button>
        </div>
      </app-modal>
    </section>
  `,
})
export class PoliciesPage implements OnInit {
  private readonly policyStore = inject(PolicyStoreService)
  private readonly toast = inject(ToastService)

  protected keyword = ''
  protected categoryFilter = 'all'
  protected readonly formOpen = signal(false)
  protected readonly editingId = signal<number | null>(null)
  protected readonly deleteTarget = signal<Policy | null>(null)

  protected form = {
    title: '',
    category: 'LabRoom' as 'LabRoom' | 'Equipment' | 'General',
    content: '',
  }

  ngOnInit(): void {}

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

  protected openCreate(): void {
    this.editingId.set(null)
    this.form = { title: '', category: 'LabRoom', content: '' }
    this.formOpen.set(true)
  }

  protected openEdit(item: Policy): void {
    this.editingId.set(item.policyId)
    this.form = { title: item.title, category: item.category, content: item.content }
    this.formOpen.set(true)
  }

  protected confirmDelete(item: Policy): void {
    this.deleteTarget.set(item)
  }

  protected save(): void {
    if (!this.form.title.trim() || !this.form.content.trim()) {
      this.toast.info('Vui lòng nhập đầy đủ tiêu đề và nội dung chính sách')
      return
    }

    if (this.editingId()) {
      this.policyStore.update(this.editingId()!, {
        title: this.form.title.trim(),
        category: this.form.category,
        content: this.form.content.trim(),
      })
      this.toast.success('Đã cập nhật chính sách')
    } else {
      this.policyStore.create({
        title: this.form.title.trim(),
        category: this.form.category,
        content: this.form.content.trim(),
      })
      this.toast.success('Đã tạo chính sách mới')
    }
    this.formOpen.set(false)
  }

  protected doDelete(): void {
    const item = this.deleteTarget()
    if (item) {
      this.policyStore.remove(item.policyId)
      this.toast.success('Đã xóa chính sách')
      this.deleteTarget.set(null)
    }
  }
}
