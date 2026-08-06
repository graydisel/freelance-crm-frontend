import {
  Component,
  inject,
  OnInit,
  signal,
  DestroyRef,
  ChangeDetectionStrategy,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, forkJoin, of, switchMap } from 'rxjs';
import { ProjectsService } from '../../../core/services/projects/projects.service';
import { Project } from '../../../core/models/project.model';
import { TaskStatusEnum } from '../../../core/enums/task-status.enum';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { TaskService } from '../../../core/services/tasks/task.service';
import { TaskPriorityEnum } from '../../../core/enums/task-priority.enum';
import { Task } from '../../../core/models/task.model';
import { CrmDrawerComponent } from '../../../shared/components/crm-drawer/crm-drawer.component';
import { CrmButtonComponent } from '../../../shared/components/crm-button/crm-button';
import { TaskFormComponent } from '../components/task-form/task-form.component';
import { TaskDetailsComponent } from '../components/task-details/task-details.component';
import { TaskFilterComponent, TaskFilterOptions } from '../components/task-filter/task-filter.component';
import { Dialog, DialogModule } from '@angular/cdk/dialog';
import { ConfirmationModalComponent } from '../../../shared/components/confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-kanban-desk',
  standalone: true,
  imports: [CommonModule, DragDropModule, DialogModule, CrmDrawerComponent, TaskFormComponent, TaskDetailsComponent, TaskFilterComponent],
  templateUrl: './kanban-desk.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./kanban-desk.page.scss'],
})
export class KanbanDeskPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly projectsService = inject(ProjectsService);
  private readonly taskService = inject(TaskService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialog = inject(Dialog);

  protected readonly statuses = Object.values(TaskStatusEnum);
  protected readonly priorities = Object.values(TaskPriorityEnum);

  project = signal<Project | null>(null);
  tasks = signal<Task[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);
  activeFilters = signal<TaskFilterOptions>({});

  protected readonly isDrawerOpen = signal<boolean>(false);
  protected readonly selectedTask = signal<Task | null>(null);
  protected readonly isEditingTask = signal<boolean>(false);

  drawerTitle = computed(() => {
    if (!this.selectedTask()) return 'Add New Task';
    return this.isEditingTask() ? 'Edit Task' : 'Task Details';
  });

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
      const filters = this.activeFilters();
      if (Object.keys(filters).length > 0) {
        this.taskService.getFilteredTasks({ projectId: id, ...filters })
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(tasks => this.tasks.set(tasks));
      } else {
        this.taskService.getTasks(id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(tasks => this.tasks.set(tasks));
      }
    }
  }

  onFilterChange(filters: TaskFilterOptions) {
    this.activeFilters.set(filters);
    this.loadTasks();
  }

  protected openAddTask(): void {
    this.selectedTask.set(null);
    this.isEditingTask.set(true);
    this.isDrawerOpen.set(true);
  }

  protected viewTask(task: Task): void {
    this.selectedTask.set(task);
    this.isEditingTask.set(false);
    this.isDrawerOpen.set(true);
  }

  protected closeDrawer(): void {
    this.isDrawerOpen.set(false);
    setTimeout(() => {
      this.selectedTask.set(null);
      this.isEditingTask.set(false);
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

  deleteTask(task: Task, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    
    const dialogRef = this.dialog.open(ConfirmationModalComponent, {
      data: {
        title: 'Delete Task',
        description: `Are you sure you want to delete task "${task.title}"? This action cannot be undone.`,
        confirmText: 'Delete',
        variant: 'danger',
      }
    });

    dialogRef.closed.pipe(
      switchMap((result) => {
        if (result) {
          return this.taskService.deleteTask(task.id);
        }
        return of(null);
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (result) => {
        if (result !== null) {
          this.loadTasks();
          if (this.selectedTask()?.id === task.id) {
            this.closeDrawer();
          }
        }
      },
      error: (err) => {
        console.error('Failed to delete task:', err);
        this.errorMessage.set('Could not delete task.');
      }
    });
  }
}
