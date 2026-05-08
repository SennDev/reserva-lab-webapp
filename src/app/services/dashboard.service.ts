import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL, normalizeApiBaseUrl } from '../core/api.config';
import { DashboardSummaryResponse } from '../shared/models/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = normalizeApiBaseUrl(inject(API_BASE_URL));

  public getSummary(): Observable<DashboardSummaryResponse> {
    return this.http.get<DashboardSummaryResponse>(`${this.apiBaseUrl}/api/dashboard/summary/`);
  }
}
