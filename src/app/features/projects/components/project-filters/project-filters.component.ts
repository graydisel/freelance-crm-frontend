import {Component, computed, inject, input, output, signal} from '@angular/core';
import { CrmButtonComponent } from '../../../../shared/components/crm-button/crm-button';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CrmSearchInput } from '../../../../shared/components/crm-search-input/crm-search-input';
import { ProjectStatusEnum } from '../../../../core/enums/project-status.enum';
import { ProjectsService } from '../../../../core/services/projects/projects.service';
import {CrmFilterChipItem} from '../../../../shared/interfaces/crm-filter.interface';
import {CrmFilterChips} from '../../../../shared/components/crm-filter-chips/crm-filter-chips';

@Component({
  selector: 'app-project-filters',
  standalone: true,
  templateUrl: './project-filters.component.html',
  imports: [
    CrmButtonComponent,
    ReactiveFormsModule,
    CrmSearchInput,
    CrmFilterChips
  ],
  styleUrls: ['./project-filters.component.scss']
})
export class ProjectFiltersComponent {
  protected readonly fb = inject(NonNullableFormBuilder);
  protected readonly projectsService = inject(ProjectsService);

  totalSearchCount = input<number>(0);
  planningCount = input<number>(0);
  activeCount = input<number>(0);
  reviewCount = input<number>(0);
  completedCount = input<number>(0);
  pausedCount = input<number>(0);

  protected readonly projectSearchFn = (term: string) => this.projectsService.getProjects(1, 5, term);

  searchChange = output<string>();
  statusChange = output<string>();

  protected readonly isLoading = signal(false);
  protected readonly currentStatus = signal<string>('all');

  searchForm = this.fb.group({
    text: [''],
    status: ['all'],
  });

  constructor() {
    this.searchForm.get('status')?.valueChanges.subscribe(status => {
      if (status) {
        this.currentStatus.set(status);
        this.statusChange.emit(status);
      }
    });
  }

  search() {
    this.isLoading.set(true);
    const searchValues = this.searchForm.getRawValue();
    this.searchChange.emit(searchValues.text);
    this.isLoading.set(false);
  }

  protected readonly projectFilterChips = computed<CrmFilterChipItem[]>(() => [
    { value: 'all', label: 'All', count: this.totalSearchCount() },
    { value: ProjectStatusEnum.PLANNING, label: 'Planning', count: this.planningCount() },
    { value: ProjectStatusEnum.ACTIVE, label: 'In Progress', count: this.activeCount() },
    { value: ProjectStatusEnum.REVIEW, label: 'Review', count: this.reviewCount() },
    { value: ProjectStatusEnum.COMPLETED, label: 'Completed', count: this.completedCount() },
    { value: ProjectStatusEnum.PAUSED, label: 'Paused', count: this.pausedCount() }
  ]);

  onStatusChange(status: string) {
    this.searchForm.patchValue({ status }, { emitEvent: false });
    this.currentStatus.set(status);
    this.statusChange.emit(status);
  }

  protected readonly ProjectStatusEnum = ProjectStatusEnum;
}
