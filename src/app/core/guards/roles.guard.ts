import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { inject } from '@angular/core';
import { AuthStore } from '../stores/auth.store';

export const rolesGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  const requiredRoles = route.data['roles'] as Array<string>;
  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  const role = authStore.role();
  if (!role) return false;

  const hasAccess = requiredRoles.includes(role.toLowerCase());
  if (hasAccess) {
    return true;
  } else {
    return router.createUrlTree(['/forbidden']);
  }
};
