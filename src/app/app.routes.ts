import { Routes } from '@angular/router';
import { rolesGuard } from './core/guards/roles.guard';

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
    canActivate: [rolesGuard],
    data: { roles: ['manager', 'admin'] },
    loadComponent: () => import('./features/dashboard/dashboard.page').then((m) => m.DashboardPage),
  },
  {
    path: 'clients',
    title: 'Clients',
    canActivate: [rolesGuard],
    data: { roles: ['manager', 'admin'] },
    loadComponent: () =>
      import('./features/clients/clients.page').then((m) => m.ClientsPageComponent),
  },
  {
    path: 'projects',
    title: 'Projects',
    canActivate: [rolesGuard],
    data: { roles: ['manager', 'admin'] },
    loadComponent: () =>
      import('./features/projects/projects.page').then((m) => m.ProjectsPageComponent),
  },
  {
    path: 'projects/:id',
    canActivate: [rolesGuard],
    data: { roles: ['manager', 'admin', 'developer'] },
    loadComponent: () =>
      import('./features/projects/project-layout/project-layout.page').then(
        (m) => m.ProjectLayoutPage,
      ),
    children: [
      {
        path: '',
        redirectTo: 'tasks',
        pathMatch: 'full',
      },
      {
        path: 'tasks',
        title: 'Project Tasks',
        loadComponent: () =>
          import('./features/projects/project-tasks/project-tasks.page').then(
            (m) => m.ProjectTasksPage,
          ),
      },
      {
        path: 'kanban',
        title: 'Project Kanban',
        loadComponent: () =>
          import('./features/projects/kanban-desk/kanban-desk.page').then((m) => m.KanbanDeskPage),
      },
    ],
  },
  {
    path: 'forbidden',
    title: 'Forbidden',
    loadComponent: () => import('./features/forbidden/forbidden.page').then((m) => m.ForbiddenPage),
  },
  {
    path: '**',
    loadComponent: () => import('./features/not-found/not-found.page').then((m) => m.NotFoundPage),
  },
];
