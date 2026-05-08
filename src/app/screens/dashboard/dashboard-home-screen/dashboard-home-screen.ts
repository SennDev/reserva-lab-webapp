import { Component, inject, OnInit, signal } from '@angular/core';
import { SHARED_IMPORTS } from '../../../shared/shared-imports';
import { AuthService } from '../../../services/auth.service';
import { DashboardService } from '../../../services/dashboard.service';
import {
  DashboardReserva,
  DashboardStat
} from '../../../shared/models/dashboard.model';
import { extractErrorMessage } from '../../../shared/utils/http-error.utils';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [SHARED_IMPORTS],
  templateUrl: './dashboard-home-screen.html',
  styleUrl: './dashboard-home-screen.scss'
})
export class DashboardHomeScreen implements OnInit {
  private authService = inject(AuthService);
  private dashboardService = inject(DashboardService);

  public userName = signal('Usuario');
  public isLoading = signal(true);
  public loadError = signal<string | null>(null);
  public stats = signal<DashboardStat[]>([]);
  public proximasReservas = signal<DashboardReserva[]>([]);
  public ocupacionGlobal = signal(0);

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      if (user?.nombre_completo) {
        this.userName.set(user.nombre_completo.split(' ')[0]);
      }
    });

    this.fetchDashboardData();
  }

  public refresh(): void {
    this.fetchDashboardData();
  }

  private fetchDashboardData(): void {
    this.isLoading.set(true);
    this.loadError.set(null);

    this.dashboardService.getSummary().subscribe({
      next: (summary) => {
        this.stats.set(summary.stats);
        this.proximasReservas.set(summary.proximas_reservas);
        this.ocupacionGlobal.set(summary.ocupacion_global);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.stats.set([]);
        this.proximasReservas.set([]);
        this.ocupacionGlobal.set(0);
        this.loadError.set(
          extractErrorMessage(error, 'No se pudo cargar el resumen del dashboard.')
        );
      }
    });
  }
}
