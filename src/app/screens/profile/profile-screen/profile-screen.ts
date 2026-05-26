import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { SHARED_IMPORTS } from '../../../shared/shared-imports';
import { AuthService } from '../../../services/auth.service';
import { ReservationsService } from '../../../services/reservations.service';
import { LoansService } from '../../../services/loans.service';
import { User, UserRole } from '../../../shared/models/user.model';
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

  public userRole = computed<UserRole>(() => this.user()?.rol ?? 'estudiante');
  public roleLabel = computed(() => this.getRoleLabel(this.userRole()));
  public roleTone = computed(() => this.getRoleTone(this.userRole()));
  public initials = computed(() => this.getInitials(this.user()?.nombre_completo));
  public areaAcademica = computed(
    () => this.user()?.carrera || this.user()?.carrera_departamento || 'Sin área registrada'
  );
  public tipoUsuarioLabel = computed(() => {
    const tipoUsuario = this.user()?.tipo_usuario;

    if (tipoUsuario === 'admin') return 'Administrador';
    if (tipoUsuario === 'tecnico' || tipoUsuario === 'personal') return 'Personal técnico';

    return 'Estudiante';
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
        this.loadError.set(
          extractErrorMessage(error, 'No se pudo cargar la información del perfil.')
        );
      }
    });
  }

  private getRoleLabel(role: UserRole): string {
    const labels: Record<UserRole, string> = {
      admin: 'Administrador',
      tecnico: 'Técnico',
      estudiante: 'Estudiante'
    };

    return labels[role];
  }

  private getRoleTone(role: UserRole): string {
    const tones: Record<UserRole, string> = {
      admin: 'role-admin',
      tecnico: 'role-tech',
      estudiante: 'role-student'
    };

    return tones[role];
  }

  private getInitials(fullName?: string | null): string {
    if (!fullName?.trim()) {
      return 'U';
    }

    return fullName
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');
  }
}
