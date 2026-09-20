import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';
import { AuthStore } from '../stores/auth.store';

export const projectsGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authStore = inject(AuthStore);

  const user = authStore.user();
  if (user && user.role) {
    const role = user.role.toLowerCase();

    if (role === 'manager' || role === 'admin' || role === 'client') {
      return true;
    }
  }

  console.warn('Access denied: Not appropriate role');
  router.navigate(['/login']);
  return false;
};
