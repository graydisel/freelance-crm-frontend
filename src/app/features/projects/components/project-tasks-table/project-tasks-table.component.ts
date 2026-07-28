import {
  Component,
  input,
  output,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../../../../core/models/task.model';
import { TaskPriorityEnum } from '../../../../core/enums/task-priority.enum';
import { CRM_TABLE_DECORATORS } from '../../../../shared/components/crm-table/crm-table';
import { CrmStatusBadgeComponent } from '../../../../shared/components/crm-status-badge/crm-status-badge.component';

@Component({
  selector: 'app-project-tasks-table',
  standalone: true,
  imports: [CommonModule, CRM_TABLE_DECORATORS, CrmStatusBadgeComponent],
  templateUrl: './project-tasks-table.component.html',
  styleUrls: ['./project-tasks-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectTasksTableComponent {
  tasks = input.required<Task[]>();
  
  taskClick = output<Task>();
  priorityChange = output<{ task: Task; newPriority: TaskPriorityEnum }>();

  protected readonly priorities = Object.values(TaskPriorityEnum);

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
