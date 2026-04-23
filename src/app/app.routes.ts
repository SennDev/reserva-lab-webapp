import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./screens/home-screen/home-screen').then(m => m.HomeScreen)
  },
  {
    path: 'auth/login',
    loadComponent: () => import('./screens/auth/login-screen/login-screen').then(m => m.LoginScreen)
  },
  {
    path: 'auth/registro',
    loadComponent: () => import('./screens/auth/registro-screen/registro-screen').then(m => m.RegistroScreen)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./screens/dashboard/dashboard').then(m => m.DashboardScreen),
    children: [
      // 1. RUTA POR DEFECTO (Resumen del Dashboard)
      {
        path: '',
        loadComponent: () => import('./screens/dashboard/dashboard-home-screen/dashboard-home-screen').then(m => m.DashboardHomeScreen)
      },

      // 2. RUTAS DE LABORATORIOS
      {
        path: 'laboratorios',
        loadComponent: () => import('./screens/labs/labs-list-screen/labs-list-screen').then(m => m.LabsListScreen)
      },
      {
        path: 'laboratorios/nuevo',
        loadComponent: () => import('./screens/labs/labs-form-screen/labs-form-screen').then(m => m.LabsFormScreen)
      },

      // 3. RUTAS DE RESERVAS
      {
        path: 'reservas',
        loadComponent: () => import('./screens/reservations/reservations-list-screen/reservations-list-screen').then(m => m.ReservationsListScreen)
      },
      {
        path: 'reservas/nueva',
        loadComponent: () => import('./screens/reservations/reservations-form-screen/reservations-form-screen').then(m => m.ReservationsFormScreen)
      },

      // 4. RUTA DE PRESTAMOS
      {
        path: 'prestamos',
        loadComponent: () => import('./screens/loans/loans-list-screen/loans-list-screen').then(m => m.LoansListScreen)
      },
      {
        path: 'prestamos/nueva',
        loadComponent: () => import('./screens/loans/loans-form-screen/loans-form-screen').then(m => m.LoansFormScreen)
      },

      // 4. RUTAS DE EQUIPOS
      {
        path: 'equipos',
        loadComponent: () => import('./screens/equipment/equipment-list-screen/equipment-list-screen').then(m => m.EquipmentListScreen)
      },
      {
        path: 'equipos/nuevo',
        loadComponent: () => import('./screens/equipment/equipment-form-screen/equipment-form-screen').then(m => m.EquipmentFormScreen)
      },
      
      // 5. RUTAS DE REPORTES / ADMINISTRACIÓN
      {
        path: 'reportes',
        loadComponent: () => import('./screens/reports/reports-list-screen/reports-list-screen').then(m => m.ReportsListScreen)
      },
      {
        path: 'reportes/detalle', // En el futuro será 'reportes/:id'
        loadComponent: () => import('./screens/reports/reports-detail-screen/reports-detail-screen').then(m => m.ReportsDetailScreen)
      },
      // 6. RUTA DE PERFIL DE USUARIO
      {
        path: 'perfil',
        loadComponent: () => import('./screens/profile/profile-screen/profile-screen').then(m => m.ProfileScreen)
      }
    ]
  }
];
