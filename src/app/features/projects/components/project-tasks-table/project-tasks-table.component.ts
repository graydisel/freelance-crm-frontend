import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../../../../core/models/task.model';
import { User } from '../../../../core/models/user.model';
import { TaskPriorityEnum } from '../../../../core/enums/task-priority.enum';
import { CRM_TABLE_DECORATORS } from '../../../../shared/components/crm-table/crm-table';
import { CrmStatusBadgeComponent } from '../../../../shared/components/crm-status-badge/crm-status-badge.component';
import { CrmAvatarComponent } from '../../../../shared/components/crm-avatar/crm-avatar.component';

@Component({
  selector: 'app-project-tasks-table',
  standalone: true,
  imports: [CommonModule, CRM_TABLE_DECORATORS, CrmStatusBadgeComponent, CrmAvatarComponent],
  templateUrl: './project-tasks-table.component.html',
  styleUrls: ['./project-tasks-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectTasksTableComponent {
  tasks = input.required<Task[]>();

  taskClick = output<Task>();
  priorityChange = output<{ task: Task; newPriority: TaskPriorityEnum }>();

  protected readonly priorities = Object.values(TaskPriorityEnum);

  protected getAssigneeInitials(assignee: User | null): string {
    if (!assignee) return '';
    if (assignee.profile) {
      const first = assignee.profile.firstName?.trim() || '';
      const last = assignee.profile.lastName?.trim() || '';
      if (first || last) {
        return ((first[0] || '') + (last[0] || '')).toUpperCase();
      }
    }
    if (assignee.email) {
      return assignee.email.substring(0, 2).toUpperCase();
    }
    return '?';
  }

  protected getAssigneeName(assignee: User | null): string {
    if (!assignee) return 'Unassigned';
    if (assignee.profile) {
      const first = assignee.profile.firstName?.trim() || '';
      const last = assignee.profile.lastName?.trim() || '';
      const fullName = `${first} ${last}`.trim();
      if (fullName) return fullName;
    }
    return assignee.email || 'Unassigned';
  }

  protected onTaskClick(task: Task, event: Event): void {
    event.preventDefault();
    this.taskClick.emit(task);
  }

  protected onPriorityChange(task: Task, event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const newPriority = selectElement.value as TaskPriorityEnum;
    if (task.priority !== newPriority) {
      this.priorityChange.emit({ task, newPriority });
    }
  }
}
