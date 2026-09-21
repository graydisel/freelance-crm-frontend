import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthStore } from '../stores/auth.store';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authStore = inject(AuthStore);

  const token = authStore.token() || localStorage.getItem(environment.token);

  let clonedReq = req;
  if (token && !req.url.includes('/auth/login')) {
    clonedReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`),
    });
  }
  return next(clonedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        console.warn('Session is not valid');
        authStore.logout();
      }
      return throwError(() => error);
    }),
  );
};
