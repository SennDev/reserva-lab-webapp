import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs';
import { SHARED_IMPORTS } from '../../../shared/shared-imports';
import { AuthService } from '../../../services/auth.service';
import { DashboardService } from '../../../services/dashboard.service';
import { ReservationsService } from '../../../services/reservations.service';
import { LoansService } from '../../../services/loans.service';
import { DashboardReserva, DashboardStat } from '../../../shared/models/dashboard.model';
import { Prestamo } from '../../../shared/models/loan.model';
import { Reserva } from '../../../shared/models/reservation.model';
import { User, UserRole } from '../../../shared/models/user.model';
import { extractErrorMessage } from '../../../shared/utils/http-error.utils';

type QueueKind = 'reservation' | 'loan';

interface QueueItem {
  id: string;
  kind: QueueKind;
  title: string;
  subtitle: string;
  requester: string;
  meta: string;
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
  private dashboardService = inject(DashboardService);
  private reservationsService = inject(ReservationsService);
  private loansService = inject(LoansService);
  private snackBar = inject(MatSnackBar);

  public currentUser = signal<User | null>(null);
  public userName = signal('Usuario');
  public isLoading = signal(true);
  public loadError = signal<string | null>(null);
  public stats = signal<DashboardStat[]>([]);
  public proximasReservas = signal<DashboardReserva[]>([]);
  public ocupacionGlobal = signal(0);
  public reservas = signal<Reserva[]>([]);
  public prestamos = signal<Prestamo[]>([]);

  public role = computed<UserRole>(() => this.currentUser()?.rol ?? 'estudiante');
  public isAdmin = computed(() => this.role() === 'admin');
  public isTechnician = computed(() => this.role() === 'tecnico');
  public isStudent = computed(() => this.role() === 'estudiante');
  public roleLabel = computed(() => {
    const labels: Record<UserRole, string> = {
      admin: 'Administrador',
      tecnico: 'Técnico',
      estudiante: 'Estudiante'
    };

    return labels[this.role()];
  });

  public activeReservationsCount = computed(
    () => this.reservas().filter((reserva) => ['Pendiente', 'Aprobada'].includes(reserva.estado)).length
  );
  public activeLoansCount = computed(
    () => this.prestamos().filter((prestamo) => ['Pendiente', 'Aprobado'].includes(prestamo.estado)).length
  );
  public pendingReservationsCount = computed(
    () => this.reservas().filter((reserva) => reserva.estado === 'Pendiente').length
  );
  public pendingLoansCount = computed(
    () => this.prestamos().filter((prestamo) => prestamo.estado === 'Pendiente').length
  );

  public summaryCards = computed<DashboardStat[]>(() => {
    if (this.isAdmin()) {
      return [
        {
          title: 'Préstamos activos',
          value: this.activeLoansCount(),
          subtext: `${this.pendingLoansCount()} solicitudes pendientes`,
          icon: 'bi-box-seam-fill',
          color: 'text-primary'
        },
        {
          title: 'Reservas activas',
          value: this.activeReservationsCount(),
          subtext: `${this.pendingReservationsCount()} esperan aprobación`,
          icon: 'bi-calendar2-check-fill',
          color: 'text-success'
        },
        {
          title: 'Estado global',
          value: `${this.ocupacionGlobal()}%`,
          subtext: 'Ocupación de laboratorios hoy',
          icon: 'bi-activity',
          color: 'text-warning'
        }
      ];
    }

    if (this.isTechnician()) {
      return [
        {
          title: 'Reservas por revisar',
          value: this.pendingReservationsCount(),
          subtext: 'Aprobación o rechazo operativo',
          icon: 'bi-inboxes-fill',
          color: 'text-warning'
        },
        {
          title: 'Préstamos por revisar',
          value: this.pendingLoansCount(),
          subtext: 'Entrega y validación de equipo',
          icon: 'bi-tools',
          color: 'text-primary'
        },
        {
          title: 'Labs disponibles',
          value: this.findStatValue('Labs Disponibles'),
          subtext: 'Consulta y seguimiento del catálogo',
          icon: 'bi-building-check',
          color: 'text-success'
        }
      ];
    }

    return this.stats();
  });

