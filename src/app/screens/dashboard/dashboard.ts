import { Component, OnInit, signal, inject, HostListener, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { SHARED_IMPORTS } from '../../shared/shared-imports';
import { AuthService } from '../../services/auth.service';
import { User } from '../../shared/models/user.model';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification.service'; // Ajusta la ruta

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [SHARED_IMPORTS, CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardScreen implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private eRef = inject(ElementRef);
  
  // INYECTAMOS EL NUEVO SERVICIO
  private notificationService = inject(NotificationService);

  public user = signal<User | null>(null);
  public isSidebarOpen = signal(false);
  public isNotificationsOpen = signal(false);

  // VINCULAMOS LAS SIGNALS DEL SERVICIO AL COMPONENTE
  public notifications = this.notificationService.notifications;
  public unreadCount = this.notificationService.unreadCount;

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(currentUser => {
      this.user.set(currentUser);
    });
    
    // Opcional: Cargar notificaciones al iniciar
    this.notificationService.loadNotifications();
  }

  // --- MÉTODOS DEL LAYOUT ---
  public toggleSidebar(): void { this.isSidebarOpen.update(val => !val); }
  public closeSidebar(): void { this.isSidebarOpen.set(false); }
  public logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  // --- MÉTODOS DE NOTIFICACIONES ---
  public toggleNotifications(event: Event): void {
    event.stopPropagation();
    this.isNotificationsOpen.update(val => !val);
  }

  public markAsRead(id: number, event?: Event): void {
    if (event) event.stopPropagation(); // Evita que se cierre el menú al hacer clic
    this.notificationService.markAsRead(id);
  }

  public markAllAsRead(event: Event): void {
    event.preventDefault();
    this.notificationService.markAllAsRead();
  }

  @HostListener('document:click', ['$event'])
  public clickout(event: Event) {
    if (this.isNotificationsOpen() && !this.eRef.nativeElement.querySelector('.notification-container')?.contains(event.target)) {
      this.isNotificationsOpen.set(false);
    }
  }
}