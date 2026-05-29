import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/index.js';

/**
 * Standalone component (`zitadel-signin-callback`) that completes the OIDC
 * sign-in redirect by invoking {@link AuthService.signinCallback} and then
 * navigating back to the originally intercepted route.
 *
 * @example
 * ```ts
 * import { SignInCallback } from '@zitadel/angular-auth';
 *
 * const routes = [{ path: 'auth/callback', component: SignInCallback }];
 * ```
 */
@Component({
  selector: 'zitadel-signin-callback',
  standalone: true,
  imports: [],
  template: `<p>Login successful! Redirecting...</p>`,
  styles: ``,
})
export class SignInCallback implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  async ngOnInit(): Promise<void> {
    await this.authService.signinCallback();
    await this.router.navigate([
      this.authService.getAuthGuardInterceptedPathname(),
    ]);
  }
}
