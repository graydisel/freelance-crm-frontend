import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth/auth.service';
import { Router } from '@angular/router';
import {CrmButtonComponent} from '../../../shared/components/crm-button/crm-button';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CrmButtonComponent],
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss',
})
export class LoginPage {
  protected readonly fb = inject(NonNullableFormBuilder);
  protected readonly authService = inject(AuthService);
  protected readonly router = inject(Router);

  isLoading = signal(false);
  errorMessage = '';

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage = '';

    const { email, password } = this.loginForm.getRawValue();

    this.authService.login(email, password).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.isLoading.set(false);
        if (error.status === 0) {
          this.errorMessage = 'No access to the server. Please try again';
        } else {
          this.errorMessage = error.error?.message || 'Authorization error';
        }

        console.error('Error details:', error);
      },
    });
  }
}
