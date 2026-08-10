import { NgClass } from '@angular/common'
import {
  Component,
  ElementRef,
  HostListener,
  Input,
  Output,
  EventEmitter,
  forwardRef,
  signal,
  computed,
  inject,
} from '@angular/core'
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms'
import { IconComponent } from './icon'
import { TranslatePipe } from '../../core/i18n/translate.pipe'

export interface SelectOption {
  value: any
  label: string
  code?: string
  sublabel?: string
}

@Component({
  selector: 'app-searchable-select',
  standalone: true,
  imports: [FormsModule, IconComponent, TranslatePipe],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SearchableSelectComponent),
      multi: true,
    },
  ],
  template: `
    <div class="relative w-full">
      <!-- Trigger Button -->
      <button
        type="button"
        [disabled]="disabled"
        class="input-shell flex h-11 w-full items-center justify-between text-left transition focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
        [class.border-blue-500]="isOpen()"
        [class.ring-2]="isOpen()"
        [class.ring-blue-500/20]="isOpen()"
        (click)="toggleOpen()"
      >
        <span class="min-w-0 flex-1 truncate" [class.text-slate-400]="selectedOption() === null">
          @if (selectedOption(); as opt) {
            <span class="font-medium text-slate-800">{{ opt.label | t }}</span>
            @if (opt.code) {
              <span
                class="ml-1.5 rounded border border-blue-200/60 bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-blue-700"
              >
                {{ opt.code }}
              </span>
            }
          } @else {
            {{ placeholder | t }}
          }
        </span>
        <app-icon
          name="chevron-down"
          [size]="16"
          class="ml-2 shrink-0 text-slate-400 transition-transform duration-200"
          [class.rotate-180]="isOpen()"
        />
      </button>

      <!-- Dropdown Popover -->
      @if (isOpen()) {
        <div
          class="animate-in fade-in zoom-in-95 absolute top-full left-0 z-50 mt-1.5 w-full min-w-[240px] rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-900/15 backdrop-blur-xl duration-150"
        >
          <!-- Search input -->
          <div class="relative mb-2">
            <span
              class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400"
            >
              <app-icon name="search" [size]="15" />
            </span>
            <input
              type="text"
              [ngModel]="searchQuery()"
              (ngModelChange)="searchQuery.set($event)"
              placeholder="{{ searchPlaceholder | t }}"
              class="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 pr-8 pl-9 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none"
              (click)="$event.stopPropagation()"
            />
            @if (searchQuery()) {
              <button
                type="button"
                class="absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400 hover:text-slate-600"
                (click)="searchQuery.set(''); $event.stopPropagation()"
              >
                <app-icon name="x" [size]="14" />
              </button>
            }
          </div>

          <!-- Options list -->
          <div class="max-h-60 [scrollbar-width:thin] space-y-0.5 overflow-y-auto">
            @if (allowNull) {
              <button
                type="button"
                class="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs transition"
                [class.bg-blue-50]="val() === null"
                [class.text-blue-700]="val() === null"
                [class.font-bold]="val() === null"
                [class.text-slate-700]="val() !== null"
                [class.hover:bg-slate-50]="val() !== null"
                (click)="select(null)"
              >
                <span>{{ placeholder | t }}</span>
                @if (val() === null) {
                  <app-icon name="check" [size]="15" class="text-blue-600" />
                }
              </button>
            }

            @for (opt of filteredOptions(); track opt.value) {
              <button
                type="button"
                class="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition"
                [class.bg-blue-50]="isSelected(opt.value)"
                [class.text-blue-700]="isSelected(opt.value)"
                [class.font-bold]="isSelected(opt.value)"
                [class.text-slate-700]="!isSelected(opt.value)"
                [class.hover:bg-slate-50]="!isSelected(opt.value)"
                (click)="select(opt.value)"
              >
                <div class="min-w-0 flex-1 truncate">
                  <span class="font-medium text-slate-800">{{ opt.label | t }}</span>
                  @if (opt.sublabel) {
                    <span class="ml-1 text-[11px] text-slate-400">({{ opt.sublabel | t }})</span>
                  }
                </div>
                <div class="ml-2 flex shrink-0 items-center gap-1.5">
                  @if (opt.code) {
                    <span
                      class="rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500"
                    >
                      {{ opt.code }}
                    </span>
                  }
                  @if (isSelected(opt.value)) {
                    <app-icon name="check" [size]="15" class="text-blue-600" />
                  }
                </div>
              </button>
            }

            @if (filteredOptions().length === 0 && (!allowNull || searchQuery())) {
              <div class="px-3 py-4 text-center text-xs text-slate-400">
                {{ 'common.noData' | t }}
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class SearchableSelectComponent implements ControlValueAccessor {
  private readonly elementRef = inject(ElementRef)

  @Input() options: SelectOption[] = []
  @Input() placeholder = 'common.all'
  @Input() searchPlaceholder = 'common.search'
  @Input() allowNull = true
  @Input() disabled = false

  @Output() selectionChange = new EventEmitter<any>()

  protected readonly isOpen = signal(false)
  protected readonly val = signal<any>(null)
  protected readonly searchQuery = signal('')

  protected readonly selectedOption = computed(() => {
    const v = this.val()
    if (v === null || v === undefined) return null
    return this.options.find((opt) => opt.value === v) ?? null
  })

  protected readonly filteredOptions = computed(() => {
    const q = this.searchQuery().trim().toLowerCase()
    if (!q) return this.options
    return this.options.filter((opt) => {
      const matchLabel = opt.label?.toLowerCase().includes(q)
      const matchCode = opt.code?.toLowerCase().includes(q)
      const matchSub = opt.sublabel?.toLowerCase().includes(q)
      return matchLabel || matchCode || matchSub
    })
  })

  private onChange: (val: any) => void = () => {}
  private onTouched: () => void = () => {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false)
    }
  }

  toggleOpen(): void {
    if (this.disabled) return
    const nextState = !this.isOpen()
    this.isOpen.set(nextState)
    if (nextState) {
      this.searchQuery.set('')
    }
  }

  select(value: any): void {
    this.val.set(value)
    this.onChange(value)
    this.onTouched()
    this.selectionChange.emit(value)
    this.isOpen.set(false)
  }

  isSelected(value: any): boolean {
    return this.val() === value
  }

  // ControlValueAccessor methods
  writeValue(value: any): void {
    this.val.set(value)
  }

  registerOnChange(fn: any): void {
    this.onChange = fn
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled
  }
}
