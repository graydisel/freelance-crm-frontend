import { ILoginCredentials, IUser, TAuthState } from '../models/auth.model';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { computed, inject, PLATFORM_ID } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, of, pipe, switchMap, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HttpErrorResponse } from '@angular/common/http';

const initialState: TAuthState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
};

export const AuthStore = signalStore(
  { providedIn: 'root' },

  withState<TAuthState>(initialState),

  withComputed(({ user }) => ({
    isAuthenticated: computed(() => !!user()),
    role: computed(() => user()?.role ?? null),
    permissions: computed(() => user()?.permissions ?? []),
    isClient: computed(() => user()?.role?.toUpperCase() === 'CLIENT'),
    isDeveloper: computed(() => user()?.role?.toUpperCase() === 'DEVELOPER'),
    isDemo: computed(() => user()?.role?.toUpperCase() === 'DEMO_MANAGER'),
    isManager: computed(() =>
      ['ADMIN', 'MANAGER', 'DEMO_MANAGER'].includes(user()?.role?.toUpperCase() ?? ''),
    ),
    canManageClients: computed(() => (user()?.permissions ?? []).includes('clients:read')),
    canViewAnalytics: computed(() => (user()?.permissions ?? []).includes('analytics:read')),
  })),

  withMethods(
    (
      store,
      authService = inject(AuthService),
      router = inject(Router),
      platformId = inject(PLATFORM_ID),
    ) => {
      const isBrowser = isPlatformBrowser(platformId);

      return {
        hasPermission(permission: string): boolean {
          if (store.isDemo()) {
            return true;
          }
          return (store.permissions() ?? []).includes(permission);
        },

        hasAnyPermission(perms: string[]): boolean {
          if (store.isDemo()) {
            return true;
          }
          return perms.some((p) => (store.permissions() ?? []).includes(p));
        },

        login: rxMethod<ILoginCredentials>(
          pipe(
            tap(() => patchState(store, { isLoading: true, error: null })),
            switchMap((credentials) =>
              authService.login(credentials).pipe(
                tap((res) => {
                  if (isBrowser) {
                    localStorage.setItem(environment.token, res.access_token);
                    localStorage.setItem(environment.userKey, JSON.stringify(res.user));
                  }

                  patchState(store, {
                    user: res.user,
                    token: res.access_token,
                    isLoading: false,
                  });

                  const userRole = res.user.role?.toUpperCase();
                  if (userRole === 'CLIENT') {
                    void router.navigate(['/portal']);
                  } else if (userRole === 'DEVELOPER') {
                    void router.navigate(['/projects']);
                  } else {
                    void router.navigate(['/dashboard']);
                  }
                }),
                catchError((err: unknown) => {
                  const message =
                    err instanceof HttpErrorResponse
                      ? (err.error as { message?: string } | undefined)?.message
                      : undefined;
                  patchState(store, {
                    isLoading: false,
                    error: message || 'Login failed',
                  });
                  return of(null);
                }),
              ),
            ),
          ),
        ),

        logout() {
          if (isBrowser) {
            localStorage.removeItem(environment.token);
            localStorage.removeItem(environment.userKey);
          }
          patchState(store, initialState);
          void router.navigate(['/login']);
        },

        initAuthFromStorage() {
          if (!isBrowser) return;

          const token = localStorage.getItem(environment.token);
          const savedUser = localStorage.getItem(environment.userKey);

          if (token && savedUser) {
            try {
              patchState(store, {
                token,
                user: JSON.parse(savedUser) as IUser,
              });
            } catch {
              localStorage.removeItem(environment.token);
              localStorage.removeItem(environment.userKey);
            }
          }
        },
      };
    },
  ),

  withHooks({
    onInit(store) {
      store.initAuthFromStorage();
    },
  }),
);
