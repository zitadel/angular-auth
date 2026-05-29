import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../auth/index.js';

/**
 * Standalone demo sign-in component (`zitadel-signin`) exposing buttons for the
 * various sign-in and sign-out flows offered by {@link AuthService}.
 *
 * @example
 * ```ts
 * import { SignIn } from '@zitadel/angular-auth';
 *
 * const routes = [{ path: 'auth/signin', component: SignIn }];
 * ```
 */
@Component({
  selector: 'zitadel-signin',
  standalone: true,
  imports: [RouterModule],
  template: `
    <main>
      <section>
        <nav>
          <button routerLink="/" routerLinkActive="active">Home</button>
          <button routerLink="../account" routerLinkActive="active">
            Account
          </button>
        </nav>
        <div>
          <h1>Authenticated: {{ isAuthenticated() }}</h1>
        </div>
        <nav>
          <button (click)="signinRedirect()">signinRedirect</button>
          <button (click)="signinSilent()">signinSilent</button>
          <button (click)="signinPopup()">signinPopup</button>
          <button (click)="signoutRedirect()">signoutRedirect</button>
          <button (click)="signoutPopup()">signoutPopup</button>
        </nav>
      </section>
    </main>
  `,
  styles: ``,
})
export class SignIn implements OnInit {
  private readonly authService = inject(AuthService);

  readonly isAuthenticated = this.authService.isAuthenticated;
  readonly user = this.authService.user;
  authGuardReturnUrl: string | null = null;

  signinRedirect(): void {
    void this.authService.signinRedirect();
  }

  signinSilent(): void {
    void this.authService.signinSilent();
  }

  signinPopup(): void {
    void this.authService.signinPopup();
  }

  signoutRedirect(): void {
    void this.authService.signoutRedirect();
  }

  signoutPopup(): void {
    void this.authService.signoutPopup();
  }

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.authGuardReturnUrl =
        this.authService.getAuthGuardInterceptedPathname();
    }
  }
}
