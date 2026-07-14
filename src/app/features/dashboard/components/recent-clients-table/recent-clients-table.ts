import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { RecentClient } from '../../../../core/models/client.model';
import { CurrencyPipe } from '@angular/common';
import { CRM_TABLE_DECORATORS, CrmTable } from '../../../../shared/components/crm-table/crm-table';
import { CrmStatusBadgeComponent } from '../../../../shared/components/crm-status-badge/crm-status-badge.component';

@Component({
  selector: 'app-recent-clients-table',
  imports: [CurrencyPipe, CrmTable, CRM_TABLE_DECORATORS, CrmStatusBadgeComponent],
  templateUrl: './recent-clients-table.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './recent-clients-table.scss',
})
export class RecentClientsTable {
  clients = input.required<RecentClient[]>();
}
