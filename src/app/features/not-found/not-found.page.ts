import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
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
      void this.router.navigate(['/dashboard']);
    } else {
      void this.router.navigate(['/login']);
    }
  }

  goBack(): void {
    window.history.back();
  }
}
