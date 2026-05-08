import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL, normalizeApiBaseUrl } from '../core/api.config';
import {
  Reserva,
  ReservaPayload,
  ReservationStatusUpdate
} from '../shared/models/reservation.model';

@Injectable({
  providedIn: 'root'
})
export class ReservationsService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = normalizeApiBaseUrl(inject(API_BASE_URL));

  public list(search?: string): Observable<Reserva[]> {
    const params = search ? { search } : undefined;
    return this.http.get<Reserva[]>(`${this.apiBaseUrl}/api/reservas/`, { params });
  }

  public getById(id: string): Observable<Reserva> {
    return this.http.get<Reserva>(`${this.apiBaseUrl}/api/reservas/${id}/`);
  }

  public create(payload: ReservaPayload): Observable<Reserva> {
    return this.http.post<Reserva>(`${this.apiBaseUrl}/api/reservas/`, payload);
  }

  public updateStatus(id: string, estado: ReservationStatusUpdate): Observable<Reserva> {
    return this.http.patch<Reserva>(`${this.apiBaseUrl}/api/reservas/${id}/estado/`, { estado });
  }

  public cancel(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiBaseUrl}/api/reservas/${id}/`);
  }
}
