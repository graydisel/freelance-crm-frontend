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
  changeDetection: ChangeDetectionStrategy.Eager,
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
    this.authStore.logout();
  }

  protected readonly navItems = navItems;
}
