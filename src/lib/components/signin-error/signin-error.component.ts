import { Component, inject } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { AuthService } from '../../auth/index.js';

/**
 * Standalone component (`zitadel-signin-error`) that renders the current
 * authentication error captured by {@link AuthService.authError}.
 *
 * @example
 * ```ts
 * import { SignInError } from '@zitadel/angular-auth';
 *
 * const routes = [{ path: 'auth/error', component: SignInError }];
 * ```
 */
@Component({
  selector: 'zitadel-signin-error',
  standalone: true,
  imports: [JsonPipe],
  template: `<p>Sign-in error!</p>
    <pre><code>{{ authError() | json }}</code></pre> `,
  styles: ``,
})
export class SignInError {
  private readonly authService = inject(AuthService);
  readonly authError = this.authService.authError;
}
