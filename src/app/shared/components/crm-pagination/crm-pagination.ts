import {Component, computed, input, output} from '@angular/core';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'crm-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './crm-pagination.html',
  styleUrl: './crm-pagination.scss',
})
export class CrmPagination {
  currentPage = input.required<number>();
  pageSize = input.required<number>();
  totalItems = input.required<number>();

  pageChange = output<number>();

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

  protected onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.pageChange.emit(page);
    }
  }

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
