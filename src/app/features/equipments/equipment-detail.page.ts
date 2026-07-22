import { Component, OnInit, inject, signal } from '@angular/core'
import { ActivatedRoute, RouterLink } from '@angular/router'
import { TranslatePipe } from '@ngx-translate/core'
import { AuthStore } from '../../core/auth/auth.store'
import { BadgeComponent, BadgeTone } from '../../shared/ui/badge'
import { ButtonComponent } from '../../shared/ui/button'
import { IconComponent } from '../../shared/ui/icon'
import { SpinnerComponent } from '../../shared/ui/spinner'
import { EquipmentsStore } from './equipments.store'

const STATUS_TONE: Record<string, BadgeTone> = {
  Available: 'green',
  InUse: 'amber',
  Maintenance: 'amber',
  Broken: 'red',
  Retired: 'slate',
}

@Component({
  selector: 'app-equipment-detail-page',
  imports: [RouterLink, TranslatePipe, BadgeComponent, ButtonComponent, IconComponent, SpinnerComponent],
  template: `
    @if (store.status() === 'loading') {
      <div class="flex justify-center py-16"><app-spinner /></div>
    } @else if (store.selected(); as eq) {
      <section class="mx-auto flex max-w-2xl flex-col gap-5">
        <a routerLink="/equipments" class="flex w-fit items-center gap-1 text-sm text-slate-500 hover:text-brand-600">
          <app-icon name="back" [size]="14" />
          {{ 'equipments.backToList' | translate }}
        </a>

        <div class="flex items-start justify-between gap-3">
          <div>
            <h1 class="text-xl font-semibold text-slate-900">{{ eq.equipmentName }}</h1>
            <p class="text-sm text-slate-500">Lab #{{ eq.labId }}</p>
          </div>
          <app-badge [tone]="STATUS_TONE[eq.status] ?? 'slate'">{{ eq.status }}</app-badge>
        </div>

        <div class="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 text-sm">
          @if (eq.modelSpecs) {
            <div class="flex items-center justify-between">
              <span class="text-slate-500">{{ 'equipments.modelSpecs' | translate }}</span>
              <span class="font-medium text-slate-900">{{ eq.modelSpecs }}</span>
            </div>
          }
          @if (eq.usageGuideline) {
            <div class="border-t border-slate-100 pt-3">
              <p class="mb-1 text-slate-500">{{ 'equipments.usageGuideline' | translate }}</p>
              <p class="text-slate-900">{{ eq.usageGuideline }}</p>
            </div>
          }
        </div>

        @if (authStore.isAdmin()) {
          <div class="flex justify-end gap-2">
            <app-button variant="danger" (click)="confirmDelete(eq.equipmentId)">
              {{ 'common.delete' | translate }}
            </app-button>
          </div>
        }
      </section>
    }
  `,
})
export class EquipmentDetailPage implements OnInit {
  protected readonly store = inject(EquipmentsStore)
  protected readonly authStore = inject(AuthStore)
  private readonly route = inject(ActivatedRoute)
  protected readonly STATUS_TONE = STATUS_TONE

  private readonly id = signal(Number(this.route.snapshot.paramMap.get('id') ?? '0'))

  async ngOnInit(): Promise<void> {
    await this.store.loadById(this.id())
  }

  async confirmDelete(id: number): Promise<void> {
    if (confirm('Bạn có chắc muốn xóa thiết bị này?')) {
      await this.store.remove(id)
      window.history.back()
    }
  }
}
