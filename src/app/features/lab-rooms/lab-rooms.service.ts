import { Injectable, inject } from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'
import { Observable } from 'rxjs'
import { env } from '../../core/config/env'
import type {
  ChangeLabRoomManagerInput,
  CreateLabRoomInput,
  LabRoom,
  LabRoomDetail,
  LabRoomSearchParams,
  UpdateLabRoomInput,
} from './lab-rooms.types'

@Injectable({ providedIn: 'root' })
export class LabRoomsService {
  private readonly http = inject(HttpClient)
  private readonly base = `${env.apiBaseUrl}/labrooms`

  getAll(): Observable<LabRoom[]> {
    return this.http.get<LabRoom[]>(this.base)
  }

  search(params: LabRoomSearchParams): Observable<LabRoom[]> {
    let httpParams = new HttpParams()
    if (params.keyword) httpParams = httpParams.set('keyword', params.keyword)
    if (params.status) httpParams = httpParams.set('status', params.status)
    if (params.pageNumber) httpParams = httpParams.set('pageNumber', params.pageNumber.toString())
    if (params.pageSize) httpParams = httpParams.set('pageSize', params.pageSize.toString())
    return this.http.get<LabRoom[]>(`${this.base}/search`, { params: httpParams })
  }

  getById(id: number): Observable<LabRoomDetail> {
    return this.http.get<LabRoomDetail>(`${this.base}/${id}`)
  }

  create(input: CreateLabRoomInput): Observable<LabRoomDetail> {
    return this.http.post<LabRoomDetail>(this.base, input)
  }

  update(id: number, input: UpdateLabRoomInput): Observable<void> {
    return this.http.put<void>(`${this.base}/${id}`, input)
  }

  changeManager(id: number, input: ChangeLabRoomManagerInput): Observable<void> {
    return this.http.put<void>(`${this.base}/${id}/manager`, input)
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`)
  }
}
