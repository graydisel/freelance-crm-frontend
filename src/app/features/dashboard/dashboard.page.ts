import { CurrencyPipe, PercentPipe } from '@angular/common';
import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { RecentClientsTable } from './components/recent-clients-table/recent-clients-table';
import { ProjectProgressList } from './components/project-progress-list/project-progress-list';
import { CrmButtonComponent } from '../../shared/components/crm-button/crm-button';
import { CrmMetricCard } from '../../shared/components/crm-metric-card/crm-metric-card';
import { DashboardStore } from '../../core/stores/dashboard.store';

@Component({
  selector: 'app-dashboard',
  imports: [
    CurrencyPipe,
    PercentPipe,
    SidebarComponent,
    CrmMetricCard,
    RecentClientsTable,
    ProjectProgressList,
    CrmButtonComponent,
  ],
  templateUrl: './dashboard.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './dashboard.page.scss',
})
export class DashboardPage {
  protected readonly store = inject(DashboardStore);

  protected readonly isRefreshing = this.store.isLoading;
  protected readonly metrics = this.store.metrics;
  protected readonly tasksProgress = this.store.tasksProgress;
  protected readonly summaryText = this.store.summaryText;

  protected refreshData(): void {
    if (this.isRefreshing()) return;
    this.store.loadData();
  }
}
