import { Component, OnInit, inject, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { TranslatePipe } from '@ngx-translate/core'
import { firstValueFrom } from 'rxjs'
import { ButtonComponent } from '../../shared/ui/button'
import { CardComponent } from '../../shared/ui/card'
import { LabRoomsService } from './lab-rooms.service'
import { LabRoomsStore } from './lab-rooms.store'
import type { CreateLabRoomInput, UpdateLabRoomInput } from './lab-rooms.types'

@Component({
  selector: 'app-lab-room-form-page',
  imports: [FormsModule, TranslatePipe, ButtonComponent, CardComponent],
  template: `
    <section class="mx-auto max-w-lg">
      <app-card [title]="(isEdit() ? 'labRooms.editTitle' : 'labRooms.addTitle') | translate">
        <form class="flex flex-col gap-4" (ngSubmit)="submit()">
          <label class="flex flex-col gap-1 text-sm">
            {{ 'labRooms.labName' | translate }}
            <input [(ngModel)]="form.labName" name="labName" required
              class="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
          </label>
          <label class="flex flex-col gap-1 text-sm">
            {{ 'labRooms.roomCode' | translate }}
            <input [(ngModel)]="form.roomCode" name="roomCode" required
              class="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
          </label>
          <label class="flex flex-col gap-1 text-sm">
            {{ 'labRooms.location' | translate }}
            <input [(ngModel)]="form.location" name="location" required
              class="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
          </label>
          <label class="flex flex-col gap-1 text-sm">
            {{ 'labRooms.capacity' | translate }}
            <input [(ngModel)]="form.capacity" name="capacity" type="number" required min="1"
              class="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
          </label>
          <label class="flex flex-col gap-1 text-sm">
            {{ 'labRooms.description' | translate }}
            <textarea [(ngModel)]="form.description" name="description" rows="3"
              class="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"></textarea>
          </label>
          <label class="flex flex-col gap-1 text-sm">
            {{ 'labRooms.usageGuideline' | translate }}
            <textarea [(ngModel)]="form.usageGuideline" name="usageGuideline" rows="2"
              class="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"></textarea>
          </label>
          @if (!isEdit()) {
            <label class="flex flex-col gap-1 text-sm">
              {{ 'labRooms.managerId' | translate }}
              <input [(ngModel)]="form.managerId" name="managerId" type="number" required
                class="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
            </label>
          }
          <div class="mt-2 flex justify-end gap-2">
            <app-button type="button" variant="ghost" (click)="cancel()">
              {{ 'common.cancel' | translate }}
            </app-button>
            <app-button type="submit" [loading]="store.mutating()">
              {{ 'common.save' | translate }}
            </app-button>
          </div>
        </form>
      </app-card>
    </section>
  `,
})
export class LabRoomFormPage implements OnInit {
  protected readonly store = inject(LabRoomsStore)
  private readonly api = inject(LabRoomsService)
  private readonly router = inject(Router)
  private readonly route = inject(ActivatedRoute)

  protected readonly isEdit = signal(false)
  private editId = 0

  protected form: CreateLabRoomInput = {
    labName: '',
    roomCode: '',
    location: '',
    capacity: 1,
    description: '',
    usageGuideline: '',
    managerId: 0,
  }

  async ngOnInit(): Promise<void> {
    const idParam = this.route.snapshot.paramMap.get('id')
    if (idParam) {
      this.isEdit.set(true)
      this.editId = Number(idParam)
      await this.store.loadById(this.editId)
      const room = this.store.selected()
      if (room) {
        this.form = {
          labName: room.labName,
          roomCode: room.roomCode,
          location: room.location,
          capacity: room.capacity,
          description: room.description ?? '',
          usageGuideline: room.usageGuideline ?? '',
          managerId: 0,
        }
      }
    }
  }

  async submit(): Promise<void> {
    if (this.isEdit()) {
      const { managerId, ...updateData } = this.form
      await firstValueFrom(this.api.update(this.editId, updateData as UpdateLabRoomInput))
    } else {
      await this.store.create(this.form)
    }
    void this.router.navigate(['/lab-rooms'])
  }

  cancel(): void {
    window.history.back()
  }
}
