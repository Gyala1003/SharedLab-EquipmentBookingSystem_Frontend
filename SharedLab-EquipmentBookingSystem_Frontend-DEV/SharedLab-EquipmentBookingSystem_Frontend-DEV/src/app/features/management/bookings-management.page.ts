import { DatePipe, NgClass } from '@angular/common'
import { Component, OnInit, computed, inject, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { RouterLink } from '@angular/router'
import { catchError, EMPTY, forkJoin, of, timeout, from } from 'rxjs'
import { mergeMap, toArray } from 'rxjs/operators'
import { SystemService } from '../../core/api/system.service'
import type { BookingDetailResponse, BookingResponse } from '../../core/api/system.models'
import { AuthStore } from '../../core/auth/auth.store'
import { LanguageStore } from '../../core/i18n/language.store'
import { TranslatePipe } from '../../core/i18n/translate.pipe'
import { DataStateComponent } from '../../shared/ui/data-state'
import { IconComponent } from '../../shared/ui/icon'
import { ModalComponent } from '../../shared/ui/modal'
import { PageHeaderComponent } from '../../shared/ui/page-header'
import { StatusBadgeComponent } from '../../shared/ui/status-badge'
import { ToastService } from '../../shared/ui/toast.service'
import { ConfirmDialogService } from '../../shared/ui/confirm-dialog'
import {
  getFirstDayOfMonth,
  getLastDayOfMonth,
  labelOf,
  toDateInput,
} from '../../shared/utils/presentation'

@Component({
  selector: 'app-bookings-management-page',
  imports: [
    DatePipe,
    NgClass,
    FormsModule,
    RouterLink,
    IconComponent,
    ModalComponent,
    StatusBadgeComponent,
    DataStateComponent,
    TranslatePipe,
  ],
  template: `
    <section class="space-y-6">
      <!-- Unified Header + Compact Stat Chips Bar (Strictly 1 Single Row, Zero Gap) -->
      <article class="card-surface space-y-4 p-5">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 class="text-2xl font-black tracking-tight text-slate-950">
              {{ 'manageBookings.title' | t }}
            </h1>
            <p class="mt-1 text-xs font-medium text-slate-500">
              {{ 'manageBookings.subtitle' | t }}
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <a
              routerLink="/app/management/bookings/pending"
              class="btn-primary flex items-center gap-2"
              ><app-icon name="clock" [size]="17" /> {{ 'nav.pendingBookings' | t }}</a
            >
            <a routerLink="/app/calendar" class="btn-secondary flex items-center gap-2"
              ><app-icon name="calendar" [size]="17" /> {{ 'header.viewCalendar' | t }}</a
            >
          </div>
        </div>

        <div class="border-t border-slate-100 pt-3">
          <!-- Strictly 1 Single Horizontal Row (overflow-x-auto, whitespace-nowrap, no line break) -->
          <div class="flex scrollbar-none items-center gap-2 overflow-x-auto pt-0.5 pb-1">
            @for (card of cards(); track card.status) {
              <button
                type="button"
                class="flex shrink-0 items-center gap-2.5 rounded-xl border px-3.5 py-2 text-left whitespace-nowrap transition duration-150"
                [ngClass]="{
                  'border-violet-500 bg-violet-50/90 font-bold text-violet-900 shadow-2xs ring-2 ring-violet-500/20':
                    status() === card.status,
                  'border-slate-200/90 bg-slate-50/70 text-slate-700 hover:border-violet-300 hover:bg-white':
                    status() !== card.status,
                }"
                (click)="status.set(card.status)"
              >
                <span
                  class="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg text-[11px]"
                  [ngClass]="card.bgTint"
                >
                  <app-icon [name]="card.iconName" [size]="12" />
                </span>
                <span class="text-xs font-bold text-slate-600">{{ card.label }}:</span>
                <span class="text-xs font-black" [class]="card.className">{{ card.count }}</span>
              </button>
            }
          </div>
        </div>
      </article>

      <!-- Filters Surface -->
      <div class="card-surface space-y-4 p-5">
        <div class="grid gap-3.5 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <label class="field-label">{{ 'common.search' | t }}</label>
            <div class="relative">
              <span
                class="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400"
                ><app-icon name="search" [size]="16"
              /></span>
              <input
                class="input-shell pl-10"
                [ngModel]="keyword()"
                (ngModelChange)="keyword.set($event)"
                placeholder="{{ 'bookings.searchPlaceholder' | t }}"
              />
            </div>
          </div>
          <div>
            <label class="field-label">{{ 'common.status' | t }}</label>
            <select class="input-shell" [ngModel]="status()" (ngModelChange)="status.set($event)">
              <option value="">{{ 'common.allStatuses' | t }}</option>
              @for (tab of statuses(); track tab.value) {
                <option [value]="tab.value">{{ tab.label }}</option>
              }
            </select>
          </div>
          <div>
            <label class="field-label">{{ 'common.from' | t }}</label>
            <input
              class="input-shell"
              type="date"
              [ngModel]="from()"
              (ngModelChange)="setFrom($event)"
              [class.border-rose-500]="dateInvalid()"
            />
          </div>
          <div>
            <label class="field-label">{{ 'common.to' | t }}</label>
            <input
              class="input-shell"
              type="date"
              [ngModel]="to()"
              (ngModelChange)="setTo($event)"
              [class.border-rose-500]="dateInvalid()"
            />
          </div>
          @if (dateInvalid()) {
            <div
              class="col-span-full flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-700"
            >
              <app-icon name="alert" [size]="16" />
              <span>Ngày bắt đầu (From) không được lớn hơn ngày kết thúc (To).</span>
            </div>
          }
        </div>
      </div>

      <!-- Table Section -->
      <article class="card-surface overflow-hidden">
        <header
          class="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4"
        >
          <div class="flex items-center gap-3">
            <span
              class="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 text-xs font-black text-violet-700"
            >
              <app-icon name="calendar" [size]="17" />
            </span>
            <div>
              <h2 class="text-base font-black text-slate-950">{{ 'manageBookings.title' | t }}</h2>
              <p class="text-xs font-medium text-slate-400">
                {{ filtered().length }} {{ 'common.records' | t }}
              </p>
            </div>
          </div>
          @if (status()) {
            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded-xl border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-black text-violet-700 transition hover:bg-violet-100"
              (click)="status.set('')"
            >
              Lọc theo: {{ status() }} ✕
            </button>
          }
        </header>

        @if (loading()) {
          <div class="p-6"><div class="skeleton h-80 rounded-2xl"></div></div>
        } @else if (filtered().length === 0) {
          <div class="p-6">
            <app-data-state
              [title]="'common.noData' | t"
              [message]="'common.noData' | t"
              icon="calendar"
            />
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="table-shell">
              <thead>
                <tr>
                  <th class="w-[140px]">{{ 'bookings.bookingCode' | t }}</th>
                  <th class="w-[160px]">{{ 'bookings.user' | t }}</th>
                  <th class="w-[180px]">Phòng Lab / Tài nguyên</th>
                  <th>{{ 'bookings.purpose' | t }}</th>
                  <th class="w-[180px]">{{ 'bookings.usageTime' | t }}</th>
                  <th class="w-[90px] text-center">{{ 'bookings.priority' | t }}</th>
                  <th class="w-[130px]">{{ 'common.status' | t }}</th>
                  <th class="w-[160px] text-right">{{ 'common.actions' | t }}</th>
                </tr>
              </thead>
              <tbody>
                @for (item of filtered(); track item.bookingId) {
                  <tr class="transition duration-150 hover:bg-slate-50/80">
                    <!-- Mã Booking -->
                    <td>
                      <button
                        type="button"
                        class="inline-flex items-center gap-1 rounded-xl border border-violet-200/80 bg-violet-50 px-2.5 py-1 font-mono text-xs font-black text-violet-700 shadow-2xs transition hover:border-violet-600 hover:bg-violet-600 hover:text-white"
                        (click)="openDetail(item)"
                      >
                        #BK-{{ item.bookingId.toString().padStart(5, '0') }}
                      </button>
                      <p class="mt-1 text-[10px] font-semibold text-slate-400">
                        {{ 'common.created' | t }}{{ item.createdAt | date: 'dd/MM/yyyy' }}
                      </p>
                    </td>

                    <!-- Người đặt -->
                    <td>
                      <p class="text-xs font-black text-slate-900">
                        {{ item.userName || 'User #' + item.userId }}
                      </p>
                      <p class="mt-0.5 text-[10px] font-bold text-slate-400">
                        ID: #{{ item.userId }}
                      </p>
                    </td>

                    <!-- Phòng Lab / Tài nguyên -->
                    <td>
                      @if (item.labName) {
                        <p class="flex items-center gap-1.5 text-xs font-black text-indigo-950">
                          <app-icon name="building" [size]="14" class="shrink-0 text-indigo-600" />
                          <span>{{ item.labName }}</span>
                        </p>
                      }
                      @if (item.equipmentSummary) {
                        <p class="mt-0.5 flex items-center gap-1 text-[11px] font-semibold text-cyan-800">
                          <app-icon name="microscope" [size]="13" class="shrink-0 text-cyan-600" />
                          <span>{{ item.equipmentSummary }}</span>
                        </p>
                      }
                      @if (!item.labName && !item.equipmentSummary) {
                        @if (item.resourceSummary) {
                          <p class="text-xs font-bold text-slate-700">
                            {{ item.resourceSummary }}
                          </p>
                        } @else {
                          <span class="text-[11px] font-medium text-slate-400 italic">Đang tải...</span>
                        }
                      }
                    </td>

                    <!-- Mục đích sử dụng -->
                    <td>
                      <div class="space-y-1">
                        <span class="inline-block text-xs font-black text-slate-900">
                          {{ labelOf('purpose', item.purposeType, languageStore.lang()) }}
                        </span>
                      </div>
                    </td>

                    <!-- Thời gian sử dụng -->
                    <td>
                      <div class="space-y-0.5">
                        <p class="flex items-center gap-1.5 text-xs font-black text-slate-900">
                          <app-icon name="clock" [size]="13" class="shrink-0 text-violet-500" />
                          {{ item.startTime | date: 'HH:mm' }} - {{ item.endTime | date: 'HH:mm' }}
                        </p>
                        <p class="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                          <app-icon name="calendar" [size]="12" class="shrink-0" />
                          {{ item.startTime | date: 'dd/MM/yyyy' }}
                        </p>
                      </div>
                    </td>

                    <!-- Ưu tiên -->
                    <td class="text-center">
                      <span
                        class="inline-block rounded-xl border px-2.5 py-1 text-[11px] font-black"
                        [ngClass]="{
                          'border-indigo-200 bg-indigo-50 text-indigo-700':
                            item.priorityLevel === 1,
                          'border-cyan-200 bg-cyan-50 text-cyan-700': item.priorityLevel === 2,
                          'border-emerald-200 bg-emerald-50 text-emerald-700':
                            item.priorityLevel === 3,
                          'border-slate-200 bg-slate-100 text-slate-600':
                            !item.priorityLevel || item.priorityLevel >= 4,
                        }"
                      >
                        P{{ item.priorityLevel ?? '—' }}
                      </span>
                    </td>

                    <!-- Trạng thái -->
                    <td>
                      <app-status-badge [value]="item.status" domain="booking" />
                    </td>

                    <!-- Thao tác -->
                    <td class="text-right">
                      <div class="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          class="inline-flex h-8 items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-black text-slate-700 shadow-2xs transition hover:border-slate-300 hover:bg-slate-100"
                          (click)="openDetail(item)"
                        >
                          <app-icon name="eye" [size]="14" /> {{ 'common.detail' | t }}
                        </button>

                        @if (item.status === 'Pending') {
                          <button
                            type="button"
                            class="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 shadow-2xs transition hover:bg-emerald-600 hover:text-white"
                            [title]="'common.approved' | t"
                            (click)="quickAction(item, 'approve')"
                          >
                            <app-icon name="check" [size]="15" />
                          </button>
                          <button
                            type="button"
                            class="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-700 shadow-2xs transition hover:bg-rose-600 hover:text-white"
                            [title]="'incidents.reject' | t"
                            (click)="openReject(item)"
                          >
                            <app-icon name="x" [size]="15" />
                          </button>
                        }

                        @if (item.status === 'Approved') {
                          <button
                            type="button"
                            class="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 shadow-2xs transition hover:bg-emerald-600 hover:text-white"
                            [title]="'common.completed' | t"
                            (click)="quickAction(item, 'complete')"
                          >
                            <app-icon name="check" [size]="15" />
                          </button>
                          <button
                            type="button"
                            class="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-amber-200 bg-amber-50 text-amber-700 shadow-2xs transition hover:bg-amber-600 hover:text-white"
                            title="NoShow"
                            (click)="quickAction(item, 'no-show')"
                          >
                            <app-icon name="alert" [size]="15" />
                          </button>
                          <button
                            type="button"
                            class="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-700 shadow-2xs transition hover:bg-rose-600 hover:text-white"
                            [title]="'common.cancel' | t"
                            (click)="quickAction(item, 'cancel')"
                          >
                            <app-icon name="x" [size]="15" />
                          </button>
                        }
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </article>
    </section>

    <!-- Modal Từ chối booking -->
    <app-modal
      [open]="rejectOpen()"
      [title]="'manageBookings.rejectTitle' | t"
      [subtitle]="'manageBookings.rejectSubtitle' | t"
      (close)="rejectOpen.set(false)"
    >
      <div class="grid gap-4">
        <div>
          <label class="field-label">{{ 'manageBookings.rejectReasonLabel' | t }}</label>
          <textarea
            class="textarea-shell"
            [(ngModel)]="rejectReason"
            placeholder="{{ 'manageBookings.rejectReasonPlaceholder' | t }}"
          ></textarea>
        </div>
        <div class="flex justify-end gap-2">
          <button type="button" class="btn-secondary" (click)="rejectOpen.set(false)">
            {{ 'common.cancel' | t }}
          </button>
          <button
            class="btn-primary bg-rose-600 hover:bg-rose-700"
            [disabled]="actioning()"
            (click)="confirmReject()"
          >
            {{
              actioning()
                ? ('manageBookings.rejectingBtn' | t)
                : ('manageBookings.confirmRejectBtn' | t)
            }}
          </button>
        </div>
      </div>
    </app-modal>

    <!-- Modal Chi tiết booking -->
    <app-modal
      [open]="detailOpen()"
      [title]="
        detailBooking()
          ? '#BK-' + detailBooking()!.bookingId.toString().padStart(5, '0')
          : ('common.detail' | t)
      "
      [subtitle]="'bookings.detailSubtitle' | t"
      (close)="closeDetail()"
    >
      @if (detailLoading()) {
        <div class="space-y-3">
          <div class="skeleton h-8 rounded-xl"></div>
          <div class="skeleton h-20 rounded-xl"></div>
          <div class="skeleton h-12 rounded-xl"></div>
        </div>
      } @else if (detailAccessDenied()) {
        <div
          class="space-y-4 rounded-2xl border border-amber-200 bg-amber-50/90 p-6 text-center shadow-sm"
        >
          <div
            class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 text-amber-700 shadow-inner"
          >
            <app-icon name="shield" [size]="28" />
          </div>
          <div>
            <h3 class="text-lg font-black text-slate-950">Không có quyền xem chi tiết</h3>
          </div>

          <div
            class="rounded-xl border border-amber-200 bg-white/90 p-4 text-left text-xs text-slate-800 shadow-sm"
          >
            <p
              class="rounded-lg border border-amber-200/60 bg-amber-100/60 p-3 font-sans text-xs leading-relaxed font-bold whitespace-pre-line text-amber-950"
            >
              {{ detailErrorMessage() || 'Bạn không có quyền xem booking này.' }}
            </p>
          </div>

          <div class="flex flex-wrap justify-center gap-2 pt-2">
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-2.5 text-xs font-black text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-700"
              (click)="sendErrorReportToBE()"
            >
              <app-icon name="send" [size]="15" /> Gửi báo lỗi về Backend
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-black text-slate-700 shadow-sm transition hover:bg-slate-50"
              (click)="closeDetail()"
            >
              <app-icon name="arrow-left" [size]="15" /> Quay lại trang
            </button>
          </div>
        </div>
      } @else if (detailBooking()) {
        <div class="grid gap-4">
          <div class="grid gap-3 rounded-2xl bg-slate-50 p-4 sm:grid-cols-2">
            <div>
              <p class="text-[10px] font-black tracking-[.14em] text-slate-400 uppercase">
                {{ 'bookings.user' | t }}
              </p>
              <p class="mt-1 font-black text-slate-900">
                {{ detailBooking()!.userName || 'User #' + detailBooking()!.userId }}
              </p>
            </div>
            <div>
              <p class="text-[10px] font-black tracking-[.14em] text-slate-400 uppercase">
                {{ 'common.status' | t }}
              </p>
              <div class="mt-1">
                <app-status-badge [value]="detailBooking()!.status" domain="booking" />
              </div>
            </div>
            <div>
              <p class="text-[10px] font-black tracking-[.14em] text-slate-400 uppercase">
                {{ 'bookings.purpose' | t }}
              </p>
              <p class="mt-1 font-bold text-slate-800">
                {{ labelOf('purpose', detailBooking()!.purposeType, languageStore.lang()) }}
              </p>
            </div>
            <div>
              <p class="text-[10px] font-black tracking-[.14em] text-slate-400 uppercase">
                {{ 'bookings.priority' | t }}
              </p>
              <p class="mt-1 font-bold text-slate-800">
                P{{ detailBooking()!.priorityLevel ?? '—' }}
              </p>
            </div>
            <div>
              <p class="text-[10px] font-black tracking-[.14em] text-slate-400 uppercase">
                {{ 'bookings.startTime' | t }}
              </p>
              <p class="mt-1 font-bold text-slate-800">
                {{ detailBooking()!.startTime | date: 'HH:mm dd/MM/yyyy' }}
              </p>
            </div>
            <div>
              <p class="text-[10px] font-black tracking-[.14em] text-slate-400 uppercase">
                {{ 'bookings.endTime' | t }}
              </p>
              <p class="mt-1 font-bold text-slate-800">
                {{ detailBooking()!.endTime | date: 'HH:mm dd/MM/yyyy' }}
              </p>
            </div>
            @if (detailBooking()!.purposeDescription) {
              <div class="sm:col-span-2">
                <p class="text-[10px] font-black tracking-[.14em] text-slate-400 uppercase">
                  {{ 'bookings.purposeDesc' | t }}
                </p>
                <p class="mt-1 text-sm text-slate-700">{{ detailBooking()!.purposeDescription }}</p>
              </div>
            }
            @if (detailBooking()!.rejectionReason) {
              <div class="rounded-xl border border-rose-200 bg-rose-50 p-3 sm:col-span-2">
                <p class="text-[10px] font-black tracking-[.14em] text-rose-500 uppercase">
                  {{ 'bookings.rejectionReason' | t }}
                </p>
                <p class="mt-1 text-sm text-rose-800">{{ detailBooking()!.rejectionReason }}</p>
              </div>
            }
          </div>
          @if (detailBooking()!.items && detailBooking()!.items.length > 0) {
            <div>
              <p class="mb-2 text-xs font-black tracking-[.14em] text-slate-400 uppercase">
                {{ 'bookings.registeredResources' | t }}
              </p>
              <div class="divide-y divide-slate-100 rounded-2xl border border-slate-100 bg-white">
                @for (item of detailBooking()!.items; track item.bookingItemId) {
                  <div class="flex items-center gap-3 px-4 py-3">
                    <div
                      class="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600"
                    >
                      <app-icon
                        [name]="item.resourceType === 'Lab' ? 'building' : 'microscope'"
                        [size]="18"
                      />
                    </div>
                    <div class="flex-1">
                      <p class="text-sm font-black text-slate-900">
                        {{
                          item.labName ||
                            item.equipmentName ||
                            'Tài nguyên #' + (item.labId || item.equipmentId) | t
                        }}
                      </p>
                      <p class="text-xs text-slate-400">
                        {{ labelOf('resource', item.resourceType, languageStore.lang())
                        }}{{ item.note ? ' · ' + item.note : '' }}
                      </p>
                    </div>
                  </div>
                }
              </div>
            </div>
          }
          <!-- Action buttons in detail modal -->
          <div class="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
            <a
              [routerLink]="['/app/bookings', detailBooking()!.bookingId]"
              class="btn-secondary flex-1"
              ><app-icon name="arrow-right" [size]="16" />
              {{ 'manageBookings.fullDetailBtn' | t }}</a
            >
            @if (detailBooking()!.status === 'Pending') {
              <button
                class="btn-primary bg-emerald-600 hover:bg-emerald-700"
                [disabled]="actioning()"
                (click)="quickAction(detailBooking()!, 'approve')"
              >
                <app-icon name="check" [size]="16" /> {{ 'common.approved' | t }}
              </button>
              <button
                class="btn-primary bg-rose-600 hover:bg-rose-700"
                [disabled]="actioning()"
                (click)="openReject(detailBooking()!)"
              >
                <app-icon name="x" [size]="16" /> {{ 'incidents.reject' | t }}
              </button>
            }
            @if (detailBooking()!.status === 'Approved') {
              <button
                class="btn-primary bg-emerald-600 hover:bg-emerald-700"
                [disabled]="actioning()"
                (click)="quickAction(detailBooking()!, 'complete')"
              >
                <app-icon name="check" [size]="16" /> {{ 'common.completed' | t }}
              </button>
              <button
                class="btn-secondary"
                [disabled]="actioning()"
                (click)="quickAction(detailBooking()!, 'no-show')"
              >
                <app-icon name="alert" [size]="16" /> NoShow
              </button>
              <button
                class="btn-secondary btn-danger"
                [disabled]="actioning()"
                (click)="quickAction(detailBooking()!, 'cancel')"
              >
                <app-icon name="x" [size]="16" /> {{ 'common.cancel' | t }}
              </button>
            }
          </div>
        </div>
      }
    </app-modal>
  `,
})
export class BookingsManagementPage implements OnInit {
  private readonly api = inject(SystemService)
  private readonly toast = inject(ToastService)
  private readonly confirmDialog = inject(ConfirmDialogService)
  protected readonly store = inject(AuthStore)
  protected readonly languageStore = inject(LanguageStore)
  protected readonly items = signal<
    (BookingResponse & {
      userName?: string | null
      labName?: string | null
      equipmentSummary?: string | null
      resourceSummary?: string | null
    })[]
  >([])
  protected readonly loading = signal(true)
  protected readonly actioning = signal(false)
  protected readonly rejectOpen = signal(false)
  protected readonly detailOpen = signal(false)
  protected readonly detailLoading = signal(false)
  protected readonly detailAccessDenied = signal(false)
  protected readonly detailErrorMessage = signal('')
  protected readonly detailBooking = signal<BookingDetailResponse | null>(null)
  protected rejectTarget: BookingResponse | null = null
  protected rejectReason = ''
  protected readonly keyword = signal('')
  protected readonly status = signal('')
  protected readonly from = signal(getFirstDayOfMonth())
  protected readonly to = signal(getLastDayOfMonth())
  protected readonly dateInvalid = computed(
    () => !!(this.from() && this.to() && this.from() > this.to()),
  )

  protected setFrom(val: string): void {
    this.from.set(val)
    if (val && this.to() && val > this.to()) {
      this.toast.error('Ngày bắt đầu (From) không được lớn hơn ngày kết thúc (To).')
    }
  }

  protected setTo(val: string): void {
    this.to.set(val)
    if (this.from() && val && this.from() > val) {
      this.toast.error('Ngày bắt đầu (From) không được lớn hơn ngày kết thúc (To).')
    }
  }

  protected readonly labelOf = labelOf
  protected readonly statuses = computed(() => [
    { value: 'Pending', label: labelOf('booking', 'Pending', this.languageStore.lang()) },
    { value: 'Approved', label: labelOf('booking', 'Approved', this.languageStore.lang()) },
    { value: 'LateCheckout', label: 'Quá hạn Check-out' },
    { value: 'Rejected', label: labelOf('booking', 'Rejected', this.languageStore.lang()) },
    { value: 'Cancelled', label: labelOf('booking', 'Cancelled', this.languageStore.lang()) },
    { value: 'Completed', label: labelOf('booking', 'Completed', this.languageStore.lang()) },
    { value: 'NoShow', label: labelOf('booking', 'NoShow', this.languageStore.lang()) },
  ])
  protected readonly filtered = computed(() => {
    if (this.dateInvalid()) return []
    const needle = this.keyword().trim().toLowerCase()
    const status = this.status()
    const from = this.from()
    const to = this.to()
    return [...this.items()]
      .filter((item) => {
        const date = toDateInput(new Date(item.startTime))
        // Filter by status
        if (status) {
          if (status === 'LateCheckout') {
            if (item.status !== 'Approved' || Date.now() <= +new Date(item.endTime)) return false
          } else {
            if (item.status !== status) return false
          }
        }
        // Filter by date range
        if (from && date < from) return false
        if (to && date > to) return false
        // Search filter
        if (needle) {
          const bkCode = `bk-${item.bookingId.toString().padStart(5, '0')}`
          const bookingIdStr = String(item.bookingId)
          const userIdStr = String(item.userId)
          const userName = (item.userName || '').toLowerCase()
          const labStr = (item.labName || '').toLowerCase()
          const equipStr = (item.equipmentSummary || '').toLowerCase()
          const purposeStr = labelOf(
            'purpose',
            item.purposeType,
            this.languageStore.lang(),
          ).toLowerCase()
          const statusStr = labelOf('booking', item.status, this.languageStore.lang()).toLowerCase()
          const matched =
            bkCode.includes(needle) ||
            bookingIdStr.includes(needle) ||
            userIdStr.includes(needle) ||
            userName.includes(needle) ||
            labStr.includes(needle) ||
            equipStr.includes(needle) ||
            purposeStr.includes(needle) ||
            statusStr.includes(needle)
          if (!matched) return false
        }
        return true
      })
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
  })
  protected readonly cards = computed(() => [
    {
      status: '',
      label: this.languageStore.t('dashboard.totalBookings'),
      count: this.items().length,
      className: 'text-slate-950',
      iconName: 'calendar',
      bgTint: 'bg-slate-100 text-slate-700',
    },
    {
      status: 'Pending',
      label: labelOf('booking', 'Pending', this.languageStore.lang()),
      count: this.items().filter((b) => b.status === 'Pending').length,
      className: 'text-amber-600',
      iconName: 'clock',
      bgTint: 'bg-amber-100 text-amber-700',
    },
    {
      status: 'Approved',
      label: labelOf('booking', 'Approved', this.languageStore.lang()),
      count: this.items().filter((b) => b.status === 'Approved').length,
      className: 'text-emerald-600',
      iconName: 'check',
      bgTint: 'bg-emerald-100 text-emerald-700',
    },
    {
      status: 'LateCheckout',
      label: 'Quá hạn Check-out',
      count: this.items().filter(
        (b) => b.status === 'Approved' && Date.now() > +new Date(b.endTime),
      ).length,
      className: 'text-rose-700',
      iconName: 'alert',
      bgTint: 'bg-rose-100 text-rose-800 border border-rose-200',
    },
    {
      status: 'Rejected',
      label: labelOf('booking', 'Rejected', this.languageStore.lang()),
      count: this.items().filter((b) => b.status === 'Rejected').length,
      className: 'text-rose-600',
      iconName: 'x',
      bgTint: 'bg-rose-100 text-rose-700',
    },
    {
      status: 'Cancelled',
      label: labelOf('booking', 'Cancelled', this.languageStore.lang()),
      count: this.items().filter((b) => b.status === 'Cancelled').length,
      className: 'text-slate-500',
      iconName: 'slash',
      bgTint: 'bg-slate-100 text-slate-600',
    },
    {
      status: 'Completed',
      label: labelOf('booking', 'Completed', this.languageStore.lang()),
      count: this.items().filter((b) => b.status === 'Completed').length,
      className: 'text-cyan-600',
      iconName: 'check-circle',
      bgTint: 'bg-cyan-100 text-cyan-700',
    },
    {
      status: 'NoShow',
      label: labelOf('booking', 'NoShow', this.languageStore.lang()),
      count: this.items().filter((b) => b.status === 'NoShow').length,
      className: 'text-rose-600',
      iconName: 'alert',
      bgTint: 'bg-rose-100 text-rose-700',
    },
  ])

  ngOnInit(): void {
    this.load()
  }

  protected load(): void {
    this.loading.set(true)
    forkJoin({
      bookings: this.api.bookings().pipe(catchError(() => of([]))),
      usersMap: this.api.usersMap().pipe(catchError(() => of(new Map<number, string>()))),
    }).subscribe({
      next: ({ bookings, usersMap }) => {
        usersMap.forEach((name, id) => this.api.setCachedUserName(id, name))

        const enriched = bookings.map((b) => {
          const name =
            usersMap.get(b.userId) || this.api.getCachedUserName(b.userId) || b.userName || null
          return { ...b, userName: name }
        })
        this.items.set(enriched)
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
              const current = [...this.items()] as (BookingResponse & {
                labName?: string | null
                equipmentSummary?: string | null
                resourceSummary?: string | null
              })[]
              for (const d of details) {
                if (d && d.bookingId) {
                  if (d.userId && d.userName) {
                    this.api.setCachedUserName(d.userId, d.userName)
                  }
                  const labNames = Array.from(
                    new Set(d.items?.map((i) => i.labName).filter(Boolean)),
                  ).join(' · ')
                  const equipmentNames = Array.from(
                    new Set(d.items?.map((i) => i.equipmentName).filter(Boolean)),
                  ).join(' · ')
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
                      if (labNames) item.labName = labNames
                      if (equipmentNames) item.equipmentSummary = equipmentNames
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
        this.toast.error('Không tải được danh sách booking')
      },
    })
  }

  protected reset(): void {
    this.keyword.set('')
    this.status.set('')
    this.from.set(getFirstDayOfMonth())
    this.to.set(getLastDayOfMonth())
  }

  protected currentBookingId = 0

  protected openDetail(item: BookingResponse): void {
    this.currentBookingId = item.bookingId
    this.detailBooking.set(null)
    this.detailLoading.set(true)
    this.detailAccessDenied.set(false)
    this.detailErrorMessage.set('')
    this.detailOpen.set(true)
    forkJoin({
      detail: this.api.booking(item.bookingId).pipe(timeout(2500)),
      usersMap: this.api.usersMap().pipe(catchError(() => of(new Map<number, string>()))),
    }).subscribe({
      next: ({ detail, usersMap }) => {
        if (detail) {
          detail.userName =
            usersMap.get(detail.userId) ||
            this.api.getCachedUserName(detail.userId) ||
            detail.userName ||
            null
          if (detail.userName && detail.userId) {
            this.api.setCachedUserName(detail.userId, detail.userName)
          }
        }
        this.detailBooking.set(detail)
        this.detailLoading.set(false)
      },
      error: (err: any) => {
        this.detailLoading.set(false)
        this.detailAccessDenied.set(true)
        const msg =
          err?.message ||
          err?.error?.message ||
          err?.error?.detail ||
          (err?.name === 'TimeoutError'
            ? 'Máy chủ Backend đang tạm dừng hoặc xử lý lâu (Timeout 2.5s).'
            : 'Tài khoản không đủ thẩm quyền quản lý hoặc xem chi tiết booking này.')
        this.detailErrorMessage.set(msg)
      },
    })
  }

  protected sendErrorReportToBE(): void {
    const user = this.store.user()
    if (!user?.userId) return
    const errorMsg =
      this.detailErrorMessage() || 'Ngoại lệ phân quyền xem chi tiết booking từ BE cho Manager'
    this.api
      .sendNotification({
        userId: user.userId,
        title: 'Báo cáo lỗi & Đồng bộ Data Backend',
        message: `[Báo lỗi Manager BE Data] Quản lý ${user.fullName || user.username} (User ID ${user.userId}) báo cáo ngoại lệ tại Booking #${this.currentBookingId || ''}: ${errorMsg}`,
        notificationType: 1,
      })
      .pipe(catchError(() => EMPTY))
      .subscribe({
        next: () => {
          this.toast.success('Đã gửi thông tin báo lỗi về Backend!')
        },
        error: () => {
          this.toast.info('Đã hoàn tất phản hồi về Backend.')
        },
      })
  }

  protected closeDetail(): void {
    const user = this.store.user()
    if (user?.userId && this.detailAccessDenied()) {
      this.api
        .sendNotification({
          userId: user.userId,
          title: 'Phản hồi từ chối truy cập quản lý booking',
          message: `Người dùng ${user.fullName || user.username} đã quay lại trang sau khi xem thông báo không đủ quyền quản lý booking.`,
          notificationType: 1,
        })
        .pipe(catchError(() => EMPTY))
        .subscribe()
    }
    this.detailOpen.set(false)
    this.detailLoading.set(false)
    this.detailAccessDenied.set(false)
    this.detailErrorMessage.set('')
    this.detailBooking.set(null)
  }

  protected openReject(item: BookingResponse): void {
    this.rejectTarget = item
    this.rejectReason = ''
    this.rejectOpen.set(true)
  }

  protected confirmReject(): void {
    if (!this.rejectTarget || !this.rejectReason.trim()) {
      this.toast.info('Hãy nhập lý do từ chối')
      return
    }
    this.actioning.set(true)
    this.api.rejectBooking(this.rejectTarget.bookingId, this.rejectReason.trim()).subscribe({
      next: () => {
        this.actioning.set(false)
        this.rejectOpen.set(false)
        if (this.detailBooking()?.bookingId === this.rejectTarget?.bookingId)
          this.detailOpen.set(false)
        this.toast.success('Đã từ chối booking')
        this.load()
      },
      error: () => {
        this.actioning.set(false)
        this.toast.error('Không thể từ chối booking')
      },
    })
  }

  protected async quickAction(
    item: BookingResponse,
    actionType: 'approve' | 'complete' | 'no-show' | 'cancel',
  ): Promise<void> {
    const labels: Record<string, string> = {
      approve: 'duyệt',
      complete: 'hoàn thành',
      'no-show': 'NoShow',
      cancel: 'hủy',
    }
    const isDanger = actionType === 'cancel' || actionType === 'no-show'
    const isWarning = actionType === 'approve'
    const confirmed = await this.confirmDialog.confirm({
      title: 'Xác nhận thao tác',
      message: `Xác nhận ${labels[actionType]} booking #${item.bookingId}?`,
      confirmText: 'Xác nhận',
      cancelText: 'Hủy bỏ',
      variant: isDanger ? 'danger' : isWarning ? 'warning' : 'primary',
    })
    if (!confirmed) return
    this.actioning.set(true)
    const req =
      actionType === 'approve'
        ? this.api.approveBooking(item.bookingId)
        : actionType === 'complete'
          ? this.api.completeBooking(item.bookingId)
          : actionType === 'no-show'
            ? this.api.noShowBooking(item.bookingId)
            : this.api.cancelBooking(item.bookingId)
    req.subscribe({
      next: () => {
        this.actioning.set(false)
        this.toast.success('Đã cập nhật booking')
        if (this.detailBooking()?.bookingId === item.bookingId) {
          this.openDetail(item)
        }
        this.load()
      },
      error: () => {
        this.actioning.set(false)
        this.toast.error('Không thể cập nhật booking')
      },
    })
  }
}
