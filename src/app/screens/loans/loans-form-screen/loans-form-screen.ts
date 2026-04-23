import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { SHARED_IMPORTS } from '../../../shared/shared-imports';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-loans-form-screen',
  standalone: true,
  imports: [SHARED_IMPORTS],
  templateUrl: './loans-form-screen.html',
  styleUrl: './loans-form-screen.scss'
})
export class LoansFormScreen implements OnInit {
  private router = inject(Router);
  public authService = inject(AuthService); 

  public isSaving = signal<boolean>(false);
  public errors: any = {};

  public minDate: string = '';

  // Datos mockeados del inventario disponibles para préstamo
  public equiposDisponibles = [
    { id: 'EQ-001', nombre: 'Osciloscopio Digital Rigol' },
    { id: 'EQ-003', nombre: 'Kit Arduino Mega 2560' },
    { id: 'EQ-005', nombre: 'Servidor Dell PowerEdge' }
  ];

  // Las mismas franjas horarias que en las reservas
  public bloquesHorarios = [
    '07:00 - 09:00', '09:00 - 11:00', '11:00 - 13:00',
    '13:00 - 15:00', '15:00 - 17:00', '17:00 - 19:00'
  ];

  public prestamoData: any = {
    equipoId: '',
    fecha: '',
    horario: '',
    proyecto: '',
    motivo: ''
  };

  public equipoSeleccionadoNombre = computed(() => {
    const eqId = this.prestamoData.equipoId;
    if (!eqId) return 'Selecciona un equipo...';
    const equipo = this.equiposDisponibles.find(e => e.id === eqId);
    return equipo ? equipo.nombre : 'Equipo desconocido';
  });

  ngOnInit(): void {
    const today = new Date();
    const offset = today.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(today.getTime() - offset)).toISOString().split('T')[0];
    this.minDate = localISOTime;
  }

  public validarFormulario(): boolean {
    this.errors = {};
    let esValido = true;

    if (!this.prestamoData.equipoId) {
      this.errors.equipoId = 'Debes seleccionar un equipo del inventario.';
      esValido = false;
    }

    if (!this.prestamoData.fecha) {
      this.errors.fecha = 'La fecha es obligatoria.';
      esValido = false;
    } else if (this.prestamoData.fecha < this.minDate) {
      this.errors.fecha = 'No puedes solicitar préstamos en el pasado.';
      esValido = false;
    }

    if (!this.prestamoData.horario) {
      this.errors.horario = 'Selecciona una franja horaria.';
      esValido = false;
    }

    if (!this.prestamoData.proyecto || this.prestamoData.proyecto.trim().length < 4) {
      this.errors.proyecto = 'Ingresa el nombre del proyecto o materia (Mín. 4 letras).';
      esValido = false;
    }

    if (!this.prestamoData.motivo || this.prestamoData.motivo.trim().length < 10) {
      this.errors.motivo = 'Describe brevemente para qué usarás el equipo (Mín. 10 letras).';
      esValido = false;
    }

    return esValido;
  }

  public submitPrestamo(): void {
    if (this.validarFormulario()) {
      this.isSaving.set(true);

      const payload = {
        ...this.prestamoData,
        solicitanteId: this.authService.currentUserValue?.id_usuario
      };
      console.log('Enviando Préstamo a BD:', payload);

      setTimeout(() => {
        this.isSaving.set(false);
        this.router.navigate(['/dashboard/prestamos']);
      }, 1500);
    }
  }
}