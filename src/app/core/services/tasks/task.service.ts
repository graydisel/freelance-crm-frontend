import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TaskStatusEnum } from '../../enums/task-status.enum';
import { TaskPriorityEnum } from '../../enums/task-priority.enum';
import { CreateTaskDto, Task, UpdateTaskDto } from '../../models/task.model';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private readonly http = inject(HttpClient);
  private readonly URL_TASKS = `${environment.apiUrl}/tasks`;

  getTasks(id: string): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.URL_TASKS}/project/${id}`);
  }

  getFilteredTasks(params: { projectId: string; priority?: string; assigneeId?: string }): Observable<Task[]> {
    let httpParams = new HttpParams().set('projectId', params.projectId);
    if (params.priority && params.priority !== 'all') {
      httpParams = httpParams.set('priority', params.priority);
    }
    if (params.assigneeId) {
      httpParams = httpParams.set('assigneeId', params.assigneeId);
    }
    return this.http.get<Task[]>(`${this.URL_TASKS}/filter`, { params: httpParams });
  }

  createTask(dto: CreateTaskDto): Observable<Task> {
    return this.http.post<Task>(this.URL_TASKS, dto);
  }

  updateTask(taskId: string, dto: UpdateTaskDto): Observable<Task> {
    return this.http.patch<Task>(`${this.URL_TASKS}/${taskId}`, dto);
  }

  updateTaskStatus(taskId: string, newStatus: TaskStatusEnum): Observable<Task> {
    return this.http.patch<Task>(`${this.URL_TASKS}/${taskId}/status`, { newStatus });
  }

  updateTaskPriority(taskId: string, newPriority: TaskPriorityEnum): Observable<Task> {
    return this.http.patch<Task>(`${this.URL_TASKS}/${taskId}/priority`, { newPriority });
  }

  deleteTask(taskId: string): Observable<void> {
    return this.http.delete<void>(`${this.URL_TASKS}/${taskId}`);
  }
}
