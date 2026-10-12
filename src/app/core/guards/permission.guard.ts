import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthStore } from '../stores/auth.store';

export const permissionGuard = (permission: string): CanActivateFn => {
  return () => {
    const authStore = inject(AuthStore);
    const router = inject(Router);

    if (authStore.hasPermission(permission)) {
      return true;
    }

    return router.createUrlTree(['/forbidden']);
  };
};
