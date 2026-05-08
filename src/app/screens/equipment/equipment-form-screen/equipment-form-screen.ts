import { Component, signal, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SHARED_IMPORTS } from '../../../shared/shared-imports';
import { EquipoPayload } from '../../../shared/models/equipment.model';
import { EquipmentService } from '../../../services/equipment.service';
import { LabsService } from '../../../services/labs.service';
import { extractErrorMessage, extractFieldErrors } from '../../../shared/utils/http-error.utils';

interface EquipmentFormErrors {
  nombre?: string;
  numero_serie?: string;
  ubicacion?: string;
  cantidad_total?: string;
  cantidad_disponible?: string;
}

@Component({
  selector: 'app-equipment-form',
  standalone: true,
  imports: [SHARED_IMPORTS],
  templateUrl: './equipment-form-screen.html',
  styleUrl: './equipment-form-screen.scss'
})
export class EquipmentFormScreen implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private equipmentService = inject(EquipmentService);
  private labsService = inject(LabsService);
  private snackBar = inject(MatSnackBar);

  public eqData: EquipoPayload = {
    nombre: '',
    numero_serie: '',
    laboratorioId: null,
    ubicacion: '',
    estado: 'Disponible',
    cantidad_total: 1,
    cantidad_disponible: 1
  };

  public errors: EquipmentFormErrors = {};
  public isSaving = signal(false);
  public isLoading = signal(false);
  public isEditMode = signal(false);
  public serverError = signal<string | null>(null);
  public laboratorios = signal<Array<{ id: string; nombre: string }>>([]);
  private equipmentId: string | null = null;

  ngOnInit(): void {
    this.equipmentId = this.route.snapshot.paramMap.get('id');
    this.isEditMode.set(!!this.equipmentId);
    this.loadLaboratorios();

    if (this.equipmentId) {
      this.loadEquipment(this.equipmentId);
    }
  }

  public validarFormulario(): boolean {
    this.errors = {};
    this.serverError.set(null);
    let esValido = true;

    if (!this.eqData.nombre || this.eqData.nombre.trim().length < 5) {
      this.errors.nombre = 'El nombre del equipo debe tener al menos 5 caracteres.';
      esValido = false;
    }

    if (!this.eqData.numero_serie || this.eqData.numero_serie.trim().length < 4) {
      this.errors.numero_serie = 'Ingresa un numero de serie valido.';
      esValido = false;
    }

    if (!this.eqData.laboratorioId && !this.eqData.ubicacion.trim()) {
      this.errors.ubicacion = 'Debes asignar el equipo a un laboratorio o ubicacion.';
      esValido = false;
    }

    if (!this.eqData.cantidad_total || this.eqData.cantidad_total <= 0) {
      this.errors.cantidad_total = 'La cantidad total debe ser mayor a cero.';
      esValido = false;
    }

    const cantidadDisponible =
      this.eqData.cantidad_disponible ?? this.eqData.cantidad_total ?? 0;

    if (cantidadDisponible < 0) {
      this.errors.cantidad_disponible = 'La cantidad disponible no puede ser negativa.';
      esValido = false;
    } else if (
      this.eqData.cantidad_total &&
      cantidadDisponible > this.eqData.cantidad_total
    ) {
      this.errors.cantidad_disponible =
        'La cantidad disponible no puede exceder la cantidad total.';
      esValido = false;
    }

    return esValido;
  }

  public saveEquipment(): void {
    if (!this.validarFormulario()) {
      return;
    }

    this.isSaving.set(true);

    const payload: EquipoPayload = {
      ...this.eqData,
      ubicacion: this.eqData.ubicacion.trim(),
      cantidad_disponible: this.eqData.cantidad_disponible ?? this.eqData.cantidad_total
    };

    const request$ =
      this.equipmentId && this.isEditMode()
        ? this.equipmentService.update(this.equipmentId, payload)
        : this.equipmentService.create(payload);

    request$.subscribe({
      next: () => {
        this.isSaving.set(false);
        this.snackBar.open(
          this.isEditMode() ? 'Equipo actualizado correctamente.' : 'Equipo registrado correctamente.',
          'Cerrar',
          { duration: 3000 }
        );
        this.router.navigate(['/dashboard/equipos']);
      },
      error: (error) => {
        this.isSaving.set(false);
        this.errors = {
          ...this.errors,
          ...(extractFieldErrors(error) as EquipmentFormErrors)
        };
        this.serverError.set(
          extractErrorMessage(error, 'No se pudo guardar la informacion del equipo.')
        );
      }
    });
  }

  public syncCantidadDisponible(): void {
    if (!this.isEditMode()) {
      this.eqData.cantidad_disponible = this.eqData.cantidad_total;
    }
  }

  public getSelectedLabName(): string {
    if (!this.eqData.laboratorioId) {
      return this.eqData.ubicacion || 'Ubicacion sin asignar';
    }

    return (
      this.laboratorios().find((lab) => lab.id === this.eqData.laboratorioId)?.nombre ||
      this.eqData.ubicacion ||
      'Ubicacion sin asignar'
    );
  }

  private loadLaboratorios(): void {
    this.labsService.list().subscribe({
      next: (labs) => {
        this.laboratorios.set(labs.map((lab) => ({ id: lab.id, nombre: lab.nombre })));
      }
    });
  }

  private loadEquipment(id: string): void {
    this.isLoading.set(true);
    this.serverError.set(null);

    this.equipmentService.getById(id).subscribe({
      next: (equipo) => {
        this.eqData = {
          nombre: equipo.nombre,
          numero_serie: equipo.numero_serie,
          laboratorioId: equipo.laboratorioId ?? null,
          ubicacion: equipo.ubicacion ?? '',
          estado: equipo.estado,
          cantidad_total: equipo.cantidad_total,
          cantidad_disponible: equipo.cantidad_disponible
        };
        this.isLoading.set(false);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.serverError.set(
          extractErrorMessage(error, 'No se pudo cargar el equipo seleccionado.')
        );
      }
    });
  }
}
