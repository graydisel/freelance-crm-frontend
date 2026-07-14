import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Project } from '../../../../core/models/project.model';
import { CRM_TABLE_DECORATORS } from '../../../../shared/components/crm-table/crm-table';

@Component({
  selector: 'app-project-table',
  standalone: true,
  imports: [CommonModule, ...CRM_TABLE_DECORATORS],
  templateUrl: './project-table.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./project-table.component.scss'],
})
export class ProjectTableComponent {
  projects = input.required<Project[]>();
  projectClick = output<Project>();

  onRowClick(project: Project): void {
    this.projectClick.emit(project);
  }
}
