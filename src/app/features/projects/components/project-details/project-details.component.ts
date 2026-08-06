import {Component, input, output, ChangeDetectionStrategy, inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Project } from '../../../../core/models/project.model';
import { ProjectStatusEnum } from '../../../../core/enums/project-status.enum';
import { CrmButtonComponent } from '../../../../shared/components/crm-button/crm-button';
import {Router, RouterModule} from '@angular/router';

import { Dialog, DialogModule } from '@angular/cdk/dialog';
import { ConfirmationModalComponent } from '../../../../shared/components/confirmation-modal/confirmation-modal.component';
import { ProjectsService } from '../../../../core/services/projects/projects.service';
import { switchMap } from 'rxjs/operators';
import { of, EMPTY } from 'rxjs';

@Component({
  selector: 'app-project-details',
  standalone: true,
  imports: [CommonModule, CrmButtonComponent, RouterModule, DialogModule],
  templateUrl: './project-details.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./project-details.component.scss'],
})
export class ProjectDetailsComponent {
  protected readonly router = inject(Router);
  protected readonly dialog = inject(Dialog);
  protected readonly projectsService = inject(ProjectsService);
  
  project = input.required<Project>();
  edit = output<void>();

  protected readonly ProjectStatusEnum = ProjectStatusEnum;

  onEditClick(): void {
    this.edit.emit();
  }

  onNavigateClick(): void {
    this.router.navigate([`/${this.router.url.split('/')[1]}/${this.project().id}/kanban`]);
  }

  onDeleteClick(): void {
    const project = this.project();
    const hasTasks = project.tasksCount > 0;

    const dialogRef = this.dialog.open(ConfirmationModalComponent, {
      data: {
        title: hasTasks ? 'Archive Project?' : 'Delete Project',
        description: hasTasks 
          ? `This project has ${project.tasksCount} linked tasks. Deleting it is not allowed to prevent data loss. Would you like to archive it instead?`
          : `Are you sure you want to delete "${project.name}"? This action cannot be undone.`,
        confirmText: hasTasks ? 'Archive' : 'Delete',
        variant: hasTasks ? 'warning' : 'danger',
      }
    });

    dialogRef.closed.pipe(
      switchMap((result) => {
        if (result) {
          if (hasTasks) {
            return this.projectsService.updateProject(project.id, { status: ProjectStatusEnum.ARCHIVED });
          } else {
            return this.projectsService.deleteProject(project.id);
          }
        }
        return EMPTY;
      })
    ).subscribe({
      next: () => {
        this.router.navigate(['/projects']);
      },
      error: (err) => {
        console.error('Failed to process project deletion/archiving:', err);
      }
    });
  }
}
