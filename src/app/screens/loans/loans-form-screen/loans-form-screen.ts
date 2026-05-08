import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SHARED_IMPORTS } from '../../../shared/shared-imports';
import { AuthService } from '../../../services/auth.service';
import { EquipmentService } from '../../../services/equipment.service';
import { LoansService } from '../../../services/loans.service';
import { PrestamoPayload } from '../../../shared/models/loan.model';
import { extractErrorMessage, extractFieldErrors } from '../../../shared/utils/http-error.utils';

interface LoanFormErrors {
  equipoId?: string;
  fecha?: string;
  horario?: string;
  cantidad?: string;
  proyecto?: string;
  motivo?: string;
}

@Component({
  selector: 'app-loans-form-screen',
  standalone: true,
  imports: [SHARED_IMPORTS],
  templateUrl: './loans-form-screen.html',
  styleUrl: './loans-form-screen.scss'
})
export class LoansFormScreen implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);
  private equipmentService = inject(EquipmentService);
  private loansService = inject(LoansService);
  public authService = inject(AuthService);

  public isSaving = signal(false);
  public isLoadingEquipment = signal(true);
  public serverError = signal<string | null>(null);
  public errors: LoanFormErrors = {};
  public minDate = '';

  public equiposDisponibles = signal<Array<{ id: string; nombre: string; disponible: number }>>([]);
  public bloquesHorarios = [
    '07:00 - 09:00',
    '09:00 - 11:00',
    '11:00 - 13:00',
    '13:00 - 15:00',
    '15:00 - 17:00',
    '17:00 - 19:00'
  ];

  public prestamoData: PrestamoPayload = {
    equipoId: '',
    fecha: '',
    horario: '',
    proyecto: '',
    motivo: '',
    cantidad: 1
  };

  public equipoSeleccionadoNombre = computed(() => {
    const equipoId = this.prestamoData.equipoId;
    if (!equipoId) return 'Selecciona un equipo...';
    const equipo = this.equiposDisponibles().find((item) => item.id === equipoId);
    return equipo ? equipo.nombre : 'Equipo desconocido';
  });

  public equipoSeleccionadoDisponible = computed(() => {
    const equipoId = this.prestamoData.equipoId;
    if (!equipoId) return 0;
    return this.equiposDisponibles().find((item) => item.id === equipoId)?.disponible ?? 0;
  });

  ngOnInit(): void {
    const today = new Date();
    const offset = today.getTimezoneOffset() * 60000;
    this.minDate = new Date(today.getTime() - offset).toISOString().split('T')[0];
    this.loadEquipos();

    const equipoId = this.route.snapshot.queryParamMap.get('equipoId');
    if (equipoId) {
      this.prestamoData.equipoId = equipoId;
    }
  }

  public validarFormulario(): boolean {
    this.errors = {};
    this.serverError.set(null);
    let esValido = true;

    if (!this.prestamoData.equipoId) {
      this.errors.equipoId = 'Debes seleccionar un equipo del inventario.';
      esValido = false;
    }

    if (!this.prestamoData.fecha) {
      this.errors.fecha = 'La fecha es obligatoria.';
      esValido = false;
    } else if (this.prestamoData.fecha < this.minDate) {
      this.errors.fecha = 'No puedes solicitar prestamos en el pasado.';
      esValido = false;
    }

    if (!this.prestamoData.horario) {
      this.errors.horario = 'Selecciona una franja horaria.';
      esValido = false;
    }

    if (!this.prestamoData.proyecto || this.prestamoData.proyecto.trim().length < 4) {
      this.errors.proyecto = 'Ingresa el nombre del proyecto o materia.';
      esValido = false;
    }

    if (!this.prestamoData.motivo || this.prestamoData.motivo.trim().length < 10) {
      this.errors.motivo = 'Describe brevemente para que usaras el equipo.';
      esValido = false;
    }

    if (!this.prestamoData.cantidad || this.prestamoData.cantidad <= 0) {
      this.errors.cantidad = 'Debes solicitar al menos una unidad.';
      esValido = false;
    } else if (this.prestamoData.cantidad > this.equipoSeleccionadoDisponible()) {
      this.errors.cantidad = 'La cantidad supera la disponibilidad actual.';
      esValido = false;
    }

    return esValido;
  }

  public submitPrestamo(): void {
    if (!this.validarFormulario()) {
      return;
    }

    this.isSaving.set(true);

    this.loansService.create(this.prestamoData).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.snackBar.open('Prestamo enviado correctamente.', 'Cerrar', {
          duration: 3000
        });
        this.router.navigate(['/dashboard/prestamos']);
      },
      error: (error) => {
        this.isSaving.set(false);
        this.errors = {
          ...this.errors,
          ...(extractFieldErrors(error) as LoanFormErrors)
        };
        this.serverError.set(
          extractErrorMessage(error, 'No se pudo enviar la solicitud de prestamo.')
        );
      }
    });
  }

  private loadEquipos(): void {
    this.isLoadingEquipment.set(true);

    this.equipmentService.list().subscribe({
      next: (equipos) => {
        this.equiposDisponibles.set(
          equipos
            .filter((equipo) => equipo.estado === 'Disponible' && equipo.cantidad_disponible > 0)
            .map((equipo) => ({
              id: equipo.id,
              nombre: equipo.nombre,
              disponible: equipo.cantidad_disponible
            }))
        );
        this.isLoadingEquipment.set(false);
      },
      error: (error) => {
        this.isLoadingEquipment.set(false);
        this.serverError.set(
          extractErrorMessage(error, 'No se pudo cargar la lista de equipos disponibles.')
        );
      }
    });
  }
}
