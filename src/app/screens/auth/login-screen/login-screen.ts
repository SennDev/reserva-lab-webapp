import { Component, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { SHARED_IMPORTS } from '../../../shared/shared-imports';
import { AuthService } from '../../../services/auth.service'; // <-- 1. Importamos el servicio

@Component({
  selector: 'app-login-screen',
  standalone: true,
  imports: [SHARED_IMPORTS],
  templateUrl: './login-screen.html',
  styleUrl: './login-screen.scss'
})
export class LoginScreen {
  private router = inject(Router);
  private authService = inject(AuthService); // <-- 2. Inyectamos el servicio

  public user: any = {};
  public errors: any = {};

  // Signal para manejar la transición inmersiva de Glassmorphism
  public isLoading = signal(false);

  public hidePassword = true;
  public inputType: 'password' | 'text' = 'password';

  public showPassword(): void {
    this.hidePassword = !this.hidePassword;
    this.inputType = this.hidePassword ? 'password' : 'text';
  }

  public validarFormulario(): boolean {
    this.errors = {};
    let esValido = true;

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!this.user.email || !emailRegex.test(this.user.email)) {
      this.errors.email = 'Ingresa un correo institucional válido.';
      esValido = false;
    }

    if (!this.user.password) {
      this.errors.password = 'La contraseña es requerida.';
      esValido = false;
    }

    return esValido;
  }

  // 3. ACTUALIZAMOS EL MÉTODO DE LOGIN
  public login(): void {
    if (this.validarFormulario()) {
      this.isLoading.set(true);

      // Delegamos el trabajo al AuthService
      this.authService.login(this.user.email, this.user.password).subscribe({
        next: (usuarioAutenticado) => {
          // Cuando el servicio responde que todo salió bien (después de 1.5s)
          this.isLoading.set(false);
          console.log('Login conectado al AuthService:', usuarioAutenticado);
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.isLoading.set(false);
          console.error('Error al iniciar sesión', err);
        }
      });
    }
  }
}
