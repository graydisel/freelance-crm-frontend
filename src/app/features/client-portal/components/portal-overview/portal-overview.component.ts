import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Project } from '../../../../core/models/project.model';
import { CrmStatusBadgeComponent } from '../../../../shared/components/crm-status-badge/crm-status-badge.component';
import { CrmAvatarComponent } from '../../../../shared/components/crm-avatar/crm-avatar.component';

@Component({
  selector: 'app-portal-overview',
  standalone: true,
  imports: [CommonModule, CrmStatusBadgeComponent, CrmAvatarComponent],
  templateUrl: './portal-overview.component.html',
  styleUrl: './portal-overview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortalOverviewComponent {
  readonly project = input.required<Project>();
  readonly completionPercentage = input.required<number>();
  readonly totalTasks = input.required<number>();
  readonly pmInitials = input.required<string>();
}
