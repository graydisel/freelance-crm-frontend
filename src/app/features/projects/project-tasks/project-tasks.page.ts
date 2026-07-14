import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-project-tasks',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './project-tasks.page.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./project-tasks.page.scss'],
})
export class ProjectTasksPage {}
