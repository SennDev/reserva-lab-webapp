import { Component, signal, computed, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SHARED_IMPORTS } from '../../../shared/shared-imports';

// 1. INTERFAZ ESTRICTA: El contrato de datos que Django espera recibir
export interface LaboratorioPayload {
  nombre: string;
  edificio: string;
  capacidad: number | null;
  estado: 'Disponible' | 'En Mantenimiento' | 'Ocupado';
  equipamiento: string;
}

@Component({
  selector: 'app-labs-form',
  standalone: true,
  imports: [SHARED_IMPORTS],
  templateUrl: './labs-form-screen.html',
  styleUrl: './labs-form-screen.scss'
})
export class LabsFormScreen implements OnInit {
  public labData: LaboratorioPayload = {
    nombre: '',
    edificio: '',
    capacidad: null,
    estado: 'Disponible',
    equipamiento: ''
  };

  public errors: any = {};
  public isSaving = signal<boolean>(false);

  // 2. VARIABLES DE BACKEND-READINESS
  public isEditMode = signal<boolean>(false); // Detectará si estamos creando o editando
  public serverError = signal<string | null>(null); // Almacenará errores que envíe Django

  // PREVISUALIZACIÓN EN VIVO
  public equipamientoTags = computed(() => {
    const text = this.labData.equipamiento;
    if (!text) return [];
    return text.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
  });

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Aquí en el futuro leeremos la URL.
    // Si la URL dice /laboratorios/editar/5, isEditMode será true y haremos un this.http.get()
  }

  public validarFormulario(): boolean {
    this.errors = {};
    let esValido = true;

    if (!this.labData.nombre || this.labData.nombre.trim().length < 5) {
      this.errors.nombre = 'El nombre debe tener al menos 5 caracteres.';
      esValido = false;
    }

    if (!this.labData.edificio || this.labData.edificio.trim().length < 2) {
      this.errors.edificio = 'Ingresa un edificio o ubicación válida.';
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
    if (this.validarFormulario()) {
      this.isSaving.set(true);
      this.serverError.set(null); // Limpiamos errores previos del servidor

      // Simulación de Petición HTTP POST/PUT a Django
      setTimeout(() => {
        // 3. SIMULACIÓN DE ERROR DE BASE DE DATOS (Constraint de Nombre Único)
        if (this.labData.nombre.toLowerCase() === 'laboratorio de computación avanzada') {
          this.serverError.set('Error 400: Ya existe un laboratorio registrado con ese nombre exacto en la base de datos.');
          this.isSaving.set(false);
          return; // Detenemos la ejecución
        }

        // Si todo sale bien, guardamos y redirigimos
        this.isSaving.set(false);
        this.router.navigate(['/dashboard/laboratorios']);
      }, 1500);
    }
  }
}
