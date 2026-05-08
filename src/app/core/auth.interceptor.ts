import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { API_BASE_URL, normalizeApiBaseUrl } from './api.config';
import { AuthService } from '../services/auth.service';

const AUTH_EXCLUDED_PATHS = [
  '/api/auth/login/',
  '/api/auth/registro/',
  '/api/auth/token/refresh/'
];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const apiBaseUrl = normalizeApiBaseUrl(inject(API_BASE_URL));
  const isApiRequest = req.url.startsWith(apiBaseUrl);
  const isExcludedEndpoint = AUTH_EXCLUDED_PATHS.some((path) => req.url.includes(path));
  const accessToken = authService.accessToken;

  const request =
    isApiRequest && accessToken && !isExcludedEndpoint
      ? req.clone({
          setHeaders: {
            Authorization: `Bearer ${accessToken}`
          }
        })
      : req;

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      const canRefresh =
        error.status === 401 &&
        isApiRequest &&
        !req.url.includes('/api/auth/token/refresh/') &&
        !!authService.refreshToken;

      if (!canRefresh) {
        if (error.status === 401 && isApiRequest) {
          authService.clearSession();
        }

        return throwError(() => error);
      }

      return authService.refreshAccessToken().pipe(
        switchMap(() => {
          const refreshedToken = authService.accessToken;

          if (!refreshedToken) {
            authService.clearSession();
            return throwError(() => error);
          }

          return next(
            req.clone({
              setHeaders: {
                Authorization: `Bearer ${refreshedToken}`
              }
            })
          );
        }),
        catchError((refreshError) => {
          authService.clearSession();
          return throwError(() => refreshError);
        })
      );
    })
  );
};
