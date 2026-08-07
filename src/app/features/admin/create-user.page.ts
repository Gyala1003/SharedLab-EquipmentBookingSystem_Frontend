import { NgClass } from '@angular/common'
import { Component, OnInit, computed, inject, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { Router, RouterLink } from '@angular/router'
import { SystemService } from '../../core/api/system.service'
import type { DepartmentResponse, RoleResponse } from '../../core/api/system.models'
import { IconComponent } from '../../shared/ui/icon'
import { PageHeaderComponent } from '../../shared/ui/page-header'
import { ToastService } from '../../shared/ui/toast.service'
import { labelOf } from '../../shared/utils/presentation'

@Component({
  selector: 'app-create-user-page',
  imports: [NgClass, FormsModule, RouterLink, PageHeaderComponent, IconComponent],
  template: `
    <section class="space-y-6">
      <app-page-header title="Tạo tài khoản mới" subtitle="Cấp tài khoản, vai trò và đơn vị công tác cho thành viên của hệ thống.">
        <a routerLink="/app/admin/users" class="btn-secondary"><app-icon name="arrow-left" [size]="17" /> Danh sách người dùng</a>
      </app-page-header>

      <div class="grid gap-6 xl:grid-cols-[1.3fr_.7fr]">
        <form class="card-surface overflow-hidden" (ngSubmit)="submit()">
          <div class="border-b border-slate-100 bg-gradient-to-r from-violet-50/80 to-cyan-50/60 px-6 py-5"><h2 class="font-black text-slate-950">Thông tin tài khoản</h2><p class="mt-1 text-xs leading-5 text-slate-500">Các trường có dấu * là bắt buộc. Username và email phải duy nhất.</p></div>
          <div class="grid gap-5 p-6 md:grid-cols-2">
            <div class="md:col-span-2"><label class="field-label">Họ và tên *</label><input class="input-shell" required minlength="2" [(ngModel)]="fullName" name="fullName" placeholder="Nguyễn Văn An" autocomplete="name" /></div>
            <div><label class="field-label">Username *</label><input class="input-shell" required minlength="3" [(ngModel)]="username" name="username" placeholder="nguyenvanan" autocomplete="username" /></div>
            <div><label class="field-label">Email *</label><input class="input-shell" required type="email" [(ngModel)]="email" name="email" placeholder="an@example.edu.vn" autocomplete="email" /></div>
            <div><label class="field-label">Vai trò *</label><select class="input-shell" required [(ngModel)]="role" name="role"><option [ngValue]="null">Chọn vai trò</option>@for (role of roles(); track role.roleId) { <option [ngValue]="role.roleId">{{ roleLabel(role.roleName) }}</option> }</select></div>
            <div><label class="field-label">Khoa/phòng ban *</label><select class="input-shell" required [(ngModel)]="departmentId" name="departmentId"><option [ngValue]="null">Chọn đơn vị</option>@for (department of departments(); track department.departmentId) { <option [ngValue]="department.departmentId">{{ department.departmentName }}</option> }</select></div>
            <div class="md:col-span-2">
              <label class="field-label">Mật khẩu ban đầu *</label>
              <div class="relative">
                <input class="input-shell pr-12" required minlength="8" [type]="showPassword() ? 'text' : 'password'" [(ngModel)]="password" name="password" placeholder="Tối thiểu 8 ký tự (chữ hoa, chữ thường, số)" autocomplete="new-password" />
                <button type="button" class="absolute right-3 top-3 rounded-lg p-1 text-slate-400 hover:bg-slate-100" (click)="showPassword.update((value) => !value)"><app-icon [name]="showPassword() ? 'eye-off' : 'eye'" [size]="18" /></button>
              </div>
              <div class="mt-3 flex gap-1.5">@for (level of [1,2,3,4]; track level) { <span class="h-1.5 flex-1 rounded-full" [ngClass]="passwordScore() >= level ? scoreClass() : 'bg-slate-100'"></span> }</div>
              <p class="mt-2 text-xs font-bold" [ngClass]="passwordScore() >= 3 ? 'text-emerald-600' : 'text-slate-400'">{{ passwordMessage() }}</p>

              <div class="mt-3.5 rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5">
                <p class="text-xs font-bold text-slate-700">Yêu cầu về mật khẩu:</p>
                <div class="mt-2.5 grid gap-2 sm:grid-cols-2">
                  @for (rule of passwordRules(); track rule.key) {
                    <div class="flex items-center gap-2 text-xs font-medium" [ngClass]="rule.ok ? 'text-emerald-700' : 'text-slate-500'">
                      <span class="flex h-4 w-4 shrink-0 items-center justify-center rounded-full" [ngClass]="rule.ok ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400'">
                        <app-icon [name]="rule.ok ? 'check' : 'x'" [size]="11" />
                      </span>
                      <span>{{ rule.label }}</span>
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>
          <div class="flex flex-wrap justify-end gap-2 border-t border-slate-100 bg-slate-50/70 px-6 py-5"><a routerLink="/app/admin/users" class="btn-secondary">Hủy</a><button class="btn-primary" [disabled]="saving() || !isValid()"><app-icon name="user-plus" [size]="17" /> {{ saving() ? 'Đang tạo...' : 'Tạo tài khoản' }}</button></div>
        </form>

        <aside class="space-y-5">
          <article class="relative overflow-hidden rounded-[28px] bg-[#111a3a] p-6 text-white shadow-2xl shadow-indigo-950/15"><div class="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-violet-500/30 blur-2xl"></div><div class="relative"><span class="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-cyan-300"><app-icon name="shield" [size]="23" /></span><h2 class="mt-5 text-lg font-black">Phân quyền an toàn</h2><p class="mt-2 text-sm leading-6 text-white/60">Admin có toàn quyền; LabManager chỉ quản lý tài nguyên được phân công; Requester sử dụng luồng đặt lịch cá nhân.</p></div></article>
          <article class="card-surface p-6"><h3 class="font-black text-slate-900">Checklist trước khi tạo</h3><div class="mt-5 space-y-4">@for (item of checklist(); track item.label) { <div class="flex items-start gap-3"><span class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full" [ngClass]="item.ok ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'"><app-icon [name]="item.ok ? 'check' : 'clock'" [size]="14" /></span><p class="text-sm font-semibold text-slate-600">{{ item.label }}</p></div> }</div></article>
        </aside>
      </div>
    </section>
  `,
})
export class CreateUserPage implements OnInit {
  private readonly api = inject(SystemService)
  private readonly router = inject(Router)
  private readonly toast = inject(ToastService)
  protected readonly departments = signal<DepartmentResponse[]>([])
  protected readonly roles = signal<RoleResponse[]>([])
  protected readonly saving = signal(false)
  protected readonly showPassword = signal(false)
  protected readonly fullName = signal('')
  protected readonly username = signal('')
  protected readonly email = signal('')
  protected readonly password = signal('')
  protected readonly departmentId = signal<number | null>(null)
  protected readonly role = signal<number | null>(null)

  protected readonly passwordRules = computed(() => {
    const pwd = this.password()
    return [
      { key: 'minLength', label: 'Tối thiểu 8 ký tự', ok: pwd.length >= 8 },
      { key: 'uppercase', label: 'Chữ cái viết hoa (A-Z)', ok: /[A-Z]/.test(pwd) },
      { key: 'lowercase', label: 'Chữ cái viết thường (a-z)', ok: /[a-z]/.test(pwd) },
      { key: 'digit', label: 'Chữ số (0-9)', ok: /\d/.test(pwd) },
    ]
  })
  protected readonly isPasswordValid = computed(() => this.passwordRules().every((rule) => rule.ok))

  protected readonly passwordScore = computed(() => {
    const pwd = this.password()
    if (!pwd) return 0
    let score = 0
    if (pwd.length >= 8) score++
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++
    if (/\d/.test(pwd)) score++
    if (/[^A-Za-z0-9]/.test(pwd)) score++
    return score
  })
  protected readonly passwordMessage = computed(() => ['Nhập mật khẩu để kiểm tra', 'Mật khẩu còn yếu', 'Mật khẩu trung bình', 'Mật khẩu tốt', 'Mật khẩu mạnh'][this.passwordScore()])
  protected readonly checklist = computed(() => [
    { label: 'Họ tên và username hợp lệ', ok: this.fullName().trim().length >= 2 && this.username().trim().length >= 3 },
    { label: 'Email đúng định dạng', ok: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email().trim()) },
    { label: 'Đã chọn vai trò và đơn vị', ok: this.role() !== null && this.departmentId() !== null },
    { label: 'Mật khẩu đủ 8 ký tự (chữ hoa, chữ thường, số)', ok: this.isPasswordValid() },
  ])

  ngOnInit(): void {
    this.api.departments(true).subscribe({ next: (items) => this.departments.set(items), error: () => this.toast.error('Không tải được khoa/phòng ban') })
    this.api.roles().subscribe({ next: (items) => this.roles.set(items), error: () => this.toast.error('Không tải được danh sách vai trò') })
  }

  protected roleLabel(role: string): string { return labelOf('userRole', role) }
  protected scoreClass(): string { const score = this.passwordScore(); return score >= 4 ? 'bg-emerald-500' : score >= 3 ? 'bg-cyan-500' : score >= 2 ? 'bg-amber-400' : 'bg-rose-400' }
  protected isValid(): boolean { return this.checklist().every((item) => item.ok) }

  protected submit(): void {
    if (!this.isValid() || this.departmentId() === null || this.role() === null) { this.toast.info('Vui lòng hoàn thiện đầy đủ thông tin'); return }
    this.saving.set(true)
    this.api.createUser({ fullName: this.fullName().trim(), username: this.username().trim(), email: this.email().trim(), password: this.password(), departmentId: this.departmentId()!, role: this.role()! }).subscribe({
      next: () => { this.saving.set(false); this.toast.success('Đã tạo tài khoản mới'); void this.router.navigate(['/app/admin/users']) },
      error: (err: any) => {
        this.saving.set(false)
        const msg = err?.error?.message || (typeof err?.error === 'string' ? err.error : null) || err?.message || 'Username hoặc email có thể đã được sử dụng.'
        this.toast.error('Không thể tạo tài khoản', msg)
      },
    })
  }
}
