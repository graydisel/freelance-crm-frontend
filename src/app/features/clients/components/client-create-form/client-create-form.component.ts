import { Component, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, NonNullableFormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { CrmButtonComponent } from '../../../../shared/components/crm-button/crm-button';

@Component({
  selector: 'app-client-create-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CrmButtonComponent],
  templateUrl: './client-create-form.component.html',
  styleUrls: ['./client-create-form.component.scss']
})
export class ClientCreateFormComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly http = inject(HttpClient);

  saved = output<void>();
  isSubmitting = signal(false);

  form = this.fb.group({
    companyName: ['', Validators.required],
    contractValue: [0, [Validators.required, Validators.min(0)]],
    contactPerson: ['', Validators.required],
    contactEmail: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    status: ['lead', Validators.required]
  });

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const dto = this.form.getRawValue();

    this.http.post(`${environment.apiUrl}/client`, dto).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.form.reset({ status: 'lead', contractValue: 0 });
        this.saved.emit();
      },
      error: (err) => {
        console.error('Error creating client:', err);
        this.isSubmitting.set(false);
      }
    });
  }
}
