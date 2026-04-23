import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { SHARED_IMPORTS } from '../../../shared/shared-imports';
import { AuthService } from '../../../services/auth.service';

export interface Prestamo {
  id: string;
  equipo: string;
  numero_serie: string;
  fecha: string;
  horario: string;
  estado: 'Pendiente' | 'Aprobado' | 'Rechazado' | 'Devuelto';
  solicitante: string;
}

@Component({
  selector: 'app-loans-list-screen',
  standalone: true,
  imports: [SHARED_IMPORTS],
  templateUrl: './loans-list-screen.html',
  styleUrl: './loans-list-screen.scss'
})
export class LoansListScreen implements OnInit {
  private authService = inject(AuthService);

  public userName = signal<string>(''); 
  public searchTerm = signal<string>('');
  public isLoading = signal<boolean>(true);
  public prestamos = signal<Prestamo[]>([]);

  public filteredPrestamos = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const currentName = this.userName();

    let listaResultante = this.prestamos();

    if (currentName) {
      listaResultante = listaResultante.filter(p => p.solicitante === currentName);
    }

    if (term) {
      listaResultante = listaResultante.filter(p =>
        p.equipo.toLowerCase().includes(term) ||
        p.numero_serie.toLowerCase().includes(term) ||
        p.estado.toLowerCase().includes(term)
      );
    }

    return listaResultante;
  });

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.userName.set(user.nombre_completo || '');
      } else {
        this.userName.set('');
      }
    });

    this.fetchPrestamosFromBackend();
  }

  private fetchPrestamosFromBackend(): void {
    this.isLoading.set(true);

    setTimeout(() => {
      const mockDataFromDB: Prestamo[] = [
        { id: 'PR-001', equipo: 'Osciloscopio Digital Rigol', numero_serie: 'SN-RIG-8472', fecha: '25 Mar 2026', horario: '14:00 - 16:00', estado: 'Aprobado', solicitante: 'Pablo Ivan Ibarra Valencia' },
        { id: 'PR-002', equipo: 'Router Cisco 2901', numero_serie: 'SN-CIS-9921', fecha: '26 Mar 2026', horario: '09:00 - 11:00', estado: 'Pendiente', solicitante: 'Ana Martínez' },
        { id: 'PR-003', equipo: 'Kit Arduino Mega 2560', numero_serie: 'SN-ARD-1104', fecha: '20 Mar 2026', horario: '10:00 - 12:00', estado: 'Devuelto', solicitante: 'Pablo Ivan Ibarra Valencia' },
        { id: 'PR-004', equipo: 'Impresora 3D Creality Ender 3', numero_serie: 'SN-CRE-3349', fecha: '28 Mar 2026', horario: '16:00 - 18:00', estado: 'Rechazado', solicitante: 'Gerson Contreras' }
      ];

      this.prestamos.set(mockDataFromDB);
      this.isLoading.set(false);
    }, 1500);
  }

  public updateSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }
}