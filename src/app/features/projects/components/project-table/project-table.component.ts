import { Component, input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Project } from '../../../../core/models/project.model';
import { CRM_TABLE_DECORATORS } from '../../../../shared/components/crm-table/crm-table';

@Component({
  selector: 'app-project-table',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ...CRM_TABLE_DECORATORS
  ],
  templateUrl: './project-table.component.html',
  styleUrls: ['./project-table.component.scss']
})
export class ProjectTableComponent {
  projects = input.required<Project[]>();
}
