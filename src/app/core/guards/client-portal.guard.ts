import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthStore } from '../stores/auth.store';

export const clientPortalGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  if (authStore.isClient()) {
    return true;
  }

  if (authStore.isDeveloper()) {
    return router.createUrlTree(['/projects']);
  }

  return router.createUrlTree(['/dashboard']);
};
