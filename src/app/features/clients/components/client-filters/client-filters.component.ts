import {Component, inject, input, output, signal} from '@angular/core';
import {ClientStatusEnum} from '../../../../core/enums/client-status.enum';
import {CrmButtonComponent} from '../../../../shared/components/crm-button/crm-button';
import {FormBuilder, NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';

@Component({
  selector: 'app-client-filters',
  standalone: true,
  templateUrl: './client-filters.component.html',
  imports: [
    CrmButtonComponent,
    ReactiveFormsModule
  ],
  styleUrls: ['./client-filters.component.scss']
})
export class ClientFiltersComponent {
  totalResults = input<number>(0);
  activeCount = input<number>(0);
  leadsCount = input<number>(0);
  archivedCount = input<number>(0);

  searchChange = output<string>()
  statusChange = output<string>()

  protected readonly isLoading = signal(false);
  protected readonly currentStatus = signal<string>('all');

  protected readonly fb = inject(NonNullableFormBuilder);
  searchForm = this.fb.group({
    text: [''],
    status: [''],
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
    this.statusChange.emit(searchValues.status);
    this.isLoading.set(false);
    console.log(searchValues);
  }

  onStatusChange(status: string) {
    this.searchForm.patchValue({ status }, { emitEvent: false });
    this.currentStatus.set(status);
    this.statusChange.emit(status);
  }

  protected readonly ClientStatusEnum = ClientStatusEnum;
}
