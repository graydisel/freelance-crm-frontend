import { Component, input, output, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ClientProfile } from '../../../../core/models/client.model';
import { CrmAvatarComponent } from '../../../../shared/components/crm-avatar/crm-avatar.component';
import { CrmStatusBadgeComponent } from '../../../../shared/components/crm-status-badge/crm-status-badge.component';
import { CRM_TABLE_DECORATORS } from '../../../../shared/components/crm-table/crm-table';
import { AuthStore } from '../../../../core/stores/auth.store';

@Component({
  selector: 'app-clients-table',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    CrmAvatarComponent,
    CrmStatusBadgeComponent,
    ...CRM_TABLE_DECORATORS,
  ],
  templateUrl: './clients-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./clients-table.component.scss'],
})
export class ClientsTableComponent {
  protected readonly authStore = inject(AuthStore);

  clients = input.required<ClientProfile[]>();
  rowClicked = output<ClientProfile>();
  archive = output<ClientProfile>();

  onArchive(client: ClientProfile, event: Event): void {
    event.stopPropagation();
    this.archive.emit(client);
  }
}
