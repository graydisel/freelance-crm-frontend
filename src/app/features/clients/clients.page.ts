import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { ClientFiltersComponent } from './components/client-filters/client-filters.component';
import { ClientsTableComponent } from './components/clients-table/clients-table.component';
import { ClientProfile, ClientsServerResponse } from '../../core/models/client.model';
import { ClientsService } from '../../core/services/clients/clients.service';
import { CrmMetricCard } from '../../shared/components/crm-metric-card/crm-metric-card';
import { CrmDrawerComponent } from '../../shared/components/crm-drawer/crm-drawer.component';
import { ClientCreateFormComponent } from './components/client-create-form/client-create-form.component';

@Component({
  selector: 'app-clients-page',
  standalone: true,
  imports: [
    CommonModule,
    SidebarComponent,
    CrmMetricCard,
    ClientFiltersComponent,
    ClientsTableComponent,
    CurrencyPipe,
    CrmDrawerComponent,
    ClientCreateFormComponent
  ],
  templateUrl: './clients.page.html',
  styleUrls: ['./clients.page.scss']
})
export class ClientsPageComponent implements OnInit {
  private readonly clientsService = inject(ClientsService);

  protected readonly isDrawerOpen = signal<boolean>(false);
  protected readonly currentPage = signal<number>(1);
  protected readonly pageSize = signal<number>(10);
  protected readonly searchQuery = signal<string>('');
  protected readonly statusFilter = signal<string>('all');

  private readonly serverResponse = signal<ClientsServerResponse | null>(null);

  constructor() {
    effect(() => {
      this.loadClients();
    });
  }

  ngOnInit(): void { }

  private loadClients(): void {
    this.clientsService.getClients(
      this.currentPage(),
      this.pageSize(),
      this.searchQuery(),
      this.statusFilter()
    ).subscribe({
      next: (response) => this.serverResponse.set(response),
      error: (err) => console.error('Error loading clients:', err)
    });
  }

  protected readonly paginatedClients = computed<ClientProfile[]>(() => {
    return this.serverResponse()?.data ?? [];
  });

  protected readonly totalItems = computed<number>(() => {
    return this.serverResponse()?.meta.totalItems ?? 0;
  });

  protected readonly activeClientsCount = computed<number>(() => {
    return this.serverResponse()?.meta.metrics?.activeCount ?? 0;
  });

  protected readonly leadsClientsCount = computed<number>(() => {
    return this.serverResponse()?.meta.metrics?.leadsCount ?? 0;
  });

  protected readonly archivedClientsCount = computed<number>(() => {
    return this.serverResponse()?.meta.metrics?.archivedCount ?? 0;
  });

  protected readonly totalRevenue = computed<number>(() => {
    return this.serverResponse()?.meta.metrics?.totalActiveRevenue ?? 0;
  });

  protected onPageChange(newPage: number): void {
    this.currentPage.set(newPage);
  }

  protected onSearchChange(query: string): void {
    this.searchQuery.set(query);
    this.currentPage.set(1);
  }

  protected onStatusChange(status: string): void {
    this.statusFilter.set(status);
    this.currentPage.set(1);
  }

  protected onClientSaved(): void {
    this.isDrawerOpen.set(false);
    this.loadClients();
  }
}
