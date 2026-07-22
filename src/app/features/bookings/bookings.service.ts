import { Injectable, inject } from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'
import { Observable } from 'rxjs'
import { env } from '../../core/config/env'
import type {
  BookingDetailResponse,
  BookingResponse,
  CalendarEventResponse,
  CreateBookingRequest,
  RejectBookingRequest,
  UpdateBookingRequest,
} from './bookings.types'

/** Bookings API. Matches backend BookingsController. */
@Injectable({ providedIn: 'root' })
export class BookingsService {
  private readonly http = inject(HttpClient)
  private readonly base = `${env.apiBaseUrl}/bookings`

  /** GET /api/bookings — Admin/LabManager only */
  getAll(): Observable<BookingResponse[]> {
    return this.http.get<BookingResponse[]>(this.base)
  }

  /** GET /api/bookings/{id} */
  getById(id: number): Observable<BookingDetailResponse> {
    return this.http.get<BookingDetailResponse>(`${this.base}/${id}`)
  }

  /** GET /api/bookings/user/{userId} */
  getByUserId(userId: number): Observable<BookingResponse[]> {
    return this.http.get<BookingResponse[]>(`${this.base}/user/${userId}`)
  }

  /** GET /api/bookings/pending — Admin/LabManager only */
  getPending(): Observable<BookingResponse[]> {
    return this.http.get<BookingResponse[]>(`${this.base}/pending`)
  }

  /** GET /api/bookings/calendar */
  getCalendar(from: string, to: string, labId?: number, equipmentId?: number): Observable<CalendarEventResponse[]> {
    let params = new HttpParams().set('from', from).set('to', to)
    if (labId) params = params.set('labId', labId.toString())
    if (equipmentId) params = params.set('equipmentId', equipmentId.toString())
    return this.http.get<CalendarEventResponse[]>(`${this.base}/calendar`, { params })
  }

  /** POST /api/bookings */
  create(request: CreateBookingRequest): Observable<BookingDetailResponse> {
    return this.http.post<BookingDetailResponse>(this.base, request)
  }

  /** PUT /api/bookings/{id} */
  update(id: number, request: UpdateBookingRequest): Observable<void> {
    return this.http.put<void>(`${this.base}/${id}`, request)
  }

  /** POST /api/bookings/{id}/approve */
  approve(id: number): Observable<void> {
    return this.http.post<void>(`${this.base}/${id}/approve`, {})
  }

  /** POST /api/bookings/{id}/reject */
  reject(id: number, request: RejectBookingRequest): Observable<void> {
    return this.http.post<void>(`${this.base}/${id}/reject`, request)
  }

  /** POST /api/bookings/{id}/cancel */
  cancel(id: number): Observable<void> {
    return this.http.post<void>(`${this.base}/${id}/cancel`, {})
  }

  /** POST /api/bookings/{id}/complete */
  complete(id: number): Observable<void> {
    return this.http.post<void>(`${this.base}/${id}/complete`, {})
  }

  /** POST /api/bookings/{id}/no-show */
  markNoShow(id: number): Observable<void> {
    return this.http.post<void>(`${this.base}/${id}/no-show`, {})
  }
}
