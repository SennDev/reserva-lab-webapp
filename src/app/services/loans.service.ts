import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL, normalizeApiBaseUrl } from '../core/api.config';
import { LoanStatusUpdate, Prestamo, PrestamoPayload } from '../shared/models/loan.model';

@Injectable({
  providedIn: 'root'
})
export class LoansService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = normalizeApiBaseUrl(inject(API_BASE_URL));

  public list(search?: string): Observable<Prestamo[]> {
    const params = search ? { search } : undefined;
    return this.http.get<Prestamo[]>(`${this.apiBaseUrl}/api/prestamos/`, { params });
  }

  public getById(id: string): Observable<Prestamo> {
    return this.http.get<Prestamo>(`${this.apiBaseUrl}/api/prestamos/${id}/`);
  }

  public create(payload: PrestamoPayload): Observable<Prestamo> {
    return this.http.post<Prestamo>(`${this.apiBaseUrl}/api/prestamos/`, payload);
  }

  public updateStatus(id: string, estado: LoanStatusUpdate): Observable<Prestamo> {
    return this.http.patch<Prestamo>(`${this.apiBaseUrl}/api/prestamos/${id}/estado/`, { estado });
  }
}
