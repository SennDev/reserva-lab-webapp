import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { SHARED_IMPORTS } from '../../../shared/shared-imports';
import { AuthService } from '../../../services/auth.service';

export interface Reserva {
  id: string;
  lab: string;
  fecha: string;
  horario: string;
  materia: string;
  estado: 'Pendiente' | 'Aprobada' | 'Rechazada' | 'Completada';
  solicitante: string;
}

@Component({
  selector: 'app-reservations-list',
  standalone: true,
  imports: [SHARED_IMPORTS],
  templateUrl: './reservations-list-screen.html',
  styleUrl: './reservations-list-screen.scss'
})
export class ReservationsListScreen implements OnInit {
  private authService = inject(AuthService);

  public userName = signal<string>(''); 
  public searchTerm = signal<string>('');
  public isLoading = signal<boolean>(true);
  public reservas = signal<Reserva[]>([]);

  public filteredReservas = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const currentName = this.userName();

    let listaResultante = this.reservas();

    if (currentName) {
      listaResultante = listaResultante.filter(res => res.solicitante === currentName);
    }

    if (term) {
      listaResultante = listaResultante.filter(res =>
        res.lab.toLowerCase().includes(term) ||
        res.materia.toLowerCase().includes(term) ||
        res.estado.toLowerCase().includes(term)
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

    this.fetchReservationsFromBackend();
  }

  private fetchReservationsFromBackend(): void {
    this.isLoading.set(true);

    setTimeout(() => {
      const mockDataFromDB: Reserva[] = [
        { id: 'RES-001', lab: 'Laboratorio de Computación Avanzada', fecha: '25 Mar 2026', horario: '14:00 - 16:00', materia: 'Desarrollo Web', estado: 'Aprobada', solicitante: 'Pablo Ivan Ibarra Valencia' },
        { id: 'RES-002', lab: 'Laboratorio de Redes y Seguridad', fecha: '26 Mar 2026', horario: '09:00 - 11:00', materia: 'Ciberseguridad', estado: 'Pendiente', solicitante: 'Ana Martínez' },
        { id: 'RES-003', lab: 'Laboratorio de Física Experimental', fecha: '22 Mar 2026', horario: '10:00 - 12:00', materia: 'Óptica', estado: 'Completada', solicitante: 'Carlos López' },
        { id: 'RES-004', lab: 'Sala de Posgrado e Investigación', fecha: '28 Mar 2026', horario: '16:00 - 18:00', materia: 'Tesis', estado: 'Rechazada', solicitante: 'Gerson Contreras' }
      ];

      this.reservas.set(mockDataFromDB);
      this.isLoading.set(false); 
    }, 1500); 
  }

  public updateSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }
}