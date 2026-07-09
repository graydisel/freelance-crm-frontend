import { Component, computed, inject, input, OnInit, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, NonNullableFormBuilder, Validators } from '@angular/forms';
import { Subject, catchError, debounceTime, distinctUntilChanged, of, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProjectsService } from '../../../../core/services/projects/projects.service';
import { ClientsService } from '../../../../core/services/clients/clients.service';
import { UsersService } from '../../../../core/services/users/users.service';
import { CrmButtonComponent } from '../../../../shared/components/crm-button/crm-button';
import { CrmDropdownComponent, CrmDropdownOptionComponent } from '../../../../shared/components/crm-dropdown';
import { Project, CreateProjectDto, UpdateProjectDto } from '../../../../core/models/project.model';
import { ProjectStatusEnum } from '../../../../core/enums/project-status.enum';
import { UserRoleEnum } from '../../../../core/enums/user-role.enum';
import { CrmValidators } from '../../../../core/validators/custom-validators';

@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CrmButtonComponent,
    CrmDropdownComponent,
    CrmDropdownOptionComponent
  ],
  templateUrl: './project-form.component.html',
  styleUrls: ['./project-form.component.scss']
})
export class ProjectFormComponent implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly projectsService = inject(ProjectsService);
  private readonly clientsService = inject(ClientsService);
  private readonly usersService = inject(UsersService);

  project = input<Project | null>(null);
  saved = output<void>();

  protected readonly isEditMode = computed(() => !!this.project());
  protected readonly formTitle = computed(() =>
    this.isEditMode() ? 'Edit Project' : 'Add New Project'
  );
  protected readonly formSubtitle = computed(() =>
    this.isEditMode()
      ? 'Update the project details below.'
      : 'Enter the details for the new project.'
  );
  protected readonly submitLabel = computed(() =>
    this.isEditMode() ? 'Save Changes' : 'Create Project'
  );
  protected readonly submittingLabel = computed(() =>
    this.isEditMode() ? 'Saving...' : 'Creating...'
  );

  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly clientSearchResults = signal<any[]>([]);
  protected readonly managerSearchResults = signal<any[]>([]);

  protected readonly selectedClientName = signal<string>('');
  protected readonly selectedManagerName = signal<string>('');

  private clientSearchSubject = new Subject<string>();
  private managerSearchSubject = new Subject<string>();

  protected readonly ProjectStatusEnum = ProjectStatusEnum;

  form = this.fb.group({
    name: ['', [CrmValidators.requiredNoWhitespace]],
    description: [''],
    status: [ProjectStatusEnum.PLANNING, Validators.required],
    clientId: ['', Validators.required],
    managerId: ['', Validators.required]
  });

  constructor() {
    this.clientSearchSubject.pipe(
      takeUntilDestroyed(),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => {
        if (!term.trim()) return of({ data: [] });
        return this.clientsService.getSearchPreview(term).pipe(
          catchError(() => of({ data: [] }))
        );
      })
    ).subscribe((res: any) => {
      const data = Array.isArray(res) ? res : (res?.data || []);
      this.clientSearchResults.set(data);
    });

    this.managerSearchSubject.pipe(
      takeUntilDestroyed(),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => {
        if (!term.trim()) return of([]);
        return this.usersService.getAvailableUsers(term, UserRoleEnum.MANAGER).pipe(
          catchError(() => of([]))
        );
      })
    ).subscribe((res: any) => {
      const data = Array.isArray(res) ? res : (res?.data || []);
      this.managerSearchResults.set(data);
    });
  }

  ngOnInit(): void {
    const p = this.project();
    if (p) {
      this.form.patchValue({
        name: p.name,
        description: p.description || '',
        status: p.status,
        clientId: p.client?.id || '',
        managerId: p.manager?.id || ''
      });
      this.selectedClientName.set(p.client?.companyName || '');
      this.selectedManagerName.set(p.manager?.fullName || '');
    }
  }

  protected onClientSearch(term: string): void {
    this.clientSearchSubject.next(term);
  }

  protected onManagerSearch(term: string): void {
    this.managerSearchSubject.next(term);
  }

  protected onClientSelected(clientId: string): void {
    this.form.patchValue({ clientId });
    const selected = this.clientSearchResults().find(c => c.id === clientId);
    if (selected) {
      this.selectedClientName.set(selected.companyName);
    }
  }

  protected onManagerSelected(managerId: string): void {
    this.form.patchValue({ managerId });
    const selected = this.managerSearchResults().find(u => u.id === managerId);
    if (selected) {
      this.selectedManagerName.set(`${selected.firstName} ${selected.lastName}`);
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const formValue = this.form.getRawValue();

    if (this.isEditMode()) {
      const dto: UpdateProjectDto = {
        name: formValue.name,
        description: formValue.description,
        status: formValue.status,
        clientId: formValue.clientId,
        managerId: formValue.managerId
      };
      this.projectsService.updateProject(this.project()!.id, dto).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.saved.emit();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.errorMessage.set(
            err.error?.message || 'An unexpected error occurred while saving.'
          );
        }
      });
    } else {
      const dto: CreateProjectDto = {
        name: formValue.name,
        description: formValue.description || undefined,
        status: formValue.status,
        clientId: formValue.clientId,
        managerId: formValue.managerId
      };
      this.projectsService.createProject(dto).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.form.reset({
            status: ProjectStatusEnum.PLANNING
          });
          this.selectedClientName.set('');
          this.selectedManagerName.set('');
          this.saved.emit();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.errorMessage.set(
            err.error?.message || 'An unexpected error occurred while creating.'
          );
        }
      });
    }
  }
}
