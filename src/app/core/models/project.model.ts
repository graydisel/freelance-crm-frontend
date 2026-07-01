import { ProjectStatusEnum } from "../enums/project-status.enum";

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatusEnum;
  date: string;
  tasksCount: number;
  client: {
    companyName: string;
  };
  manager: {
    fullName: string;
  };
}

export interface ProjectsServerResponse {
  data: Project[];
  meta: {
    totalItems: number; // Matches the active status tab + search query for pagination
    currentPage: number;
    itemsPerPage: number;
    totalPages: number;
    filteredMetrics: {
      planningCount: number;
      activeCount: number;
      reviewCount: number;
      completedCount: number;
      pausedCount: number;
      totalCount: number; // Sum of all statuses matching the current search string
    };
  };
}

export interface ProjectProgress {
  name: string;
  client: string;
  completedTasks: number;
  totalTasks: number;
}