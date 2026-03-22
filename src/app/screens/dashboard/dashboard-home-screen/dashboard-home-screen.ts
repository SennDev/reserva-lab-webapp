import { Component, inject, OnInit, signal } from '@angular/core';
import { SHARED_IMPORTS } from '../../../shared/shared-imports';
import { AuthService } from '../../../services/auth.service';

// 1. INTERFACES ESTRICTAS: Para tipar lo que enviará el servidor
export interface DashboardStat {
  title: string;
  value: string | number;
  subtext: string;
  icon: string;
  color: string;
}

export interface DashboardReserva {
  lab: string;
  materia: string;
  fecha: string;
  estado: 'Confirmada' | 'Pendiente' | 'Rechazada';
  badgeClass: string;
}

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [SHARED_IMPORTS],
  templateUrl: './dashboard-home-screen.html',
  styleUrl: './dashboard-home-screen.scss'
})
export class DashboardHomeScreen implements OnInit {
  private authService = inject(AuthService);

  public userName = signal<string>('Usuario');

  // 2. ESTADO DE CARGA PARA EL BACKEND
  public isLoading = signal<boolean>(true);

  // 3. SIGNALS VACÍOS (Esperando los datos de Django)
  public stats = signal<DashboardStat[]>([]);
  public proximasReservas = signal<DashboardReserva[]>([]);
  public ocupacionGlobal = signal<number>(0);

  ngOnInit(): void {
    // Obtenemos el nombre del usuario logueado
    this.authService.currentUser$.subscribe(user => {
      if (user && user.nombre_completo) {
        this.userName.set(user.nombre_completo.split(' ')[0]);
      }
    });

    // Disparamos la petición al backend
    this.fetchDashboardData();
  }

  // 4. SIMULACIÓN DE PETICIÓN HTTP
  private fetchDashboardData(): void {
    this.isLoading.set(true);

    // En el futuro: this.http.get('api/dashboard/summary').subscribe(...)
    setTimeout(() => {

      // Data simulada que llegaría de la Base de Datos
      this.stats.set([
        { title: 'Mis Reservas Activas', value: '3', subtext: '2 programadas para hoy', icon: 'bi-calendar2-check-fill', color: 'text-primary' },
        { title: 'Préstamos Pendientes', value: '1', subtext: 'Osciloscopio Digital', icon: 'bi-tools', color: 'text-warning' },
        { title: 'Labs Disponibles', value: '8', subtext: 'De 12 espacios totales', icon: 'bi-building-check', color: 'text-success' }
      ]);

      this.proximasReservas.set([
        { lab: 'Laboratorio de Computación Avanzada', materia: 'Desarrollo Web', fecha: 'Hoy, 14:00 - 16:00', estado: 'Confirmada', badgeClass: 'badge-success-neo' },
        { lab: 'Laboratorio de Física Experimental', materia: 'Óptica', fecha: 'Mañana, 10:00 - 12:00', estado: 'Pendiente', badgeClass: 'badge-warning-neo' },
        { lab: 'Laboratorio de Redes y Seguridad', materia: 'Ciberseguridad', fecha: 'Jueves, 09:00 - 11:00', estado: 'Confirmada', badgeClass: 'badge-success-neo' }
      ]);

      this.ocupacionGlobal.set(68);

      // Apagamos el estado de carga
      this.isLoading.set(false);
    }, 1500); // 1.5s de latencia de red
  }
}
