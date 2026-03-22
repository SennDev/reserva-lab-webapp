import { Component, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SHARED_IMPORTS } from '../../../shared/shared-imports';

export interface EquipoPayload {
  nombre: string;
  numero_serie: string;
  laboratorio: string;
  estado: 'Disponible' | 'En Préstamo' | 'Mantenimiento' | 'Baja';
}

@Component({
  selector: 'app-equipment-form',
  standalone: true,
  imports: [SHARED_IMPORTS],
  templateUrl: './equipment-form-screen.html',
  styleUrl: './equipment-form-screen.scss'
})
export class EquipmentFormScreen implements OnInit {
  public eqData: EquipoPayload = {
    nombre: '',
    numero_serie: '',
    laboratorio: '',
    estado: 'Disponible'
  };

  public errors: any = {};
  public isSaving = signal<boolean>(false);
  public isEditMode = signal<boolean>(false);
  public serverError = signal<string | null>(null);

  // Simulamos los laboratorios disponibles en la BD
  public ubicaciones = [
    'Almacén Central',
    'Laboratorio de Computación Avanzada',
    'Laboratorio de Redes y Seguridad',
    'Laboratorio de Hardware y Robótica',
    'Sala de Posgrado e Investigación'
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {}

  public validarFormulario(): boolean {
    this.errors = {};
    let esValido = true;

    if (!this.eqData.nombre || this.eqData.nombre.trim().length < 5) {
      this.errors.nombre = 'El nombre del equipo debe tener al menos 5 caracteres.';
      esValido = false;
    }

    if (!this.eqData.numero_serie || this.eqData.numero_serie.trim().length < 4) {
      this.errors.numero_serie = 'Ingresa un número de serie válido (Mín. 4 caracteres).';
      esValido = false;
    }

    if (!this.eqData.laboratorio) {
      this.errors.laboratorio = 'Debes asignar el equipo a una ubicación.';
      esValido = false;
    }

    return esValido;
  }

  public saveEquipment(): void {
    if (this.validarFormulario()) {
      this.isSaving.set(true);
      this.serverError.set(null);

      setTimeout(() => {
        // Simulación de error: S/N duplicado
        if (this.eqData.numero_serie.toUpperCase() === 'ERROR-123') {
          this.serverError.set('Error 400: Este número de serie ya se encuentra registrado en el inventario.');
          this.isSaving.set(false);
          return;
        }

        this.isSaving.set(false);
        this.router.navigate(['/dashboard/equipos']);
      }, 1500);
    }
  }
}
