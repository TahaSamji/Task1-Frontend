// src/app/directives/has-role.directive.ts
import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthService } from '../features/auth/auth.service';

@Directive({
  selector: '[hasRole]',
  standalone: true // 👈 standalone directive
})
export class HasRoleDirective {
  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private authService: AuthService
  ) {}

  @Input() set hasRole(expectedRole: string | string[]) {
    const userRole = this.authService.getRole();
    const rolesToCheck = Array.isArray(expectedRole) ? expectedRole : [expectedRole];

    this.viewContainer.clear();
    if (rolesToCheck.includes(userRole!)) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    }
  }
}
