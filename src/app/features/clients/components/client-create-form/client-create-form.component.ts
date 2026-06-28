import { Component, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, NonNullableFormBuilder, Validators } from '@angular/forms';
import { ClientsService } from '../../../../core/services/clients/clients.service';
import { CrmButtonComponent } from '../../../../shared/components/crm-button/crm-button';
import { ClientStatusEnum } from '../../../../core/enums/client-status.enum';
import { CreateClientDto } from '../../../../core/models/client.model';

@Component({
  selector: 'app-client-create-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CrmButtonComponent],
  templateUrl: './client-create-form.component.html',
  styleUrls: ['./client-create-form.component.scss']
})
export class ClientCreateFormComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly clientsService = inject(ClientsService);

  saved = output<void>();
  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);

  form = this.fb.group({
    companyName: ['', Validators.required],
    contractValue: [0, [Validators.required, Validators.min(0)]],
    contactPerson: ['', Validators.required],
    contactEmail: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    status: [ClientStatusEnum.LEAD, Validators.required]
  });

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const dto: CreateClientDto = {
      ...this.form.getRawValue(),
      contractValue: Number(this.form.controls.contractValue.value) || 0
    };

    this.clientsService.createClient(dto).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.form.reset({ status: ClientStatusEnum.LEAD, contractValue: 0 });
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
