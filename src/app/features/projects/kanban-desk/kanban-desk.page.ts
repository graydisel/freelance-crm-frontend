import {
  Component,
  inject,
  OnInit,
  signal,
  DestroyRef,
  ChangeDetectionStrategy,
  computed,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TaskStatusEnum } from '../../../core/enums/task-status.enum';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { TaskPriorityEnum } from '../../../core/enums/task-priority.enum';
import { Task } from '../../../core/models/task.model';
import { CrmDrawerComponent } from '../../../shared/components/crm-drawer/crm-drawer.component';
import { TaskFormComponent } from '../components/task-form/task-form.component';
import { TaskDetailsComponent } from '../components/task-details/task-details.component';
import {
  TaskFilterComponent,
  TaskFilterOptions,
} from '../components/task-filter/task-filter.component';
import { Dialog, DialogModule } from '@angular/cdk/dialog';
import { ConfirmationModalComponent } from '../../../shared/components/confirmation-modal/confirmation-modal.component';
import { TasksStore } from '../../../core/stores/tasks.store';

@Component({
  selector: 'app-kanban-desk',
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule,
    DialogModule,
    CrmDrawerComponent,
    TaskFormComponent,
    TaskDetailsComponent,
    TaskFilterComponent,
  ],
  templateUrl: './kanban-desk.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./kanban-desk.page.scss'],
})
export class KanbanDeskPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialog = inject(Dialog);

  protected readonly store = inject(TasksStore);

  protected readonly statuses = Object.values(TaskStatusEnum);
  protected readonly priorities = Object.values(TaskPriorityEnum);

  protected readonly isDrawerOpen = signal<boolean>(false);
  protected readonly selectedTask = signal<Task | null>(null);
  protected readonly isEditingTask = signal<boolean>(false);

  drawerTitle = computed(() => {
    if (!this.selectedTask()) return 'Add New Task';
    return this.isEditingTask() ? 'Edit Task' : 'Task Details';
  });

  constructor() {
    effect(() => {
      // Whenever filters change, we load tasks again.
      // But we shouldn't trigger this endlessly.
      // Since store.loadTasks uses rxMethod internally and has tap/switchMap, calling it explicitly when filter changes is better.
    });
  }

  ngOnInit() {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
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

  onPriorityChange(taskId: string, event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const newPriority = selectElement.value as TaskPriorityEnum;
    void this.store.updateTaskPriority(taskId, newPriority);
  }

  onTaskDrop(event: CdkDragDrop<Task[]>) {
    if (event.previousContainer === event.container) {
      return;
    }

    const task = event.item.data as Task;
    const [newStatus, newPriority] = event.container.id.split('_') as [
      TaskStatusEnum,
      TaskPriorityEnum,
    ];

    void this.store.updateTaskPosition(task.id, newStatus, newPriority);
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
      },
    });

    dialogRef.closed.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((result) => {
      if (result) {
        void this.store.deleteTask(task.id).then((success) => {
          if (success && this.selectedTask()?.id === task.id) {
            this.closeDrawer();
          }
        });
      }
    });
  }
}
