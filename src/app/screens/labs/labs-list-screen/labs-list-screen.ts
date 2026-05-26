import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SHARED_IMPORTS } from '../../../shared/shared-imports';
import { AuthService } from '../../../services/auth.service';
import { LabsService } from '../../../services/labs.service';
import { Laboratorio } from '../../../shared/models/lab.model';
import { extractErrorMessage } from '../../../shared/utils/http-error.utils';

@Component({
  selector: 'app-labs-list',
  standalone: true,
  imports: [SHARED_IMPORTS],
  templateUrl: './labs-list-screen.html',
  styleUrl: './labs-list-screen.scss'
})
export class LabsListScreen implements OnInit {
  private authService = inject(AuthService);
  private labsService = inject(LabsService);
  private snackBar = inject(MatSnackBar);

  public isStaff = signal(false);
  public isAdmin = signal(false);
  public searchTerm = signal('');
  public isLoading = signal(true);
  public loadError = signal<string | null>(null);
  public laboratorios = signal<Laboratorio[]>([]);

  public filteredLabs = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();

    if (!term) {
      return this.laboratorios();
    }

    return this.laboratorios().filter(
      (lab) =>
        lab.nombre.toLowerCase().includes(term) ||
        lab.edificio.toLowerCase().includes(term) ||
        lab.tipo.toLowerCase().includes(term) ||
        lab.equipamiento.some((item) => item.toLowerCase().includes(term))
    );
  });

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      const isStaff = !!user && (user.rol === 'admin' || user.rol === 'tecnico');
      this.isStaff.set(isStaff);
      this.isAdmin.set(user?.rol === 'admin');
    });

    this.fetchLabsFromBackend();
  }

  public fetchLabsFromBackend(): void {
    this.isLoading.set(true);
    this.loadError.set(null);

    this.labsService.list().subscribe({
      next: (labs) => {
        this.laboratorios.set(labs);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.loadError.set(extractErrorMessage(error, 'No se pudo cargar el catalogo de laboratorios.'));
      }
    });
  }

  public deleteLab(id: string): void {
    if (!confirm('Esta accion eliminara el laboratorio del catalogo. Deseas continuar?')) {
      return;
    }

    this.labsService.delete(id).subscribe({
      next: () => {
        this.laboratorios.update((labs) => labs.filter((lab) => lab.id !== id));
        this.snackBar.open('Laboratorio eliminado correctamente.', 'Cerrar', {
          duration: 3000
        });
      },
      error: (error) => {
        this.snackBar.open(
          extractErrorMessage(error, 'No se pudo eliminar el laboratorio.'),
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
