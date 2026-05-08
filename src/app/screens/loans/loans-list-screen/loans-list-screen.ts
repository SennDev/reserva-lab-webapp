import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SHARED_IMPORTS } from '../../../shared/shared-imports';
import { AuthService } from '../../../services/auth.service';
import { LoansService } from '../../../services/loans.service';
import { LoanStatusUpdate, Prestamo } from '../../../shared/models/loan.model';
import { extractErrorMessage } from '../../../shared/utils/http-error.utils';

@Component({
  selector: 'app-loans-list-screen',
  standalone: true,
  imports: [SHARED_IMPORTS],
  templateUrl: './loans-list-screen.html',
  styleUrl: './loans-list-screen.scss'
})
export class LoansListScreen implements OnInit {
  private authService = inject(AuthService);
  private loansService = inject(LoansService);
  private snackBar = inject(MatSnackBar);

  public isStaff = signal(false);
  public searchTerm = signal('');
  public isLoading = signal(true);
  public loadError = signal<string | null>(null);
  public prestamos = signal<Prestamo[]>([]);

  public pageTitle = computed(() => (this.isStaff() ? 'Prestamos del Sistema' : 'Mis Prestamos'));

  public filteredPrestamos = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();

    if (!term) {
      return this.prestamos();
    }

    return this.prestamos().filter(
      (prestamo) =>
        prestamo.equipo.toLowerCase().includes(term) ||
        prestamo.numero_serie.toLowerCase().includes(term) ||
        prestamo.estado.toLowerCase().includes(term) ||
        prestamo.solicitante.toLowerCase().includes(term) ||
        prestamo.proyecto.toLowerCase().includes(term)
    );
  });

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.isStaff.set(!!user && (user.rol === 'admin' || user.rol === 'tecnico'));
    });

    this.fetchPrestamosFromBackend();
  }

  public fetchPrestamosFromBackend(): void {
    this.isLoading.set(true);
    this.loadError.set(null);

    this.loansService.list().subscribe({
      next: (prestamos) => {
        this.prestamos.set(prestamos);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.loadError.set(extractErrorMessage(error, 'No se pudo cargar el historial de prestamos.'));
      }
    });
  }

  public updateStatus(id: string, estado: LoanStatusUpdate): void {
    this.loansService.updateStatus(id, estado).subscribe({
      next: (updated) => {
        this.prestamos.update((items) => items.map((item) => (item.id === id ? updated : item)));
        this.snackBar.open(`Prestamo ${estado.toLowerCase()} correctamente.`, 'Cerrar', {
          duration: 3000
        });
      },
      error: (error) => {
        this.snackBar.open(
          extractErrorMessage(error, 'No se pudo actualizar el estado del prestamo.'),
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
