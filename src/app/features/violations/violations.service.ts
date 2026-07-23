import { Injectable, inject } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { env } from '../../core/config/env'
import type { CreateViolationInput, Violation } from './violations.types'

/** Violations API. Matches backend ViolationsController. */
@Injectable({ providedIn: 'root' })
export class ViolationsService {
  private readonly http = inject(HttpClient)
  private readonly base = `${env.apiBaseUrl}/violations`

  /** GET /api/violations */
  getAll(): Observable<Violation[]> {
    return this.http.get<Violation[]>(this.base)
  }

  /** GET /api/violations/user/{userId} */
  getByUserId(userId: number): Observable<Violation[]> {
    return this.http.get<Violation[]>(`${this.base}/user/${userId}`)
  }

  /** POST /api/violations */
  create(input: CreateViolationInput): Observable<Violation> {
    return this.http.post<Violation>(this.base, input)
  }
}
