import { Component, inject, OnInit, signal, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';
import { ProjectsService } from '../../../core/services/projects/projects.service';
import { Project } from '../../../core/models/project.model';
import { SidebarComponent } from '../../../shared/sidebar/sidebar.component';
import { CrmExpandableTextComponent } from '../../../shared/components/crm-expandable-text/crm-expandable-text.component';
import { CrmButtonComponent } from '../../../shared/components/crm-button/crm-button';
import { CrmStatusBadgeComponent } from '../../../shared/components/crm-status-badge/crm-status-badge.component';

@Component({
  selector: 'app-project-layout',
  standalone: true,
  imports: [
    CommonModule,
    SidebarComponent,
    CrmExpandableTextComponent,
    CrmButtonComponent,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    CrmStatusBadgeComponent
  ],
  templateUrl: './project-layout.page.html',
  styleUrls: ['./project-layout.page.scss']
})
export class ProjectLayoutPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly projectsService = inject(ProjectsService);
  private readonly destroyRef = inject(DestroyRef);

  project = signal<Project | null>(null);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);

  ngOnInit() {
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        this.isLoading.set(true);
        if (id) {
          return this.projectsService.getProject(id);
        } else {
          throw new Error('Project ID is required');
        }
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (project) => {
        this.project.set(project);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set('Failed to load project details.');
        this.isLoading.set(false);
      }
    });
  }
}
