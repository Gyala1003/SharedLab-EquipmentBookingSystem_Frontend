import { Component, HostListener, Injectable, inject, signal } from '@angular/core'
import { IconComponent } from './icon'

export type ConfirmDialogKind = 'primary' | 'danger' | 'warning'

export interface ConfirmDialogOptions {
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  kind?: ConfirmDialogKind
}

interface InternalConfirmState {
  open: boolean
  title: string
  message: string
  confirmText: string
  cancelText: string
  kind: ConfirmDialogKind
  resolve?: (value: boolean) => void
}

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  private readonly _state = signal<InternalConfirmState>({
    open: false,
    title: 'Xác nhận',
    message: '',
    confirmText: 'Xác nhận',
    cancelText: 'Hủy',
    kind: 'primary',
  })

  readonly state = this._state.asReadonly()

  open(options: ConfirmDialogOptions | string): Promise<boolean> {
    return new Promise((resolve) => {
      const opts: ConfirmDialogOptions =
        typeof options === 'string' ? { message: options } : options

      const msgLower = (opts.message || '').toLowerCase()
      const isDanger =
        opts.kind === 'danger' ||
        msgLower.includes('hủy') ||
        msgLower.includes('xóa') ||
        msgLower.includes('ngừng') ||
        msgLower.includes('không đến')

      const isWarning = opts.kind === 'warning' || msgLower.includes('hết hạn')

      let defaultKind: ConfirmDialogKind = 'primary'
      if (isDanger) defaultKind = 'danger'
      else if (isWarning) defaultKind = 'warning'

      this._state.set({
        open: true,
        title: opts.title ?? 'Xác nhận hành động',
        message: opts.message,
        confirmText: opts.confirmText ?? 'Xác nhận',
        cancelText: opts.cancelText ?? 'Hủy',
        kind: opts.kind ?? defaultKind,
        resolve,
      })
    })
  }

  confirm(): void {
    const currentState = this._state()
    if (currentState.resolve) {
      currentState.resolve(true)
    }
    this.close()
  }

  cancel(): void {
    const currentState = this._state()
    if (currentState.resolve) {
      currentState.resolve(false)
    }
    this.close()
  }

  private close(): void {
    this._state.update((s) => ({ ...s, open: false, resolve: undefined }))
  }
}

@Component({
  selector: 'app-confirm-dialog-outlet',
  imports: [IconComponent],
  template: `
    @if (service.state().open) {
      <div
        class="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6"
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          class="absolute inset-0 bg-slate-950/50 backdrop-blur-sm transition-opacity"
          aria-label="Đóng"
          (click)="service.cancel()"
        ></button>
        <div
          class="relative z-10 w-full max-w-md animate-in fade-in zoom-in-95 duration-150 overflow-hidden rounded-[28px] border border-white/60 bg-white p-6 shadow-2xl sm:p-7"
        >
          <div class="flex items-start gap-4">
            <div
              class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
              [class.bg-rose-50]="service.state().kind === 'danger'"
              [class.text-rose-600]="service.state().kind === 'danger'"
              [class.bg-amber-50]="service.state().kind === 'warning'"
              [class.text-amber-600]="service.state().kind === 'warning'"
              [class.bg-violet-50]="service.state().kind === 'primary'"
              [class.text-violet-600]="service.state().kind === 'primary'"
            >
              @if (service.state().kind === 'danger') {
                <app-icon name="trash" [size]="22" />
              } @else if (service.state().kind === 'warning') {
                <app-icon name="alert" [size]="22" />
              } @else {
                <app-icon name="check" [size]="22" />
              }
            </div>

            <div class="min-w-0 flex-1">
              <h3 class="text-lg font-black text-slate-950">
                {{ service.state().title }}
              </h3>
              <p class="mt-2 text-sm leading-6 text-slate-600">
                {{ service.state().message }}
              </p>
            </div>
          </div>

          <div class="mt-7 flex items-center justify-end gap-3">
            <button
              type="button"
              class="btn-secondary h-10 rounded-full px-5 text-sm font-bold"
              (click)="service.cancel()"
            >
              {{ service.state().cancelText }}
            </button>
            <button
              type="button"
              class="h-10 rounded-full px-5 text-sm font-bold text-white shadow-lg transition active:scale-[0.98]"
              [class.bg-rose-600]="service.state().kind === 'danger'"
              [class.hover:bg-rose-700]="service.state().kind === 'danger'"
              [class.shadow-rose-600\/25]="service.state().kind === 'danger'"
              [class.bg-amber-600]="service.state().kind === 'warning'"
              [class.hover:bg-amber-700]="service.state().kind === 'warning'"
              [class.shadow-amber-600\/25]="service.state().kind === 'warning'"
              [class.bg-linear-to-r]="service.state().kind === 'primary'"
              [class.from-violet-600]="service.state().kind === 'primary'"
              [class.to-indigo-600]="service.state().kind === 'primary'"
              [class.hover:from-violet-700]="service.state().kind === 'primary'"
              [class.hover:to-indigo-700]="service.state().kind === 'primary'"
              [class.shadow-violet-600\/25]="service.state().kind === 'primary'"
              (click)="service.confirm()"
            >
              {{ service.state().confirmText }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ConfirmDialogOutletComponent {
  protected readonly service = inject(ConfirmDialogService)

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.service.state().open) {
      this.service.cancel()
    }
  }

  @HostListener('document:keydown.enter')
  onEnter(): void {
    if (this.service.state().open) {
      this.service.confirm()
    }
  }
}
