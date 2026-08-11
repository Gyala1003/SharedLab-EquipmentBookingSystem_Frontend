import { Component, Injectable, inject, signal } from '@angular/core'
import { NgClass } from '@angular/common'
import { ModalComponent } from './modal'
import { IconComponent } from './icon'
import { LanguageStore } from '../../core/i18n/language.store'

export interface ConfirmOptions {
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'primary'
}

interface ConfirmState extends ConfirmOptions {
  open: boolean
  resolve: (value: boolean) => void
}

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  readonly state = signal<ConfirmState | null>(null)

  confirm(options: string | ConfirmOptions): Promise<boolean> {
    const opts: ConfirmOptions = typeof options === 'string' ? { message: options } : options
    return new Promise<boolean>((resolve) => {
      this.state.set({
        title: opts.title,
        message: opts.message,
        confirmText: opts.confirmText,
        cancelText: opts.cancelText,
        variant: opts.variant || 'primary',
        open: true,
        resolve,
      })
    })
  }

  handleResult(result: boolean): void {
    const current = this.state()
    if (current) {
      current.resolve(result)
      this.state.set(null)
    }
  }
}

@Component({
  selector: 'app-confirm-dialog-outlet',
  imports: [NgClass, ModalComponent, IconComponent],
  template: `
    @if (service.state(); as st) {
      <app-modal
        [open]="st.open"
        [title]="st.title || (lang.isEn() ? 'Confirm Action' : 'Xác nhận thao tác')"
        (close)="service.handleResult(false)"
      >
        <div class="space-y-6">
          <div class="flex items-start gap-4">
            <div
              class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
              [ngClass]="{
                'bg-rose-100 text-rose-600': st.variant === 'danger',
                'bg-amber-100 text-amber-600': st.variant === 'warning',
                'bg-indigo-100 text-indigo-600': st.variant === 'primary' || !st.variant
              }"
            >
              <app-icon
                [name]="st.variant === 'danger' ? 'trash' : st.variant === 'warning' ? 'alert-triangle' : 'help-circle'"
                [size]="24"
              />
            </div>
            <div class="pt-1">
              <p class="text-base font-semibold leading-6 text-slate-900">
                {{ st.message }}
              </p>
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-2">
            <button
              type="button"
              class="btn-secondary"
              (click)="service.handleResult(false)"
            >
              {{ st.cancelText || (lang.isEn() ? 'Cancel' : 'Hủy bỏ') }}
            </button>
            <button
              type="button"
              class="btn-primary"
              [ngClass]="{
                'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20': st.variant === 'danger',
                'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20': st.variant === 'warning'
              }"
              (click)="service.handleResult(true)"
            >
              {{ st.confirmText || (lang.isEn() ? 'Confirm' : 'Xác nhận') }}
            </button>
          </div>
        </div>
      </app-modal>
    }
  `,
})
export class ConfirmDialogOutletComponent {
  protected readonly service = inject(ConfirmDialogService)
  protected readonly lang = inject(LanguageStore)
}
