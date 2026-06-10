import { inject, Injectable, signal } from '@angular/core';
import { IProject, ITask } from '../models/project.model';
import { HttpClient, provideHttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class Project {
  projects = signal<IProject[]>([]);

  http = inject(HttpClient);
  loading = false;
  error = '';
  baseUrl = 'http://localhost:3000';

  async loadProjects() {
    this.loading = true;
    this.error = '';
    this.http.get<IProject[]>(`${this.baseUrl}/projects`).subscribe({
      next: (data) => {
        this.projects.set(data);
        this.loading = false;
      },
      error: (error) => {
        this.error = error;
        this.loading = false;
      },
    });
  }

  addProject(project: IProject) {
    this.projects.update((currentProjects) => [...currentProjects, project]);
  }

  addTask(projectId: string, title: string, description: string) {
    this.http.post<ITask>(`${this.baseUrl}/tasks`, {
      projectId: projectId,
      title: title,
      description: description,
    })
      .subscribe({
        next: (createdTask) => {
          this.projects.update((currentProjects) =>
            currentProjects.map((project) => {
              if (project.id === projectId) {
                return {
                    ...project,
                  tasks: [createdTask, ...project.tasks],
                }
              }
              return project;
            }),
          );
        },
        error: (error) => this.error = error,
        }
      );
  }

  updateTaskStatus(projectId: string, taskId: string, newStatus: ITask['status']) {
    this.http.patch<ITask>(`${this.baseUrl}/tasks/${taskId}/status`, {
      newStatus: newStatus
    })
      .subscribe({
        next: (updatedTask) => {
          this.projects.update((currentProjects) =>
            currentProjects.map((project) => {
              if (project.id === projectId) {
                return {
                  ...project,
                  tasks: project.tasks.map((task) =>
                    task.id === taskId ? { ...task, status: newStatus } : task
                  )
                };
              }
              return project;
            })
          );
        },
        error: (error) => this.error = error
      });
  }
}
