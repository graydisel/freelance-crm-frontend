import {inject, Injectable} from '@angular/core';
import {environment} from '../../../../environments/environment.development';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {TaskStatusEnum} from '../../enums/task-status.enum';
import {TaskPriorityEnum} from '../../enums/task-priority.enum';
import {Task} from '../../models/task.model';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private readonly http = inject(HttpClient);
  private readonly URL_TASKS = `${environment.apiUrl}/tasks`;

  getTasks(id: string): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.URL_TASKS}/project/${id}`);
  }

  updateTaskStatus(taskId: string, newStatus: TaskStatusEnum): Observable<Task> {
    return this.http.patch<Task>(`${this.URL_TASKS}/${taskId}/status`, { newStatus });
  }

  updateTaskPriority(taskId: string, newPriority: TaskPriorityEnum): Observable<Task> {
    return this.http.patch<Task>(`${this.URL_TASKS}/${taskId}/priority`, { newPriority });
  }
}
