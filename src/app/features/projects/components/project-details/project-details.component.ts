import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Project } from '../../../../core/models/project.model';
import { ProjectStatusEnum } from '../../../../core/enums/project-status.enum';
import { CrmButtonComponent } from '../../../../shared/components/crm-button/crm-button';

@Component({
  selector: 'app-project-details',
  standalone: true,
  imports: [CommonModule, CrmButtonComponent],
  templateUrl: './project-details.component.html',
  styleUrls: ['./project-details.component.scss']
})
export class ProjectDetailsComponent {
  project = input.required<Project>();
  edit = output<void>();

  protected readonly ProjectStatusEnum = ProjectStatusEnum;

  onEditClick(): void {
    this.edit.emit();
  }
}
