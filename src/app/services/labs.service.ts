import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL, normalizeApiBaseUrl } from '../core/api.config';
import { Laboratorio, LaboratorioPayload } from '../shared/models/lab.model';

@Injectable({
  providedIn: 'root'
})
export class LabsService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = normalizeApiBaseUrl(inject(API_BASE_URL));

  public list(search?: string): Observable<Laboratorio[]> {
    const params = search ? { search } : undefined;
    return this.http.get<Laboratorio[]>(`${this.apiBaseUrl}/api/laboratorios/`, { params });
  }

  public listDisponibles(): Observable<Laboratorio[]> {
    return this.http.get<Laboratorio[]>(`${this.apiBaseUrl}/api/laboratorios/disponibles/`);
  }

  public getById(id: string): Observable<Laboratorio> {
    return this.http.get<Laboratorio>(`${this.apiBaseUrl}/api/laboratorios/${id}/`);
  }

  public create(payload: LaboratorioPayload): Observable<Laboratorio> {
    return this.http.post<Laboratorio>(`${this.apiBaseUrl}/api/laboratorios/`, payload);
  }

  public update(id: string, payload: LaboratorioPayload): Observable<Laboratorio> {
    return this.http.put<Laboratorio>(`${this.apiBaseUrl}/api/laboratorios/${id}/`, payload);
  }

  public delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiBaseUrl}/api/laboratorios/${id}/`);
  }
}
