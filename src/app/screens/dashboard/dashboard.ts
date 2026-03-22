import { Component, OnInit, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { SHARED_IMPORTS } from '../../shared/shared-imports';
import { AuthService } from '../../services/auth.service';
import { User } from '../../shared/models/user.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [SHARED_IMPORTS],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardScreen implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  // Signal para almacenar los datos del usuario logueado
  public user = signal<User | null>(null);
  // Signal para controlar el menú lateral en dispositivos móviles
  public isSidebarOpen = signal(false);

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(currentUser => {
      this.user.set(currentUser);
    });
  }

  public toggleSidebar(): void {
    this.isSidebarOpen.update(val => !val);
  }

  public closeSidebar(): void {
    this.isSidebarOpen.set(false);
  }

  public logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
