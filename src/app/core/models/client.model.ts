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
}

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
