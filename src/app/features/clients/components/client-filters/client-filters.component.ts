import {Component, computed, inject, input, output, signal} from '@angular/core';
import { ClientStatusEnum } from '../../../../core/enums/client-status.enum';
import { CrmButtonComponent } from '../../../../shared/components/crm-button/crm-button';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CrmSearchInput } from '../../../../shared/components/crm-search-input/crm-search-input';
import { ClientsService } from '../../../../core/services/clients/clients.service';
import {CrmFilterChipItem} from '../../../../shared/interfaces/crm-filter.interface';
import {CrmFilterChips} from '../../../../shared/components/crm-filter-chips/crm-filter-chips';

@Component({
  selector: 'app-client-filters',
  standalone: true,
  templateUrl: './client-filters.component.html',
  imports: [
    CrmButtonComponent,
    ReactiveFormsModule,
    CrmSearchInput,
    CrmFilterChips
  ],
  styleUrls: ['./client-filters.component.scss']
})
export class ClientFiltersComponent {
  protected readonly fb = inject(NonNullableFormBuilder);
  protected readonly clientsService = inject(ClientsService);

  totalResults = input<number>(0);
  activeCount = input<number>(0);
  leadsCount = input<number>(0);
  archivedCount = input<number>(0);

  protected readonly clientSearchFn = (term: string) => this.clientsService.getSearchPreview(term);

  searchChange = output<string>()
  statusChange = output<string>()

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

  protected readonly filterChips = computed<CrmFilterChipItem[]>(() => [
    { value: 'all', label: 'All', count: this.totalResults() },
    { value: ClientStatusEnum.ACTIVE, label: 'Active', count: this.activeCount() },
    { value: ClientStatusEnum.LEAD, label: 'Lead', count: this.leadsCount() },
    { value: ClientStatusEnum.ARCHIVED, label: 'Archived', count: this.archivedCount() }
  ]);

  onStatusChange(status: string) {
    this.searchForm.patchValue({ status }, { emitEvent: false });
    this.currentStatus.set(status);
    this.statusChange.emit(status);
  }

  protected readonly ClientStatusEnum = ClientStatusEnum;
}
