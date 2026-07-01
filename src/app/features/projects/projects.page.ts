import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { ProjectFiltersComponent } from './components/project-filters/project-filters.component';
import { ProjectCardComponent } from './components/project-card/project-card.component';
import { Project, ProjectsServerResponse } from '../../core/models/project.model';
import { ProjectsService } from '../../core/services/projects/projects.service';
import { CRM_TABLE_DECORATORS } from '../../shared/components/crm-table/crm-table';
import {ProjectTableComponent} from './components/project-table/project-table.component';
import {CrmPagination} from '../../shared/components/crm-pagination/crm-pagination';

@Component({
  selector: 'app-projects-page',
  standalone: true,
  imports: [
    CommonModule,
    SidebarComponent,
    ProjectFiltersComponent,
    ProjectCardComponent,
    RouterModule,
    ProjectTableComponent,
    CrmPagination
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
      next: (response) => {
        this.serverResponse.set(response)
      },
      error: (err) => console.error('Error loading projects:', err)
    });
  }

  protected readonly paginatedProjects = computed<Project[]>(() => {
    return this.serverResponse()?.data ?? [];
  });

  protected readonly totalItems = computed<number>(() => {
    return this.serverResponse()?.meta.totalItems ?? 0;
  });

  protected readonly filteredPlanningCount = computed(() => this.serverResponse()?.meta.filteredMetrics?.planningCount ?? 0);
  protected readonly filteredActiveCount = computed(() => this.serverResponse()?.meta.filteredMetrics?.activeCount ?? 0);
  protected readonly filteredReviewCount = computed(() => this.serverResponse()?.meta.filteredMetrics?.reviewCount ?? 0);
  protected readonly filteredCompletedCount = computed(() => this.serverResponse()?.meta.filteredMetrics?.completedCount ?? 0);
  protected readonly filteredPausedCount = computed(() => this.serverResponse()?.meta.filteredMetrics?.pausedCount ?? 0);
  protected readonly filteredTotalCount = computed(() => this.serverResponse()?.meta.filteredMetrics?.totalCount ?? 0);

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
}
