import { Directive, TemplateRef, ViewContainerRef, inject, input, effect } from '@angular/core';
import { AuthStore } from '../../core/stores/auth.store';

@Directive({
  selector: '[hasPermission]',
  standalone: true,
})
export class HasPermissionDirective {
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly authStore = inject(AuthStore);

  readonly hasPermission = input.required<string | string[]>();

  private hasView = false;

  constructor() {
    effect(() => {
      const permissionValue = this.hasPermission();
      let isGranted = false;

      if (Array.isArray(permissionValue)) {
        isGranted = this.authStore.hasAnyPermission(permissionValue);
      } else if (typeof permissionValue === 'string') {
        isGranted = this.authStore.hasPermission(permissionValue);
      }

      if (isGranted && !this.hasView) {
        this.viewContainer.createEmbeddedView(this.templateRef);
        this.hasView = true;
      } else if (!isGranted && this.hasView) {
        this.viewContainer.clear();
        this.hasView = false;
      }
    });
  }
}
