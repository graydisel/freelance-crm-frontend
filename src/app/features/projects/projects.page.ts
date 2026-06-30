import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { ProjectFiltersComponent } from './components/project-filters/project-filters.component';
import { ProjectCardComponent } from './components/project-card/project-card.component';
import { Project, ProjectsServerResponse } from '../../core/models/project.model';
import { ProjectsService } from '../../core/services/projects/projects.service';
import { CRM_TABLE_DECORATORS } from '../../shared/components/crm-table/crm-table';

@Component({
  selector: 'app-projects-page',
  standalone: true,
  imports: [
    CommonModule,
    SidebarComponent,
    ProjectFiltersComponent,
    ProjectCardComponent,
    ...CRM_TABLE_DECORATORS,
    DatePipe,
    RouterModule
  ],
  templateUrl: './projects.page.html',
  styleUrls: ['./projects.page.scss']
})
export class ProjectsPageComponent implements OnInit {
  private readonly projectsService = inject(ProjectsService);

  protected readonly currentPage = signal<number>(1);
  protected readonly pageSize = signal<number>(10);
  protected readonly searchQuery = signal<string>('');
  protected readonly statusFilter = signal<string>('all');
  protected readonly viewMode = signal<'grid' | 'table'>('grid');

  private readonly serverResponse = signal<ProjectsServerResponse | null>(null);

  constructor() {
    effect(() => {
      this.loadProjects();
    });
  }

  ngOnInit(): void { }

  private loadProjects(): void {
    this.projectsService.getProjects(
      this.currentPage(),
      this.pageSize(),
      this.searchQuery(),
      this.statusFilter()
    ).subscribe({
      next: (response) => this.serverResponse.set(response),
      error: (err) => console.error('Error loading projects:', err)
    });
  }

  protected readonly paginatedProjects = computed<Project[]>(() => {
    return this.serverResponse()?.data ?? [];
  });

  protected readonly totalItems = computed<number>(() => {
    return this.serverResponse()?.meta.totalItems ?? 0;
  });

  protected readonly filteredPlanningCount = computed<number>(() => {
    return this.serverResponse()?.meta.filteredMetrics?.planningCount ?? 0;
  });

  protected readonly filteredInProgressCount = computed<number>(() => {
    return this.serverResponse()?.meta.filteredMetrics?.inProgressCount ?? 0;
  });

  protected readonly filteredDoneCount = computed<number>(() => {
    return this.serverResponse()?.meta.filteredMetrics?.doneCount ?? 0;
  });

  protected onPageChange(newPage: number): void {
    this.currentPage.set(newPage);
  }

  protected onSearchChange(query: string): void {
    this.searchQuery.set(query);
    this.currentPage.set(1);
  }

  protected onStatusChange(status: string): void {
    this.statusFilter.set(status);
    this.currentPage.set(1);
  }

  protected setViewMode(mode: 'grid' | 'table'): void {
    this.viewMode.set(mode);
  }

  // Grid pagination logic
  protected readonly totalPages = computed(() => Math.ceil(this.totalItems() / this.pageSize()));
  
  protected readonly rangeStart = computed(() => {
    if (this.totalItems() === 0) return 0;
    return (this.currentPage() - 1) * this.pageSize() + 1;
  });
  
  protected readonly rangeEnd = computed(() => {
    return Math.min(this.currentPage() * this.pageSize(), this.totalItems());
  });
  
  protected readonly pages = computed(() => {
    const pagesArray: number[] = [];
    const total = this.totalPages();
    const current = this.currentPage();
    const maxVisible = 3;

    if (total <= maxVisible) {
      for (let i = 1; i <= total; i++) {
        pagesArray.push(i);
      }
    } else {
      let start = current - 1;
      let end = current + 1;

      if (current === 1) {
        start = 1;
        end = maxVisible;
      } else if (current === total) {
        start = total - maxVisible + 1;
        end = total;
      }

      for (let i = start; i <= end; i++) {
        pagesArray.push(i);
      }
    }
    return pagesArray;
  });

  protected onFirst(): void {
    if (this.currentPage() > 1) this.onPageChange(1);
  }
  
  protected onPrev(): void {
    if (this.currentPage() > 1) this.onPageChange(this.currentPage() - 1);
  }
  
  protected onNext(): void {
    if (this.currentPage() < this.totalPages()) this.onPageChange(this.currentPage() + 1);
  }
  
  protected onLast(): void {
    if (this.currentPage() < this.totalPages()) this.onPageChange(this.totalPages());
  }
}
