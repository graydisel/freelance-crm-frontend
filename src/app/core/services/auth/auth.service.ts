import { computed, inject, Injectable, signal, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { AuthResponse } from '../../models/auth.model';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly API_URL = `${environment.apiUrl}/auth`;
  private readonly USER_KEY = environment.userKey;
  private readonly TOKEN_KEY = environment.token;

  currentUser = signal<AuthResponse['user'] | null>(null);

  readonly isAuthenticated = computed(() => !!this.currentUser());

  constructor() {
    if (this.isBrowser) {
      const savedUser = localStorage.getItem(this.USER_KEY);
      if (savedUser) {
        try {
          this.currentUser.set(JSON.parse(savedUser));
        } catch {
          localStorage.removeItem(this.USER_KEY);
          localStorage.removeItem(this.TOKEN_KEY);
        }
      }
    }
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, { email, password }).pipe(
      tap((response) => {
        localStorage.setItem(this.TOKEN_KEY, response.access_token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));

        this.currentUser.set(response.user);
      }),
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }
}
