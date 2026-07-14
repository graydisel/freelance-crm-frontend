import { Component, inject, OnInit, signal, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';
import { ProjectsService } from '../../../core/services/projects/projects.service';
import { Project } from '../../../core/models/project.model';

@Component({
  selector: 'app-kanban-desk',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './kanban-desk.page.html',
  styleUrls: ['./kanban-desk.page.scss']
})
export class KanbanDeskPage implements OnInit {
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
