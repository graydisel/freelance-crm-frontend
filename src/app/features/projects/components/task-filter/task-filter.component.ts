import {
  Component,
  inject,
  output,
  signal,
  DestroyRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { Subject, catchError, debounceTime, distinctUntilChanged, of, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UsersService } from '../../../../core/services/users/users.service';
import {
  CrmDropdownComponent,
  CrmDropdownOptionComponent,
} from '../../../../shared/components/crm-dropdown';
import { CrmButtonComponent } from '../../../../shared/components/crm-button/crm-button';
import { TaskPriorityEnum } from '../../../../core/enums/task-priority.enum';
import { UserRoleEnum } from '../../../../core/enums/user-role.enum';

export interface TaskFilterOptions {
  priority?: string;
  assigneeId?: string;
}

@Component({
  selector: 'app-task-filter',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CrmDropdownComponent,
    CrmDropdownOptionComponent,
    CrmButtonComponent,
  ],
  templateUrl: './task-filter.component.html',
  styleUrls: ['./task-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskFilterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly usersService = inject(UsersService);
  private readonly destroyRef = inject(DestroyRef);

  filterChange = output<TaskFilterOptions>();
  openAddTask = output();

  protected readonly TaskPriorityEnum = TaskPriorityEnum;
  protected readonly priorities = Object.values(TaskPriorityEnum);

  protected readonly assigneeSearchResults = signal<any[]>([]);
  protected readonly selectedAssigneeName = signal<string>('All Assignees');
  private assigneeSearchSubject = new Subject<string>();

  form = this.fb.group({
    priority: ['all'],
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

    this.form.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((val) => {
        const options: TaskFilterOptions = {};
        if (val.priority && val.priority !== 'all') {
          options.priority = val.priority;
        }
        if (val.assigneeId) {
          options.assigneeId = val.assigneeId;
        }
        this.filterChange.emit(options);
      });
  }

  protected onOpenAddTask(): void {
    this.openAddTask.emit();
  }

  protected onAssigneeSearch(term: string): void {
    this.assigneeSearchSubject.next(term);
  }

  protected onAssigneeSelected(assigneeId: string): void {
    this.form.patchValue({ assigneeId });
    if (!assigneeId) {
      this.selectedAssigneeName.set('All Assignees');
      return;
    }
    const selected = this.assigneeSearchResults().find((u) => u.id === assigneeId);
    if (selected) {
      this.selectedAssigneeName.set(`${selected.firstName} ${selected.lastName}`);
    }
  }

  clearFilters(): void {
    this.form.patchValue({ priority: 'all', assigneeId: '' });
    this.selectedAssigneeName.set('All Assignees');
  }
}
