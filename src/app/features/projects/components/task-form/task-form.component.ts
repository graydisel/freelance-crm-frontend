import {
  Component,
  computed,
  inject,
  input,
  OnInit,
  output,
  signal,
  DestroyRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, NonNullableFormBuilder, Validators } from '@angular/forms';
import { Subject, catchError, debounceTime, distinctUntilChanged, of, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TaskService } from '../../../../core/services/tasks/task.service';
import { UsersService } from '../../../../core/services/users/users.service';
import { CrmButtonComponent } from '../../../../shared/components/crm-button/crm-button';
import {
  CrmDropdownComponent,
  CrmDropdownOptionComponent,
} from '../../../../shared/components/crm-dropdown';
import { Task, CreateTaskDto, UpdateTaskDto } from '../../../../core/models/task.model';
import { TaskStatusEnum } from '../../../../core/enums/task-status.enum';
import { TaskPriorityEnum } from '../../../../core/enums/task-priority.enum';
import { UserRoleEnum } from '../../../../core/enums/user-role.enum';
import { CrmValidators } from '../../../../core/validators/custom-validators';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CrmButtonComponent,
    CrmDropdownComponent,
    CrmDropdownOptionComponent,
  ],
  templateUrl: './task-form.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./task-form.component.scss'],
})
export class TaskFormComponent implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly taskService = inject(TaskService);
  private readonly usersService = inject(UsersService);
  private readonly destroyRef = inject(DestroyRef);

  task = input<Task | null>(null);
  projectId = input.required<string>();
  saved = output<void>();

  protected readonly isEditMode = computed(() => !!this.task());
  protected readonly formTitle = computed(() =>
    this.isEditMode() ? 'Edit Task' : 'Add New Task',
  );
  protected readonly formSubtitle = computed(() =>
    this.isEditMode()
      ? 'Update the task details below.'
      : 'Enter the details for the new task.',
  );
  protected readonly submitLabel = computed(() =>
    this.isEditMode() ? 'Save Changes' : 'Create Task',
  );
  protected readonly submittingLabel = computed(() =>
    this.isEditMode() ? 'Saving...' : 'Creating...',
  );

  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly assigneeSearchResults = signal<any[]>([]);
  protected readonly selectedAssigneeName = signal<string>('');
  private assigneeSearchSubject = new Subject<string>();

  protected readonly TaskStatusEnum = TaskStatusEnum;
  protected readonly statuses = Object.values(TaskStatusEnum);

  protected readonly TaskPriorityEnum = TaskPriorityEnum;
  protected readonly priorities = Object.values(TaskPriorityEnum);

  form = this.fb.group({
    title: ['', [CrmValidators.requiredNoWhitespace]],
    description: [''],
    status: [TaskStatusEnum.TODO, Validators.required],
    priority: [TaskPriorityEnum.LOW, Validators.required],
    assigneeId: [''],
  });

  constructor() {
    this.assigneeSearchSubject
      .pipe(
        takeUntilDestroyed(),
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((term) => {
          if (!term.trim()) return of([]);
          return this.usersService
            .getAvailableUsers(term, UserRoleEnum.DEVELOPER)
            .pipe(catchError(() => of([])));
        }),
      )
      .subscribe((res: any) => {
        const data = Array.isArray(res) ? res : res?.data || [];
        this.assigneeSearchResults.set(data);
      });
  }

  ngOnInit(): void {
    const t = this.task();
    if (t) {
      this.form.patchValue({
        title: t.title,
        description: t.description || '',
        status: t.status,
        priority: t.priority,
        assigneeId: t.assignee?.id || '',
      });
      this.selectedAssigneeName.set(t.assignee && t.assignee.profile ? `${t.assignee.profile.firstName} ${t.assignee.profile.lastName}` : '');
    }
  }

  protected onAssigneeSearch(term: string): void {
    this.assigneeSearchSubject.next(term);
  }

  protected onAssigneeSelected(assigneeId: string): void {
    this.form.patchValue({ assigneeId });
    const selected = this.assigneeSearchResults().find((u) => u.id === assigneeId);
    if (selected) {
      this.selectedAssigneeName.set(`${selected.profile.firstName} ${selected.profile.lastName}`);
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const formValue = this.form.getRawValue();

    if (this.isEditMode()) {
      const dto: UpdateTaskDto = {
        title: formValue.title,
        description: formValue.description,
        status: formValue.status,
        priority: formValue.priority,
        projectId: this.projectId(),
        assigneeId: formValue.assigneeId || undefined,
      };
      this.taskService
        .updateTask(this.task()!.id, dto)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.isSubmitting.set(false);
            this.saved.emit();
          },
          error: (err) => {
            this.isSubmitting.set(false);
            this.errorMessage.set(
              err.error?.message || 'An unexpected error occurred while saving.',
            );
          },
        });
    } else {
      const dto: CreateTaskDto = {
        title: formValue.title,
        description: formValue.description || undefined,
        status: formValue.status,
        priority: formValue.priority,
        projectId: this.projectId(),
        assigneeId: formValue.assigneeId || undefined,
      };
      console.log(dto);

      this.taskService
        .createTask(dto)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.isSubmitting.set(false);
            this.form.reset({
              status: TaskStatusEnum.TODO,
              priority: TaskPriorityEnum.LOW,
            });
            this.selectedAssigneeName.set('');
            this.saved.emit();
          },
          error: (err) => {
            this.isSubmitting.set(false);
            this.errorMessage.set(
              err.error?.message || 'An unexpected error occurred while creating.',
            );
          },
        });
    }
  }
}
