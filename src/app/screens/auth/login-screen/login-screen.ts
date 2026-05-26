import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { SHARED_IMPORTS } from '../../../shared/shared-imports';
import { AuthService } from '../../../services/auth.service';
import { extractErrorMessage } from '../../../shared/utils/http-error.utils';

interface LoginErrors {
  email?: string;
  password?: string;
}

@Component({
  selector: 'app-login-screen',
  standalone: true,
  imports: [SHARED_IMPORTS],
  templateUrl: './login-screen.html',
  styleUrl: './login-screen.scss'
})
export class LoginScreen {
  private router = inject(Router);
  private authService = inject(AuthService);

  public user: { email?: string; password?: string } = {
    email: '',
    password: ''
  };

  public errors: LoginErrors = {};
  public serverError = signal<string | null>(null);
  public isLoading = signal(false);
  public hidePassword = true;
  public inputType: 'password' | 'text' = 'password';

  public prevenirEspacioInicial(event: KeyboardEvent, valorActual = ''): void {
    // Si el usuario presiona espacio al inicio del campo de texto, cancela el evento
    if (event.key === ' ') {
      if (!valorActual || valorActual.trim().length === 0) {
        event.preventDefault();
      }
    }
  }

  public showPassword(): void {
    this.hidePassword = !this.hidePassword;
    this.inputType = this.hidePassword ? 'password' : 'text';
  }

  public validarFormulario(): boolean {
    this.errors = {};
    this.serverError.set(null);
    let esValido = true;

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!this.user.email || !emailRegex.test(this.user.email)) {
      this.errors.email = 'Ingresa un correo electrónico institucional válido.';
      esValido = false;
    }

    if (!this.user.password) {
      this.errors.password = 'La contraseña es requerida.';
      esValido = false;
    }

    return esValido;
  }

  public login(): void {
    if (!this.validarFormulario()) {
      return;
    }

    this.isLoading.set(true);

    this.authService.login(this.user.email!, this.user.password!).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.serverError.set(
          extractErrorMessage(error, 'Credenciales incorrectas o problemas de conexión con el servidor institucional.')
        );
      }
    });
  }
}
