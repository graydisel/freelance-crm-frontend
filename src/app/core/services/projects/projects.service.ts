import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { Project, ProjectsServerResponse } from '../../models/project.model';

@Injectable({
  providedIn: 'root',
})
export class ProjectsService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/projects`;

  getProjects(page: number, limit: number, search?: string, status?: string): Observable<ProjectsServerResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search) {
      params = params.set('search', search);
    }
    if (status && status !== 'all') {
      params = params.set('status', status);
    }

    return this.http.get<ProjectsServerResponse>(this.API_URL, { params });
  }

  getProject(id: string): Observable<Project> {
    return this.http.get<Project>(`${this.API_URL}/${id}`);
  }
}
