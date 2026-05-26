import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SHARED_IMPORTS } from '../../../shared/shared-imports';
import { LaboratorioPayload } from '../../../shared/models/lab.model';
import { LabsService } from '../../../services/labs.service';
import { extractErrorMessage, extractFieldErrors } from '../../../shared/utils/http-error.utils';

interface LabFormErrors {
  nombre?: string;
  edificio?: string;
  tipo?: string;
  capacidad?: string;
  equipamiento?: string;
}

@Component({
  selector: 'app-labs-form',
  standalone: true,
  imports: [SHARED_IMPORTS],
  templateUrl: './labs-form-screen.html',
  styleUrl: './labs-form-screen.scss'
})
export class LabsFormScreen implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private labsService = inject(LabsService);
  private snackBar = inject(MatSnackBar);

  public labData: LaboratorioPayload = {
    nombre: '',
    edificio: '',
    tipo: '',
    capacidad: null,
    estado: 'Disponible',
    equipamiento: ''
  };

  public errors: LabFormErrors = {};
  public isSaving = signal(false);
  public isLoading = signal(false);
  public isEditMode = signal(false);
  public serverError = signal<string | null>(null);
  private labId: string | null = null;

  public equipamientoTags = computed(() => {
    const text = this.labData.equipamiento;
    if (!text) return [];
    return text
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  });

  ngOnInit(): void {
    this.labId = this.route.snapshot.paramMap.get('id');
    this.isEditMode.set(!!this.labId);

    if (this.labId) {
      this.loadLab(this.labId);
    }
  }

  // 1. NOMBRE y TIPO: Solo letras y máximo un espacio entre palabras
  public soloLetras(event: KeyboardEvent, valorActual: string = ''): void {
    if (event.key.length > 1) return; // Permite teclas como Backspace, Tab, flechas

    // Bloquea espacio al inicio o dos espacios seguidos
    if (event.key === ' ' && (valorActual.length === 0 || valorActual.endsWith(' '))) {
      event.preventDefault();
      return;
    }

    // Solo permite letras y espacios
    const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]$/;
    if (!regex.test(event.key)) {
      event.preventDefault();
    }
  }

  // 2. EDIFICIO: Alfanumérico y máximo un espacio entre palabras
  public alfanumericoUnEspacio(event: KeyboardEvent, valorActual: string = ''): void {
    if (event.key.length > 1) return;

    if (event.key === ' ' && (valorActual.length === 0 || valorActual.endsWith(' '))) {
      event.preventDefault();
      return;
    }

    // Permite letras, números y espacios
    const regex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]$/;
    if (!regex.test(event.key)) {
      event.preventDefault();
    }
  }

  // 3. CAPACIDAD: Solo números (bloquea el signo negativo y letras)
  public soloNumeros(event: KeyboardEvent): void {
    if (event.key.length > 1) return;

    const regex = /^[0-9]$/;
    if (!regex.test(event.key)) {
      event.preventDefault();
    }
  }

  // 4. EQUIPAMIENTO: Alfanumérico, máximo 2 espacios juntos, solo comas (no juntas)
  public reglasEquipamiento(event: KeyboardEvent, valorActual: string = ''): void {
    if (event.key.length > 1) return;

    // Bloquea coma al inicio o dos comas seguidas
    if (event.key === ',') {
      if (valorActual.length === 0 || valorActual.endsWith(',')) {
        event.preventDefault();
        return;
      }
    }

    // Permite 2 espacios, pero bloquea el 3er espacio consecutivo
    if (event.key === ' ') {
      if (valorActual.endsWith('  ')) { // Si ya hay dos espacios al final
        event.preventDefault();
        return;
      }
    }

    // Permite letras, números, espacios y comas
    const regex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s,]$/;
    if (!regex.test(event.key)) {
      event.preventDefault();
    }
  }

  public validarFormulario(): boolean {
    this.errors = {};
    this.serverError.set(null);
    let esValido = true;

    if (!this.labData.nombre || this.labData.nombre.trim().length < 5) {
      this.errors.nombre = 'El nombre debe tener al menos 5 caracteres.';
      esValido = false;
    }

    if (!this.labData.edificio || this.labData.edificio.trim().length < 2) {
      this.errors.edificio = 'Ingresa un edificio o ubicacion valida.';
      esValido = false;
    }

    if (!this.labData.tipo || this.labData.tipo.trim().length < 3) {
      this.errors.tipo = 'Ingresa el tipo de laboratorio.';
      esValido = false;
    }

    if (!this.labData.capacidad || this.labData.capacidad <= 0 || this.labData.capacidad > 100) {
      this.errors.capacidad = 'La capacidad debe ser entre 1 y 100 alumnos.';
      esValido = false;
    }

    if (!this.labData.equipamiento || this.labData.equipamiento.trim().length < 5) {
      this.errors.equipamiento = 'Debes detallar al menos un equipo principal.';
      esValido = false;
    }

    return esValido;
  }

  public saveLab(): void {
    if (!this.validarFormulario()) {
      return;
    }

    this.isSaving.set(true);

    const request$ =
      this.labId && this.isEditMode()
        ? this.labsService.update(this.labId, this.labData)
        : this.labsService.create(this.labData);

    request$.subscribe({
      next: () => {
        this.isSaving.set(false);
        this.snackBar.open(
          this.isEditMode() ? 'Laboratorio actualizado correctamente.' : 'Laboratorio registrado correctamente.',
          'Cerrar',
          { duration: 3000 }
        );
        this.router.navigate(['/dashboard/laboratorios']);
      },
      error: (error) => {
        this.isSaving.set(false);
        this.errors = {
          ...this.errors,
          ...(extractFieldErrors(error) as LabFormErrors)
        };
        this.serverError.set(
          extractErrorMessage(error, 'No se pudo guardar la informacion del laboratorio.')
        );
      }
    });
  }

  private loadLab(id: string): void {
    this.isLoading.set(true);
    this.serverError.set(null);

    this.labsService.getById(id).subscribe({
      next: (lab) => {
        this.labData = {
          nombre: lab.nombre,
          edificio: lab.edificio,
          tipo: lab.tipo,
          capacidad: lab.capacidad,
          estado: lab.estado,
          equipamiento: lab.equipamiento.join(', ')
        };
        this.isLoading.set(false);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.serverError.set(
          extractErrorMessage(error, 'No se pudo cargar el laboratorio seleccionado.')
        );
      }
    });
  }
}
