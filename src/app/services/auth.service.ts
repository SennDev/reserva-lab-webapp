import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { User } from '../shared/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.checkStoredSession();
  }

  public get isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  public login(email: string, password: string): Observable<User> {
    const mockUser: User = {
      id_usuario: 'USR-2026-001',
      nombre_completo: 'Gerson Contreras',
      matricula: '202301234',
      email: email,
      carrera_departamento: 'Ciencias de la Computación',
      tipo_usuario: 'personal',
      rol: 'admin' // ¡Aquí eres Admin!
    };

    return of(mockUser).pipe(
      delay(1500),
      tap(user => {
        // 1. Guardamos en memoria física primero
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('reservalab_user', JSON.stringify(user));
        }
        // 2. Avisamos a toda la app que ya hay usuario
        this.currentUserSubject.next(user);
      })
    );
  }

  public logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('reservalab_user');
    }
    this.currentUserSubject.next(null);
  }

  private checkStoredSession(): void {
    if (isPlatformBrowser(this.platformId)) {
      const storedUser = localStorage.getItem('reservalab_user');
      if (storedUser) {
        // Emitimos el usuario guardado para que los componentes que arranquen lo vean de inmediato
        this.currentUserSubject.next(JSON.parse(storedUser));
      }
    }
  }
}
