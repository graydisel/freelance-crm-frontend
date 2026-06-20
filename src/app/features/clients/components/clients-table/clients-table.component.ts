import {Component, computed, input, output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ClientProfile} from '../../../../core/models/client.model';
import {CrmAvatarComponent} from '../../../../shared/components/crm-avatar/crm-avatar.component';
import {CrmStatusBadgeComponent} from '../../../../shared/components/crm-status-badge/crm-status-badge.component';

@Component({
  selector: 'app-clients-table',
  standalone: true,
  imports: [CommonModule, CrmAvatarComponent, CrmStatusBadgeComponent],
  templateUrl: './clients-table.component.html',
  styleUrls: ['./clients-table.component.scss']
})
export class ClientsTableComponent {
  clients = input.required<ClientProfile[]>();
  currentPage = input<number>(1);
  pageSize = input<number>(10);
  totalItems = input<number>(0);

  pageChange = output<number>();

  totalPages = computed(() => Math.ceil(this.totalItems() / this.pageSize()));

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

  rangeStart = computed(() => {
    if (this.totalItems() === 0) return 0;
    return (this.currentPage() - 1) * this.pageSize() + 1;
  });

  rangeEnd = computed(() => {
    return Math.min(this.currentPage() * this.pageSize(), this.totalItems());
  });

  onFirst(): void {
    if (this.currentPage() > 1) {
      this.pageChange.emit(1);
    }
  }

  onPrev() {
    if (this.currentPage() > 1) {
      this.pageChange.emit(this.currentPage() - 1);
    }
  }

  onNext() {
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

  onPage(page: number) {
    this.pageChange.emit(page);
  }
}
