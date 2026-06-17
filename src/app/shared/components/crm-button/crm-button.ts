import {Component, input, ViewEncapsulation} from '@angular/core';

@Component({
  selector: 'button[crm-btn]',
  standalone: true,
  template: `
    @if (loading()) {
      <span class="crm-icon crm-icon--refresh crm-icon--spinning" aria-hidden="true"></span>
    }

    <ng-content></ng-content>
  `,
  styleUrl: './crm-button.scss',
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'crm-btn',
    '[class.crm-btn--primary]': "variant() === 'primary'",
    '[class.crm-btn--secondary]': "variant() === 'secondary'",
    '[class.crm-btn--danger]': "variant() === 'danger'",
    '[class.crm-btn--sm]': "size() === 'sm'",
    '[class.crm-btn--md]': "size() === 'md'",
    '[class.crm-btn--lg]': "size() === 'lg'",
    '[class.crm-btn--loading]': 'loading()',
    '[disabled]': 'disabled() || loading()'
  }
})
export class CrmButtonComponent {
  variant = input<'primary' | 'secondary' | 'danger'>('primary');
  size = input<'sm' | 'md' | 'lg'>('md');

  disabled = input<boolean>(false);
  loading = input<boolean>(false);
}
