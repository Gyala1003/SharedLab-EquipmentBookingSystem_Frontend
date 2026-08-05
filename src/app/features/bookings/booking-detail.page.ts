import { DatePipe, NgClass } from '@angular/common'
import { Component, OnInit, computed, inject, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { ActivatedRoute, Router, RouterLink } from '@angular/router'
import { catchError, EMPTY, forkJoin, of, timeout } from 'rxjs'
import { SystemService } from '../../core/api/system.service'
import type { BookingDetailResponse, BookingItemResponse, UsageLogResponse, ViolationResponse } from '../../core/api/system.models'
import { AuthStore } from '../../core/auth/auth.store'
import { LanguageStore } from '../../core/i18n/language.store'
import { TranslatePipe } from '../../core/i18n/translate.pipe'
import { DataStateComponent } from '../../shared/ui/data-state'
import { IconComponent } from '../../shared/ui/icon'
import { ModalComponent } from '../../shared/ui/modal'
import { PageHeaderComponent } from '../../shared/ui/page-header'
import { StatusBadgeComponent } from '../../shared/ui/status-badge'
import { ToastService } from '../../shared/ui/toast.service'
import { labelOf, getCheckInWindowInfo } from '../../shared/utils/presentation'

@Component({
  selector: 'app-booking-detail-page',
  imports: [DatePipe, NgClass, FormsModule, RouterLink, PageHeaderComponent, IconComponent, ModalComponent, StatusBadgeComponent, TranslatePipe],
  template: `
    <section class="space-y-6">
      @if (loading()) {
        <div class="card-surface p-7">
          <div class="skeleton h-8 w-1/3 rounded"></div>
          <div class="skeleton mt-5 h-80 rounded-3xl"></div>
        </div>
      } @else if (accessDenied() || !booking()) {
        <div class="mx-auto max-w-xl rounded-2xl border border-amber-200 bg-amber-50/90 p-8 text-center space-y-4 shadow-sm my-8">
          <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 text-amber-700 shadow-inner">
            <app-icon name="shield" [size]="28" />
          </div>
          <div>
            <h3 class="font-black text-slate-950 text-xl">{{ 'lab.notFoundTitle' | t }}</h3>
          </div>
          
          <div class="rounded-xl bg-white/90 p-4 border border-amber-200 text-left text-xs text-slate-800 shadow-sm">
            <p class="whitespace-pre-line leading-relaxed font-bold text-amber-950 bg-amber-100/60 p-3 rounded-lg border border-amber-200/60 font-sans text-xs">
              {{ errorMessage() || ('lab.notFoundMsg' | t) }}
            </p>
          </div>

          <div class="pt-2 flex flex-wrap justify-center gap-2">
            <button type="button" class="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-2.5 text-xs font-black text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition" (click)="sendErrorReportToBE()">
              <app-icon name="send" [size]="15" /> Gửi báo lỗi về Backend
            </button>
            <button type="button" class="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-black text-slate-700 hover:bg-slate-50 transition shadow-sm" (click)="goBackToList()">
              <app-icon name="arrow-left" [size]="15" /> {{ 'common.back' | t }}
            </button>
          </div>
        </div>
      } @else {
        <app-page-header [title]="'Booking #BK-' + booking()!.bookingId.toString().padStart(5,'0')" [subtitle]="labelOf('purpose', booking()!.purposeType, languageStore.lang()) + ' · ' + ('bookingDetail.createdAt' | t: { time: ((booking()!.createdAt | date:'HH:mm dd/MM/yyyy') || '') })">
          @if (canApprove()) { <button class="btn-primary" (click)="action('approve')"><app-icon name="check" [size]="17" /> {{ 'bookingDetail.approveBtn' | t }}</button><button class="btn-secondary btn-danger" (click)="rejectOpen.set(true)"><app-icon name="x" [size]="17" /> {{ 'bookingDetail.rejectBtn' | t }}</button> }
          @if (canCancel()) { <button class="btn-secondary btn-danger" (click)="action('cancel')"><app-icon name="x" [size]="17" /> {{ 'bookingDetail.cancelBtn' | t }}</button> }
          @if (isOwnBooking()) { <a routerLink="/app/bookings/my" class="btn-secondary"><app-icon name="arrow-left" [size]="17" /> {{ 'bookingDetail.myBookingsBtn' | t }}</a> }
        </app-page-header>

        <!-- Banner: Requester đang xem booking của người khác -->
        @if (store.isRequester() && !isOwnBooking()) {
          <div class="flex items-center gap-3 rounded-2xl border border-blue-200 bg-blue-50 px-5 py-3 text-sm font-bold text-blue-800">
            <app-icon name="eye" [size]="18" class="shrink-0 text-blue-500" />
            <span>{{ 'bookingDetail.readOnlyNotice' | t }}</span>
          </div>
        }

        <div class="grid gap-6 xl:grid-cols-[1fr_360px]">
          <div class="space-y-6">
            <article class="card-surface p-5 sm:p-7"><div class="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div><p class="text-[10px] font-black uppercase tracking-[.16em] text-slate-400">{{ 'bookingDetail.currentStatus' | t }}</p><div class="mt-2"><app-status-badge [value]="booking()!.status" domain="booking" /></div></div><div class="grid grid-cols-2 gap-3 sm:grid-cols-3"><div class="rounded-2xl bg-violet-50 px-4 py-3 text-center"><p class="text-[10px] font-black uppercase text-violet-500">{{ 'bookingDetail.priority' | t }}</p><p class="mt-1 text-xl font-black text-violet-800">P{{ booking()!.priorityLevel ?? '—' }}</p></div><div class="rounded-2xl bg-cyan-50 px-4 py-3 text-center"><p class="text-[10px] font-black uppercase text-cyan-500">{{ 'bookingDetail.resources' | t }}</p><p class="mt-1 text-xl font-black text-cyan-800">{{ booking()!.items.length }}</p></div><div class="col-span-2 rounded-2xl bg-slate-50 px-4 py-3 text-center sm:col-span-1"><p class="text-[10px] font-black uppercase text-slate-400">{{ 'bookingDetail.duration' | t }}</p><p class="mt-1 text-xl font-black text-slate-800">{{ durationHours() }}h</p></div></div></div><div class="mt-6 grid gap-4 sm:grid-cols-2"><div class="rounded-2xl border border-slate-200 p-5"><p class="text-xs font-black text-slate-400">{{ 'bookingDetail.start' | t }}</p><p class="mt-2 text-lg font-black text-slate-900">{{ booking()!.startTime | date:'HH:mm' }}</p><p class="mt-1 text-sm text-slate-500">{{ booking()!.startTime | date:'EEEE, dd/MM/yyyy' }}</p></div><div class="rounded-2xl border border-slate-200 p-5"><p class="text-xs font-black text-slate-400">{{ 'bookingDetail.end' | t }}</p><p class="mt-2 text-lg font-black text-slate-900">{{ booking()!.endTime | date:'HH:mm' }}</p><p class="mt-1 text-sm text-slate-500">{{ booking()!.endTime | date:'EEEE, dd/MM/yyyy' }}</p></div></div><div class="mt-5 rounded-2xl bg-slate-50 p-5"><p class="text-xs font-black text-slate-700">{{ 'bookingDetail.purposeDesc' | t }}</p><p class="mt-2 whitespace-pre-line text-sm leading-7 text-slate-500">{{ booking()!.purposeDescription || ('bookingDetail.noDescription' | t) }}</p></div>@if (booking()!.rejectionReason) { <div class="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-5"><p class="text-xs font-black text-rose-800">{{ 'bookingDetail.rejectionReason' | t }}</p><p class="mt-2 text-sm leading-6 text-rose-700">{{ booking()!.rejectionReason }}</p></div> }</article>

            <article class="card-surface overflow-hidden">
              <header class="border-b border-slate-100 px-5 py-5 sm:px-6">
                <h2 class="text-lg font-black text-slate-950">{{ 'bookingDetail.itemsTitle' | t }}</h2>
                <p class="mt-1 text-xs text-slate-400">{{ 'bookingDetail.itemsSub' | t }}</p>
              </header>
              <div class="divide-y divide-slate-100">
                @for (item of booking()!.items; track item.bookingItemId) {
                  <div class="p-5 sm:p-6">
                    <div class="flex flex-col gap-4 sm:flex-row sm:items-center">
                      <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl" [ngClass]="item.resourceType === 'LabRoom' ? 'bg-violet-50 text-violet-600' : 'bg-cyan-50 text-cyan-600'">
                        <app-icon [name]="item.resourceType === 'LabRoom' ? 'building' : 'microscope'" [size]="22" />
                      </div>
                      <div class="min-w-0 flex-1">
                        <p class="font-black text-slate-900">{{ (item.labName | t) || (item.equipmentName | t) || 'Tài nguyên #' + item.bookingItemId }}</p>
                        <p class="mt-1 text-xs text-slate-400">{{ labelOf('resource', item.resourceType, languageStore.lang()) }} · Item #{{ item.bookingItemId }}</p>
                        <p class="mt-2 text-sm text-slate-500">{{ item.note || ('bookingDetail.noNote' | t) }}</p>
                      </div>
                      <div class="flex flex-wrap items-center gap-2">
                        @if (booking()!.status === 'Approved') {
                          <!-- Chưa check-in -->
                          @if (!logFor(item.bookingItemId)) {
                            @if (isMissedNoShow(item.bookingItemId)) {
                              <span class="rounded-full bg-rose-50 px-3 py-2 text-xs font-black text-rose-700">{{ 'bookingDetail.overdueNoCheckin' | t }}</span>
                            } @else {
                              <button
                                class="btn-primary"
                                [disabled]="!canCheckInNow()"
                                [title]="!canCheckInNow() ? ('bookingDetail.checkInBeforeMsg' | t) : ''"
                                (click)="openCheckIn(item)"
                              >
                                <app-icon name="login" [size]="16" /> Check-in
                              </button>
                              @if (isUpcomingBooking()) {
                                <span class="text-xs font-bold text-slate-400">{{ 'bookingDetail.notTimeYet' | t }}</span>
                              }
                            }
                          }
                           @if (logFor(item.bookingItemId); as log) {
                             @if (!log.actualCheckout) {
                               <button class="btn-primary" (click)="openCheckOut(log)">
                                 <app-icon name="logout" [size]="16" /> {{ (store.isManager() || store.isAdmin()) && !isOwnBooking() ? ('bookingDetail.checkoutByManager' | t) : 'Check-out' }}
                               </button>
                               <button class="btn-secondary" (click)="openIncident(log)">
                                 <app-icon name="alert" [size]="16" /> {{ 'bookingDetail.reportIncident' | t }}
                               </button>
                             } @else {
                              <span class="rounded-full bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700">
                                <app-icon name="check" [size]="14" /> {{ 'bookingDetail.checkedOutDone' | t }}
                              </span>
                            }
                          }
                        } @else {
                          <span class="text-xs font-bold text-slate-400">{{ 'bookingDetail.statusLabel' | t }}: {{ labelOf('booking', booking()!.status, languageStore.lang()) }}</span>
                        }
                      </div>
                    </div>
                    @if (logFor(item.bookingItemId); as log) {
                      <div class="mt-4 grid gap-3 rounded-2xl bg-slate-50 p-4 sm:grid-cols-3">
                        <div><p class="text-[10px] font-black uppercase text-slate-400">Check-in</p><p class="mt-1 text-xs font-bold text-slate-700">{{ log.actualCheckin | date:'HH:mm dd/MM/yyyy' }}</p></div>
                        <div><p class="text-[10px] font-black uppercase text-slate-400">Check-out</p><p class="mt-1 text-xs font-bold text-slate-700">{{ log.actualCheckout ? (log.actualCheckout | date:'HH:mm dd/MM/yyyy') : ('bookingDetail.notCheckedOutYet' | t) }}</p></div>
                        <div><p class="text-[10px] font-black uppercase text-slate-400">{{ 'bookingDetail.incidentLabel' | t }}</p><p class="mt-1 text-xs font-bold text-slate-700">{{ labelOf('incidentType', log.incidentStatus, languageStore.lang()) }} · {{ labelOf('incident', log.incidentReviewStatus, languageStore.lang()) }}</p></div>
                      </div>
                    }
                  </div>
                }
              </div>
            </article>

            @if (violations().length) { <article class="card-surface overflow-hidden"><header class="border-b border-slate-100 px-5 py-5"><h2 class="font-black text-slate-950">{{ 'bookingDetail.relatedViolations' | t }}</h2></header><div class="divide-y divide-slate-100">@for (item of violations(); track item.violationId) { <div class="flex items-center gap-4 px-5 py-4"><div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50 text-rose-600"><app-icon name="alert" [size]="18" /></div><div class="min-w-0 flex-1"><p class="font-black text-slate-800">{{ labelOf('violationType', item.violationType, languageStore.lang()) }}</p><p class="mt-1 text-xs text-slate-400">{{ item.loggedAt | date:'HH:mm dd/MM/yyyy' }} · +{{ item.penaltyPointsAdded }} {{ 'bookingDetail.points' | t }}</p></div><app-status-badge [value]="item.status" domain="violation" /></div> }</div></article> }
          </div>

          <aside class="space-y-5"><article class="card-surface p-5"><p class="text-xs font-black uppercase tracking-[.15em] text-violet-500">{{ 'bookingDetail.requester' | t }}</p><div class="mt-4 flex items-center gap-3"><div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 font-black text-violet-700">{{ initials(booking()!.userName || 'U') }}</div><div><p class="font-black text-slate-900">{{ booking()!.userName || 'User #' + booking()!.userId }}</p><p class="mt-1 text-xs text-slate-400">User ID {{ booking()!.userId }}</p></div></div></article><article class="card-surface p-5"><p class="text-xs font-black uppercase tracking-[.15em] text-slate-400">{{ 'bookingDetail.approval' | t }}</p><div class="mt-4 space-y-4"><div><p class="text-xs text-slate-400">{{ 'bookingDetail.approvedBy' | t }}</p><p class="mt-1 font-bold text-slate-800">{{ booking()!.approvedByName || ('bookingDetail.notApprovedYet' | t) }}</p></div><div class="h-px bg-slate-100"></div><div><p class="text-xs text-slate-400">{{ 'bookingDetail.approvedAt' | t }}</p><p class="mt-1 font-bold text-slate-800">{{ booking()!.approvedAt ? (booking()!.approvedAt | date:'HH:mm dd/MM/yyyy') : '—' }}</p></div></div></article>@if (canManageConcluded()) { <article class="rounded-[24px] border border-indigo-200 bg-indigo-50 p-5"><p class="font-black text-indigo-900">{{ 'bookingDetail.concludeOps' | t }}</p><p class="mt-2 text-sm leading-6 text-indigo-800/70">{{ 'bookingDetail.concludeSub' | t }}</p><div class="mt-4 grid gap-2"><button class="btn-primary" (click)="action('complete')"><app-icon name="check" [size]="16" /> {{ 'bookingDetail.markComplete' | t }}</button><button class="btn-secondary btn-danger" (click)="action('no-show')"><app-icon name="alert" [size]="16" /> {{ 'bookingDetail.markNoShow' | t }}</button></div></article> }</aside>
        </div>

        <app-modal [open]="rejectOpen()" [title]="'bookingDetail.rejectModalTitle' | t" [subtitle]="'bookingDetail.rejectModalSub' | t" (close)="rejectOpen.set(false)"><label class="field-label">{{ 'bookingDetail.rejectReasonLabel' | t }}</label><textarea class="textarea-shell" [(ngModel)]="rejectionReason" placeholder="{{ 'bookingDetail.rejectReasonPlaceholder' | t }}"></textarea><div class="mt-5 flex justify-end gap-2"><button class="btn-secondary" (click)="rejectOpen.set(false)">{{ 'common.cancel' | t }}</button><button class="btn-primary" [disabled]="!rejectionReason.trim()" (click)="reject()">{{ 'bookingDetail.confirmReject' | t }}</button></div></app-modal>
        <app-modal [open]="incidentOpen()" [title]="'bookingDetail.incidentModalTitle' | t" [subtitle]="'bookingDetail.incidentModalSub' | t" (close)="incidentOpen.set(false)"><div class="grid gap-4"><div><label class="field-label">{{ 'bookingDetail.incidentTypeLabel' | t }}</label><select class="input-shell" [(ngModel)]="incidentStatus"><option [ngValue]="2">{{ 'incidents.confirmWarning' | t }}</option><option [ngValue]="3">{{ 'violationType.LateCheckout' | t }}</option><option [ngValue]="4">{{ 'incidentType.MissingEquipment' | t }}</option><option [ngValue]="5">{{ 'incidentType.Other' | t }}</option></select></div><div><label class="field-label">{{ 'bookingDetail.affectedEquipmentIdLabel' | t }}</label><input class="input-shell" type="number" [(ngModel)]="affectedEquipmentId" placeholder="{{ 'bookingDetail.affectedEquipmentPlaceholder' | t }}" /></div><div><label class="field-label">{{ 'bookingDetail.detailDescLabel' | t }}</label><textarea class="textarea-shell" [(ngModel)]="incidentDescription"></textarea></div><div class="flex justify-end gap-2"><button class="btn-secondary" (click)="incidentOpen.set(false)">{{ 'common.cancel' | t }}</button><button class="btn-primary" [disabled]="!incidentDescription.trim()" (click)="reportIncident()">{{ 'bookingDetail.sendReportBtn' | t }}</button></div></div></app-modal>
        <app-modal [open]="checkInOpen()" [title]="'bookingDetail.checkinModalTitle' | t" [subtitle]="'bookingDetail.checkinModalSub' | t" (close)="checkInOpen.set(false)">@if (checkInItem; as item) { <div class="grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm"><div class="flex justify-between"><span class="text-slate-400">{{ 'bookingDetail.checkinPerson' | t }}</span><span class="font-black text-slate-800">{{ store.user()?.fullName }}</span></div><div class="flex justify-between"><span class="text-slate-400">{{ 'bookingDetail.account' | t }}</span><span class="font-bold text-slate-700">{{ store.user()?.username }} · {{ store.user()?.email }}</span></div><div class="flex justify-between"><span class="text-slate-400">{{ 'bookingDetail.department' | t }}</span><span class="font-bold text-slate-700">{{ store.user()?.departmentName }}</span></div><div class="flex justify-between"><span class="text-slate-400">{{ 'bookingDetail.labOrResource' | t }}</span><span class="font-bold text-slate-700">{{ (item.labName | t) || (item.equipmentName | t) }}</span></div><div class="flex justify-between"><span class="text-slate-400">{{ 'bookingDetail.checkinTimestamp' | t }}</span><span class="font-bold text-slate-700">{{ checkInTime | date:'HH:mm dd/MM/yyyy' }}</span></div></div><div class="mt-4 rounded-xl border border-cyan-200 bg-cyan-50/70 p-3 text-xs leading-5 text-cyan-900"><p class="font-bold">{{ 'bookingDetail.checkinRuleTitle' | t }}</p><p class="mt-0.5 text-cyan-800">{{ 'bookingDetail.checkinRuleBody' | t }}</p></div><div class="mt-5 flex justify-end gap-2"><button class="btn-secondary" (click)="checkInOpen.set(false)">{{ 'common.cancel' | t }}</button><button class="btn-primary" (click)="confirmCheckIn()"><app-icon name="login" [size]="16" /> {{ 'bookingDetail.confirmCheckinBtn' | t }}</button></div> }</app-modal>
        <app-modal [open]="checkOutOpen()" [title]="'bookingDetail.checkoutModalTitle' | t" [subtitle]="'bookingDetail.checkoutModalSub' | t" (close)="checkOutOpen.set(false)">@if (checkOutLog; as log) { <div class="grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm"><div class="flex justify-between"><span class="text-slate-400">{{ 'bookingDetail.user' | t }}</span><span class="font-black text-slate-800">{{ store.user()?.fullName }}</span></div><div class="flex justify-between"><span class="text-slate-400">{{ 'bookingDetail.checkinTime' | t }}</span><span class="font-bold text-slate-700">{{ log.actualCheckin | date:'HH:mm dd/MM/yyyy' }}</span></div><div class="flex justify-between"><span class="text-slate-400">{{ 'bookingDetail.registeredEndTime' | t }}</span><span class="font-bold text-slate-700">{{ booking()!.endTime | date:'HH:mm dd/MM/yyyy' }}</span></div></div>@if (checkoutLateMinutes() > 0) { <div class="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs leading-5 text-rose-900"><p class="font-black">{{ 'bookingDetail.lateNoticeTitle' | t }}</p><p class="mt-1">{{ 'bookingDetail.lateNoticeBody' | t: { minutes: checkoutLateMinutes() } }}</p></div> }<div class="mt-5 flex flex-wrap justify-end gap-2"><button class="btn-secondary" (click)="continueUsing()">{{ 'bookingDetail.continueUsingBtn' | t }}</button><button class="btn-primary" (click)="confirmCheckout()"><app-icon name="logout" [size]="16" /> {{ 'bookingDetail.confirmCheckoutBtn' | t }}</button></div> }</app-modal>
      }
    </section>
  `,
})
export class BookingDetailPage implements OnInit {
  private readonly api = inject(SystemService)
  private readonly route = inject(ActivatedRoute)
  private readonly router = inject(Router)
  private readonly toast = inject(ToastService)
  protected readonly store = inject(AuthStore)
  protected readonly languageStore = inject(LanguageStore)
  protected readonly booking = signal<BookingDetailResponse | null>(null)
  protected readonly logs = signal<UsageLogResponse[]>([])
  protected readonly violations = signal<ViolationResponse[]>([])
  protected readonly loading = signal(true)
  protected readonly rejectOpen = signal(false)
  protected readonly incidentOpen = signal(false)
  protected readonly checkInOpen = signal(false)
  protected readonly checkOutOpen = signal(false)
  protected rejectionReason = ''
  protected incidentStatus = 2
  protected incidentDescription = ''
  protected affectedEquipmentId: number | null = null
  protected readonly labelOf = labelOf
  private id = 0
  private incidentLogId = 0
  protected checkInItem: BookingItemResponse | null = null
  protected checkInTime = ''
  protected checkOutLog: UsageLogResponse | null = null
  private noShowChecked = false
  protected readonly durationHours = computed(() => { const item = this.booking(); return item ? Math.round((+new Date(item.endTime)-+new Date(item.startTime))/360000)/10 : 0 })

  ngOnInit(): void { this.id = Number(this.route.snapshot.paramMap.get('bookingId')); this.load() }
  protected canApprove(): boolean { return Boolean(this.store.isManager() && this.booking()?.status === 'Pending') }
  protected isOwnBooking(): boolean { return this.booking()?.userId === this.store.user()?.userId }
  protected canCancel(): boolean { const item = this.booking(); return Boolean(item && ['Pending','Approved'].includes(item.status) && (item.userId === this.store.user()?.userId || this.store.isManager())) }
  protected canCheckIn(): boolean { const item = this.booking(); if (!item || item.status !== 'Approved') return false; return getCheckInWindowInfo(item.startTime, item.endTime).canCheckIn }
  protected canCheckInNow(): boolean {
    const item = this.booking()
    if (!item || item.status !== 'Approved') return false
    if (!this.isOwnBooking() && !this.store.isManager()) return false
    return getCheckInWindowInfo(item.startTime, item.endTime).canCheckIn
  }
  protected isUpcomingBooking(): boolean {
    const item = this.booking()
    if (!item || item.status !== 'Approved') return false
    return getCheckInWindowInfo(item.startTime, item.endTime).isTooEarly
  }
  protected checkUserRestricted(): boolean {
    const status = this.store.user()?.status
    if (status === 'Restricted' || status === 3) {
      this.toast.error('Tài khoản đang bị hạn chế', 'Tài khoản của bạn đang ở trạng thái Bị hạn chế do có điểm vi phạm. Không thể thực hiện Check-in / Check-out.')
      return true
    }
    return false
  }
  protected canManageConcluded(): boolean { return Boolean(this.store.isManager() && this.booking()?.status === 'Approved') }
  protected isMissedNoShow(itemId: number): boolean { const item = this.booking(); if (!item || item.status !== 'Approved') return false; return Date.now() > +new Date(item.endTime) && !this.logFor(itemId) }
  protected checkoutLateMinutes(): number { const item = this.booking(); if (!item) return 0; const deadline = +new Date(item.endTime); return Math.max(0, Math.round((Date.now()-deadline)/60_000)) }
  protected logFor(itemId: number): UsageLogResponse | undefined { return this.logs().find((log) => log.bookingItemId === itemId) }
  protected initials(name: string): string { return name.trim().split(/\s+/).slice(-2).map((x) => x[0]?.toUpperCase() ?? '').join('') }
  protected action(action: 'approve'|'cancel'|'complete'|'no-show'): void { if (!confirm(`Xác nhận thao tác ${action} booking #${this.id}?`)) return; const request = action === 'approve' ? this.api.approveBooking(this.id) : action === 'cancel' ? this.api.cancelBooking(this.id) : action === 'complete' ? this.api.completeBooking(this.id) : this.api.noShowBooking(this.id); request.subscribe({ next: () => { this.toast.success('Đã cập nhật booking'); this.load() }, error: () => this.toast.error('Không thể cập nhật booking') }) }
  protected reject(): void { this.api.rejectBooking(this.id, this.rejectionReason.trim()).subscribe({ next: () => { this.rejectOpen.set(false); this.toast.success('Đã từ chối booking'); this.load() }, error: () => this.toast.error('Không thể từ chối booking') }) }
  protected checkIn(itemId: number): void {
    if (this.checkUserRestricted()) return
    this.api.checkIn(itemId).subscribe({
      next: () => { this.toast.success('Check-in thành công', 'Đã bắt đầu phiên sử dụng tài nguyên.'); this.load() },
      error: (err: any) => {
        const msg = err?.error?.message || (typeof err?.error === 'string' ? err.error : null) || err?.message || 'Kiểm tra khung giờ và trạng thái booking.'
        this.toast.error('Không thể check-in', msg)
      }
    })
  }
  protected checkOut(logId: number): void {
    if (this.checkUserRestricted()) return
    if (!confirm('Xác nhận check-out tài nguyên này?')) return
    this.api.checkOut(logId).subscribe({
      next: () => { this.toast.success('Check-out thành công', 'Phiên sử dụng đã hoàn tất.'); this.load() },
      error: (err: any) => {
        const msg = err?.error?.message || (typeof err?.error === 'string' ? err.error : null) || err?.message || 'Không thể check-out.'
        this.toast.error('Không thể check-out', msg)
      }
    })
  }
  protected openCheckIn(item: BookingItemResponse): void { this.checkInItem = item; this.checkInTime = new Date().toISOString(); this.checkInOpen.set(true) }
  protected confirmCheckIn(): void { const item = this.checkInItem; if (!item) return; this.checkInOpen.set(false); this.checkIn(item.bookingItemId) }
  protected openCheckOut(log: UsageLogResponse): void { this.checkOutLog = log; this.checkOutOpen.set(true) }
  protected confirmCheckout(): void {
    const log = this.checkOutLog
    const item = this.booking()
    if (!log || !item) return
    this.checkOutOpen.set(false)
    this.checkOut(log.logId)
  }
  protected continueUsing(): void { this.checkOutOpen.set(false) }
  protected openIncident(log: UsageLogResponse): void { this.incidentLogId = log.logId; this.incidentStatus = 2; this.incidentDescription = ''; this.affectedEquipmentId = null; this.incidentOpen.set(true) }
  protected reportIncident(): void { this.api.reportIncident(this.incidentLogId, { incidentStatus: this.incidentStatus, incidentDescription: this.incidentDescription.trim(), affectedEquipmentId: this.affectedEquipmentId }).subscribe({ next: () => { this.incidentOpen.set(false); this.toast.success('Đã gửi báo cáo sự cố'); this.load() }, error: () => this.toast.error('Không thể gửi báo cáo sự cố') }) }
  protected readonly accessDenied = signal(false)
  protected readonly errorMessage = signal('')

  protected sendErrorReportToBE(): void {
    const user = this.store.user()
    if (!user?.userId) return
    const errorMsg = this.errorMessage() || 'Ngoại lệ phân quyền xem chi tiết booking / vi phạm từ BE'
    this.api
      .sendNotification({
        userId: user.userId,
        title: 'Báo cáo lỗi & Đồng bộ Data Backend',
        message: `[Báo lỗi BookingDetail BE Data] Người dùng ${user.fullName || user.username} (User ID ${user.userId}) báo cáo ngoại lệ tại Booking #${this.id}: ${errorMsg}`,
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

  protected goBackToList(): void {
    const user = this.store.user()
    if (user?.userId && this.accessDenied()) {
      this.api
        .sendNotification({
          userId: user.userId,
          title: 'Phản hồi từ chối truy cập chi tiết booking',
          message: `Người dùng ${user.fullName || user.username} đã quay lại trang sau khi nhận thông báo từ chối truy cập booking #${this.id}.`,
          notificationType: 1,
        })
        .pipe(catchError(() => EMPTY))
        .subscribe()
    }
    void this.router.navigate([this.store.isRequester() ? '/app/bookings/my' : '/app/management/bookings'])
  }

  private load(): void {
    this.loading.set(true)
    this.accessDenied.set(false)
    this.errorMessage.set('')
    forkJoin({
      booking: this.api.booking(this.id).pipe(
        timeout(2500),
        catchError((err: any) => {
          this.accessDenied.set(true)
          const msg =
            err?.message ||
            err?.error?.message ||
            err?.error?.detail ||
            (err?.name === 'TimeoutError'
              ? 'Máy chủ Backend đang tạm dừng hoặc xử lý lâu (Timeout 2.5s).'
              : 'Bạn không có quyền xem booking này.')
          this.errorMessage.set(msg)
          return of(null)
        }),
      ),
      logs: this.api.usageLogsByBooking(this.id).pipe(catchError(() => of([]))),
      violations: this.api.violationsByBooking(this.id).pipe(
        catchError((err: any) => {
          if (!this.errorMessage()) {
            this.accessDenied.set(true)
            const msg =
              err?.message ||
              err?.error?.message ||
              err?.error?.detail ||
              'Bạn không có quyền xem vi phạm của booking này.'
            this.errorMessage.set(msg)
          }
          return of([])
        }),
      ),
    }).subscribe({
      next: ({ booking, logs, violations }) => {
        this.booking.set(booking)
        this.logs.set(logs)
        this.violations.set(violations)
        this.loading.set(false)
      },
      error: () => {
        this.booking.set(null)
        this.loading.set(false)
      },
    })
  }
}
