import {Component, input, output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CrmFilterChipItem} from '../../interfaces/crm-filter.interface';

@Component({
  selector: 'crm-filter-chips',
  imports: [CommonModule],
  templateUrl: './crm-filter-chips.html',
  styleUrl: './crm-filter-chips.scss',
})
export class CrmFilterChips {
  items = input.required<CrmFilterChipItem[]>();
  currentStatus = input.required<string>();
  statusChange = output<string>();
  protected onChipClick(status: string): void {
    this.statusChange.emit(status);
  }
}
