import { Injectable, signal } from '@angular/core';
import { IProject } from '../models/project.model';

@Injectable({
  providedIn: 'root',
})
export class Project {
  projects = signal<IProject[]>([
    {
      id: '1',
      name: 'Book store web site',
      clientName: 'Ivan Ivanov',
      budget: 500,
      tasks: [
        {
          id: 't1',
          title: 'Configure routing',
          description: 'Make switching of pages',
          status: 'done',
        },
        {
          id: 't2',
          title: 'Insert Firebase',
          description: 'Connect the database',
          status: 'todo',
        },
      ],
    },
    {
      id: '2',
      name: 'Mobile app (Fitness)',
      clientName: 'ООО Sport',
      budget: 1200,
      tasks: [
        {
          id: 't3',
          title: 'Make UI design',
          description: 'Make pages on Figma',
          status: 'in-progress',
        },
      ],
    },
  ]);

  addProject (project: IProject) {
    this.projects.update(currentProjects => [...currentProjects, project]);
  };
}
