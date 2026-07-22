import { Injectable, inject } from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'
import { Observable } from 'rxjs'
import { env } from '../../core/config/env'
import type {
  CreateEquipmentInput,
  Equipment,
  EquipmentDetail,
  EquipmentSearchParams,
  UpdateEquipmentInput,
} from './equipments.types'

@Injectable({ providedIn: 'root' })
export class EquipmentsService {
  private readonly http = inject(HttpClient)
  private readonly base = `${env.apiBaseUrl}/equipments`

  getAll(): Observable<Equipment[]> {
    return this.http.get<Equipment[]>(this.base)
  }

  search(params: EquipmentSearchParams): Observable<Equipment[]> {
    let httpParams = new HttpParams()
    if (params.keyword) httpParams = httpParams.set('keyword', params.keyword)
    if (params.labId) httpParams = httpParams.set('labId', params.labId.toString())
    if (params.status) httpParams = httpParams.set('status', params.status)
    if (params.pageNumber) httpParams = httpParams.set('pageNumber', params.pageNumber.toString())
    if (params.pageSize) httpParams = httpParams.set('pageSize', params.pageSize.toString())
    return this.http.get<Equipment[]>(`${this.base}/search`, { params: httpParams })
  }

  getById(id: number): Observable<EquipmentDetail> {
    return this.http.get<EquipmentDetail>(`${this.base}/${id}`)
  }

  getByLabId(labId: number): Observable<Equipment[]> {
    return this.http.get<Equipment[]>(`${this.base}/lab/${labId}`)
  }

  create(input: CreateEquipmentInput): Observable<EquipmentDetail> {
    return this.http.post<EquipmentDetail>(this.base, input)
  }

  update(id: number, input: UpdateEquipmentInput): Observable<void> {
    return this.http.put<void>(`${this.base}/${id}`, input)
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`)
  }
}
