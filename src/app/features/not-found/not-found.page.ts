import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { AuthService } from '../../core/services/auth/auth.service';
import { Router } from '@angular/router';
import { AuthStore } from '../../core/stores/auth.store';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [],
  templateUrl: './not-found.page.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './not-found.page.scss',
})
export class NotFoundPage {
  private readonly router = inject(Router);
  private readonly authStore = inject(AuthStore);

  goHome(): void {
    if (this.authStore.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  goBack(): void {
    window.history.back();
  }
}
