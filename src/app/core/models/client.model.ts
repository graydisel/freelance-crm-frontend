import { ClientStatusEnum } from "../enums/client-status.enum";

export interface ClientProfile {
  id: string;
  companyName: string;
  date: string;
  contactPerson: string;
  contactEmail: string;
  phone: string;
  contractValue: number | null;
  status: ClientStatusEnum;
  initialsCompany: string;
  initialsContact: string;
  projects?: any[];
}

export interface CreateClientDto {
  companyName?: string;
  contactPerson?: string;
  contactEmail?: string;
  phone?: string;
  contractValue?: number;
  status?: ClientStatusEnum;
}

export interface UpdateClientDto extends CreateClientDto { }

export interface ClientsServerResponse {
  data: ClientProfile[];
  meta: {
    totalItems: number;
    currentPage: number;
    pageSize: number;
    totalPages: number;
    metrics: {
      activeCount: number;
      leadsCount: number;
      archivedCount: number;
      totalActiveRevenue: number;
    }
  };
}

export interface RecentClient {
  companyName: string;
  contractValue: number;
  phone: string;
  status: ClientStatusEnum;
}
