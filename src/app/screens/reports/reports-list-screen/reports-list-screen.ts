import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs';
import { SHARED_IMPORTS } from '../../../shared/shared-imports';
import { AuthService } from '../../../services/auth.service';
import { LoansService } from '../../../services/loans.service';
import { ReservationsService } from '../../../services/reservations.service';
import { LoanStatusUpdate, Prestamo } from '../../../shared/models/loan.model';
import { ReservationStatusUpdate, Reserva } from '../../../shared/models/reservation.model';
import { extractErrorMessage } from '../../../shared/utils/http-error.utils';

type AdminTab = 'reservas' | 'prestamos';

interface AdminRequestItem {
  id: string;
  tipo: AdminTab;
  recurso: string;
  solicitante: string;
  fecha: string;
  horario: string;
  descripcion: string;
  estado: 'Pendiente' | 'Aprobada' | 'Aprobado' | 'Rechazada' | 'Rechazado' | 'Completada' | 'Devuelto';
  cantidad?: number;
}

@Component({
  selector: 'app-reports-list-screen',
  standalone: true,
  imports: [SHARED_IMPORTS],
  templateUrl: './reports-list-screen.html',
  styleUrl: './reports-list-screen.scss'
})
export class ReportsListScreen implements OnInit {
  private authService = inject(AuthService);
  private reservationsService = inject(ReservationsService);
  private loansService = inject(LoansService);
  private snackBar = inject(MatSnackBar);

  public isStaff = signal(false);
  public activeTab = signal<AdminTab>('reservas');
  public searchTerm = signal('');
  public isLoading = signal(true);
  public loadError = signal<string | null>(null);
  public catalogo = signal<AdminRequestItem[]>([]);

  public filteredCatalogo = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const tab = this.activeTab();

    return this.catalogo().filter((item) => {
      if (item.tipo !== tab) {
        return false;
      }

      if (!term) {
        return true;
      }

      return (
        item.recurso.toLowerCase().includes(term) ||
        item.solicitante.toLowerCase().includes(term) ||
        item.descripcion.toLowerCase().includes(term) ||
        item.estado.toLowerCase().includes(term)
      );
    });
  });

  public pendientes = computed(() => this.filteredCatalogo().filter((item) => item.estado === 'Pendiente'));

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.isStaff.set(!!user && (user.rol === 'admin' || user.rol === 'tecnico'));
    });

    this.fetchCatalogoGlobal();
  }

  public fetchCatalogoGlobal(): void {
    this.isLoading.set(true);
    this.loadError.set(null);

    forkJoin({
      reservas: this.reservationsService.list(),
      prestamos: this.loansService.list()
    }).subscribe({
      next: ({ reservas, prestamos }) => {
        this.catalogo.set([
          ...reservas.map((reserva) => this.mapReservation(reserva)),
          ...prestamos.map((prestamo) => this.mapLoan(prestamo))
        ]);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.loadError.set(extractErrorMessage(error, 'No se pudo cargar la bandeja operativa.'));
      }
    });
  }

  public approve(item: AdminRequestItem): void {
    if (item.tipo === 'reservas') {
      this.updateReservationStatus(item.id, 'Aprobada');
      return;
    }

    this.updateLoanStatus(item.id, 'Aprobado');
  }

  public reject(item: AdminRequestItem): void {
    if (item.tipo === 'reservas') {
      this.updateReservationStatus(item.id, 'Rechazada');
      return;
    }

    this.updateLoanStatus(item.id, 'Rechazado');
  }

  public updateSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }

  private updateReservationStatus(id: string, estado: ReservationStatusUpdate): void {
    this.reservationsService.updateStatus(id, estado).subscribe({
      next: (updated) => {
        this.catalogo.update((items) =>
          items.map((item) => (item.id === id ? this.mapReservation(updated) : item))
        );
        this.snackBar.open(`Reserva ${estado.toLowerCase()} correctamente.`, 'Cerrar', {
          duration: 3000
        });
      },
      error: (error) => {
        this.snackBar.open(
          extractErrorMessage(error, 'No se pudo actualizar la reserva.'),
          'Cerrar',
          { duration: 4000 }
        );
      }
    });
  }

  private updateLoanStatus(id: string, estado: LoanStatusUpdate): void {
    this.loansService.updateStatus(id, estado).subscribe({
      next: (updated) => {
        this.catalogo.update((items) =>
          items.map((item) => (item.id === id ? this.mapLoan(updated) : item))
        );
        this.snackBar.open(`Prestamo ${estado.toLowerCase()} correctamente.`, 'Cerrar', {
          duration: 3000
        });
      },
      error: (error) => {
        this.snackBar.open(
          extractErrorMessage(error, 'No se pudo actualizar el prestamo.'),
          'Cerrar',
          { duration: 4000 }
        );
      }
    });
  }

  private mapReservation(reserva: Reserva): AdminRequestItem {
    return {
      id: reserva.id,
      tipo: 'reservas',
      recurso: reserva.lab,
      solicitante: reserva.solicitante,
      fecha: reserva.fecha,
      horario: reserva.horario,
      descripcion: reserva.materia,
      estado: reserva.estado
    };
  }

  private mapLoan(prestamo: Prestamo): AdminRequestItem {
    return {
      id: prestamo.id,
      tipo: 'prestamos',
      recurso: prestamo.equipo,
      solicitante: prestamo.solicitante,
      fecha: prestamo.fecha,
      horario: prestamo.horario,
      descripcion: prestamo.proyecto,
      estado: prestamo.estado,
      cantidad: prestamo.cantidad
    };
  }
}
