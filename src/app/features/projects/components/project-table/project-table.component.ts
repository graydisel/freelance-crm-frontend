import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Project } from '../../../../core/models/project.model';
import { CRM_TABLE_DECORATORS } from '../../../../shared/components/crm-table/crm-table';

import { HasPermissionDirective } from '../../../../shared/directives/has-permission.directive';

@Component({
  selector: 'app-project-table',
  standalone: true,
  imports: [CommonModule, ...CRM_TABLE_DECORATORS, HasPermissionDirective],
  templateUrl: './project-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./project-table.component.scss'],
})
export class ProjectTableComponent {
  projects = input.required<Project[]>();
  projectClick = output<Project>();

  onRowClick(project: Project): void {
    this.projectClick.emit(project);
  }
}
