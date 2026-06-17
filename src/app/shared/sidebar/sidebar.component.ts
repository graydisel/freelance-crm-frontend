import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth/auth.service';

interface NavItem {
  label: string;
  route: string;
  icon: 'dashboard' | 'clients' | 'projects' | 'tasks';
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  host: {
    class: 'crm-sidebar',
    '[class.crm-sidebar--collapsed]': 'isDesktopCollapsed()',
  },
})
export class SidebarComponent {
  private readonly authService = inject(AuthService);
  protected readonly router = inject(Router);

  protected readonly isMobileMenuOpen = signal(false);
  protected readonly isDesktopCollapsed = signal(false);

  protected readonly navItems: NavItem[] = [
    { label: 'Dashboard', route: '/dashboard', icon: 'dashboard' },
    { label: 'Clients', route: '/clients', icon: 'clients' },
    { label: 'Projects', route: '/projects', icon: 'projects' },
    { label: 'Tasks', route: '/tasks', icon: 'tasks' },
  ];

  protected readonly userDisplayName = computed(() => {
    const user = this.authService.currentUser();
    return user ? `${user.firstName} ${user.lastName}` : 'Elena Smirnova';
  });

  protected readonly userRole = computed(() => {
    const user = this.authService.currentUser();
    if (!user || !user.role) return 'Manager';
    return user.role.charAt(0).toUpperCase() + user.role.slice(1);
  });

  protected toggleMobileMenu(): void {
    this.isMobileMenuOpen.update((open) => !open);
  }

  protected toggleDesktopSidebar(): void {
    this.isDesktopCollapsed.update((collapsed) => !collapsed);
  }

  protected closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  protected logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
