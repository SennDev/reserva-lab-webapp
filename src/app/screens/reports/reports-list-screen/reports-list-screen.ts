import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { SHARED_IMPORTS } from '../../../shared/shared-imports';
import { AuthService } from '../../../services/auth.service';

// Interfaz unificada para el catálogo administrativo
export interface CatalogoAdmin {
  id: string;
  tipo: 'laboratorio' | 'equipo';
  nombre: string;
  ubicacion_serie: string; // Guarda el edificio (Labs) o el Número de Serie (Equipos)
  estado: 'Disponible' | 'En Mantenimiento' | 'Ocupado' | 'En Préstamo' | 'Baja';
  icon: string;
}

@Component({
  selector: 'app-reports-list-screen',
  standalone: true,
  imports: [SHARED_IMPORTS],
  templateUrl: './reports-list-screen.html',
  styleUrl: './reports-list-screen.scss'
})
export class ReportsListScreen implements OnInit {
  public authService = inject(AuthService);

  // Las pestañas ahora controlan qué tipo de catálogo vemos
  public activeTab = signal<'laboratorios' | 'equipos'>('laboratorios');
  public searchTerm = signal<string>('');
  public isLoading = signal<boolean>(true);
  
  public catalogo = signal<CatalogoAdmin[]>([]);

  // Filtro Dinámico: Primero por pestaña, luego por búsqueda
  public filteredCatalogo = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const tabActual = this.activeTab();

    // 1. Filtrar por el tipo de pestaña seleccionada
    let lista = this.catalogo().filter(item => item.tipo === (tabActual === 'laboratorios' ? 'laboratorio' : 'equipo'));

    // 2. Aplicar búsqueda global
    if (term) {
      lista = lista.filter(item =>
        item.nombre.toLowerCase().includes(term) ||
        item.ubicacion_serie.toLowerCase().includes(term) ||
        item.estado.toLowerCase().includes(term)
      );
    }

    return lista;
  });

  ngOnInit(): void {
    this.fetchCatalogoGlobal();
  }

  private fetchCatalogoGlobal(): void {
    this.isLoading.set(true);

    setTimeout(() => {
      const mockDataGlobal: CatalogoAdmin[] = [
        // --- LABORATORIOS ---
        { id: 'LAB-CCO1', tipo: 'laboratorio', nombre: 'Laboratorio de Computación Avanzada', ubicacion_serie: 'Edificio CCO1', estado: 'Disponible', icon: 'bi-pc-display' },
        { id: 'LAB-CCO2', tipo: 'laboratorio', nombre: 'Laboratorio de Redes y Seguridad', ubicacion_serie: 'Edificio CCO2', estado: 'En Mantenimiento', icon: 'bi-hdd-network' },
        { id: 'LAB-FIS1', tipo: 'laboratorio', nombre: 'Laboratorio de Hardware y Robótica', ubicacion_serie: 'Edificio CCO3', estado: 'Disponible', icon: 'bi-cpu' },
        { id: 'LAB-CCO4', tipo: 'laboratorio', nombre: 'Sala de Posgrado e Investigación', ubicacion_serie: 'Edificio CCO4', estado: 'Ocupado', icon: 'bi-building-gear' },
        
        // --- EQUIPOS ---
        { id: 'EQ-001', tipo: 'equipo', nombre: 'Osciloscopio Digital Rigol', ubicacion_serie: 'SN-RIG-8472', estado: 'Disponible', icon: 'bi-activity' },
        { id: 'EQ-002', tipo: 'equipo', nombre: 'Router Cisco 2901', ubicacion_serie: 'SN-CIS-9921', estado: 'En Préstamo', icon: 'bi-hdd-network' },
        { id: 'EQ-003', tipo: 'equipo', nombre: 'Kit Arduino Mega 2560', ubicacion_serie: 'SN-ARD-1104', estado: 'Disponible', icon: 'bi-cpu' },
        { id: 'EQ-004', tipo: 'equipo', nombre: 'Impresora 3D Creality Ender 3', ubicacion_serie: 'SN-CRE-3349', estado: 'En Mantenimiento', icon: 'bi-printer' }
      ];

      this.catalogo.set(mockDataGlobal);
      this.isLoading.set(false);
    }, 1200);
  }

  public updateSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }
}