import { Component, inject, input, output, signal } from '@angular/core';
import { ProjectStatusEnum } from '../../../../core/models/project.model';
import { CrmButtonComponent } from '../../../../shared/components/crm-button/crm-button';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CrmSearchInput } from '../../../../shared/components/crm-search-input/crm-search-input';

@Component({
  selector: 'app-project-filters',
  standalone: true,
  templateUrl: './project-filters.component.html',
  imports: [
    CrmButtonComponent,
    ReactiveFormsModule,
    CrmSearchInput
  ],
  styleUrls: ['./project-filters.component.scss']
})
export class ProjectFiltersComponent {
  protected readonly fb = inject(NonNullableFormBuilder);
  
  totalResults = input<number>(0);
  planningCount = input<number>(0);
  inProgressCount = input<number>(0);
  doneCount = input<number>(0);

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

  onStatusChange(status: string) {
    this.searchForm.patchValue({ status }, { emitEvent: false });
    this.currentStatus.set(status);
    this.statusChange.emit(status);
  }

  protected readonly ProjectStatusEnum = ProjectStatusEnum;
}
