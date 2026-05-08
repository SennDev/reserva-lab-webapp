import { Injectable, Inject, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { API_BASE_URL, normalizeApiBaseUrl } from '../core/api.config';
import { LoginResponse, RegisterPayload, RegisterResponse, TokenRefreshResponse } from '../shared/models/auth.model';
import { CurrentUserUpdatePayload, User } from '../shared/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = normalizeApiBaseUrl(inject(API_BASE_URL));

  private readonly accessTokenStorageKey = 'reservalab_access_token';
  private readonly refreshTokenStorageKey = 'reservalab_refresh_token';
  private readonly userStorageKey = 'reservalab_user';

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.checkStoredSession();
  }

  public get isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null && !!this.accessToken;
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  public get accessToken(): string | null {
    return this.getStoredValue(this.accessTokenStorageKey);
  }

  public get refreshToken(): string | null {
    return this.getStoredValue(this.refreshTokenStorageKey);
  }

  public login(email: string, password: string): Observable<User> {
    return this.http
      .post<LoginResponse>(`${this.apiBaseUrl}/api/auth/login/`, { email, password })
      .pipe(
        tap((response) => this.persistSession(response)),
        map((response) => response.user)
      );
  }

  public register(payload: RegisterPayload): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiBaseUrl}/api/auth/registro/`, payload);
  }

  public fetchCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiBaseUrl}/api/auth/me/`).pipe(
      tap((user) => {
        this.currentUserSubject.next(user);
        this.storeValue(this.userStorageKey, JSON.stringify(user));
      })
    );
  }

  public updateCurrentUser(payload: CurrentUserUpdatePayload): Observable<User> {
    return this.http.patch<User>(`${this.apiBaseUrl}/api/auth/me/`, payload).pipe(
      tap((user) => {
        this.currentUserSubject.next(user);
        this.storeValue(this.userStorageKey, JSON.stringify(user));
      })
    );
  }

  public refreshAccessToken(): Observable<TokenRefreshResponse> {
    const refresh = this.refreshToken;

    if (!refresh) {
      throw new Error('No hay refresh token disponible para renovar la sesión.');
    }

    return this.http
      .post<TokenRefreshResponse>(`${this.apiBaseUrl}/api/auth/token/refresh/`, {
        refresh
      })
      .pipe(
        tap((response) => {
          this.storeValue(this.accessTokenStorageKey, response.access);

          if (response.refresh) {
            this.storeValue(this.refreshTokenStorageKey, response.refresh);
          }
        })
      );
  }

  public logout(): void {
    const refresh = this.refreshToken;

    if (refresh) {
      this.http.post(`${this.apiBaseUrl}/api/auth/logout/`, { refresh }).subscribe({
        error: () => {
          // Priorizamos la limpieza local aunque el backend no responda.
        }
      });
    }

    this.clearSession();
  }

  public clearSession(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.accessTokenStorageKey);
      localStorage.removeItem(this.refreshTokenStorageKey);
      localStorage.removeItem(this.userStorageKey);
    }

    this.currentUserSubject.next(null);
  }

  private checkStoredSession(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const storedUser = localStorage.getItem(this.userStorageKey);

    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  private persistSession(response: LoginResponse): void {
    this.currentUserSubject.next(response.user);
    this.storeValue(this.accessTokenStorageKey, response.access);
    this.storeValue(this.refreshTokenStorageKey, response.refresh);
    this.storeValue(this.userStorageKey, JSON.stringify(response.user));
  }

  private getStoredValue(key: string): string | null {
    return isPlatformBrowser(this.platformId) ? localStorage.getItem(key) : null;
  }

  private storeValue(key: string, value: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(key, value);
    }
  }
}
