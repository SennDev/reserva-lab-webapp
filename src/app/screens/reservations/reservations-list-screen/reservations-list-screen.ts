import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SHARED_IMPORTS } from '../../../shared/shared-imports';
import { AuthService } from '../../../services/auth.service';
import { ReservationsService } from '../../../services/reservations.service';
import {
  Reserva,
  ReservationStatusUpdate
} from '../../../shared/models/reservation.model';
import { extractErrorMessage } from '../../../shared/utils/http-error.utils';

@Component({
  selector: 'app-reservations-list',
  standalone: true,
  imports: [SHARED_IMPORTS],
  templateUrl: './reservations-list-screen.html',
  styleUrl: './reservations-list-screen.scss'
})
export class ReservationsListScreen implements OnInit {
  private authService = inject(AuthService);
  private reservationsService = inject(ReservationsService);
  private snackBar = inject(MatSnackBar);

  public currentUserId = signal<string | null>(null);
  public isStaff = signal(false);
  public isAdmin = signal(false);
  public searchTerm = signal('');
  public isLoading = signal(true);
  public loadError = signal<string | null>(null);
  public reservas = signal<Reserva[]>([]);

  public pageTitle = computed(() => (this.isStaff() ? 'Reservas del Sistema' : 'Mis Reservas'));

  public filteredReservas = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();

    if (!term) {
      return this.reservas();
    }

    return this.reservas().filter(
      (res) =>
        res.lab.toLowerCase().includes(term) ||
        res.materia.toLowerCase().includes(term) ||
        res.estado.toLowerCase().includes(term) ||
        res.solicitante.toLowerCase().includes(term)
    );
  });

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUserId.set(user?.id_usuario ?? null);
      this.isStaff.set(!!user && (user.rol === 'admin' || user.rol === 'tecnico'));
      this.isAdmin.set(user?.rol === 'admin');
    });

    this.fetchReservationsFromBackend();
  }

  public fetchReservationsFromBackend(): void {
    this.isLoading.set(true);
    this.loadError.set(null);

    this.reservationsService.list().subscribe({
      next: (reservas) => {
        this.reservas.set(reservas);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.loadError.set(extractErrorMessage(error, 'No se pudo cargar el historial de reservas.'));
      }
    });
  }

  public canCancel(reserva: Reserva): boolean {
    return this.isAdmin() || reserva.solicitanteId === this.currentUserId();
  }

  public updateStatus(id: string, estado: ReservationStatusUpdate): void {
    this.reservationsService.updateStatus(id, estado).subscribe({
      next: (updated) => {
        this.reservas.update((items) => items.map((item) => (item.id === id ? updated : item)));
        this.snackBar.open(`Reserva ${estado.toLowerCase()} correctamente.`, 'Cerrar', {
          duration: 3000
        });
      },
      error: (error) => {
        this.snackBar.open(
          extractErrorMessage(error, 'No se pudo actualizar el estado de la reserva.'),
          'Cerrar',
          { duration: 4000 }
        );
      }
    });
  }

  public cancelReservation(id: string): void {
    if (!confirm('Esta accion cancelara la reserva seleccionada. Deseas continuar?')) {
      return;
    }

    this.reservationsService.cancel(id).subscribe({
      next: () => {
        this.reservas.update((items) => items.filter((item) => item.id !== id));
        this.snackBar.open('Reserva cancelada correctamente.', 'Cerrar', {
          duration: 3000
        });
      },
      error: (error) => {
        this.snackBar.open(
          extractErrorMessage(error, 'No se pudo cancelar la reserva.'),
          'Cerrar',
          { duration: 4000 }
        );
      }
    });
  }

  public updateSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }
}
