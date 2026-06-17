import {DashboardMetrics} from '../../../core/models/dashboard.model';

export function createEmptyMetrics(): DashboardMetrics {
  return {
    activeClientsCount: 0,
    leadsCount: 0,
    archivedClientsCount: 0,
    totalRevenue: 0,
    projectsPlanning: 0,
    projectsActive: 0,
    projectsDone: 0,
    tasksCompleted: 0,
    tasksTotal: 0,
    recentClients: [],
    topProjects: []
  };
}
