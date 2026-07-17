import { Injectable, inject } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { env } from '../../core/config/env'
import type { UpsertUserInput, User } from './users.types'

/** Users API. Talks to the backend at env.apiBaseUrl. */
@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly http = inject(HttpClient)
  private readonly base = `${env.apiBaseUrl}/users`

  list(): Observable<User[]> {
    return this.http.get<User[]>(this.base)
  }

  create(input: UpsertUserInput): Observable<User> {
    return this.http.post<User>(this.base, input)
  }

  update(id: string, input: UpsertUserInput): Observable<User> {
    return this.http.put<User>(`${this.base}/${id}`, input)
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`)
  }
}
