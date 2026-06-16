import { ClientStatusEnum } from "../enums/client-status.enum";

export interface RecentClient {
  companyName: string;
  contractValue: number;
  phone: string;
  status: ClientStatusEnum;
}