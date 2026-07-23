import { Injectable, inject } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { env } from '../../core/config/env'
import type { CreateMaintenanceInput, MaintenanceSchedule, UpdateMaintenanceInput } from './maintenance.types'

/** Maintenance API. Matches backend MaintenanceController. */
@Injectable({ providedIn: 'root' })
export class MaintenanceService {
  private readonly http = inject(HttpClient)
  private readonly base = `${env.apiBaseUrl}/maintenance`

  /** GET /api/maintenance */
  getAll(): Observable<MaintenanceSchedule[]> {
    return this.http.get<MaintenanceSchedule[]>(this.base)
  }

  /** GET /api/maintenance/{id} */
  getById(id: number): Observable<MaintenanceSchedule> {
    return this.http.get<MaintenanceSchedule>(`${this.base}/${id}`)
  }

  /** POST /api/maintenance */
  create(input: CreateMaintenanceInput): Observable<MaintenanceSchedule> {
    return this.http.post<MaintenanceSchedule>(this.base, input)
  }

  /** PUT /api/maintenance/{id} */
  update(id: number, input: UpdateMaintenanceInput): Observable<void> {
    return this.http.put<void>(`${this.base}/${id}`, input)
  }

  /** DELETE /api/maintenance/{id} */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`)
  }
}
