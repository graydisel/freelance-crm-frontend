import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { UserRoleEnum } from '../../enums/user-role.enum';
import { Observable } from 'rxjs';
import { User } from '../../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/users`;

  getAvailableUsers(search: string, role: UserRoleEnum): Observable<User[]> {
    const params = new HttpParams()
      .set('search', search)
      .set('role', role);

    return this.http.get<User[]>(this.baseUrl, { params });
  }
}
