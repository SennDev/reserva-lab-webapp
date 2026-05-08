import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { SHARED_IMPORTS } from '../../../shared/shared-imports';
import { AuthService } from '../../../services/auth.service';
import { RegisterPayload } from '../../../shared/models/auth.model';
import { extractErrorMessage, extractFieldErrors } from '../../../shared/utils/http-error.utils';

interface RegisterErrors {
  nombre?: string;
  apellidos?: string;
  matricula?: string;
  email?: string;
  carrera?: string;
  password?: string;
  confirm_password?: string;
}

@Component({
  selector: 'app-registro-screen',
  standalone: true,
  imports: [SHARED_IMPORTS],
  templateUrl: './registro-screen.html',
  styleUrl: './registro-screen.scss'
})
export class RegistroScreen {
  private router = inject(Router);
  private authService = inject(AuthService);

  public user: RegisterPayload = {
    nombre: '',
    apellidos: '',
    matricula: '',
    email: '',
    carrera: '',
    tipo_usuario: 'estudiante',
    password: '',
    confirm_password: ''
  };

  public errors: RegisterErrors = {};
  public serverError = signal<string | null>(null);
  public isLoading = signal(false);
  public hide_1 = true;
  public inputType_1: 'password' | 'text' = 'password';
  public hide_2 = true;
  public inputType_2: 'password' | 'text' = 'password';
  public nivelFuerza = '';
  public claseFuerza = '';
  public passwordsCoinciden: boolean | null = null;

  public carreras: string[] = [
    'Ciencias de la Computacion',
    'Ingenieria en Tecnologias de la Informacion',
    'Ingenieria en Ciencias de la Computacion',
    'Matematicas Aplicadas',
    'Otra'
  ];

  public soloLetras(event: KeyboardEvent, valorActual = ''): void {
    if (event.key === ' ' && valorActual.trim().length === 0) {
      event.preventDefault();
      return;
    }

    const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/;

    if (!regex.test(event.key)) {
      event.preventDefault();
    }
  }

  public soloAlfanumericoSinEspacios(event: KeyboardEvent): void {
    const regex = /^[a-zA-Z0-9]*$/;

    if (!regex.test(event.key)) {
      event.preventDefault();
    }
  }

  public validarCorreoRealTime(): void {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (this.user.email && !emailRegex.test(this.user.email)) {
      this.errors.email = 'Debe ser un correo institucional valido.';
    } else {
      delete this.errors.email;
    }
  }

  public evaluarFuerzaPassword(): void {
    const password = this.user.password || '';
    let fuerza = 0;

    if (password.length > 5) fuerza++;
    if (password.length >= 8) fuerza++;
    if (/[A-Z]/.test(password)) fuerza++;
    if (/[0-9]/.test(password)) fuerza++;

    if (password.length === 0) {
      this.nivelFuerza = '';
      this.claseFuerza = '';
    } else if (fuerza <= 1) {
      this.nivelFuerza = 'Debil';
      this.claseFuerza = 'fuerza-debil';
    } else if (fuerza === 2 || fuerza === 3) {
      this.nivelFuerza = 'Media';
      this.claseFuerza = 'fuerza-media';
    } else {
      this.nivelFuerza = 'Fuerte';
      this.claseFuerza = 'fuerza-fuerte';
    }

    this.compararPasswords();
  }

  public compararPasswords(): void {
    if (!this.user.confirm_password) {
      this.passwordsCoinciden = null;
      return;
    }

    this.passwordsCoinciden = this.user.password === this.user.confirm_password;
  }

  public validarFormulario(): boolean {
    this.errors = {};
    this.serverError.set(null);
    let esValido = true;

    if (!this.user.nombre.trim()) {
      this.errors.nombre = 'El nombre es requerido.';
      esValido = false;
    }

    if (!this.user.apellidos.trim()) {
      this.errors.apellidos = 'Los apellidos son requeridos.';
      esValido = false;
    }

    if (!this.user.matricula.trim()) {
      this.errors.matricula = 'La matricula o ID es requerida.';
      esValido = false;
    } else if (this.user.tipo_usuario === 'estudiante' && !/^\d{9}$/.test(this.user.matricula)) {
      this.errors.matricula = 'La matricula debe tener exactamente 9 digitos.';
      esValido = false;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!this.user.email || !emailRegex.test(this.user.email)) {
      this.errors.email = 'Ingresa un correo institucional valido.';
      esValido = false;
    }

    if (!this.user.carrera) {
      this.errors.carrera = 'Selecciona tu carrera o departamento.';
      esValido = false;
    }

    if (!this.user.password) {
      this.errors.password = 'La contrasena es requerida.';
      esValido = false;
    } else if (this.user.password.length < 8) {
      this.errors.password = 'La contrasena debe tener al menos 8 caracteres.';
      esValido = false;
    }

    if (this.user.password !== this.user.confirm_password) {
      this.errors.confirm_password = 'Las contrasenas no coinciden.';
      esValido = false;
    }

    return esValido;
  }

  public registrar(): void {
    if (!this.validarFormulario()) {
      return;
    }

    this.isLoading.set(true);

    this.authService.register(this.user).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/auth/login'], {
          state: { registered: true, email: this.user.email }
        });
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errors = {
          ...this.errors,
          ...(extractFieldErrors(error) as RegisterErrors)
        };
        this.serverError.set(
          extractErrorMessage(error, 'No se pudo completar el registro. Revisa tus datos.')
        );
      }
    });
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
