import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Task } from '../../../../core/models/task.model';
import { CRM_TABLE_DECORATORS } from '../../../../shared/components/crm-table/crm-table';

@Component({
  selector: 'app-portal-tasks-table',
  standalone: true,
  imports: [CommonModule, DatePipe, ...CRM_TABLE_DECORATORS],
  templateUrl: './portal-tasks-table.component.html',
  styleUrl: './portal-tasks-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortalTasksTableComponent {
  readonly tasks = input.required<Task[]>();
  readonly isLoading = input<boolean>(false);

  normalizeStatus(status: string): string {
    return (status || '').toLowerCase().replace(/_/g, '-');
  }

  formatStatus(status: string): string {
    return (status || '').replace(/[-_]/g, ' ');
  }

  formatAssignee(task: Task): string {
    if (task.assignee?.profile?.firstName) {
      const last = task.assignee.profile.lastName ? ` ${task.assignee.profile.lastName}` : '';
      return `${task.assignee.profile.firstName}${last}`;
    }
    return task.assignee?.email || 'Engineering Team';
  }
}
