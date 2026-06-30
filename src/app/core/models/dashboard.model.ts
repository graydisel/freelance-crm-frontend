import { RecentClient } from "./client.model";
import { ProjectProgress } from "./project.model";

export interface DashboardMetrics {
  activeClientsCount: number;
  leadsCount: number;
  archivedClientsCount: number;
  totalRevenue: number;
  projectsPlanning: number;
  projectsActive: number;
  projectsDone: number;
  tasksCompleted: number;
  tasksTotal: number;
  recentClients: RecentClient[];
  topProjects: ProjectProgress[];
}