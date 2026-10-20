import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CrmMetricCard } from '../../../../shared/components/crm-metric-card/crm-metric-card';

@Component({
  selector: 'app-portal-milestone-tracker',
  standalone: true,
  imports: [CommonModule, CrmMetricCard],
  templateUrl: './portal-milestone-tracker.component.html',
  styleUrl: './portal-milestone-tracker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortalMilestoneTrackerComponent {
  readonly completionPercentage = input.required<number>();
  readonly completedTasks = input.required<number>();
  readonly inProgressTasks = input.required<number>();
  readonly reviewTasks = input.required<number>();
  readonly todoTasks = input.required<number>();
}
