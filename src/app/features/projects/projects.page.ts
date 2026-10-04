import { Component, computed, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { ProjectFiltersComponent } from './components/project-filters/project-filters.component';
import { ProjectCardComponent } from './components/project-card/project-card.component';
import { Project } from '../../core/models/project.model';
import { ProjectTableComponent } from './components/project-table/project-table.component';
import { CrmPagination } from '../../shared/components/crm-pagination/crm-pagination';
import { CrmButtonComponent } from '../../shared/components/crm-button/crm-button';
import { CrmDrawerComponent } from '../../shared/components/crm-drawer/crm-drawer.component';
import { ProjectFormComponent } from './components/project-form/project-form.component';
import { ProjectDetailsComponent } from './components/project-details/project-details.component';
import { ProjectsStore } from '../../core/stores/projects.store';

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
    CrmPagination,
    CrmButtonComponent,
    CrmDrawerComponent,
    ProjectFormComponent,
    ProjectDetailsComponent,
  ],
  templateUrl: './projects.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./projects.page.scss'],
})
export class ProjectsPageComponent {
  protected readonly store = inject(ProjectsStore);

  protected readonly currentPage = this.store.currentPage;
  protected readonly pageSize = this.store.pageSize;

  protected readonly viewMode = signal<'grid' | 'table'>('grid');
  protected readonly isDrawerOpen = signal<boolean>(false);
  protected readonly drawerMode = signal<'create' | 'details' | 'edit'>('create');
  protected readonly selectedProject = signal<Project | null>(null);

  protected readonly paginatedProjects = computed<Project[]>(() => this.store.projects());
  protected readonly totalItems = computed<number>(() => this.store.totalItems());

  protected readonly filteredPlanningCount = computed(
    () => this.store.filteredMetrics()?.planningCount ?? 0,
  );
  protected readonly filteredActiveCount = computed(
    () => this.store.filteredMetrics()?.activeCount ?? 0,
  );
  protected readonly filteredReviewCount = computed(
    () => this.store.filteredMetrics()?.reviewCount ?? 0,
  );
  protected readonly filteredCompletedCount = computed(
    () => this.store.filteredMetrics()?.completedCount ?? 0,
  );
  protected readonly filteredPausedCount = computed(
    () => this.store.filteredMetrics()?.pausedCount ?? 0,
  );
  protected readonly filteredTotalCount = computed(
    () => this.store.filteredMetrics()?.totalCount ?? 0,
  );

  protected onPageChange(newPage: number): void {
    this.store.setPage(newPage);
  }

  protected onSearchChange(query: string): void {
    this.store.setSearchQuery(query);
  }

  protected onStatusChange(status: string): void {
    this.store.setStatusFilter(status);
  }

  protected setViewMode(mode: 'grid' | 'table'): void {
    this.viewMode.set(mode);
  }

  protected openAddProject(): void {
    this.selectedProject.set(null);
    this.drawerMode.set('create');
    this.isDrawerOpen.set(true);
  }

  protected openProjectDetails(project: Project): void {
    this.selectedProject.set(project);
    this.drawerMode.set('details');
    this.isDrawerOpen.set(true);
  }

  protected onEditProject(): void {
    this.drawerMode.set('edit');
  }

  protected closeDrawer(): void {
    this.isDrawerOpen.set(false);
    setTimeout(() => {
      this.selectedProject.set(null);
      this.drawerMode.set('create');
    }, 300);
  }

  protected onProjectSaved(): void {
    this.closeDrawer();
    this.store.loadProjects({
      page: this.store.currentPage(),
      limit: this.store.pageSize(),
      search: this.store.searchQuery(),
      status: this.store.statusFilter(),
    });
  }
}
