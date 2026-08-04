import { DatePipe } from '@angular/common'
import { Component, OnInit, computed, inject, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { RouterLink } from '@angular/router'
import { LanguageStore } from '../../core/i18n/language.store'
import { TranslatePipe } from '../../core/i18n/translate.pipe'
import { SystemMaintenanceStore } from '../../core/system/system-maintenance.store'
import { IconComponent } from '../../shared/ui/icon'
import { PageHeaderComponent } from '../../shared/ui/page-header'
import { ToastService } from '../../shared/ui/toast.service'

@Component({
  selector: 'app-admin-system-maintenance-page',
  imports: [FormsModule, RouterLink, IconComponent, PageHeaderComponent, TranslatePipe],
  template: `
    <section class="space-y-6">
      <app-page-header
        [title]="'systemMaintenance.title' | t"
        [subtitle]="'systemMaintenance.subtitle' | t"
      >
        <a routerLink="/app/dashboard" class="btn-secondary">
          <app-icon name="arrow-left" [size]="17" />
          <span>{{ 'common.back' | t }}</span>
        </a>
      </app-page-header>

      <!-- Status Hero Banner -->
      <article
        class="card-surface overflow-hidden border p-6 transition shadow-sm"
        [class]="
          config().enabled
            ? 'border-amber-200 bg-gradient-to-r from-amber-50/70 via-white to-amber-50/30'
            : 'border-emerald-200 bg-gradient-to-r from-emerald-50/50 via-white to-teal-50/20'
        "
      >
        <div class="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex items-center gap-4">
            <div
              class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-md"
              [class]="
                config().enabled
                  ? 'bg-amber-500 text-white shadow-amber-500/20'
                  : 'bg-emerald-500 text-white shadow-emerald-500/20'
              "
            >
              <app-icon [name]="config().enabled ? 'wrench' : 'check-circle'" [size]="28" />
            </div>

            <div>
              <div class="flex items-center gap-2">
                <span
                  class="h-2.5 w-2.5 rounded-full"
                  [class]="config().enabled ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'"
                ></span>
                <strong
                  class="text-xs font-black uppercase tracking-wider"
                  [class]="config().enabled ? 'text-amber-800' : 'text-emerald-800'"
                >
                  {{
                    config().enabled
                      ? ('systemMaintenance.statusActive' | t)
                      : ('systemMaintenance.statusInactive' | t)
                  }}
                </strong>
              </div>

              <h2 class="mt-1 text-xl font-black text-slate-950">
                {{
                  config().enabled
                    ? config().title
                    : ('systemMaintenance.normalOperation' | t)
                }}
              </h2>

              <p class="mt-1 text-xs font-medium text-slate-500">
                {{
                  config().enabled
                    ? ('systemMaintenance.activeImpactNotice' | t)
                    : ('systemMaintenance.inactiveNotice' | t)
                }}
              </p>
            </div>
          </div>

          <!-- Quick Toggle Button -->
          <button
            type="button"
            class="inline-flex h-12 shrink-0 items-center gap-2 rounded-2xl px-6 text-xs font-bold text-white shadow-md transition"
            [class]="
              config().enabled
                ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                : 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
            "
            (click)="toggleMaintenanceMode()"
          >
            <app-icon [name]="config().enabled ? 'power' : 'wrench'" [size]="18" />
            <span>
              {{
                config().enabled
                  ? ('systemMaintenance.turnOff' | t)
                  : ('systemMaintenance.turnOn' | t)
              }}
            </span>
          </button>
        </div>
      </article>

      <!-- Main Form & Quick Presets -->
      <div class="grid gap-6 xl:grid-cols-[1fr_360px]">
        
        <!-- Form: Tạo / Cấu hình lịch bảo trì -->
        <article class="card-surface p-6 sm:p-8 space-y-6">
          <div class="border-b border-slate-100 pb-4">
            <h3 class="text-lg font-black text-slate-950">
              {{ 'systemMaintenance.formHeader' | t }}
            </h3>
            <p class="mt-1 text-xs text-slate-500">
              {{ 'systemMaintenance.formSub' | t }}
            </p>
          </div>

          <form (ngSubmit)="saveSchedule()" class="space-y-5">
            <!-- Tiêu đề VN -->
            <div>
              <label class="field-label">{{ 'systemMaintenance.fieldTitle' | t }}</label>
              <input
                type="text"
                class="input-shell"
                [(ngModel)]="formTitle"
                name="formTitle"
                required
                placeholder="Nâng cấp & Bảo trì hệ thống"
              />
            </div>

            <!-- Tiêu đề EN -->
            <div>
              <label class="field-label">{{ 'systemMaintenance.fieldTitleEn' | t }}</label>
              <input
                type="text"
                class="input-shell"
                [(ngModel)]="formTitleEn"
                name="formTitleEn"
                required
                placeholder="System Maintenance & Upgrade"
              />
            </div>

            <!-- Thời gian bắt đầu & Thời gian dự kiến kết thúc -->
            <div class="grid gap-4 sm:grid-cols-2">
              <div>
                <label class="field-label">{{ 'systemMaintenance.startTime' | t }}</label>
                <input
                  type="datetime-local"
                  class="input-shell"
                  [(ngModel)]="formStartTime"
                  name="formStartTime"
                  required
                />
              </div>

              <div>
                <label class="field-label">{{ 'systemMaintenance.endTime' | t }}</label>
                <input
                  type="datetime-local"
                  class="input-shell"
                  [(ngModel)]="formEndTime"
                  name="formEndTime"
                  required
                />
              </div>
            </div>

            <!-- Mô tả chi tiết VN -->
            <div>
              <label class="field-label">{{ 'systemMaintenance.description' | t }}</label>
              <textarea
                rows="3"
                class="textarea-shell"
                [(ngModel)]="formDescription"
                name="formDescription"
                placeholder="Nội dung bảo trì, lý do và phạm vi ảnh hưởng..."
              ></textarea>
            </div>

            <!-- Mô tả chi tiết EN -->
            <div>
              <label class="field-label">{{ 'systemMaintenance.descriptionEn' | t }}</label>
              <textarea
                rows="3"
                class="textarea-shell"
                [(ngModel)]="formDescriptionEn"
                name="formDescriptionEn"
                placeholder="Maintenance description and scope in English..."
              ></textarea>
            </div>

            <!-- Enable Switch Checkbox -->
            <div class="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 border border-slate-100">
              <input
                type="checkbox"
                id="enableSchedule"
                class="h-5 w-5 rounded-lg border-slate-300 text-cyan-600 focus:ring-cyan-500"
                [(ngModel)]="formEnable"
                name="formEnable"
              />
              <label for="enableSchedule" class="text-xs font-bold text-slate-800 cursor-pointer">
                {{ 'systemMaintenance.activateImmediately' | t }}
              </label>
            </div>

            <!-- Submit Button -->
            <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="submit"
                class="btn-primary inline-flex h-11 items-center gap-2 px-6 shadow-md"
              >
                <app-icon name="save" [size]="17" />
                <span>{{ 'systemMaintenance.saveBtn' | t }}</span>
              </button>
            </div>
          </form>
        </article>

        <!-- Sidebar: Quick Presets & Guidance -->
        <div class="space-y-6">
          
          <!-- Quick Presets -->
          <article class="card-surface p-6 space-y-4">
            <h4 class="text-sm font-black text-slate-900 flex items-center gap-2">
              <app-icon name="zap" [size]="16" class="text-amber-500" />
              <span>{{ 'systemMaintenance.presetsTitle' | t }}</span>
            </h4>

            <p class="text-xs text-slate-500">
              {{ 'systemMaintenance.presetsSub' | t }}
            </p>

            <div class="space-y-2">
              <button
                type="button"
                class="w-full flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-xs font-bold text-slate-700 transition hover:border-cyan-400 hover:bg-cyan-50/50"
                (click)="applyPreset(1)"
              >
                <span>+1 {{ 'systemMaintenance.hourEmergency' | t }}</span>
                <app-icon name="clock" [size]="15" class="text-slate-400" />
              </button>

              <button
                type="button"
                class="w-full flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-xs font-bold text-slate-700 transition hover:border-cyan-400 hover:bg-cyan-50/50"
                (click)="applyPreset(4)"
              >
                <span>+4 {{ 'systemMaintenance.hoursScheduled' | t }}</span>
                <app-icon name="clock" [size]="15" class="text-slate-400" />
              </button>

              <button
                type="button"
                class="w-full flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-xs font-bold text-slate-700 transition hover:border-cyan-400 hover:bg-cyan-50/50"
                (click)="applyOvernightPreset()"
              >
                <span>{{ 'systemMaintenance.overnightPreset' | t }}</span>
                <app-icon name="moon" [size]="15" class="text-slate-400" />
              </button>
            </div>
          </article>

          <!-- System Guidance Card -->
          <article class="card-surface p-6 bg-slate-900 text-slate-200 space-y-3">
            <h4 class="text-sm font-black text-white flex items-center gap-2">
              <app-icon name="shield" [size]="16" class="text-cyan-400" />
              <span>{{ 'systemMaintenance.adminRulesTitle' | t }}</span>
            </h4>
            <ul class="list-disc pl-4 text-xs space-y-2 text-slate-400 leading-relaxed">
              <li>{{ 'systemMaintenance.adminRule1' | t }}</li>
              <li>{{ 'systemMaintenance.adminRule2' | t }}</li>
              <li>{{ 'systemMaintenance.adminRule3' | t }}</li>
            </ul>
          </article>

        </div>

      </div>
    </section>
  `,
})
export class AdminSystemMaintenancePage implements OnInit {
  protected readonly languageStore = inject(LanguageStore)
  protected readonly maintenanceStore = inject(SystemMaintenanceStore)
  private readonly toast = inject(ToastService)

  protected readonly config = computed(() => this.maintenanceStore.config())

  protected formTitle = ''
  protected formTitleEn = ''
  protected formStartTime = ''
  protected formEndTime = ''
  protected formDescription = ''
  protected formDescriptionEn = ''
  protected formEnable = false

  ngOnInit(): void {
    this.populateForm()
  }

  private populateForm(): void {
    const cfg = this.config()
    this.formTitle = cfg.title
    this.formTitleEn = cfg.titleEn
    this.formStartTime = this.formatDatetimeInput(new Date(cfg.startTime))
    this.formEndTime = this.formatDatetimeInput(new Date(cfg.endTime))
    this.formDescription = cfg.description
    this.formDescriptionEn = cfg.descriptionEn
    this.formEnable = cfg.enabled
  }

  private formatDatetimeInput(d: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0')
    const yyyy = d.getFullYear()
    const MM = pad(d.getMonth() + 1)
    const dd = pad(d.getDate())
    const hh = pad(d.getHours())
    const mm = pad(d.getMinutes())
    return `${yyyy}-${MM}-${dd}T${hh}:${mm}`
  }

  protected applyPreset(hours: number): void {
    const now = new Date()
    const end = new Date(now.getTime() + hours * 3600 * 1000)
    this.formStartTime = this.formatDatetimeInput(now)
    this.formEndTime = this.formatDatetimeInput(end)
    this.toast.info('Đã áp dụng mẫu thời gian', `Bảo trì trong ${hours} giờ tới.`)
  }

  protected applyOvernightPreset(): void {
    const now = new Date()
    const start = new Date(now)
    start.setHours(22, 0, 0, 0)
    const end = new Date(now)
    end.setDate(end.getDate() + 1)
    end.setHours(6, 0, 0, 0)

    this.formStartTime = this.formatDatetimeInput(start)
    this.formEndTime = this.formatDatetimeInput(end)
    this.toast.info('Đã áp dụng mẫu bảo trì đêm', 'Thời gian: 22:00 hôm nay – 06:00 sáng mai.')
  }

  protected saveSchedule(): void {
    if (!this.formTitle || !this.formStartTime || !this.formEndTime) {
      this.toast.error('Thiếu thông tin', 'Vui lòng nhập đầy đủ tiêu đề và thời gian bảo trì.')
      return
    }

    const startISO = new Date(this.formStartTime).toISOString()
    const endISO = new Date(this.formEndTime).toISOString()

    this.maintenanceStore.updateConfig({
      title: this.formTitle,
      titleEn: this.formTitleEn || this.formTitle,
      startTime: startISO,
      endTime: endISO,
      description: this.formDescription,
      descriptionEn: this.formDescriptionEn || this.formDescription,
      enabled: this.formEnable,
    })

    this.toast.success(
      'Cập nhật thành công',
      this.formEnable
        ? 'Lịch bảo trì hệ thống đã kích hoạt. Người dùng Requester & Manager sẽ được trỏ về trang thông báo bảo trì.'
        : 'Đã lưu lịch bảo trì hệ thống.',
    )
  }

  protected toggleMaintenanceMode(): void {
    const newState = this.maintenanceStore.toggleMaintenance()
    this.formEnable = newState
    if (newState) {
      this.toast.info(
        'Đã BẬT bảo trì hệ thống',
        'Các tài khoản Requester và Manager sẽ bị chặn truy cập và trỏ về trang thông báo bảo trì.',
      )
    } else {
      this.toast.success('Đã TẮT bảo trì hệ thống', 'Hệ thống hoạt động bình thường trở lại.')
    }
  }
}
