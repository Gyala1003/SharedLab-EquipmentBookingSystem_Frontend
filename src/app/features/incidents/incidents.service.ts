import { Injectable, inject } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { env } from '../../core/config/env'
import type { CreateIncidentInput, Incident, UpdateIncidentInput } from './incidents.types'

/** Incidents API. Matches backend IncidentsController. */
@Injectable({ providedIn: 'root' })
export class IncidentsService {
  private readonly http = inject(HttpClient)
  private readonly base = `${env.apiBaseUrl}/incidents`

  /** GET /api/incidents */
  getAll(): Observable<Incident[]> {
    return this.http.get<Incident[]>(this.base)
  }

  /** GET /api/incidents/{id} */
  getById(id: number): Observable<Incident> {
    return this.http.get<Incident>(`${this.base}/${id}`)
  }

  /** POST /api/incidents */
  create(input: CreateIncidentInput): Observable<Incident> {
    return this.http.post<Incident>(this.base, input)
  }

  /** PUT /api/incidents/{id} */
  update(id: number, input: UpdateIncidentInput): Observable<void> {
    return this.http.put<void>(`${this.base}/${id}`, input)
  }
}
