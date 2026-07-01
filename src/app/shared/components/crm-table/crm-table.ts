import { Component, computed, Directive, input, output, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';

@Directive({
  selector: '[crm-table-header]',
  standalone: true
})
export class CrmTableHeaderDirective {}

@Directive({
  selector: '[crm-table-body]',
  standalone: true
})
export class CrmTableBodyDirective {}

@Component({
  selector: 'crm-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './crm-table.html',
  styleUrl: './crm-table.scss',
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'crm-table-shared-root'
  }
})
export class CrmTable { }

export const CRM_TABLE_DECORATORS = [
  CrmTable,
  CrmTableHeaderDirective,
  CrmTableBodyDirective
] as const;
