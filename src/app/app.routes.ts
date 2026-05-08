import { Routes } from '@angular/router';
import { authGuard, guestOnlyGuard } from './core/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./screens/home-screen/home-screen').then((m) => m.HomeScreen)
  },
  {
    path: 'auth/login',
    canActivate: [guestOnlyGuard],
    loadComponent: () => import('./screens/auth/login-screen/login-screen').then((m) => m.LoginScreen)
  },
  {
    path: 'auth/registro',
    canActivate: [guestOnlyGuard],
    loadComponent: () =>
      import('./screens/auth/registro-screen/registro-screen').then((m) => m.RegistroScreen)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./screens/dashboard/dashboard').then((m) => m.DashboardScreen),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./screens/dashboard/dashboard-home-screen/dashboard-home-screen').then(
            (m) => m.DashboardHomeScreen
          )
      },
      {
        path: 'laboratorios',
        loadComponent: () =>
          import('./screens/labs/labs-list-screen/labs-list-screen').then(
            (m) => m.LabsListScreen
          )
      },
      {
        path: 'laboratorios/nuevo',
        loadComponent: () =>
          import('./screens/labs/labs-form-screen/labs-form-screen').then(
            (m) => m.LabsFormScreen
          )
      },
      {
        path: 'laboratorios/:id/editar',
        loadComponent: () =>
          import('./screens/labs/labs-form-screen/labs-form-screen').then(
            (m) => m.LabsFormScreen
          )
      },
      {
        path: 'reservas',
        loadComponent: () =>
          import('./screens/reservations/reservations-list-screen/reservations-list-screen').then(
            (m) => m.ReservationsListScreen
          )
      },
      {
        path: 'reservas/nueva',
        loadComponent: () =>
          import('./screens/reservations/reservations-form-screen/reservations-form-screen').then(
            (m) => m.ReservationsFormScreen
          )
      },
      {
        path: 'prestamos',
        loadComponent: () =>
          import('./screens/loans/loans-list-screen/loans-list-screen').then(
            (m) => m.LoansListScreen
          )
      },
      {
        path: 'prestamos/nueva',
        loadComponent: () =>
          import('./screens/loans/loans-form-screen/loans-form-screen').then(
            (m) => m.LoansFormScreen
          )
      },
      {
        path: 'equipos',
        loadComponent: () =>
          import('./screens/equipment/equipment-list-screen/equipment-list-screen').then(
            (m) => m.EquipmentListScreen
          )
      },
      {
        path: 'equipos/nuevo',
        loadComponent: () =>
          import('./screens/equipment/equipment-form-screen/equipment-form-screen').then(
            (m) => m.EquipmentFormScreen
          )
      },
      {
        path: 'equipos/:id/editar',
        loadComponent: () =>
          import('./screens/equipment/equipment-form-screen/equipment-form-screen').then(
            (m) => m.EquipmentFormScreen
          )
      },
      {
        path: 'reportes',
        loadComponent: () =>
          import('./screens/reports/reports-list-screen/reports-list-screen').then(
            (m) => m.ReportsListScreen
          )
      },
      {
        path: 'reportes/detalle',
        loadComponent: () =>
          import('./screens/reports/reports-detail-screen/reports-detail-screen').then(
            (m) => m.ReportsDetailScreen
          )
      },
      {
        path: 'perfil',
        loadComponent: () =>
          import('./screens/profile/profile-screen/profile-screen').then((m) => m.ProfileScreen)
      }
    ]
  }
];
