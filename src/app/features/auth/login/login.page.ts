import { Component, inject, DestroyRef, ChangeDetectionStrategy } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CrmButtonComponent } from '../../../shared/components/crm-button/crm-button';
import { AuthStore } from '../../../core/stores/auth.store';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CrmButtonComponent],
  templateUrl: './login.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './login.page.scss',
})
export class LoginPage {
  protected readonly fb = inject(NonNullableFormBuilder);
  protected readonly router = inject(Router);
  protected readonly authStore = inject(AuthStore);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.authStore.login(this.loginForm.getRawValue());
  }
}
