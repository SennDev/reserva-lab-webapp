import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { Location } from '@angular/common'; // Para el botón de "Volver"
import { SHARED_IMPORTS } from '../../../shared/shared-imports';
import { AuthService } from '../../../services/auth.service';

// Interfaces listas para el Backend
export interface RecursoDetalle {
  id: string;
  tipo: 'laboratorio' | 'equipo';
  nombre: string;
  ubicacion_serie: string;
  estado_actual: string;
  icon: string;
}

export interface SolicitudVinculada {
  id: string;
  usuario: string;
  matricula: string;
  fecha: string;
  horario: string;
  proyecto: string;
  estado: 'Pendiente' | 'Aprobada' | 'Rechazada';
}

@Component({
  selector: 'app-reports-detail-screen',
  standalone: true,
  imports: [SHARED_IMPORTS],
  templateUrl: './reports-detail-screen.html',
  styleUrl: './reports-detail-screen.scss'
})
export class ReportsDetailScreen implements OnInit {
  private authService = inject(AuthService);
  public location = inject(Location); // Inyectamos Location para volver a la lista anterior

  public isStaff = signal<boolean>(false);
  public isLoading = signal<boolean>(true);

  // Datos del recurso que estamos inspeccionando
  public recursoInfo = signal<RecursoDetalle | null>(null);
  
  // Historial y solicitudes vinculadas a ESTE recurso
  public solicitudes = signal<SolicitudVinculada[]>([]);

  // Filtros automáticos
  public pendientes = computed(() => this.solicitudes().filter(s => s.estado === 'Pendiente'));
  public agendaAprobada = computed(() => this.solicitudes().filter(s => s.estado === 'Aprobada'));

  ngOnInit(): void {
    // Protección de ruta (Solo staff)
    this.authService.currentUser$.subscribe(user => {
      this.isStaff.set(!!user && (user.rol === 'admin' || user.rol === 'tecnico'));
    });

    this.fetchDetallesDelRecurso();
  }

  private fetchDetallesDelRecurso(): void {
    this.isLoading.set(true);

    // Simulamos la carga desde la base de datos (Ej. GET /api/recurso/LAB-CCO1/detalles)
    setTimeout(() => {
      // 1. Cargamos el recurso en sí
      this.recursoInfo.set({
        id: 'LAB-CCO1',
        tipo: 'laboratorio',
        nombre: 'Laboratorio de Computación Avanzada',
        ubicacion_serie: 'Edificio CCO1',
        estado_actual: 'Disponible',
        icon: 'bi-pc-display'
      });

      // 2. Cargamos las solicitudes SOLO de este recurso (< 20 registros)
      this.solicitudes.set([
        { id: 'SOL-01', usuario: 'Gerson Contreras', matricula: '202301234', fecha: '28 Mar 2026', horario: '14:00 - 16:00', proyecto: 'Desarrollo Web Integrado', estado: 'Pendiente' },
        { id: 'SOL-02', usuario: 'Ana Martínez', matricula: '202305678', fecha: '28 Mar 2026', horario: '09:00 - 11:00', proyecto: 'Práctica de Ciberseguridad', estado: 'Pendiente' },
        { id: 'SOL-03', usuario: 'Fernando Morales', matricula: '202309012', fecha: '29 Mar 2026', horario: '11:00 - 13:00', proyecto: 'Tesis de Grado', estado: 'Pendiente' },
        
        // Estas ya fueron aprobadas, aparecerán en la agenda de la derecha
        { id: 'SOL-04', usuario: 'Pablo Ivan Ibarra', matricula: '202304321', fecha: '25 Mar 2026', horario: '14:00 - 16:00', proyecto: 'Proyecto Angular', estado: 'Aprobada' },
        { id: 'SOL-05', usuario: 'Carlos López', matricula: '202308765', fecha: '26 Mar 2026', horario: '16:00 - 18:00', proyecto: 'Taller de Redes', estado: 'Aprobada' }
      ]);

      this.isLoading.set(false);
    }, 1200);
  }

  // --- MÉTODOS PARA EL BACKEND ---
  public aprobarSolicitud(id: string): void {
    // Aquí harías: this.http.put(`/api/solicitudes/${id}/aprobar`).subscribe(...)
    this.solicitudes.update(lista => lista.map(s => s.id === id ? { ...s, estado: 'Aprobada' } : s));
  }

  public rechazarSolicitud(id: string): void {
    // Aquí harías: this.http.put(`/api/solicitudes/${id}/rechazar`).subscribe(...)
    this.solicitudes.update(lista => lista.map(s => s.id === id ? { ...s, estado: 'Rechazada' } : s));
  }

  public goBack(): void {
    this.location.back();
  }
}