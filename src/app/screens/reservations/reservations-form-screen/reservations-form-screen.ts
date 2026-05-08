import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SHARED_IMPORTS } from '../../../shared/shared-imports';
import { AuthService } from '../../../services/auth.service';
import { LabsService } from '../../../services/labs.service';
import { ReservationsService } from '../../../services/reservations.service';
import { ReservaPayload } from '../../../shared/models/reservation.model';
import { extractErrorMessage, extractFieldErrors } from '../../../shared/utils/http-error.utils';

interface ReservationFormErrors {
  laboratorioId?: string;
  fecha?: string;
  horario?: string;
  materia?: string;
  motivo?: string;
}

@Component({
  selector: 'app-reservations-form',
  standalone: true,
  imports: [SHARED_IMPORTS],
  templateUrl: './reservations-form-screen.html',
  styleUrl: './reservations-form-screen.scss'
})
export class ReservationsFormScreen implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);
  private labsService = inject(LabsService);
  private reservationsService = inject(ReservationsService);
  public authService = inject(AuthService);

  public isSaving = signal(false);
  public isLoadingLabs = signal(true);
  public serverError = signal<string | null>(null);
  public errors: ReservationFormErrors = {};
  public minDate = '';

  public laboratoriosDisponibles = signal<Array<{ id: string; nombre: string }>>([]);
  public bloquesHorarios = [
    '07:00 - 09:00',
    '09:00 - 11:00',
    '11:00 - 13:00',
    '13:00 - 15:00',
    '15:00 - 17:00',
    '17:00 - 19:00'
  ];

  public reservaData: ReservaPayload = {
    laboratorioId: '',
    fecha: '',
    horario: '',
    materia: '',
    motivo: ''
  };

  public labSeleccionadoNombre = computed(() => {
    const labId = this.reservaData.laboratorioId;
    if (!labId) return 'Selecciona un laboratorio...';
    const lab = this.laboratoriosDisponibles().find((item) => item.id === labId);
    return lab ? lab.nombre : 'Laboratorio desconocido';
  });

  ngOnInit(): void {
    const today = new Date();
    const offset = today.getTimezoneOffset() * 60000;
    this.minDate = new Date(today.getTime() - offset).toISOString().split('T')[0];
    this.loadLabs();

    const laboratorioId = this.route.snapshot.queryParamMap.get('laboratorioId');
    if (laboratorioId) {
      this.reservaData.laboratorioId = laboratorioId;
    }
  }

  public validarFormulario(): boolean {
    this.errors = {};
    this.serverError.set(null);
    let esValido = true;

    if (!this.reservaData.laboratorioId) {
      this.errors.laboratorioId = 'Debes seleccionar un espacio.';
      esValido = false;
    }

    if (!this.reservaData.fecha) {
      this.errors.fecha = 'La fecha es obligatoria.';
      esValido = false;
    } else if (this.reservaData.fecha < this.minDate) {
      this.errors.fecha = 'No puedes realizar reservas en fechas que ya pasaron.';
      esValido = false;
    }

    if (!this.reservaData.horario) {
      this.errors.horario = 'Selecciona una franja horaria.';
      esValido = false;
    }

    if (!this.reservaData.materia || this.reservaData.materia.trim().length < 4) {
      this.errors.materia = 'Ingresa el nombre de la materia o practica.';
      esValido = false;
    }

    if (!this.reservaData.motivo || this.reservaData.motivo.trim().length < 10) {
      this.errors.motivo = 'Describe brevemente la actividad a realizar.';
      esValido = false;
    }

    return esValido;
  }

  public submitReserva(): void {
    if (!this.validarFormulario()) {
      return;
    }

    this.isSaving.set(true);

    this.reservationsService.create(this.reservaData).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.snackBar.open('Reserva enviada correctamente.', 'Cerrar', {
          duration: 3000
        });
        this.router.navigate(['/dashboard/reservas']);
      },
      error: (error) => {
        this.isSaving.set(false);
        this.errors = {
          ...this.errors,
          ...(extractFieldErrors(error) as ReservationFormErrors)
        };
        this.serverError.set(
          extractErrorMessage(error, 'No se pudo enviar la solicitud de reserva.')
        );
      }
    });
  }

  private loadLabs(): void {
    this.isLoadingLabs.set(true);

    this.labsService.listDisponibles().subscribe({
      next: (labs) => {
        this.laboratoriosDisponibles.set(labs.map((lab) => ({ id: lab.id, nombre: lab.nombre })));
        this.isLoadingLabs.set(false);
      },
      error: (error) => {
        this.isLoadingLabs.set(false);
        this.serverError.set(
          extractErrorMessage(error, 'No se pudo cargar la lista de laboratorios disponibles.')
        );
      }
    });
  }
}
