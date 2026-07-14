import {Component, input, output, ChangeDetectionStrategy, inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Project } from '../../../../core/models/project.model';
import { ProjectStatusEnum } from '../../../../core/enums/project-status.enum';
import { CrmButtonComponent } from '../../../../shared/components/crm-button/crm-button';
import {Router, RouterModule} from '@angular/router';

@Component({
  selector: 'app-project-details',
  standalone: true,
  imports: [CommonModule, CrmButtonComponent, RouterModule],
  templateUrl: './project-details.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./project-details.component.scss'],
})
export class ProjectDetailsComponent {
  protected readonly router = inject(Router);
  project = input.required<Project>();
  edit = output<void>();

  protected readonly ProjectStatusEnum = ProjectStatusEnum;

  onEditClick(): void {
    this.edit.emit();
  }

  onNavigateClick(): void {
    this.router.navigate([`/${this.router.url}/${this.project().id}/kanban`]);
  }
}
