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
  public notifications = signal<NotificationItem[]>([]);
  public unreadCount = computed(() => this.notifications().filter((item) => !item.read).length);

  public loadNotifications(): void {
    this.notifications.set([]);
  }

  public markAsRead(id: number): void {
    this.notifications.update((items) =>
      items.map((item) => (item.id === id ? { ...item, read: true } : item))
    );
  }

  public markAllAsRead(): void {
    this.notifications.update((items) => items.map((item) => ({ ...item, read: true })));
  }
}
