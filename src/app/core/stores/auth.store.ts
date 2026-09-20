import { IAuthResponse, ILoginCredentials, IUser, TAuthState } from '../models/auth.model';
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
    isManager: computed(() => user()?.role === 'MANAGER'),
    isClient: computed(() => user()?.role === 'CLIENT'),
    isDeveloper: computed(() => user()?.role === 'DEVELOPER'),
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

                  router.navigate(['/dashboard']);
                }),
                catchError((err) => {
                  patchState(store, {
                    isLoading: false,
                    error: err?.error?.message || 'Login failed',
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
          router.navigate(['/login']);
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
