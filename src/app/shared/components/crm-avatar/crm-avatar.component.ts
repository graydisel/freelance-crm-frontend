import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'crm-avatar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './crm-avatar.component.html',
  styleUrls: ['./crm-avatar.component.scss'],
  host: {
    'class': 'crm-avatar',
    '[class.crm-avatar--company]': 'variant() === "company"',
    '[class.crm-avatar--contact]': 'variant() === "contact"'
  }
})
export class CrmAvatarComponent {
  initials = input.required<string>();
  variant = input<'company' | 'contact'>('company');
}
