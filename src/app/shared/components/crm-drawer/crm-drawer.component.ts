import { Component, HostBinding, HostListener, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'crm-drawer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './crm-drawer.component.html',
  styleUrls: ['./crm-drawer.component.scss'],
  host: {
    '[class.is-open]': 'isOpen()'
  }
})
export class CrmDrawerComponent {
  isOpen = input<boolean>(false);
  closed = output<void>();

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.isOpen()) {
      this.close();
    }
  }

  close() {
    this.closed.emit();
  }
}
