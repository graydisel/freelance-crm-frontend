import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import {
  CreateProjectDto,
  Project,
  ProjectsServerResponse,
  UpdateProjectDto
} from '../../models/project.model';
import { ProjectStatusEnum } from '../../enums/project-status.enum';

@Injectable({
  providedIn: 'root',
})
export class ProjectsService {
  private readonly http = inject(HttpClient);
  private readonly URL_PROJECTS = `${environment.apiUrl}/projects`;

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

    return this.http.get<ProjectsServerResponse>(this.URL_PROJECTS, { params });
  }

  getProject(id: string): Observable<Project> {
    return this.http.get<Project>(`${this.URL_PROJECTS}/${id}`);
  }

  createProject(dto: CreateProjectDto): Observable<Project> {
    return this.http.post<Project>(this.URL_PROJECTS, dto);
  }

  updateProject(id: string, dto: UpdateProjectDto): Observable<Project> {
    return this.http.patch<Project>(`${this.URL_PROJECTS}/${id}`, dto);
  }

  updateStatusProject(id: string, newStatus: ProjectStatusEnum): Observable<Project> {
    return this.http.patch<Project>(`${this.URL_PROJECTS}/${id}/status`, { newStatus });
  }

  deleteProject(id: string): Observable<void> {
    return this.http.delete<void>(`${this.URL_PROJECTS}/${id}`);
  }
}
