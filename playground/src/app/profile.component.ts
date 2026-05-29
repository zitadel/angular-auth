import { JsonPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AuthService } from '@zitadel/angular-auth';

/**
 * Protected page (guarded by `authGuard` in the route config) that renders the
 * authenticated user's OIDC profile claims.
 */
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [JsonPipe],
  template: `
    <h2>Profile</h2>
    @if (user()) {
      <h3>Claims</h3>
      <pre>{{ user()?.profile | json }}</pre>
    } @else {
      <p>Loading profile…</p>
    }
  `,
})
export class ProfileComponent {
  private readonly auth = inject(AuthService);
  readonly user = this.auth.user;
}
