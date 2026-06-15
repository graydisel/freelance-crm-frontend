import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthResponse } from '../models/auth.model';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/auth`;

  currentUser = signal<AuthResponse['user'] | null>(null);

  constructor() {
    const savedUser = localStorage.getItem('crm_user');
    if (savedUser) {
      this.currentUser.set(JSON.parse(savedUser));
    }
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, { email, password }).pipe(
      tap((response) => {
        localStorage.setItem('crm_token', response.access_token);
        localStorage.setItem('crm_user', JSON.stringify(response.user));

        this.currentUser.set(response.user);
      }),
    );
  }

  logout(): void {
    localStorage.removeItem('crm_token');
    localStorage.removeItem('crm_user');
    this.currentUser.set(null);
  }

  get isAuthenticated(): boolean {
    return !!localStorage.getItem('crm_token');
  }
}
