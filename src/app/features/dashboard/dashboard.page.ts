import { CurrencyPipe, PercentPipe } from '@angular/common';
import {Component, computed, inject, OnInit, signal} from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth/auth.service';
import { RecentClient } from '../../core/models/client.model';
import { ProjectProgress } from '../../core/models/project.model';
import { ClientStatusEnum } from '../../core/enums/client-status.enum';
import { DashboardService } from '../../core/services/dashboard/dashboard.service';


interface NavItem {
  label: string;
  route: string;
  active: boolean;
  icon: 'dashboard' | 'clients' | 'projects' | 'tasks';
}

@Component({
  selector: 'app-dashboard',
  imports: [CurrencyPipe, PercentPipe, RouterLink],
  templateUrl: './dashboard.page.html',
})
export class DashboardPage implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly dashboardService = inject(DashboardService);

  protected readonly isRefreshing = signal(false);

  protected readonly navItems: NavItem[] = [
    { label: 'Dashboard', route: '/dashboard', active: true, icon: 'dashboard' },
    { label: 'Clients', route: '/clients', active: false, icon: 'clients' },
    { label: 'Projects', route: '/projects', active: false, icon: 'projects' },
    { label: 'Tasks', route: '/tasks', active: false, icon: 'tasks' },
  ];

  protected readonly recentClients = signal<RecentClient[]>([]);
  protected readonly topProjects = signal<ProjectProgress[]>([]);

  protected readonly activeClientsCount = signal<number>(0);
  protected readonly totalRevenue = signal<number>(0);
  protected readonly projectsPlanning = signal<number>(0);
  protected readonly projectsActive = signal<number>(0);
  protected readonly projectsDone = signal<number>(0);
  protected readonly tasksCompleted = signal<number>(0);
  protected readonly tasksTotal = signal<number>(0);

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.dashboardService.getDashboardData().subscribe({
      next: (metrics: any) => {
        this.recentClients.set(metrics.recentClients || []);
        this.topProjects.set(metrics.topProjects || []);

        this.activeClientsCount.set(metrics.activeClientsCount);
        this.totalRevenue.set(metrics.totalRevenue);

        this.projectsPlanning.set(metrics.projectsPlanning || 0);
        this.projectsActive.set(metrics.projectsActive || 0);
        this.projectsDone.set(metrics.projectsDone || 0);

        this.tasksCompleted.set(metrics.tasksCompleted || 0);
        this.tasksTotal.set(metrics.tasksTotal || 0);

        this.isRefreshing.set(false);
      },
      error: (err) => {
        console.error('Error with dashboard data:', err);
        this.isRefreshing.set(false);
      }
    });
  }

  protected readonly tasksProgress = computed(() => {
    const total = this.tasksTotal();
    if (total === 0) return 0;
    return this.tasksCompleted() / total;
  });

  protected readonly userRole = computed(() => {
    const user = this.authService.currentUser();
    if (!user || !user.role) {
      return 'Manager';
    }
    return user.role.charAt(0).toUpperCase() + user.role.slice(1);
  });

  protected readonly userDisplayName = computed(() => {
    const user = this.authService.currentUser();
    return user ? `${user.firstName} ${user.lastName}` : 'Elena Smirnova';
  });

  protected readonly summaryText = computed(
    () =>
      `${this.activeClientsCount()} active clients · ${this.projectsActive()} live projects · ${this.tasksCompleted()} tasks completed this quarter`,
  );

  protected refreshData(): void {
    if (this.isRefreshing()) return;
    this.isRefreshing.set(true);

    this.loadData();
  }

  protected projectProgress(completed: number, total: number): number {
    if (total === 0) return 0;
    return completed / total;
  }


  protected statusBadgeClasses(status: ClientStatusEnum): string {
    const base = 'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm ring-1 ring-inset';
    return status === ClientStatusEnum.ACTIVE
      ? `${base} bg-green-50 text-green-700 ring-green-600/20`
      : `${base} bg-amber-50 text-amber-700 ring-amber-600/20`;
  }
}
