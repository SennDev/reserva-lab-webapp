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

  public prevenirEspacioInicial(event: KeyboardEvent, valorActual = ''): void {
    if (event.key === ' ' && (!valorActual || valorActual.trim().length === 0)) {
      event.preventDefault();
    }
  }

  public soloLetras(event: KeyboardEvent, valorActual: string = ''): void {
  if (event.key.length > 1) return; // Permite teclas como Backspace, Tab, flechas

  if (event.key === ' ' && (!valorActual || valorActual.trim().length === 0 || valorActual.endsWith(' '))) {
    event.preventDefault();
    return;
  }

  const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]$/;
  if (!regex.test(event.key)) {
    event.preventDefault();
  }
}

public alfanumericoUnEspacio(event: KeyboardEvent, valorActual: string = ''): void {
  if (event.key.length > 1) return;

  if (event.key === ' ' && (!valorActual || valorActual.trim().length === 0 || valorActual.endsWith(' '))) {
    event.preventDefault();
    return;
  }

  const regex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]$/;
  if (!regex.test(event.key)) {
    event.preventDefault();
  }
}

public soloNumeros(event: KeyboardEvent): void {
  if (event.key.length > 1) return;

  const regex = /^[0-9]$/;
  if (!regex.test(event.key)) {
    event.preventDefault();
  }
}

  public validarFormulario(): boolean {
    this.errors = {};
    this.serverError.set(null);
    let esValido = true;

    const data = this.eqData;

    // 1. NOMBRE / DESCRIPCIÓN: Al menos 5 caracteres (se permiten letras y números para los modelos)
    if (!data.nombre || data.nombre.trim().length < 5) {
      this.errors.nombre = 'El nombre del equipo debe tener al menos 5 caracteres.';
      esValido = false;
    }

    // 2. NÚMERO DE SERIE: Al menos 4 caracteres
    if (!data.numero_serie || data.numero_serie.trim().length < 4) {
      this.errors.numero_serie = 'Ingresa un número de serie válido (mínimo 4 caracteres).';
      esValido = false;
    }

    // 3. ASIGNACIÓN: Debe tener un laboratorio seleccionado O una ubicación manual
    if (!data.laboratorioId && (!data.ubicacion || data.ubicacion.trim() === '')) {
      this.errors.ubicacion = 'Debes asignar el equipo a un laboratorio o escribir una ubicación manual.';
      esValido = false;
    }

    // 4. CANTIDAD TOTAL: Mayor a 0
    if (!data.cantidad_total || data.cantidad_total <= 0) {
      this.errors.cantidad_total = 'La cantidad total debe ser mayor a cero.';
      esValido = false;
    }

    // 5. CANTIDAD DISPONIBLE: No negativa y no mayor a la cantidad total
    const cantidadDisponible = data.cantidad_disponible ?? data.cantidad_total ?? 0;

    if (cantidadDisponible < 0) {
      this.errors.cantidad_disponible = 'La cantidad disponible no puede ser negativa.';
      esValido = false;
    } else if (data.cantidad_total && cantidadDisponible > data.cantidad_total) {
      this.errors.cantidad_disponible = 'La cantidad disponible no puede exceder la cantidad total.';
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
