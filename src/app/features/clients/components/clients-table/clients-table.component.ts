import { Component, input, output } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ClientProfile } from '../../../../core/models/client.model';
import { CrmAvatarComponent } from '../../../../shared/components/crm-avatar/crm-avatar.component';
import { CrmStatusBadgeComponent } from '../../../../shared/components/crm-status-badge/crm-status-badge.component';
import { CRM_TABLE_DECORATORS } from '../../../../shared/components/crm-table/crm-table';

@Component({
  selector: 'app-clients-table',
  standalone: true,
  imports: [CommonModule,
    CurrencyPipe,
    CrmAvatarComponent,
    CrmStatusBadgeComponent,
    ...CRM_TABLE_DECORATORS],
  templateUrl: './clients-table.component.html',
  styleUrls: ['./clients-table.component.scss']
})
export class ClientsTableComponent {
  clients = input.required<ClientProfile[]>();
  rowClicked = output<ClientProfile>();
}
