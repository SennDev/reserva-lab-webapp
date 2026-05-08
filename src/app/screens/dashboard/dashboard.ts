import { Component, OnInit, signal, inject, HostListener, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SHARED_IMPORTS } from '../../shared/shared-imports';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { User } from '../../shared/models/user.model';

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
  private notificationService = inject(NotificationService);

  public user = signal<User | null>(null);
  public isSidebarOpen = signal(false);
  public isNotificationsOpen = signal(false);
  public notifications = this.notificationService.notifications;
  public unreadCount = this.notificationService.unreadCount;

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((currentUser) => {
      this.user.set(currentUser);
    });

    if (this.authService.accessToken) {
      this.authService.fetchCurrentUser().subscribe({
        error: () => {
          // El interceptor ya limpia la sesion si el token no es valido.
        }
      });
    }

    this.notificationService.loadNotifications();
  }

  public toggleSidebar(): void {
    this.isSidebarOpen.update((value) => !value);
  }

  public closeSidebar(): void {
    this.isSidebarOpen.set(false);
  }

  public logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  public toggleNotifications(event: Event): void {
    event.stopPropagation();
    this.isNotificationsOpen.update((value) => !value);
  }

  public markAsRead(id: number, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    this.notificationService.markAsRead(id);
  }

  public markAllAsRead(event: Event): void {
    event.preventDefault();
    this.notificationService.markAllAsRead();
  }

  @HostListener('document:click', ['$event'])
  public clickout(event: Event): void {
    if (
      this.isNotificationsOpen() &&
      !this.eRef.nativeElement.querySelector('.notification-container')?.contains(event.target)
    ) {
      this.isNotificationsOpen.set(false);
    }
  }
}
