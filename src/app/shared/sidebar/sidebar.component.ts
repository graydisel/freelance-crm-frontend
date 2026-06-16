import {Component, inject, signal} from '@angular/core';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {AuthService} from '../../core/services/auth/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.sidebar.component.scss',
})
export class SidebarComponent {
  private readonly authService = inject(AuthService);

  protected readonly isMobileMenuOpen = signal(false);

  protected readonly isDesktopCollapsed = signal(false);
}
