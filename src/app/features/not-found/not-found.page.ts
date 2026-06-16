import {Component, inject} from '@angular/core';
import {AuthService} from '../../core/services/auth/auth.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [],
  templateUrl: './not-found.page.html',
})
export class NotFoundPage {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  goHome(): void {
    if (this.authService.isAuthenticated) {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  goBack(): void {
    window.history.back();
  }
}
