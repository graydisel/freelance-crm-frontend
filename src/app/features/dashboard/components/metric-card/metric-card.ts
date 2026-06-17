import { Component, input } from '@angular/core';

@Component({
  selector: 'app-metric-card',
  standalone: true,
  imports: [],
  templateUrl: './metric-card.html',
  styleUrl: './metric-card.scss',
})
export class MetricCard {
  label = input.required<string>();
  value = input.required<string | number | null>();
  total = input<number | null>(null);
  hint = input<string>('');
  isLive = input<boolean>(false);
}
