import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { SHARED_IMPORTS } from '../../../shared/shared-imports';
import { AuthService } from '../../../services/auth.service';

export interface Equipo {
  id: string;
  nombre: string;
  numero_serie: string;
  laboratorio: string;
  estado: 'Disponible' | 'En Préstamo' | 'Mantenimiento' | 'Baja';
  icon: string;
  color: string;
}

@Component({
  selector: 'app-equipment-list',
  standalone: true,
  imports: [SHARED_IMPORTS],
  templateUrl: './equipment-list-screen.html',
  styleUrl: './equipment-list-screen.scss'
})
export class EquipmentListScreen implements OnInit {
  private authService = inject(AuthService);

  public isStaff = signal<boolean>(false);
  public searchTerm = signal<string>('');
  public isLoading = signal<boolean>(true);

  public equipos = signal<Equipo[]>([]);

  public filteredEquipos = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.equipos();
    return this.equipos().filter(eq =>
      eq.nombre.toLowerCase().includes(term) ||
      eq.numero_serie.toLowerCase().includes(term) ||
      eq.laboratorio.toLowerCase().includes(term)
    );
  });

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.isStaff.set(!!user && (user.rol === 'admin' || user.rol === 'tecnico'));
    });

    this.fetchEquiposFromBackend();
  }

  private fetchEquiposFromBackend(): void {
    this.isLoading.set(true);

    setTimeout(() => {
      const mockData: Equipo[] = [
        { id: 'EQ-001', nombre: 'Osciloscopio Digital Rigol', numero_serie: 'SN-RIG-8472', laboratorio: 'Laboratorio de Hardware y Robótica', estado: 'Disponible', icon: 'bi-activity', color: 'text-success' },
        { id: 'EQ-002', nombre: 'Router Cisco 2901', numero_serie: 'SN-CIS-9921', laboratorio: 'Laboratorio de Redes y Seguridad', estado: 'En Préstamo', icon: 'bi-hdd-network', color: 'text-primary' },
        { id: 'EQ-003', nombre: 'Kit Arduino Mega 2560', numero_serie: 'SN-ARD-1104', laboratorio: 'Almacén Central', estado: 'Disponible', icon: 'bi-cpu', color: 'text-success' },
        { id: 'EQ-004', nombre: 'Impresora 3D Creality Ender 3', numero_serie: 'SN-CRE-3349', laboratorio: 'Laboratorio de Hardware y Robótica', estado: 'Mantenimiento', icon: 'bi-printer', color: 'text-warning' },
        { id: 'EQ-005', nombre: 'Servidor Dell PowerEdge', numero_serie: 'SN-DEL-5582', laboratorio: 'Sala de Posgrado e Investigación', estado: 'Disponible', icon: 'bi-server', color: 'text-success' }
      ];

      this.equipos.set(mockData);
      this.isLoading.set(false);
    }, 1200);
  }

  public updateSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }
}
