import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { SHARED_IMPORTS } from '../../../shared/shared-imports';

@Component({
  selector: 'app-registro-screen',
  standalone: true,
  imports: [SHARED_IMPORTS],
  templateUrl: './registro-screen.html',
  styleUrl: './registro-screen.scss'
})
export class RegistroScreen {
  public user: any = { tipo_usuario: 'estudiante' };
  public errors: any = {};
  public isLoading = signal(false);

  public hide_1 = true;
  public inputType_1: 'password' | 'text' = 'password';
  public hide_2 = true;
  public inputType_2: 'password' | 'text' = 'password';

  public nivelFuerza: string = '';
  public claseFuerza: string = '';
  public passwordsCoinciden: boolean | null = null;

  public carreras: string[] = [
    'Ciencias de la Computación',
    'Ingeniería en Tecnologías de la Información',
    'Ingeniería en Ciencias de la Computación',
    'Matemáticas Aplicadas',
    'Otra'
  ];

  constructor(private router: Router) {}

  public soloLetras(event: KeyboardEvent, valorActual: string = ''): void {
    if (event.key === ' ' && valorActual.trim().length === 0) {
      event.preventDefault(); return;
    }
    const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/;
    if (!regex.test(event.key)) { event.preventDefault(); }
  }

  public soloAlfanumericoSinEspacios(event: KeyboardEvent): void {
    const regex = /^[a-zA-Z0-9]*$/;
    if (!regex.test(event.key)) { event.preventDefault(); }
  }

  public validarCorreoRealTime(): void {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (this.user.email && !emailRegex.test(this.user.email)) {
      this.errors.email = 'Debe ser un correo institucional válido (ej: @alumno.buap.mx).';
    } else {
      this.errors.email = null;
    }
  }

  public evaluarFuerzaPassword(): void {
    const p = this.user.password || '';
    let fuerza = 0;
    if (p.length > 5) fuerza++;
    if (p.length >= 8) fuerza++;
    if (/[A-Z]/.test(p)) fuerza++;
    if (/[0-9]/.test(p)) fuerza++;

    if (p.length === 0) {
      this.nivelFuerza = ''; this.claseFuerza = '';
    } else if (fuerza <= 1) {
      this.nivelFuerza = 'Débil'; this.claseFuerza = 'fuerza-debil';
    } else if (fuerza === 2 || fuerza === 3) {
      this.nivelFuerza = 'Media'; this.claseFuerza = 'fuerza-media';
    } else if (fuerza >= 4) {
      this.nivelFuerza = 'Fuerte'; this.claseFuerza = 'fuerza-fuerte';
    }
    this.compararPasswords();
  }

  public compararPasswords(): void {
    if (!this.user.confirm_password) {
      this.passwordsCoinciden = null; return;
    }
    this.passwordsCoinciden = (this.user.password === this.user.confirm_password);
  }

  public validarFormulario(): boolean {
    this.errors = {};
    let esValido = true;

    if (!this.user.nombre_completo) { this.errors.nombre_completo = 'El nombre es requerido.'; esValido = false; }

    if (this.user.tipo_usuario === 'estudiante' && (!this.user.matricula || this.user.matricula.length !== 9)) {
      this.errors.matricula = 'La matrícula debe tener exactamente 9 dígitos.'; esValido = false;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!this.user.email || !emailRegex.test(this.user.email)) {
      this.errors.email = 'Ingresa un correo institucional válido.'; esValido = false;
    }

    if (!this.user.carrera) { this.errors.carrera = 'Selecciona tu carrera.'; esValido = false; }
    if (!this.user.password) { this.errors.password = 'La contraseña es requerida.'; esValido = false; }
    if (this.user.password !== this.user.confirm_password) { esValido = false; }

    return esValido;
  }

  public registrar(): void {
    if (this.validarFormulario()) {
      this.isLoading.set(true);
      console.log('Registro exitoso (Simulado):', this.user);
      setTimeout(() => {
        this.isLoading.set(false);
        this.router.navigate(['/auth/login']);
      }, 2000);
    } else {
      console.log('Formulario inválido', this.errors);
    }
  }

  public showPassword(): void {
    this.hide_1 = !this.hide_1;
    this.inputType_1 = this.hide_1 ? 'password' : 'text';
  }

  public showConfirmPassword(): void {
    this.hide_2 = !this.hide_2;
    this.inputType_2 = this.hide_2 ? 'password' : 'text';
  }
}
