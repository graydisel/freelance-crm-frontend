import { CurrencyPipe, PercentPipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DashboardService } from '../../core/services/dashboard/dashboard.service';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { MetricCard } from './components/metric-card/metric-card';
import { RecentClientsTable } from './components/recent-clients-table/recent-clients-table';
import { ProjectProgressList } from './components/project-progress-list/project-progress-list';
import { CrmButtonComponent } from '../../shared/components/crm-button/crm-button';
import { DashboardMetrics } from '../../core/models/dashboard.model';
import { createEmptyMetrics } from './creators/metrics-creator';

@Component({
  selector: 'app-dashboard',
  imports: [CurrencyPipe, PercentPipe, SidebarComponent,
    MetricCard, RecentClientsTable, ProjectProgressList, CrmButtonComponent
  ],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.scss',
})
export class DashboardPage implements OnInit {
  private readonly dashboardService = inject(DashboardService);

  protected readonly isRefreshing = signal(false);

  protected readonly metrics = signal<DashboardMetrics>(createEmptyMetrics());

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.dashboardService.getDashboardData().subscribe({
      next: (metrics) => {
        this.metrics.set(metrics);

        this.isRefreshing.set(false);
      },
      error: (err) => {
        console.error('Error with dashboard data:', err);
        this.isRefreshing.set(false);
      },
    });
  }

  protected readonly tasksProgress = computed(() => {
    const { tasksTotal, tasksCompleted } = this.metrics();
    return tasksTotal === 0 ? 0 : tasksCompleted / tasksTotal;
  });

  protected readonly summaryText = computed(
    () => {
      const { activeClientsCount, projectsActive, tasksCompleted } = this.metrics();
      return `${activeClientsCount} active clients · ${projectsActive} live projects · ${tasksCompleted} tasks completed this quarter`
    }
  );

  protected refreshData(): void {
    if (this.isRefreshing()) return;
    this.isRefreshing.set(true);
    this.loadData();
  }
}
