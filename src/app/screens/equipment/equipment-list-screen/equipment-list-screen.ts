import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SHARED_IMPORTS } from '../../../shared/shared-imports';
import { AuthService } from '../../../services/auth.service';
import { EquipmentService } from '../../../services/equipment.service';
import { Equipo } from '../../../shared/models/equipment.model';
import { extractErrorMessage } from '../../../shared/utils/http-error.utils';

@Component({
  selector: 'app-equipment-list',
  standalone: true,
  imports: [SHARED_IMPORTS],
  templateUrl: './equipment-list-screen.html',
  styleUrl: './equipment-list-screen.scss'
})
export class EquipmentListScreen implements OnInit {
  private authService = inject(AuthService);
  private equipmentService = inject(EquipmentService);
  private snackBar = inject(MatSnackBar);

  public isStaff = signal(false);
  public isAdmin = signal(false);
  public searchTerm = signal('');
  public isLoading = signal(true);
  public loadError = signal<string | null>(null);
  public equipos = signal<Equipo[]>([]);

  public filteredEquipos = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();

    if (!term) {
      return this.equipos();
    }

    return this.equipos().filter(
      (eq) =>
        eq.nombre.toLowerCase().includes(term) ||
        eq.numero_serie.toLowerCase().includes(term) ||
        eq.laboratorio.toLowerCase().includes(term) ||
        eq.estado.toLowerCase().includes(term)
    );
  });

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      const isStaff = !!user && (user.rol === 'admin' || user.rol === 'tecnico');
      this.isStaff.set(isStaff);
      this.isAdmin.set(user?.rol === 'admin');
    });

    this.fetchEquiposFromBackend();
  }

  public fetchEquiposFromBackend(): void {
    this.isLoading.set(true);
    this.loadError.set(null);

    this.equipmentService.list().subscribe({
      next: (equipos) => {
        this.equipos.set(equipos);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.loadError.set(extractErrorMessage(error, 'No se pudo cargar el inventario de equipos.'));
      }
    });
  }

  public removeEquipment(id: string): void {
    if (!confirm('El equipo sera marcado como baja en el inventario. Deseas continuar?')) {
      return;
    }

    this.equipmentService.remove(id).subscribe({
      next: () => {
        this.equipos.update((items) =>
          items.map((item) =>
            item.id === id ? { ...item, estado: 'Baja', cantidad_disponible: 0 } : item
          )
        );
        this.snackBar.open('Equipo actualizado a estado Baja.', 'Cerrar', {
          duration: 3000
        });
      },
      error: (error) => {
        this.snackBar.open(
          extractErrorMessage(error, 'No se pudo actualizar el estado del equipo.'),
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
