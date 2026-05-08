import { HttpErrorResponse } from '@angular/common/http';

export type FieldErrorMap = Record<string, string>;

function flattenErrorValue(value: unknown): string {
  if (Array.isArray(value)) {
    return value.map(flattenErrorValue).filter(Boolean).join(' ');
  }

  if (value && typeof value === 'object') {
    return Object.values(value).map(flattenErrorValue).filter(Boolean).join(' ');
  }

  return typeof value === 'string' ? value : '';
}

function getErrorPayload(error: unknown): unknown {
  if (error instanceof HttpErrorResponse) {
    return error.error;
  }

  if (error && typeof error === 'object' && 'error' in error) {
    return (error as { error: unknown }).error;
  }

  return error;
}

export function extractFieldErrors(error: unknown): FieldErrorMap {
  const payload = getErrorPayload(error);

  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return {};
  }

  return Object.entries(payload as Record<string, unknown>).reduce<FieldErrorMap>((acc, [key, value]) => {
    if (key === 'detail') {
      return acc;
    }

    const message = flattenErrorValue(value);

    if (message) {
      acc[key] = message;
    }

    return acc;
  }, {});
}

export function extractErrorMessage(
  error: unknown,
  fallback = 'Ocurrió un error inesperado. Intenta nuevamente.'
): string {
  const payload = getErrorPayload(error);

  if (typeof payload === 'string' && payload.trim()) {
    return payload;
  }

  if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
    const detail = (payload as { detail?: unknown }).detail;

    if (typeof detail === 'string' && detail.trim()) {
      return detail;
    }
  }

  const fieldErrors = extractFieldErrors(error);
  const firstFieldError = Object.values(fieldErrors)[0];

  if (firstFieldError) {
    return firstFieldError;
  }

  if (error instanceof HttpErrorResponse && error.message) {
    return error.message;
  }

  return fallback;
}
