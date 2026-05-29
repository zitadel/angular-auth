---
title: Quick Start
group: Angular
children:
  - ./components.md
  - ./interceptor.md
  - ./api-calls.md
---

# Quick Start

This guide wires `@zitadel/angular-auth` into a standalone Angular application
end to end: bootstrap, routes, a protected page and a sign-in button.

## 1. Bootstrap with `provideZitadelAuth`

```ts
// src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { provideZitadelAuth } from '@zitadel/angular-auth';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, {
  providers: [
    provideZitadelAuth({
      authority: import.meta.env.NG_APP_ZITADEL_DOMAIN,
      client_id: import.meta.env.NG_APP_ZITADEL_CLIENT_ID,
      redirect_uri: import.meta.env.NG_APP_ZITADEL_REDIRECT_URI,
      post_logout_redirect_uri:
        import.meta.env.NG_APP_ZITADEL_POST_LOGOUT_REDIRECT_URI,
      scope: import.meta.env.NG_APP_ZITADEL_SCOPE,
    }),
  ],
});
```

`provideZitadelAuth()` already calls `provideRouter(ZITADEL_ROUTES)` for the
auth routes. To add your own application routes alongside them, spread
`ZITADEL_ROUTES` into a single route array and pass it to `provideRouter`
yourself (omit the router from `provideZitadelAuth` is not required — Angular
merges router providers):

```ts
// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { authGuard, ZITADEL_ROUTES } from '@zitadel/angular-auth';
import { HomeComponent } from './home.component';
import { ProfileComponent } from './profile.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  ...ZITADEL_ROUTES,
];
```

## 2. Trigger sign-in

Inject `AuthService` and call a sign-in method from a component:

```ts
import { Component, inject } from '@angular/core';
import { AuthService } from '@zitadel/angular-auth';

@Component({
  selector: 'app-home',
  standalone: true,
  template: `
    @if (isAuthenticated()) {
      <p>Welcome, {{ user()?.profile?.name }}</p>
      <button (click)="logout()">Sign out</button>
    } @else {
      <button (click)="login()">Sign in</button>
    }
  `,
})
export class HomeComponent {
  private readonly auth = inject(AuthService);
  readonly user = this.auth.user;
  readonly isAuthenticated = this.auth.isAuthenticated;

  login(): void {
    void this.auth.signinRedirect();
  }

  logout(): void {
    void this.auth.signoutRedirect();
  }
}
```

## 3. Protected route

The `profile` route above is gated by `authGuard`. Unauthenticated visitors are
redirected into the PKCE sign-in and returned afterwards. See
[Protecting Pages](../application-side/protecting-pages.md).

## 4. Callbacks

The pre-built `ZITADEL_ROUTES` already mount `auth/callback` and
`auth/logout/callback`, so the redirect responses are handled for you. Register
the matching **Redirect URI** (`/auth/callback`) and **Post Logout Redirect
URI** (`/auth/logout/callback`) in your ZITADEL application.
