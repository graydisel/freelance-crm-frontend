import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthStore } from '../../core/stores/auth.store';
import { ProjectsService } from '../../core/services/projects/projects.service';
import { TaskService } from '../../core/services/tasks/task.service';
import { Project } from '../../core/models/project.model';
import { Task } from '../../core/models/task.model';
import { CrmButtonComponent } from '../../shared/components/crm-button/crm-button';
import { CrmStatusBadgeComponent } from '../../shared/components/crm-status-badge/crm-status-badge.component';
import { CRM_TABLE_DECORATORS } from '../../shared/components/crm-table/crm-table';
import { CrmAvatarComponent } from '../../shared/components/crm-avatar/crm-avatar.component';
import { CrmMetricCard } from '../../shared/components/crm-metric-card/crm-metric-card';

@Component({
  selector: 'app-client-portal',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    CrmButtonComponent,
    CrmStatusBadgeComponent,
    ...CRM_TABLE_DECORATORS,
    CrmAvatarComponent,
    CrmMetricCard,
  ],
  templateUrl: './client-portal.component.html',
  styleUrl: './client-portal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientPortalComponent implements OnInit {
  readonly authStore = inject(AuthStore);
  private readonly projectsService = inject(ProjectsService);
  private readonly taskService = inject(TaskService);

  readonly projects = signal<Project[]>([]);
  readonly selectedProject = signal<Project | null>(null);
  readonly tasks = signal<Task[]>([]);
  readonly isLoadingProjects = signal<boolean>(false);
  readonly isLoadingTasks = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  readonly companyName = computed(() => {
    return this.selectedProject()?.client?.companyName || 'Valued Client';
  });

  readonly userDisplayName = computed(() => {
    const user = this.authStore.user();
    if (!user) return 'Client User';
    if (user.profile?.firstName) {
      return `${user.profile.firstName} ${user.profile.lastName || ''}`.trim();
    }
    return user.email;
  });

  readonly userInitials = computed(() => {
    const user = this.authStore.user();
    if (user?.profile?.firstName) {
      const f = user.profile.firstName.charAt(0);
      const l = user.profile.lastName?.charAt(0) || '';
      return `${f}${l}`.toUpperCase();
    }
    return user?.email ? user.email.substring(0, 2).toUpperCase() : 'CU';
  });

  readonly pmInitials = computed(() => {
    const pm = this.selectedProject()?.manager;
    if (pm?.fullName) {
      const parts = pm.fullName.trim().split(' ');
      if (parts.length >= 2) {
        return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
      }
      return pm.fullName.substring(0, 2).toUpperCase();
    }
    return 'PM';
  });

  readonly totalTasks = computed(() => this.tasks().length);

  readonly completedTasks = computed(
    () =>
      this.tasks().filter((t) => {
        const s = t.status?.toLowerCase();
        return s === 'done' || s === 'completed';
      }).length,
  );

  readonly inProgressTasks = computed(
    () =>
      this.tasks().filter((t) => {
        const s = t.status?.toLowerCase();
        return s === 'in_progress' || s === 'in-progress';
      }).length,
  );

  readonly reviewTasks = computed(
    () => this.tasks().filter((t) => t.status?.toLowerCase() === 'review').length,
  );

  readonly todoTasks = computed(
    () =>
      this.tasks().filter((t) => {
        const s = t.status?.toLowerCase();
        return s === 'todo' || s === 'backlog';
      }).length,
  );

  readonly completionPercentage = computed(() => {
    const total = this.totalTasks();
    if (total === 0) return 0;
    return Math.round((this.completedTasks() / total) * 100);
  });

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.isLoadingProjects.set(true);
    this.errorMessage.set(null);

    this.projectsService.getProjects(1, 50).subscribe({
      next: (res) => {
        this.isLoadingProjects.set(false);
        const projectList = res.data ?? [];
        this.projects.set(projectList);

        if (projectList.length > 0) {
          // If user has a clientId, check if a matching project exists
          const userClientId = this.authStore.user()?.clientId;
          let matched = projectList[0];
          if (userClientId) {
            const found = projectList.find((p) => p.client?.id === userClientId);
            if (found) matched = found;
          }
          this.selectProject(matched);
        } else {
          this.selectedProject.set(null);
          this.tasks.set([]);
        }
      },
      error: (err: HttpErrorResponse) => {
        this.isLoadingProjects.set(false);
        const serverMessage =
          typeof err.error === 'object' && err.error && 'message' in err.error
            ? String((err.error as { message: unknown }).message)
            : 'Failed to load projects. Please try again.';
        this.errorMessage.set(serverMessage);
      },
    });
  }

  selectProject(project: Project): void {
    this.selectedProject.set(project);
    this.loadTasks(project.id);
  }

  loadTasks(projectId: string): void {
    this.isLoadingTasks.set(true);
    this.taskService.getTasks(projectId).subscribe({
      next: (tasks) => {
        this.isLoadingTasks.set(false);
        this.tasks.set(tasks ?? []);
      },
      error: () => {
        this.isLoadingTasks.set(false);
        this.tasks.set([]);
      },
    });
  }

  normalizeStatus(status: string): string {
    return (status || '').toLowerCase().replace(/_/g, '-');
  }

  formatStatus(status: string): string {
    return (status || '').replace(/[-_]/g, ' ');
  }

  formatAssignee(task: Task): string {
    if (task.assignee?.profile?.firstName) {
      const last = task.assignee.profile.lastName ? ` ${task.assignee.profile.lastName}` : '';
      return `${task.assignee.profile.firstName}${last}`;
    }
    return task.assignee?.email || 'Engineering Team';
  }

  onLogout(): void {
    this.authStore.logout();
  }
}
