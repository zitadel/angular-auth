import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/index.js';

/**
 * Standalone component (`zitadel-signout-callback`) that completes the OIDC
 * sign-out redirect by invoking {@link AuthService.signoutCallback} and then
 * navigating back to the application root.
 *
 * @example
 * ```ts
 * import { SignOutCallback } from '@zitadel/angular-auth';
 *
 * const routes = [{ path: 'auth/logout/callback', component: SignOutCallback }];
 * ```
 */
@Component({
  selector: 'zitadel-signout-callback',
  standalone: true,
  imports: [],
  template: `<p>Sign-out complete. Redirecting...</p>`,
  styles: ``,
})
export class SignOutCallback implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  async ngOnInit(): Promise<void> {
    await this.authService.signoutCallback();
    await this.router.navigate(['/']);
  }
}
