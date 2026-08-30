import {
  Component,
  inject,
  output,
  signal,
  DestroyRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, NonNullableFormBuilder, Validators } from '@angular/forms';
import { ClientsService } from '../../../../core/services/clients/clients.service';
import { CrmButtonComponent } from '../../../../shared/components/crm-button/crm-button';
import { ClientStatusEnum } from '../../../../core/enums/client-status.enum';
import { CreateClientDto } from '../../../../core/models/client.model';
import { CrmValidators } from '../../../../core/validators/custom-validators';
import { NgxMaskDirective } from 'ngx-mask';
import {
  CrmDropdownComponent,
  CrmDropdownOptionComponent,
} from '../../../../shared/components/crm-dropdown';
import { Subject, catchError, debounceTime, distinctUntilChanged, of, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UsersService } from '../../../../core/services/users/users.service';
import { UserRoleEnum } from '../../../../core/enums/user-role.enum';

@Component({
  selector: 'app-client-create-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CrmButtonComponent,
    NgxMaskDirective,
    CrmDropdownComponent,
    CrmDropdownOptionComponent,
  ],
  templateUrl: './client-create-form.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./client-create-form.component.scss'],
})
export class ClientCreateFormComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly clientsService = inject(ClientsService);
  private readonly usersService = inject(UsersService);
  private readonly destroyRef = inject(DestroyRef);

  saved = output<void>();
  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);

  searchResults = signal<any[]>([]);
  private searchSubject = new Subject<string>();

  constructor() {
    this.searchSubject
      .pipe(
        takeUntilDestroyed(),
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((term) => {
          if (!term.trim()) return of([]);
          return this.usersService
            .getAvailableUsers(term, UserRoleEnum.CLIENT)
            .pipe(catchError(() => of([])));
        }),
      )
      .subscribe((res: any) => {
        this.searchResults.set(Array.isArray(res) ? res : res?.data || []);
      });

    this.form
      .get('contactPerson')
      ?.valueChanges.pipe(takeUntilDestroyed())
      .subscribe((fullName) => {
        if (fullName) {
          const selectedUser = this.searchResults().find(
            (user) => `${user.profile.firstName} ${user.profile.lastName}` === fullName,
          );
          if (selectedUser) {
            this.form.patchValue({ contactEmail: selectedUser.email });
          }
        }
      });
  }

  onContactSearch(term: string) {
    this.searchSubject.next(term);
  }

  form = this.fb.group({
    companyName: ['', [CrmValidators.requiredNoWhitespace]],
    contractValue: [0, [Validators.required, Validators.min(0)]],
    contactPerson: ['', [CrmValidators.requiredNoWhitespace]],
    contactEmail: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required]],
    status: [ClientStatusEnum.LEAD, Validators.required],
  });

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const dto: CreateClientDto = {
      ...this.form.getRawValue(),
      contractValue: Number(this.form.controls.contractValue.value) || 0,
    };

    this.clientsService
      .createClient(dto)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.form.reset({ status: ClientStatusEnum.LEAD, contractValue: 0 });
          this.saved.emit();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          if (err.status === 409 || err?.error?.statusCode === 409) {
            this.errorMessage.set(
              err.error?.message || 'This email is already taken by another company.',
            );
          } else {
            this.errorMessage.set('An unexpected error occurred while saving.');
          }
        },
      });
  }
}