  public approvalQueue = computed<QueueItem[]>(() => {
    const reservasPendientes = this.reservas()
      .filter((reserva) => reserva.estado === 'Pendiente')
      .map<QueueItem>((reserva) => ({
        id: reserva.id,
        kind: 'reservation',
        title: reserva.lab,
        subtitle: reserva.materia,
        requester: reserva.solicitante,
        meta: `${reserva.fecha}, ${reserva.horario}`
      }));

    const prestamosPendientes = this.prestamos()
      .filter((prestamo) => prestamo.estado === 'Pendiente')
      .map<QueueItem>((prestamo) => ({
        id: prestamo.id,
        kind: 'loan',
        title: prestamo.equipo,
        subtitle: prestamo.proyecto,
        requester: prestamo.solicitante,
        meta: `${prestamo.fecha}, ${prestamo.horario}`
      }));

    return [...reservasPendientes, ...prestamosPendientes].slice(0, 6);
  });

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser.set(user);

      if (user?.nombre_completo) {
        this.userName.set(user.nombre_completo.split(' ')[0]);
      }
    });

    this.fetchDashboardData();
  }

  public refresh(): void {
    this.fetchDashboardData();
  }

  public approveQueueItem(item: QueueItem): void {
    if (item.kind === 'reservation') {
      this.reservationsService.updateStatus(item.id, 'Aprobada').subscribe({
        next: (updated) => {
          this.reservas.update((items) =>
            items.map((reserva) => (reserva.id === item.id ? updated : reserva))
          );
          this.snackBar.open('Reserva aprobada correctamente.', 'Cerrar', { duration: 3000 });
        },
        error: (error) => this.showStatusError(error, 'No se pudo aprobar la reserva.')
      });
      return;
    }

    this.loansService.updateStatus(item.id, 'Aprobado').subscribe({
      next: (updated) => {
        this.prestamos.update((items) =>
          items.map((prestamo) => (prestamo.id === item.id ? updated : prestamo))
        );
        this.snackBar.open('Préstamo aprobado correctamente.', 'Cerrar', { duration: 3000 });
      },
      error: (error) => this.showStatusError(error, 'No se pudo aprobar el préstamo.')
    });
  }

  public rejectQueueItem(item: QueueItem): void {
    if (item.kind === 'reservation') {
      this.reservationsService.updateStatus(item.id, 'Rechazada').subscribe({
        next: (updated) => {
          this.reservas.update((items) =>
            items.map((reserva) => (reserva.id === item.id ? updated : reserva))
          );
          this.snackBar.open('Reserva rechazada correctamente.', 'Cerrar', { duration: 3000 });
        },
        error: (error) => this.showStatusError(error, 'No se pudo rechazar la reserva.')
      });
      return;
    }

    this.loansService.updateStatus(item.id, 'Rechazado').subscribe({
      next: (updated) => {
        this.prestamos.update((items) =>
          items.map((prestamo) => (prestamo.id === item.id ? updated : prestamo))
        );
        this.snackBar.open('Préstamo rechazado correctamente.', 'Cerrar', { duration: 3000 });
      },
      error: (error) => this.showStatusError(error, 'No se pudo rechazar el préstamo.')
    });
  }

  private fetchDashboardData(): void {
    this.isLoading.set(true);
    this.loadError.set(null);

    forkJoin({
      summary: this.dashboardService.getSummary(),
      reservas: this.reservationsService.list(),
      prestamos: this.loansService.list()
    }).subscribe({
      next: ({ summary, reservas, prestamos }) => {
        this.stats.set(summary.stats);
        this.proximasReservas.set(summary.proximas_reservas);
        this.ocupacionGlobal.set(summary.ocupacion_global);
        this.reservas.set(reservas);
        this.prestamos.set(prestamos);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.stats.set([]);
        this.proximasReservas.set([]);
        this.ocupacionGlobal.set(0);
        this.reservas.set([]);
        this.prestamos.set([]);
        this.loadError.set(
          extractErrorMessage(error, 'No se pudo cargar el resumen del dashboard.')
        );
      }
    });
  }

  private findStatValue(title: string): string | number {
    return this.stats().find((stat) => stat.title === title)?.value ?? 0;
  }

  private showStatusError(error: unknown, fallback: string): void {
    this.snackBar.open(extractErrorMessage(error, fallback), 'Cerrar', { duration: 4000 });
  }
}
