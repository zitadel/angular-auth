---
title: Session Access
group: Application Side
---

# Session access

`AuthService` is provided in the application root and publishes reactive state
through Angular signals. Inject it anywhere and read the signals directly — in
component classes or in templates.

## Reading the signals

```ts
import { Component, inject } from '@angular/core';
import { AuthService } from '@zitadel/angular-auth';

@Component({
  selector: 'app-status',
  standalone: true,
  template: `
    @if (isAuthenticated()) {
      <p>Signed in as {{ user()?.profile?.name }}</p>
    } @else {
      <button (click)="login()">Sign in</button>
    }
  `,
})
export class StatusComponent {
  private readonly auth = inject(AuthService);

  readonly user = this.auth.user;
  readonly isAuthenticated = this.auth.isAuthenticated;
  readonly authError = this.auth.authError;

  login(): void {
    void this.auth.signinRedirect();
  }
}
```

## Available signals

- `user()` — the current `oidc-client-ts` `User`, or `null` when signed out
  (and `undefined` before the first emission).
- `isAuthenticated()` — `true` when a non-expired user is present.
- `authError()` — the most recent authentication error, or `null`.

There is no separate `isLoading` signal; treat the brief `undefined` window of
`user()` before the first emission as the loading state, for example
`@if (user() === undefined) { ... loading ... }`.

## Reading the access token

The OIDC `User` carries the bearer token used for API calls:

```ts
const token = this.auth.user()?.access_token;
```

You rarely need to read the token by hand — the
[interceptor](../angular/interceptor.md) attaches it to outgoing `HttpClient`
requests automatically.

## Methods

`AuthService` also exposes the imperative flow methods: `signinRedirect`,
`signinPopup`, `signinSilent`, `signoutRedirect`, `signoutPopup`,
`signinCallback` and `signoutCallback`, plus `getUser()` and the underlying
`userManagerInstance` for advanced scenarios.
