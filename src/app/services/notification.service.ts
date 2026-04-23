import { Injectable, signal, computed } from '@angular/core';

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'info' | 'error';
  read: boolean;
  date: Date;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  
  // 1. VALORES DUMMY (Mocks)
  // Aquí simulamos lo que nos devolvería el backend de Django
  private mockData: NotificationItem[] = [
    { 
      id: 1, 
      title: 'Reserva Aprobada', 
      message: 'Tu reserva para el Lab de Cómputo 1 ha sido confirmada por el Técnico.', 
      type: 'success', 
      read: false, 
      date: new Date() 
    },
    { 
      id: 2, 
      title: 'Préstamo por Vencer', 
      message: 'Recuerda devolver el Proyector EPSON mañana antes de las 14:00.', 
      type: 'warning', 
      read: false, 
      date: new Date(Date.now() - 1000 * 60 * 30) // Hace 30 minutos
    },
    { 
      id: 3, 
      title: 'Reserva Rechazada', 
      message: 'Tu solicitud fue rechazada por choque de horarios.', 
      type: 'error', 
      read: false, 
      date: new Date(Date.now() - 1000 * 60 * 60 * 2) // Hace 2 horas
    },
    { 
      id: 4, 
      title: 'Mantenimiento Programado', 
      message: 'El Lab de Electrónica estará cerrado el viernes.', 
      type: 'info', 
      read: true, 
      date: new Date(Date.now() - 1000 * 60 * 60 * 24) // Hace 1 día
    }
  ];

  // 2. ESTADO REACTIVO (Signals)
  public notifications = signal<NotificationItem[]>(this.mockData);
  public unreadCount = computed(() => this.notifications().filter(n => !n.read).length);

  constructor() {
    // Cuando conectes el backend, inyectarás el HttpClient aquí:
    // private http = inject(HttpClient);
  }

  // 3. MÉTODOS (Actualmente simulan, después harán peticiones reales)

  public loadNotifications(): void {
    // FUTURO BACKEND: 
    // this.http.get<NotificationItem[]>('/api/notifications').subscribe(data => this.notifications.set(data));
    
    // Por ahora, solo resetea a los datos mock si se necesita
    this.notifications.set(this.mockData);
  }

  public markAsRead(id: number): void {
    // FUTURO BACKEND:
    // this.http.patch(`/api/notifications/${id}/read`, {}).subscribe();

    this.notifications.update(notifs =>
      notifs.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }

  public markAllAsRead(): void {
    // FUTURO BACKEND:
    // this.http.post('/api/notifications/mark-all-read', {}).subscribe();

    this.notifications.update(notifs => 
      notifs.map(n => ({ ...n, read: true }))
    );
  }
}