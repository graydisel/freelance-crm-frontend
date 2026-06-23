import { Component, computed, Directive, input, output, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';

@Directive({
  selector: '[crm-table-header]',
  standalone: true
})
export class CrmTableHeaderDirective {}

@Directive({
  selector: '[crm-table-body]',
  standalone: true
})
export class CrmTableBodyDirective {}

@Component({
  selector: 'crm-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './crm-table.html',
  styleUrl: './crm-table.scss',
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'crm-table-shared-root'
  }
})
export class CrmTable {
  currentPage = input<number>(1);
  pageSize = input<number>(10);
  totalItems = input<number>(0);

  pageChange = output<number>();

  hasPagination = computed(() => this.totalItems() > 0);
  totalPages = computed(() => Math.ceil(this.totalItems() / this.pageSize()));

  rangeStart = computed(() => {
    if (this.totalItems() === 0) return 0;
    return (this.currentPage() - 1) * this.pageSize() + 1;
  });

  rangeEnd = computed(() => {
    return Math.min(this.currentPage() * this.pageSize(), this.totalItems());
  });

  pages = computed(() => {
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

  onFirst(): void {
    if (this.currentPage() > 1) {
      this.pageChange.emit(1);
    }
  }

  onPrev(): void {
    if (this.currentPage() > 1) {
      this.pageChange.emit(this.currentPage() - 1);
    }
  }

  onNext(): void {
    if (this.currentPage() < this.totalPages()) {
      this.pageChange.emit(this.currentPage() + 1);
    }
  }

  onLast(): void {
    const total = this.totalPages();
    if (this.currentPage() < total) {
      this.pageChange.emit(total);
    }
  }

  onPage(page: number): void {
    if (page !== this.currentPage()) {
      this.pageChange.emit(page);
    }
  }
}

export const CRM_TABLE_DECORATORS = [
  CrmTable,
  CrmTableHeaderDirective,
  CrmTableBodyDirective
] as const;
