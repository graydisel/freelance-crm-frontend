import { Component, input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Project } from '../../../../core/models/project.model';
import { ProjectStatusEnum } from '../../../../core/enums/project-status.enum';
import {CrmMetricCard} from '../../../../shared/components/crm-metric-card/crm-metric-card';

@Component({
  selector: 'app-project-card',
  standalone: true,
  imports: [CommonModule, RouterModule, CrmMetricCard],
  templateUrl: './project-card.component.html',
  styleUrls: ['./project-card.component.scss']
})
export class ProjectCardComponent {
  project = input.required<Project>();
  protected readonly ProjectStatusEnum = ProjectStatusEnum;
}
