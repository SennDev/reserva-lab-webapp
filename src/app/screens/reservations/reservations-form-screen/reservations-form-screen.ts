import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { SHARED_IMPORTS } from '../../../shared/shared-imports';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-reservations-form',
  standalone: true,
  imports: [SHARED_IMPORTS],
  templateUrl: './reservations-form-screen.html',
  styleUrl: './reservations-form-screen.scss'
})
export class ReservationsFormScreen implements OnInit {
  private router = inject(Router);
  public authService = inject(AuthService); // Cambiado a public para usarlo en el HTML

  public isSaving = signal<boolean>(false);
  public errors: any = {};

  // Fecha mínima permitida (Hoy)
  public minDate: string = '';

  // Datos estáticos que en el futuro vendrán de tu API (ej. this.http.get('/api/labs/disponibles'))
  public laboratoriosDisponibles = [
    { id: 'LAB-CCO1', nombre: 'Laboratorio de Computación Avanzada' },
    { id: 'LAB-CCO2', nombre: 'Laboratorio de Redes y Seguridad' },
    { id: 'LAB-FIS1', nombre: 'Laboratorio de Hardware y Robótica' }
  ];

  public bloquesHorarios = [
    '07:00 - 09:00', '09:00 - 11:00', '11:00 - 13:00',
    '13:00 - 15:00', '15:00 - 17:00', '17:00 - 19:00'
  ];

  public reservaData: any = {
    laboratorioId: '',
    fecha: '',
    horario: '',
    materia: '',
    motivo: ''
  };

  // Previsualización Inteligente: Busca el nombre del lab según el ID seleccionado
  public labSeleccionadoNombre = computed(() => {
    const labId = this.reservaData.laboratorioId;
    if (!labId) return 'Selecciona un laboratorio...';
    const lab = this.laboratoriosDisponibles.find(l => l.id === labId);
    return lab ? lab.nombre : 'Laboratorio desconocido';
  });

  ngOnInit(): void {
    // Calcular la fecha de hoy en formato YYYY-MM-DD para bloquear el HTML DatePicker
    const today = new Date();
    // Ajuste de zona horaria básico
    const offset = today.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(today.getTime() - offset)).toISOString().split('T')[0];
    this.minDate = localISOTime;
  }

  public validarFormulario(): boolean {
    this.errors = {};
    let esValido = true;

    if (!this.reservaData.laboratorioId) {
      this.errors.laboratorioId = 'Debes seleccionar un espacio.';
      esValido = false;
    }

    if (!this.reservaData.fecha) {
      this.errors.fecha = 'La fecha es obligatoria.';
      esValido = false;
    } else if (this.reservaData.fecha < this.minDate) {
      // 🚨 VALIDACIÓN CLAVE: Imposible reservar en el pasado
      this.errors.fecha = 'No puedes realizar reservas en fechas que ya pasaron.';
      esValido = false;
    }

    if (!this.reservaData.horario) {
      this.errors.horario = 'Selecciona una franja horaria.';
      esValido = false;
    }

    if (!this.reservaData.materia || this.reservaData.materia.trim().length < 4) {
      this.errors.materia = 'Ingresa el nombre de la materia o práctica (Mín. 4 letras).';
      esValido = false;
    }

    if (!this.reservaData.motivo || this.reservaData.motivo.trim().length < 10) {
      this.errors.motivo = 'Describe brevemente la actividad a realizar (Mín. 10 letras).';
      esValido = false;
    }

    return esValido;
  }

  public submitReserva(): void {
    if (this.validarFormulario()) {
      this.isSaving.set(true);

      // Aquí enviarías el payload a Django mediante HTTP POST
      const payload = {
        ...this.reservaData,
        solicitanteId: this.authService.currentUserValue?.id_usuario
      };
      console.log('Enviando a BD:', payload);

      setTimeout(() => {
        this.isSaving.set(false);
        this.router.navigate(['/dashboard/reservas']);
      }, 1500);
    }
  }
}
