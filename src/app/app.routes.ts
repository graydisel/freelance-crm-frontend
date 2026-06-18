import { Routes } from '@angular/router';
import {dashboardGuard} from './core/guards/dashboard.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    title: 'Login',
    loadComponent: () => import('./features/auth/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'dashboard',
    title: 'Dashboard',
    canActivate: [dashboardGuard],
    loadComponent: () => import('./features/dashboard/dashboard.page').then((m) => m.DashboardPage),
  },
  {
    path: 'clients',
    title: 'Clients',
    canActivate: [dashboardGuard],
    loadComponent: () => import('./features/clients/clients.page').then((m) => m.ClientsPageComponent),
  },
  {
    path: '**',
    loadComponent: () => import('./features/not-found/not-found.page').then(m => m.NotFoundPage),
  }
];
