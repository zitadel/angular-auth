import { Component, inject } from '@angular/core';
import { AuthService } from '@zitadel/angular-auth';

/**
 * Public landing page that shows the current authentication status (read from
 * {@link AuthService}'s signals) and lets the visitor start or end a session.
 */
@Component({
  selector: 'app-home',
  standalone: true,
  template: `
    <h2>Home</h2>
    <p>Authenticated: {{ isAuthenticated() ? 'yes' : 'no' }}</p>

    @if (isAuthenticated()) {
      <p>Signed in as {{ user()?.profile?.name ?? user()?.profile?.sub }}</p>
      <button (click)="logout()">Sign out (redirect)</button>
    } @else {
      <button (click)="loginRedirect()">Sign in (redirect)</button>
      <button (click)="loginPopup()">Sign in (popup)</button>
    }

    @if (authError()) {
      <p>Auth error — see the console for details.</p>
    }
  `,
})
export class HomeComponent {
  private readonly auth = inject(AuthService);

  readonly user = this.auth.user;
  readonly isAuthenticated = this.auth.isAuthenticated;
  readonly authError = this.auth.authError;

  loginRedirect(): void {
    void this.auth.signinRedirect();
  }

  loginPopup(): void {
    void this.auth.signinPopup();
  }

  logout(): void {
    void this.auth.signoutRedirect();
  }
}
