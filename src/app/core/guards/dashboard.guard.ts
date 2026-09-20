import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthStore } from '../stores/auth.store';

export const dashboardGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authStore = inject(AuthStore);

  const user = authStore.user();

  if (user && user.role) {
    const role = user.role.toLowerCase();

    if (role === 'manager' || role === 'admin') {
      return true;
    }
  }

  console.warn('Access denied: Not appropriate role');
  router.navigate(['/login']);
  return false;
};
