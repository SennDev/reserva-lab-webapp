import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { SHARED_IMPORTS } from '../../../shared/shared-imports';
import { AuthService } from '../../../services/auth.service';

// 1. INTERFAZ ESTRICTA: El contrato exacto de lo que enviará Django
export interface Laboratorio {
  id: string;
  nombre: string;
  edificio: string;
  capacidad: number;
  estado: 'Disponible' | 'En Mantenimiento' | 'Ocupado';
  equipamiento: string[];
  icon: string;
  color: string;
}

@Component({
  selector: 'app-labs-list',
  standalone: true,
  imports: [SHARED_IMPORTS],
  templateUrl: './labs-list-screen.html',
  styleUrl: './labs-list-screen.scss'
})
export class LabsListScreen implements OnInit {
  private authService = inject(AuthService);

  public isAdmin = signal<boolean>(false);
  public searchTerm = signal<string>('');

  // 2. ESTADO DE CARGA PARA EL BACKEND
  public isLoading = signal<boolean>(true);

  // El catálogo inicia vacío, esperando los datos del servidor
  public laboratorios = signal<Laboratorio[]>([]);

  public filteredLabs = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.laboratorios();
    return this.laboratorios().filter(lab =>
      lab.nombre.toLowerCase().includes(term) ||
      lab.edificio.toLowerCase().includes(term) ||
      lab.equipamiento.some(eq => eq.toLowerCase().includes(term))
    );
  });

  ngOnInit(): void {
    // Suscripción al rol del usuario
    this.authService.currentUser$.subscribe(user => {
      if (user && user.rol === 'admin') {
        this.isAdmin.set(true);
      } else {
        this.isAdmin.set(false);
      }
    });

    // 3. SOLICITUD A LA BASE DE DATOS
    this.fetchLabsFromBackend();
  }

  // Simulación de latencia HTTP
  private fetchLabsFromBackend(): void {
    this.isLoading.set(true);

    // Futuro código real: this.http.get<Laboratorio[]>('api/laboratorios').subscribe(...)
    setTimeout(() => {
      const mockDataFromDB: Laboratorio[] = [
        { id: 'LAB-CCO1', nombre: 'Laboratorio de Computación Avanzada', edificio: 'Edificio CCO1', capacidad: 35, estado: 'Disponible', equipamiento: ['Workstations', 'Proyector Interactivo', 'Pizarrón Inteligente'], icon: 'bi-pc-display', color: 'text-primary' },
        { id: 'LAB-CCO2', nombre: 'Laboratorio de Redes y Seguridad', edificio: 'Edificio CCO2', capacidad: 25, estado: 'En Mantenimiento', equipamiento: ['Routers Cisco', 'Switches', 'Racks de Servidores'], icon: 'bi-hdd-network', color: 'text-warning' },
        { id: 'LAB-FIS1', nombre: 'Laboratorio de Hardware y Robótica', edificio: 'Edificio CCO3', capacidad: 20, estado: 'Disponible', equipamiento: ['Osciloscopios', 'Kits Arduino', 'Impresoras 3D'], icon: 'bi-cpu', color: 'text-success' },
        { id: 'LAB-CCO4', nombre: 'Sala de Posgrado e Investigación', edificio: 'Edificio CCO4', capacidad: 15, estado: 'Ocupado', equipamiento: ['Servidores GPU', 'Pantallas 4K'], icon: 'bi-building-gear', color: 'text-danger' }
      ];

      this.laboratorios.set(mockDataFromDB);
      this.isLoading.set(false); // Ocultamos el spinner cuando llega la data
    }, 1500); // 1.5 segundos simulando latencia de internet
  }

  public updateSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }
}
