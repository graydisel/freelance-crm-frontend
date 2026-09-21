import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthStore } from '../stores/auth.store';

export const projectsGuard: CanActivateFn = () => {
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
  void router.navigate(['/login']);
  return false;
};
