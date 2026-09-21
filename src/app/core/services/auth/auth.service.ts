import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { IAuthResponse, ILoginCredentials } from '../../models/auth.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/auth`;

  login(credentials: ILoginCredentials): Observable<IAuthResponse> {
    return this.http.post<IAuthResponse>(`${this.API_URL}/login`, credentials);
  }
}
