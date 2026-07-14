import { ProjectStatusEnum } from '../enums/project-status.enum';

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatusEnum;
  date: string;
  tasksCount: number;
  client: {
    id: string;
    companyName: string;
  };
  manager: {
    id: string;
    fullName: string;
  };
}

export interface CreateProjectDto {
  name: string;
  description?: string;
  status?: ProjectStatusEnum;
  clientId: string;
  managerId: string;
}

export interface UpdateProjectDto {
  name?: string;
  description?: string;
  status?: ProjectStatusEnum;
  clientId?: string;
  managerId?: string;
}

export interface ProjectsServerResponse {
  data: Project[];
  meta: {
    totalItems: number;
    currentPage: number;
    itemsPerPage: number;
    totalPages: number;
    filteredMetrics: {
      planningCount: number;
      activeCount: number;
      reviewCount: number;
      completedCount: number;
      pausedCount: number;
      totalCount: number;
    };
  };
}

export interface ProjectProgress {
  name: string;
  client: string;
  completedTasks: number;
  totalTasks: number;
}
