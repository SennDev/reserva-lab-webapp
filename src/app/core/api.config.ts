import { InjectionToken } from '@angular/core';

export const DEFAULT_API_BASE_URL = 'http://127.0.0.1:8000';

export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  factory: () => DEFAULT_API_BASE_URL
});

export function normalizeApiBaseUrl(baseUrl: string): string {
  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
}
