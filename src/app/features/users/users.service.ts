import { Injectable, inject } from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'
import { Observable } from 'rxjs'
import { env } from '../../core/config/env'
import type {
  ChangeUserDepartmentInput,
  ChangeUserRoleInput,
  PagedUserResponse,
  SetUserStatusInput,
  UpdateUserInput,
  User,
  UserPenaltyResponse,
  UserSearchParams,
} from './users.types'

/** Users management API. Matches backend UsersController. */
@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly http = inject(HttpClient)
  private readonly base = `${env.apiBaseUrl}/users`

  /** GET /api/users — search with paging */
  search(params: UserSearchParams = {}): Observable<PagedUserResponse> {
    let httpParams = new HttpParams()
    if (params.keyword) httpParams = httpParams.set('keyword', params.keyword)
    if (params.roleName) httpParams = httpParams.set('roleName', params.roleName)
    if (params.departmentId) httpParams = httpParams.set('departmentId', params.departmentId.toString())
    if (params.status) httpParams = httpParams.set('status', params.status)
    if (params.pageNumber) httpParams = httpParams.set('pageNumber', params.pageNumber.toString())
    if (params.pageSize) httpParams = httpParams.set('pageSize', params.pageSize.toString())
    return this.http.get<PagedUserResponse>(this.base, { params: httpParams })
  }

  /** GET /api/users/{id} */
  getById(id: number): Observable<User> {
    return this.http.get<User>(`${this.base}/${id}`)
  }

  /** PUT /api/users/{id} */
  update(id: number, input: UpdateUserInput): Observable<User> {
    return this.http.put<User>(`${this.base}/${id}`, input)
  }

  /** PUT /api/users/{id}/role */
  changeRole(id: number, input: ChangeUserRoleInput): Observable<User> {
    return this.http.put<User>(`${this.base}/${id}/role`, input)
  }

  /** PUT /api/users/{id}/department */
  changeDepartment(id: number, input: ChangeUserDepartmentInput): Observable<User> {
    return this.http.put<User>(`${this.base}/${id}/department`, input)
  }

  /** POST /api/users/{id}/lock */
  lock(id: number): Observable<User> {
    return this.http.post<User>(`${this.base}/${id}/lock`, {})
  }

  /** POST /api/users/{id}/unlock */
  unlock(id: number): Observable<User> {
    return this.http.post<User>(`${this.base}/${id}/unlock`, {})
  }

  /** POST /api/users/{id}/deactivate */
  deactivate(id: number): Observable<User> {
    return this.http.post<User>(`${this.base}/${id}/deactivate`, {})
  }

  /** POST /api/users/{id}/activate */
  activate(id: number): Observable<User> {
    return this.http.post<User>(`${this.base}/${id}/activate`, {})
  }

  /** PUT /api/users/{id}/status */
  setStatus(id: number, input: SetUserStatusInput): Observable<User> {
    return this.http.put<User>(`${this.base}/${id}/status`, input)
  }

  /** GET /api/users/{id}/penalty */
  getPenalty(id: number): Observable<UserPenaltyResponse> {
    return this.http.get<UserPenaltyResponse>(`${this.base}/${id}/penalty`)
  }
}
