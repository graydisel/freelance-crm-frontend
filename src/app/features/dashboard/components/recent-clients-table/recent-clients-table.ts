import {Component, input} from '@angular/core';
import {RecentClient} from '../../../../core/models/client.model';
import {ClientStatusEnum} from '../../../../core/enums/client-status.enum';
import {CurrencyPipe} from '@angular/common';

@Component({
  selector: 'app-recent-clients-table',
  imports: [
    CurrencyPipe
  ],
  templateUrl: './recent-clients-table.html',
  styleUrl: './recent-clients-table.scss',
})
export class RecentClientsTable {
  clients = input.required<RecentClient[]>();

  protected statusBadgeClasses(status: ClientStatusEnum): string {
    return status === ClientStatusEnum.ACTIVE
      ? 'crm-badge crm-badge--active'
      : 'crm-badge crm-badge--lead';
  }
}
