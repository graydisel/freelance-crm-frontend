import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'crm-status-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './crm-status-badge.component.html',
  styleUrls: ['./crm-status-badge.component.scss'],
  host: {
    'class': 'crm-status-badge',
    '[class.crm-status-badge--active]': 'status() === "active"',
    '[class.crm-status-badge--lead]': 'status() === "lead"',
    '[class.crm-status-badge--archived]': 'status() === "archived"'
  }
})
export class CrmStatusBadgeComponent {
  status = input.required<string>();
}
