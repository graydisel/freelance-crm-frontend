export enum ProjectStatusEnum {
  PLANNING = 'planning',
  IN_PROGRESS = 'in_progress',
  DONE = 'done'
}

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
    totalItems: number;
    currentPage: number;
    pageSize: number;
    totalPages: number;
    filteredMetrics?: {
      planningCount: number;
      inProgressCount: number;
      doneCount: number;
      totalCount: number;
    };
    globalMetrics?: {
      planningCount: number;
      inProgressCount: number;
      doneCount: number;
      totalGlobal: number;
    };
  };


}

export interface ProjectProgress {
  name: string;
  client: string;
  completedTasks: number;
  totalTasks: number;
}