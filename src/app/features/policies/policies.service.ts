import { Injectable, inject } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { env } from '../../core/config/env'
import type { CreatePolicyInput, Policy, UpdatePolicyInput } from './policies.types'

/** Policies API. Matches backend PoliciesController. */
@Injectable({ providedIn: 'root' })
export class PoliciesService {
  private readonly http = inject(HttpClient)
  private readonly base = `${env.apiBaseUrl}/policies`

  /** GET /api/policies */
  getAll(): Observable<Policy[]> {
    return this.http.get<Policy[]>(this.base)
  }

  /** GET /api/policies/{id} */
  getById(id: number): Observable<Policy> {
    return this.http.get<Policy>(`${this.base}/${id}`)
  }

  /** POST /api/policies */
  create(input: CreatePolicyInput): Observable<Policy> {
    return this.http.post<Policy>(this.base, input)
  }

  /** PUT /api/policies/{id} */
  update(id: number, input: UpdatePolicyInput): Observable<void> {
    return this.http.put<void>(`${this.base}/${id}`, input)
  }

  /** DELETE /api/policies/{id} */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`)
  }
}
