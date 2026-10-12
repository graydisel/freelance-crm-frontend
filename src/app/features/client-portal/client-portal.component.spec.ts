import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ClientPortalComponent } from './client-portal.component';
import { ProjectsService } from '../../core/services/projects/projects.service';
import { TaskService } from '../../core/services/tasks/task.service';
import { ProjectStatusEnum } from '../../core/enums/project-status.enum';
import { TaskStatusEnum } from '../../core/enums/task-status.enum';
import { TaskPriorityEnum } from '../../core/enums/task-priority.enum';
import { UserRoleEnum } from '../../core/enums/user-role.enum';
import { ProjectsServerResponse } from '../../core/models/project.model';
import { Task } from '../../core/models/task.model';

describe('ClientPortalComponent', () => {
  let component: ClientPortalComponent;
  let fixture: ComponentFixture<ClientPortalComponent>;

  const mockProjectsResponse: ProjectsServerResponse = {
    data: [
      {
        id: 'proj-1',
        name: 'Enterprise CRM Overhaul',
        description: 'Frontend overhaul with Angular 21',
        status: ProjectStatusEnum.ACTIVE,
        date: 'Oct 2026',
        tasksCount: 2,
        client: {
          id: 'client-1',
          companyName: 'Acme Corp',
        },
        manager: {
          id: 'mgr-1',
          fullName: 'Jane Manager',
        },
      },
    ],
    meta: {
      totalItems: 1,
      currentPage: 1,
      itemsPerPage: 10,
      totalPages: 1,
      filteredMetrics: {
        planningCount: 0,
        activeCount: 1,
        reviewCount: 0,
        completedCount: 0,
        pausedCount: 0,
        totalCount: 1,
      },
    },
  };

  const mockTasks: Task[] = [
    {
      id: 'task-1',
      title: 'Setup Auth System',
      description: 'Implement JWT login',
      status: TaskStatusEnum.DONE,
      priority: TaskPriorityEnum.HIGH,
      createdAt: '2026-10-01T10:00:00Z',
      creator: {
        id: 'u1',
        email: 'dev@test.com',
        profile: { firstName: 'Dev', lastName: 'One' },
        role: UserRoleEnum.DEVELOPER,
      },
      assignee: null,
    },
    {
      id: 'task-2',
      title: 'Build Portal UI',
      description: 'Client portal view',
      status: TaskStatusEnum.IN_PROGRESS,
      priority: TaskPriorityEnum.MEDIUM,
      createdAt: '2026-10-05T10:00:00Z',
      creator: {
        id: 'u1',
        email: 'dev@test.com',
        profile: { firstName: 'Dev', lastName: 'One' },
        role: UserRoleEnum.DEVELOPER,
      },
      assignee: null,
    },
  ];

  beforeEach(async () => {
    const projectsServiceMock = {
      getProjects: () => of(mockProjectsResponse),
    };

    const taskServiceMock = {
      getTasks: () => of(mockTasks),
    };

    await TestBed.configureTestingModule({
      imports: [ClientPortalComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: ProjectsService, useValue: projectsServiceMock },
        { provide: TaskService, useValue: taskServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ClientPortalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the client portal component', () => {
    expect(component).toBeTruthy();
  });

  it('should load projects on init and set selected project', () => {
    expect(component.projects().length).toBe(1);
    expect(component.selectedProject()?.name).toBe('Enterprise CRM Overhaul');
    expect(component.companyName()).toBe('Acme Corp');
  });

  it('should compute completion percentage correctly', () => {
    expect(component.totalTasks()).toBe(2);
    expect(component.completedTasks()).toBe(1);
    expect(component.inProgressTasks()).toBe(1);
    expect(component.completionPercentage()).toBe(50);
  });
});
