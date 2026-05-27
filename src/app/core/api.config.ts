import { InjectionToken } from '@angular/core';
import { environment } from '../../environments/environment';

export const DEFAULT_API_BASE_URL = environment.apiBaseUrl;

export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  factory: () => DEFAULT_API_BASE_URL
});

export function normalizeApiBaseUrl(baseUrl: string): string {
  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
}
