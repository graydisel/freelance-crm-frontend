import {
  Component,
  inject,
  OnInit,
  signal,
  DestroyRef,
  ChangeDetectionStrategy,
  computed,
  ViewChild, effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {catchError, debounceTime, forkJoin, of, switchMap} from 'rxjs';
import { ProjectsService } from '../../../core/services/projects/projects.service';
import {Project} from '../../../core/models/project.model';
import {TaskStatusEnum} from '../../../core/enums/task-status.enum';
import {CdkDragDrop, DragDropModule} from '@angular/cdk/drag-drop';
import {TaskService} from '../../../core/services/tasks/task.service';
import {TaskPriorityEnum} from '../../../core/enums/task-priority.enum';
import {Task} from '../../../core/models/task.model';
import {CrmDrawerComponent} from '../../../shared/components/crm-drawer/crm-drawer.component';
import {CrmButtonComponent} from '../../../shared/components/crm-button/crm-button';
import {TaskFormComponent} from '../components/task-form/task-form.component';
import {FormControl} from '@angular/forms';

@Component({
  selector: 'app-kanban-desk',
  standalone: true,
  imports: [CommonModule, DragDropModule, CrmDrawerComponent, CrmButtonComponent, TaskFormComponent],
  templateUrl: './kanban-desk.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./kanban-desk.page.scss'],
})
export class KanbanDeskPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly projectsService = inject(ProjectsService);
  private readonly taskService = inject(TaskService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly statuses = Object.values(TaskStatusEnum);
  protected readonly priorities = Object.values(TaskPriorityEnum);

  project = signal<Project | null>(null);
  tasks = signal<Task[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);

  protected readonly isDrawerOpen = signal<boolean>(false);
  protected readonly selectedTask = signal<Task | null>(null);

  constructor() {

  }

  boardGrid = computed(() => {
    const currentTasks = this.tasks();
    const grid: Record<string, Task[]> = {};

    this.statuses.forEach(status => {
      this.priorities.forEach(priority => {
        grid[`${status}_${priority}`] = [];
      });
    });

    currentTasks.forEach(task => {
      const key = `${task.status}_${task.priority}`;
      if (grid[key]) {
        grid[key].push(task);
      }
    });

    return grid;
  });

  ngOnInit() {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const id = params.get('id');
          this.isLoading.set(true);
          if (!id) {
            throw new Error('Project ID is required');
          }
          return forkJoin({
            project: this.projectsService.getProject(id),
            tasks: this.taskService.getTasks(id)
          }).pipe(
            catchError((err) => {
              this.errorMessage.set('Failed to load kanban board data.');
              this.isLoading.set(false);
              return of({ project: null, tasks: [] });
            })
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: ({ project, tasks }) => {
          if (project) {
            this.project.set(project);
            this.tasks.set(tasks);
          }
          this.isLoading.set(false);
        }
      });
  }

  loadTasks() {
    const id = this.project()?.id;
    if (id) {
      this.taskService.getTasks(id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(tasks => this.tasks.set(tasks));
    }
  }

  protected openAddTask(): void {
    this.selectedTask.set(null);
    this.isDrawerOpen.set(true);
  }

  protected editTask(task: Task): void {
    this.selectedTask.set(task);
    this.isDrawerOpen.set(true);
  }

  protected closeDrawer(): void {
    this.isDrawerOpen.set(false);
    setTimeout(() => {
      this.selectedTask.set(null);
    }, 300);
  }

  protected onTaskSaved(): void {
    this.closeDrawer();
    this.loadTasks();
  }

  onPriorityChange(taskId: string, event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const newPriority = selectElement.value as TaskPriorityEnum;

    const targetTask = this.tasks().find(t => t.id === taskId);
    if (!targetTask || targetTask.priority === newPriority) {
      return;
    }
    const oldPriority = targetTask.priority;

    this.tasks.update(currentTasks =>
      currentTasks.map(t => t.id === taskId ? { ...t, priority: newPriority } : t)
    );

    this.taskService.updateTaskPriority(taskId, newPriority)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: (err) => {
          console.error('Failed to update task priority via dropdown:', err);
          this.tasks.update(currentTasks =>
            currentTasks.map(t => t.id === taskId ? { ...t, priority: oldPriority } : t)
          );
          this.errorMessage.set('Could not update task priority. Changes reverted.');
        }
      });
  }


  onTaskDrop(event: CdkDragDrop<Task[]>) {
    if (event.previousContainer === event.container) {
      return;
    }

    const task = event.item.data as Task;
    const oldStatus = task.status;
    const oldPriority = task.priority;

    const [newStatus, newPriority] = event.container.id.split('_') as [TaskStatusEnum, TaskPriorityEnum];

    this.tasks.update(currentTasks =>
      currentTasks.map(t => t.id === task.id ? { ...t, status: newStatus, priority: newPriority } : t)
    );

    const updateStatus$ = this.taskService.updateTaskStatus(task.id, newStatus);
    const updatePriority$ = this.taskService.updateTaskPriority(task.id, newPriority);

    forkJoin([updateStatus$, updatePriority$]).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      error: (err) => {
        console.error('Failed to update task position:', err);
        this.tasks.update(currentTasks =>
          currentTasks.map(t => t.id === task.id ? { ...t, status: oldStatus, priority: oldPriority } : t)
        );
        this.errorMessage.set('Could not save task changes.');
      }
    });
  }
}
