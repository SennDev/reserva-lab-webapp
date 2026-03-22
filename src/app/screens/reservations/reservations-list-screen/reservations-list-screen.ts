import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { SHARED_IMPORTS } from '../../../shared/shared-imports';
import { AuthService } from '../../../services/auth.service';

// 1. INTERFAZ ESTRICTA: Así es exactamente como Django debe enviarte el JSON
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

  public isStaff = signal<boolean>(false);
  public searchTerm = signal<string>('');

  // 2. ESTADO DE CARGA: Vital para cuando conectemos la Base de Datos
  public isLoading = signal<boolean>(true);

  // El arreglo inicia vacío. Los datos llegarán del backend.
  public reservas = signal<Reserva[]>([]);

  public filteredReservas = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.reservas();
    return this.reservas().filter(res =>
      res.lab.toLowerCase().includes(term) ||
      res.materia.toLowerCase().includes(term) ||
      res.estado.toLowerCase().includes(term) ||
      res.solicitante.toLowerCase().includes(term)
    );
  });

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.isStaff.set(!!user && (user.rol === 'admin' || user.rol === 'tecnico'));
    });

    // 3. LLAMADA AL SERVIDOR AL INICIAR LA PANTALLA
    this.fetchReservationsFromBackend();
  }

  // Simulación de la petición HTTP a Django (Render)
  private fetchReservationsFromBackend(): void {
    this.isLoading.set(true);

    // Cuando conectes el backend, cambiarás este setTimeout por:
    // this.http.get<Reserva[]>('tu-api/reservas').subscribe(data => { ... })

    setTimeout(() => {
      const mockDataFromDB: Reserva[] = [
        { id: 'RES-001', lab: 'Laboratorio de Computación Avanzada', fecha: '25 Mar 2026', horario: '14:00 - 16:00', materia: 'Desarrollo Web', estado: 'Aprobada', solicitante: 'Gerson Contreras' },
        { id: 'RES-002', lab: 'Laboratorio de Redes y Seguridad', fecha: '26 Mar 2026', horario: '09:00 - 11:00', materia: 'Ciberseguridad', estado: 'Pendiente', solicitante: 'Ana Martínez' },
        { id: 'RES-003', lab: 'Laboratorio de Física Experimental', fecha: '22 Mar 2026', horario: '10:00 - 12:00', materia: 'Óptica', estado: 'Completada', solicitante: 'Carlos López' },
        { id: 'RES-004', lab: 'Sala de Posgrado e Investigación', fecha: '28 Mar 2026', horario: '16:00 - 18:00', materia: 'Tesis', estado: 'Rechazada', solicitante: 'Gerson Contreras' }
      ];

      this.reservas.set(mockDataFromDB);
      this.isLoading.set(false); // Apagamos el loader cuando llegan los datos
    }, 1500); // Simulamos 1.5 segundos de viaje por internet
  }

  public updateSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }
}
