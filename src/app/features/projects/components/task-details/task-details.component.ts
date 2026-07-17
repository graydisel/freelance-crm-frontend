import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../../../../core/models/task.model';
import { CrmButtonComponent } from '../../../../shared/components/crm-button/crm-button';

@Component({
  selector: 'app-task-details',
  standalone: true,
  imports: [CommonModule, CrmButtonComponent],
  templateUrl: './task-details.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./task-details.component.scss'],
})
export class TaskDetailsComponent {
  task = input.required<Task>();
  edit = output<void>();

  onEditClick(): void {
    this.edit.emit();
  }
}
