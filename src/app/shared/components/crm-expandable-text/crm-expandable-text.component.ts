import { Component, input, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'crm-expandable-text',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './crm-expandable-text.component.html',
  styleUrls: ['./crm-expandable-text.component.scss']
})
export class CrmExpandableTextComponent {
  text = input<string>();
  maxHeight = input<number>(60);
  
  isExpanded = signal(false);
  expandedChange = output<boolean>();

  toggleExpand(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    const newValue = !this.isExpanded();
    this.isExpanded.set(newValue);
    this.expandedChange.emit(newValue);
  }
}
