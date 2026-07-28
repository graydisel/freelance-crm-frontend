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
import { TaskService } from '../../../core/services/tasks/task.service';
import { Task } from '../../../core/models/task.model';
import { CrmDrawerComponent } from '../../../shared/components/crm-drawer/crm-drawer.component';
import { TaskFormComponent } from '../components/task-form/task-form.component';
import { TaskDetailsComponent } from '../components/task-details/task-details.component';
import { TaskFilterComponent, TaskFilterOptions } from '../components/task-filter/task-filter.component';
import { ProjectTasksTableComponent } from '../components/project-tasks-table/project-tasks-table.component';
import { TaskPriorityEnum } from '../../../core/enums/task-priority.enum';

@Component({
  selector: 'app-project-tasks',
  standalone: true,
  imports: [
    CommonModule,
    CrmDrawerComponent,
    TaskFormComponent,
    TaskDetailsComponent,
    TaskFilterComponent,
    ProjectTasksTableComponent,
  ],
  templateUrl: './project-tasks.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./project-tasks.page.scss'],
})
export class ProjectTasksPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly projectsService = inject(ProjectsService);
  private readonly taskService = inject(TaskService);
  private readonly destroyRef = inject(DestroyRef);

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

  ngOnInit() {
    this.route.parent?.paramMap
      .pipe(
        switchMap((params) => {
          const id = params.get('id');
          this.isLoading.set(true);
          if (!id) {
            throw new Error('Project ID is required');
          }
          return forkJoin({
            project: this.projectsService.getProject(id),
            tasks: this.taskService.getTasks(id),
          }).pipe(
            catchError(() => {
              this.errorMessage.set('Failed to load tasks data.');
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
        },
      });
  }

  loadTasks() {
    const id = this.project()?.id;
    if (id) {
      const filters = this.activeFilters();
      if (Object.keys(filters).length > 0) {
        this.taskService
          .getFilteredTasks({ projectId: id, ...filters })
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe((tasks) => this.tasks.set(tasks));
      } else {
        this.taskService
          .getTasks(id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe((tasks) => this.tasks.set(tasks));
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

  onPriorityChange(event: { task: Task; newPriority: TaskPriorityEnum }) {
    const { task, newPriority } = event;
    const oldPriority = task.priority;

    this.tasks.update((currentTasks) =>
      currentTasks.map((t) => (t.id === task.id ? { ...t, priority: newPriority } : t))
    );

    this.taskService
      .updateTaskPriority(task.id, newPriority)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: (err) => {
          console.error('Failed to update task priority via table:', err);
          this.tasks.update((currentTasks) =>
            currentTasks.map((t) => (t.id === task.id ? { ...t, priority: oldPriority } : t))
          );
          this.errorMessage.set('Could not update task priority. Changes reverted.');
        },
      });
  }
}
