import { Component } from '@angular/core';
import { inject } from '@angular/core';
import { Project, Project as ProjectService } from '../../core/services/project';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ITask } from '../../core/models/project.model';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './projects.html',
  styleUrl: './projects.scss',
})
export class Projects {
  protected readonly projectService = inject(ProjectService);
  protected readonly projects = this.projectService.projects;

  private readonly fb = inject(FormBuilder);

  protected readonly taskForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', Validators.required],
  });

  protected activeProjectId: string | null = null;

  startEditForm(projectId: string) {
    if (this.activeProjectId === projectId) {
      this.activeProjectId = null;
    } else {
      this.activeProjectId = projectId;
      this.taskForm.reset();
    }
  }

  onSubmitTask(projectId: string) {
    if (this.taskForm.valid) {
      const { title, description } = this.taskForm.getRawValue();
      this.projectService.addTask(projectId, title, description);
      this.activeProjectId = null;
      this.taskForm.reset();
    }
  }

  changeStatus(projectId: string, taskId: string, currentStatus: ITask['status'])  {
    let nextStatus: ITask['status'];

    if (currentStatus === 'todo') {
      nextStatus = 'in-progress';
    } else if (currentStatus === 'in-progress') {
      nextStatus = 'done';
    } else return;

    this.projectService.updateTaskStatus(projectId, taskId, nextStatus);
  }
}
