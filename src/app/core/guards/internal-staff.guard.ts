import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthStore } from '../stores/auth.store';

export const internalStaffGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  if (!authStore.isClient()) {
    return true;
  }

  return router.createUrlTree(['/portal']);
};
