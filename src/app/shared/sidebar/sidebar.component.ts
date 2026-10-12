import { Component, computed, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { navItems } from '../../core/routes/sidebar.route';
import { AuthStore } from '../../core/stores/auth.store';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'crm-sidebar',
    '[class.crm-sidebar--collapsed]': 'isDesktopCollapsed()',
  },
})
export class SidebarComponent {
  protected readonly authStore = inject(AuthStore);
  protected readonly router = inject(Router);

  protected readonly isMobileMenuOpen = signal(false);
  protected readonly isDesktopCollapsed = signal(false);

  protected readonly userDisplayName = computed(() => {
    const user = this.authStore.user();
    return user && user.profile ? `${user.profile.firstName} ${user.profile.lastName}` : 'Eleonora';
  });

  protected readonly userRole = computed(() => {
    const user = this.authStore.user();
    if (!user || !user.role) return 'Manager';
    return user.role
      .split('_')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ');
  });

  protected readonly filteredNavItems = computed(() => {
    if (this.authStore.isDeveloper()) {
      return this.navItems.filter(
        (item) => item.route === '/projects' && this.authStore.hasPermission('projects:read'),
      );
    }

    return this.navItems.filter((item) => {
      if (item.route === '/dashboard') {
        return this.authStore.canViewAnalytics();
      }
      if (item.route === '/clients') {
        return this.authStore.canManageClients();
      }
      if (item.route === '/projects') {
        return this.authStore.hasPermission('projects:read');
      }
      return false;
    });
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
    this.authStore.logout();
  }

  protected readonly navItems = navItems;
}
