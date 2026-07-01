import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'crm-metric-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './crm-metric-card.html',
  styleUrl: './crm-metric-card.scss',
})
export class CrmMetricCard {
  header = input<string>();
  label = input<string>();
  value = input<string | number | null>('');
  hint = input<string>('');
  isLive = input<boolean>(false);
  isClickable = input<boolean>(false);
}
