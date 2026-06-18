import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from '../../../../environments/environment';
import {Observable} from 'rxjs';
import {ClientsServerResponse} from '../../models/client.model';

@Injectable({
  providedIn: 'root',
})
export class ClientsService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/client`;

  getClients(page: number, limit: number, search?: string, status?: string): Observable<ClientsServerResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search) {
      params = params.set('search', search);
    }
    if (status && status !== 'all') {
      params = params.set('status', status);
    }

    return this.http.get<ClientsServerResponse>(this.API_URL, { params });
  }
}
