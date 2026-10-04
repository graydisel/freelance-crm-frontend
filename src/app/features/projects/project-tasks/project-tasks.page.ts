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
import { Task } from '../../../core/models/task.model';
import { CrmDrawerComponent } from '../../../shared/components/crm-drawer/crm-drawer.component';
import { TaskFormComponent } from '../components/task-form/task-form.component';
import { TaskDetailsComponent } from '../components/task-details/task-details.component';
import {
  TaskFilterComponent,
  TaskFilterOptions,
} from '../components/task-filter/task-filter.component';
import { ProjectTasksTableComponent } from '../components/project-tasks-table/project-tasks-table.component';
import { TaskPriorityEnum } from '../../../core/enums/task-priority.enum';
import { TasksStore } from '../../../core/stores/tasks.store';

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
  private readonly destroyRef = inject(DestroyRef);

  protected readonly store = inject(TasksStore);

  protected readonly isDrawerOpen = signal<boolean>(false);
  protected readonly selectedTask = signal<Task | null>(null);
  protected readonly isEditingTask = signal<boolean>(false);

  drawerTitle = computed(() => {
    if (!this.selectedTask()) return 'Add New Task';
    return this.isEditingTask() ? 'Edit Task' : 'Task Details';
  });

  ngOnInit() {
    this.route.parent?.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.store.loadProjectAndTasks(id);
      }
    });
  }

  onFilterChange(filters: TaskFilterOptions) {
    this.store.setFilters(filters);
    this.store.loadTasks();
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
    this.store.loadTasks();
  }

  onPriorityChange(event: { task: Task; newPriority: TaskPriorityEnum }) {
    const { task, newPriority } = event;
    void this.store.updateTaskPriority(task.id, newPriority);
  }
}
