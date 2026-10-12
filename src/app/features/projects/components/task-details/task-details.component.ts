import { Component, input, output, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../../../../core/models/task.model';
import { CrmButtonComponent } from '../../../../shared/components/crm-button/crm-button';
import { HasPermissionDirective } from '../../../../shared/directives/has-permission.directive';
import { AuthStore } from '../../../../core/stores/auth.store';

@Component({
  selector: 'app-task-details',
  standalone: true,
  imports: [CommonModule, CrmButtonComponent, HasPermissionDirective],
  templateUrl: './task-details.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./task-details.component.scss'],
})
export class TaskDetailsComponent {
  protected readonly authStore = inject(AuthStore);

  task = input.required<Task>();
  edit = output<void>();
  delete = output<void>();

  onEditClick(): void {
    this.edit.emit();
  }

  onDeleteClick(): void {
    this.delete.emit();
  }
}
