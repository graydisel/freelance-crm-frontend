import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';

export const clientsGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.currentUser();

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
