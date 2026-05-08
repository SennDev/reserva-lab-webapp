import { Component, inject, OnInit, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { SHARED_IMPORTS } from '../../../shared/shared-imports';
import { AuthService } from '../../../services/auth.service';
import { ReservationsService } from '../../../services/reservations.service';
import { LoansService } from '../../../services/loans.service';
import { User } from '../../../shared/models/user.model';
import { extractErrorMessage } from '../../../shared/utils/http-error.utils';

@Component({
  selector: 'app-profile-screen',
  standalone: true,
  imports: [SHARED_IMPORTS],
  templateUrl: './profile-screen.html',
  styleUrl: './profile-screen.scss'
})
export class ProfileScreen implements OnInit {
  private authService = inject(AuthService);
  private reservationsService = inject(ReservationsService);
  private loansService = inject(LoansService);

  public user = signal<User | null>(null);
  public isLoading = signal(true);
  public loadError = signal<string | null>(null);
  public profileStats = signal({
    totalReservas: 0,
    totalPrestamos: 0
  });

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((currentUser) => {
      this.user.set(currentUser);
    });

    this.fetchProfileData();
  }

  private fetchProfileData(): void {
    this.isLoading.set(true);
    this.loadError.set(null);

    forkJoin({
      reservas: this.reservationsService.list(),
      prestamos: this.loansService.list()
    }).subscribe({
      next: ({ reservas, prestamos }) => {
        this.profileStats.set({
          totalReservas: reservas.length,
          totalPrestamos: prestamos.length
        });
        this.isLoading.set(false);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.loadError.set(extractErrorMessage(error, 'No se pudo cargar la informacion del perfil.'));
      }
    });
  }
}
