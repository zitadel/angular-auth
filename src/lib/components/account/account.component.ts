import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../auth/index.js';

/**
 * Standalone component (`zitadel-account`) that displays the authenticated
 * user's profile, or a prompt to sign in when unauthenticated. Typically guarded
 * by {@link authGuard}.
 *
 * @example
 * ```ts
 * import { Account } from '@zitadel/angular-auth';
 * import { authGuard } from '@zitadel/angular-auth';
 *
 * const routes = [
 *   { path: 'auth/account', component: Account, canActivate: [authGuard] },
 * ];
 * ```
 */
@Component({
  selector: 'zitadel-account',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    @if (isAuthenticated()) {
      <pre><code>{{ user() | json }}</code></pre>
    } @else {
      <p>
        You are not authenticated. Please <a routerLink="../signin">signin</a>.
      </p>
    }
  `,
  styles: ``,
})
export class Account {
  private readonly authService = inject(AuthService);

  readonly isAuthenticated = this.authService.isAuthenticated;
  readonly user = this.authService.user;
}
