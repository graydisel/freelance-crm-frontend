import { Component, input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Project, ProjectStatusEnum } from '../../../../core/models/project.model';

@Component({
  selector: 'app-project-card',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe],
  templateUrl: './project-card.component.html',
  styleUrls: ['./project-card.component.scss']
})
export class ProjectCardComponent {
  project = input.required<Project>();
  protected readonly ProjectStatusEnum = ProjectStatusEnum;
}
