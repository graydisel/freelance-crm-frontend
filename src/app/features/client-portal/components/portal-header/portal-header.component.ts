import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CrmAvatarComponent } from '../../../../shared/components/crm-avatar/crm-avatar.component';
import { CrmButtonComponent } from '../../../../shared/components/crm-button/crm-button';

@Component({
  selector: 'app-portal-header',
  standalone: true,
  imports: [CommonModule, CrmAvatarComponent, CrmButtonComponent],
  templateUrl: './portal-header.component.html',
  styleUrl: './portal-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortalHeaderComponent {
  readonly companyName = input.required<string>();
  readonly userDisplayName = input.required<string>();
  readonly userInitials = input.required<string>();

  readonly logout = output<void>();
}
