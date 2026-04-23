import { Component, inject, OnInit, signal } from '@angular/core';
import { SHARED_IMPORTS } from '../../../shared/shared-imports';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-profile-screen',
  standalone: true,
  imports: [SHARED_IMPORTS],
  templateUrl: './profile-screen.html',
  styleUrl: './profile-screen.scss'
})
export class ProfileScreen implements OnInit {
  private authService = inject(AuthService);

  public user = signal<any>(null);
  public isLoading = signal<boolean>(true);
  
  // Estadísticas y datos extra simulados
  public profileStats = signal<any>({
    totalReservas: 0,
    totalPrestamos: 0,
    fechaRegistro: '',
    direccion: ''
  });

  ngOnInit(): void {
    // 1. Obtenemos los datos básicos de la sesión actual
    this.authService.currentUser$.subscribe(currentUser => {
      if (currentUser) {
        this.user.set(currentUser);
      }
    });

    this.fetchProfileData();
  }

  private fetchProfileData(): void {
    this.isLoading.set(true);

    // 2. Simulamos una consulta al backend para traer estadísticas y detalles extra
    setTimeout(() => {
      this.profileStats.set({
        totalReservas: 14,
        totalPrestamos: 8,
        fechaRegistro: '15 de Agosto, 2024',
        direccion: 'Blvd. Valsequillo S/N, San Manuel, Puebla, Pue.'
      });
      this.isLoading.set(false);
    }, 1200);
  }
}