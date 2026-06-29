import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClientProfile, UpdateClientDto } from '../../../../core/models/client.model';
import { ClientsService } from '../../../../core/services/clients/clients.service';
import { CrmAvatarComponent } from '../../../../shared/components/crm-avatar/crm-avatar.component';
import { CrmStatusBadgeComponent } from '../../../../shared/components/crm-status-badge/crm-status-badge.component';
import { CrmButtonComponent } from '../../../../shared/components/crm-button/crm-button';
import { ClientStatusEnum } from '../../../../core/enums/client-status.enum';
import { RouterLink } from '@angular/router';
import { CrmValidators } from '../../../../core/validators/custom-validators';
import { NgxMaskDirective } from 'ngx-mask';

@Component({
  selector: 'app-client-details',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CurrencyPipe,
    CrmAvatarComponent,
    CrmStatusBadgeComponent,
    CrmButtonComponent,
    RouterLink,
    NgxMaskDirective
  ],
  templateUrl: './client-details.component.html',
  styleUrls: ['./client-details.component.scss']
})
export class ClientDetailsComponent {
  clientId = input.required<string>();
  saved = output<void>();

  isEditMode = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  private clientsService = inject(ClientsService);
  private fb = inject(NonNullableFormBuilder);

  client = signal<ClientProfile | null>(null);

  companyInitials = computed(() => {
    const c = this.client();
    if (!c || !c.companyName) return '?';
    const words = c.companyName.trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return c.companyName.substring(0, 2).toUpperCase();
  });

  editForm = this.fb.group({
    companyName: ['', [CrmValidators.requiredNoWhitespace]],
    contactPerson: ['', [CrmValidators.requiredNoWhitespace]],
    contactEmail: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required]],
    contractValue: [0, [Validators.required, Validators.min(0)]],
    status: [ClientStatusEnum.LEAD, Validators.required]
  });

  statusOptions = Object.values(ClientStatusEnum);

  constructor() {
    this.editForm.valueChanges.subscribe(() => {
      if (this.errorMessage()) {
        this.errorMessage.set(null);
      }
    });

    effect(() => {
      const id = this.clientId();
      if (id) {
        this.loadClient(id);
      }
    });
  }

  private loadClient(id: string) {
    this.isLoading.set(true);
    this.clientsService.getClient(id).subscribe({
      next: (data) => {
        this.client.set(data);
        this.resetForm();
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  toggleEditMode() {
    this.isEditMode.set(!this.isEditMode());
    this.errorMessage.set(null);
    if (!this.isEditMode()) {
      this.resetForm();
    }
  }

  resetForm() {
    const c = this.client();
    if (c) {
      this.editForm.patchValue({
        companyName: c.companyName,
        contactPerson: c.contactPerson,
        contactEmail: c.contactEmail,
        phone: c.phone || '',
        contractValue: c.contractValue || 0,
        status: c.status
      });
    }
  }

  onSubmit() {
    if (this.editForm.invalid || !this.client() || this.isSubmitting()) return;

    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    const dto: UpdateClientDto = {
      ...this.editForm.getRawValue(),
      contractValue: Number(this.editForm.controls.contractValue.value) || 0
    };

    this.clientsService.updateClient(this.client()!.id, dto).subscribe({
      next: (updatedClient) => {
        this.client.set(updatedClient);
        this.isSubmitting.set(false);
        this.isEditMode.set(false);
        this.saved.emit();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        if (err.status === 409 || err?.error?.statusCode === 409) {
          this.errorMessage.set(err.error?.message || 'This email is already taken by another company.');
        } else {
          this.errorMessage.set('An unexpected error occurred while saving.');
        }
      }
    });
  }
}
