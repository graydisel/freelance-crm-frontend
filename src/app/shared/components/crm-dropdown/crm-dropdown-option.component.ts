import { Component, HostListener, inject, input } from '@angular/core';
import { CrmDropdownComponent } from './crm-dropdown.component';

@Component({
  selector: '[crm-dropdown-option]',
  standalone: true,
  template: `<ng-content></ng-content>`,
  styleUrl: './crm-dropdown-option.component.scss',
  host: {
    'class': 'crm-dropdown-option'
  }
})
export class CrmDropdownOptionComponent {
  private readonly dropdown = inject(CrmDropdownComponent);
  
  value = input.required<any>();

  @HostListener('click', ['$event'])
  onClick(event: Event): void {
    event.stopPropagation();
    this.dropdown.selectOption(this.value());
  }
}
