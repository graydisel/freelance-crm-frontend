import { Component, input } from '@angular/core';
import { ProjectProgress } from '../../../../core/models/project.model';

@Component({
  selector: 'app-project-progress-list',
  imports: [],
  templateUrl: './project-progress-list.html',
  styleUrl: './project-progress-list.scss',
})
export class ProjectProgressList {
  projects = input.required<ProjectProgress[]>();

  protected projectProgress(completed: number, total: number): number {
    return total === 0 ? 0 : completed / total;
  }
}
