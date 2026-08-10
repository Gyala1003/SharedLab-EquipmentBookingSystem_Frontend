import { DatePipe } from '@angular/common'
import { Component, OnInit, inject, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { RouterLink } from '@angular/router'
import { catchError, forkJoin, of, from } from 'rxjs'
import { mergeMap, toArray } from 'rxjs/operators'
import { SystemService } from '../../core/api/system.service'
import type { BookingResponse } from '../../core/api/system.models'
import { AuthStore } from '../../core/auth/auth.store'
import { LanguageStore } from '../../core/i18n/language.store'
import { TranslatePipe } from '../../core/i18n/translate.pipe'
import { DataStateComponent } from '../../shared/ui/data-state'
import { IconComponent } from '../../shared/ui/icon'
import { ModalComponent } from '../../shared/ui/modal'
import { PageHeaderComponent } from '../../shared/ui/page-header'
import { ToastService } from '../../shared/ui/toast.service'
import { labelOf } from '../../shared/utils/presentation'

@Component({
  selector: 'app-pending-bookings-page',
  imports: [
    DatePipe,
    FormsModule,
    RouterLink,
    PageHeaderComponent,
    IconComponent,
    ModalComponent,
    DataStateComponent,
    TranslatePipe,
  ],
  template: `
    <section class="space-y-6">
      <app-page-header
        [title]="'pendingBookings.title' | t"
        [subtitle]="'pendingBookings.subtitle' | t"
      >
        <a routerLink="/app/management/bookings" class="btn-secondary"
          ><app-icon name="list" [size]="17" /> {{ 'nav.manageBookings' | t }}</a
        >
      </app-page-header>

      @if (store.isAdmin()) {
        <div class="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50/90 p-4 text-xs font-medium text-amber-900 shadow-sm">
          <app-icon name="alert" [size]="18" class="shrink-0 text-amber-600" />
          <span>
            <strong>Ghi chú dành cho Admin:</strong> Backend hiện tại phân quyền duyệt booking cho <strong>LabManager</strong> trực tiếp phụ trách phòng lab. Nếu gặp lỗi 403 khi bấm duyệt, vui lòng dùng tài khoản LabManager tương ứng để duyệt.
          </span>
        </div>
      }
      <div
        class="rounded-[26px] border border-violet-200 bg-gradient-to-r from-violet-50 to-cyan-50 p-5"
      >
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div
            class="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-violet-600 shadow-sm"
          >
            <app-icon name="sparkles" [size]="22" />
          </div>
          <div class="flex-1">
            <p class="font-black text-slate-900">
              {{ 'pendingBookings.priorityPrincipleTitle' | t }}
            </p>
            <p class="mt-1 text-sm leading-6 text-slate-600">
              {{ 'pendingBookings.priorityPrincipleDesc' | t }}
            </p>
          </div>
          <span
            class="rounded-2xl bg-white px-4 py-3 text-2xl font-black text-violet-700 shadow-sm"
            >{{ items().length }}</span
          >
        </div>
      </div>
      @if (loading()) {
        <div class="card-surface p-6"><div class="skeleton h-96 rounded-2xl"></div></div>
      } @else if (items().length === 0) {
        <app-data-state
          [title]="'pendingBookings.noPendingTitle' | t"
          [message]="'pendingBookings.noPendingSub' | t"
          icon="check"
        />
      } @else {
        <div class="space-y-4">
          @for (item of items(); track item.bookingId; let rank = $index) {
            <article class="card-surface p-5 transition hover:-translate-y-1 sm:p-6">
              <div class="flex flex-col gap-5 lg:flex-row lg:items-center">
                <div
                  class="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl"
                  [class.bg-violet-600]="rank === 0"
                  [class.text-white]="rank === 0"
                  [class.bg-slate-100]="rank !== 0"
                  [class.text-slate-600]="rank !== 0"
                >
                  <span class="text-[9px] font-black uppercase">#{{ rank + 1 }}</span>
                </div>
                <div class="min-w-0 flex-1 space-y-2.5">
                  <div class="flex flex-wrap items-center gap-2">
                    <a
                      [routerLink]="['/app/bookings', item.bookingId]"
                      class="text-lg font-black text-slate-950 transition hover:text-violet-700"
                      >Booking #{{ item.bookingId }}</a
                    >
                    <span
                      class="rounded-full bg-violet-100/90 px-2.5 py-0.5 text-xs font-black text-violet-800"
                      >P{{ item.priorityLevel ?? '—' }}</span
                    >
                    <span
                      class="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700"
                      >{{ labelOf('purpose', item.purposeType, languageStore.lang()) }}</span
                    >
                  </div>

                  <!-- Clear Booker Identity & Resource Details -->
                  <div class="flex flex-wrap items-center gap-2.5 text-xs">
                    <!-- Booker Name & User ID -->
                    <div
                      class="inline-flex items-center gap-2 rounded-xl border border-violet-100 bg-violet-50/90 px-3 py-1.5 font-extrabold text-violet-950"
                    >
                      <app-icon name="user" [size]="15" class="text-violet-600" />
                      <span>{{ 'pendingBookings.booker' | t }}:</span>
                      <span class="font-black text-slate-900">{{
                        item.userName || 'User #' + item.userId
                      }}</span>
                      <span
                        class="rounded-md bg-white px-1.5 py-0.5 font-mono text-[11px] font-bold text-slate-500 shadow-2xs"
                      >
                        #{{ item.userId }}
                      </span>
                    </div>

                    <!-- Resource Summary -->
                    @if (item.resourceSummary) {
                      <div
                        class="inline-flex items-center gap-2 rounded-xl border border-cyan-100 bg-cyan-50/90 px-3 py-1.5 font-semibold text-cyan-950"
                      >
                        <app-icon name="box" [size]="15" class="text-cyan-600" />
                        <span class="font-black text-slate-900">{{ item.resourceSummary }}</span>
                      </div>
                    }
                  </div>

                  <!-- Time details -->
                  <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span class="flex items-center gap-1.5 font-medium text-slate-700">
                      <app-icon name="clock" [size]="14" class="text-slate-400" />
                      {{ item.startTime | date: 'HH:mm dd/MM/yyyy' }} –
                      {{ item.endTime | date: 'HH:mm dd/MM/yyyy' }}
                    </span>
                    <span class="flex items-center gap-1 text-slate-400">
                      <span>Tạo lúc:</span>
                      {{ item.createdAt | date: 'HH:mm:ss dd/MM/yyyy' }}
                    </span>
                  </div>
                </div>
                <div class="flex shrink-0 gap-2">
                  <a [routerLink]="['/app/bookings', item.bookingId]" class="btn-secondary">{{
                    'common.details' | t
                  }}</a>
                  @if (store.isManager()) {
                    <button class="btn-secondary btn-danger" (click)="openReject(item)">
                      <app-icon name="x" [size]="16" /> {{ 'pendingBookings.reject' | t }}
                    </button>
                    <button class="btn-primary" (click)="approve(item)">
                      <app-icon name="check" [size]="16" /> {{ 'pendingBookings.approve' | t }}
                    </button>
                  }
                </div>
              </div>
            </article>
          }
        </div>
      }
      <app-modal
        [open]="rejectOpen()"
        [title]="'pendingBookings.reject' | t"
        [subtitle]="selected() ? 'Booking #' + selected()!.bookingId : ''"
        (close)="rejectOpen.set(false)"
      >
        <label class="field-label">Lý do từ chối *</label>
        <textarea
          class="textarea-shell"
          [(ngModel)]="reason"
          placeholder="Nêu rõ lý do để người đặt điều chỉnh..."
        ></textarea>
        <div class="mt-5 flex justify-end gap-2">
          <button class="btn-secondary" (click)="rejectOpen.set(false)">
            {{ 'common.cancel' | t }}
          </button>
          <button class="btn-primary" [disabled]="!reason.trim()" (click)="reject()">
            {{ 'common.apply' | t }}
          </button>
        </div>
      </app-modal>
    </section>
  `,
})
export class PendingBookingsPage implements OnInit {
  private readonly api = inject(SystemService)
  private readonly toast = inject(ToastService)
  protected readonly store = inject(AuthStore)
  protected readonly languageStore = inject(LanguageStore)
  protected readonly items = signal<(BookingResponse & { resourceSummary?: string | null })[]>([])
  protected readonly loading = signal(true)
  protected readonly rejectOpen = signal(false)
  protected readonly selected = signal<BookingResponse | null>(null)
  protected reason = ''
  protected readonly labelOf = labelOf

  ngOnInit(): void {
    this.load()
  }

  protected approve(item: BookingResponse): void {
    if (!confirm(`Duyệt booking #${item.bookingId}?`)) return
    this.api.approveBooking(item.bookingId).subscribe({
      next: () => {
        this.toast.success('Đã duyệt booking')
        this.load()
      },
      error: (err: any) => {
        const is403 = err?.status === 403
        if (is403 && this.store.isAdmin()) {
          this.toast.error(
            'Admin hiện chưa thể duyệt qua API',
            'BE Controller hiện phân quyền duyệt cho tài khoản LabManager phụ trách phòng. Vui lòng dùng tài khoản LabManager.',
          )
        } else {
          this.toast.error(
            'Không thể duyệt booking',
            'Slot có thể vừa phát sinh xung đột hoặc booking không còn Pending.',
          )
        }
      },
    })
  }

  protected openReject(item: BookingResponse): void {
    this.selected.set(item)
    this.reason = ''
    this.rejectOpen.set(true)
  }

  protected reject(): void {
    const item = this.selected()
    if (!item) return
    this.api.rejectBooking(item.bookingId, this.reason.trim()).subscribe({
      next: () => {
        this.rejectOpen.set(false)
        this.toast.success('Đã từ chối booking')
        this.load()
      },
      error: (err: any) => {
        const is403 = err?.status === 403
        if (is403 && this.store.isAdmin()) {
          this.toast.error(
            'Admin hiện chưa thể từ chối qua API',
            'BE Controller hiện phân quyền duyệt/từ chối cho tài khoản LabManager phụ trách phòng. Vui lòng dùng tài khoản LabManager.',
          )
        } else {
          this.toast.error('Không thể từ chối booking')
        }
      },
    })
  }

  private load(): void {
    this.loading.set(true)
    forkJoin({
      pending: this.api.pendingBookings().pipe(catchError(() => of([]))),
      usersMap: this.api.usersMap().pipe(catchError(() => of(new Map<number, string>()))),
    }).subscribe({
      next: ({ pending, usersMap }) => {
        usersMap.forEach((name, id) => this.api.setCachedUserName(id, name))

        const enriched = pending.map((b) => ({
          ...b,
          userName:
            usersMap.get(b.userId) || this.api.getCachedUserName(b.userId) || b.userName || null,
        }))
        this.items.set(
          [...enriched].sort(
            (a, b) =>
              (a.priorityLevel ?? 999) - (b.priorityLevel ?? 999) ||
              +new Date(a.createdAt) - +new Date(b.createdAt),
          ),
        )
        this.loading.set(false)

        const bookingsToResolve = [...enriched]
        if (bookingsToResolve.length > 0) {
          const detailReqs = bookingsToResolve.map((b) =>
            this.api.booking(b.bookingId).pipe(catchError(() => of(null))),
          )
          from(detailReqs)
            .pipe(
              mergeMap((req) => req, 3),
              toArray(),
            )
            .subscribe((details) => {
              let updated = false
              const current = [
                ...this.items(),
              ] as (BookingResponse & { resourceSummary?: string | null })[]
              for (const d of details) {
                if (d && d.bookingId) {
                  if (d.userId && d.userName) {
                    this.api.setCachedUserName(d.userId, d.userName)
                  }
                  const summary =
                    d.items
                      ?.map((i) =>
                        i.equipmentName
                          ? `${i.equipmentName}${i.labName ? ' (' + i.labName + ')' : ''}`
                          : i.labName,
                      )
                      .filter(Boolean)
                      .join(' · ') || null

                  for (const item of current) {
                    if (item.bookingId === d.bookingId) {
                      if (d.userName) item.userName = d.userName
                      if (summary) item.resourceSummary = summary
                      updated = true
                    } else if (
                      d.userId &&
                      item.userId === d.userId &&
                      !item.userName &&
                      d.userName
                    ) {
                      item.userName = d.userName
                      updated = true
                    }
                  }
                }
              }
              if (updated) {
                this.items.set([...current])
              }
            })
        }
      },
      error: () => {
        this.loading.set(false)
        this.toast.error('Không tải được hàng đợi')
      },
    })
  }
}
