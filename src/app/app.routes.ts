import { Routes } from '@angular/router';
import { Dashboard } from './features/dashboard/dashboard';
import { ProjectsComponent } from './features/projects/projects.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: Dashboard},
  { path: 'projects', component: ProjectsComponent},
];
