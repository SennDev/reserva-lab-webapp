import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL, normalizeApiBaseUrl } from '../core/api.config';
import { Equipo, EquipoPayload } from '../shared/models/equipment.model';

@Injectable({
  providedIn: 'root'
})
export class EquipmentService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = normalizeApiBaseUrl(inject(API_BASE_URL));

  public list(search?: string): Observable<Equipo[]> {
    const params = search ? { search } : undefined;
    return this.http.get<Equipo[]>(`${this.apiBaseUrl}/api/equipos/`, { params });
  }

  public getById(id: string): Observable<Equipo> {
    return this.http.get<Equipo>(`${this.apiBaseUrl}/api/equipos/${id}/`);
  }

  public create(payload: EquipoPayload): Observable<Equipo> {
    return this.http.post<Equipo>(`${this.apiBaseUrl}/api/equipos/`, payload);
  }

  public update(id: string, payload: EquipoPayload): Observable<Equipo> {
    return this.http.put<Equipo>(`${this.apiBaseUrl}/api/equipos/${id}/`, payload);
  }

  public remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiBaseUrl}/api/equipos/${id}/`);
  }
}
