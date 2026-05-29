# Angular Auth

An [Angular](https://angular.dev/) integration that provides seamless
authentication for single-page applications using OpenID Connect with the
Authorization Code flow and PKCE, session management, and idiomatic Angular
standalone providers, signals, guards, and interceptors.

This integration brings the power and flexibility of OIDC to Angular
applications with full TypeScript support, built on top of
[`oidc-client-ts`](https://github.com/authts/oidc-client-ts), and an API
surface compatible with `@edgeflare/ngx-oidc`.

### Why?

Modern single-page applications require robust, secure, and flexible
authentication systems. Integrating OIDC and session management with an
Angular application requires careful consideration of the browser redirect
lifecycle, silent token renewal, and TypeScript integration.

However, a direct integration isn't always straightforward. Different types
of applications or deployment scenarios might warrant different approaches:

- **Browser Redirect Lifecycle:** OIDC sign-in operates through full browser
  navigations to the identity provider and back. A proper integration should
  detect the authorization response on return, complete the code exchange, and
  clean the authorization parameters from the URL automatically.
- **Reactive Auth State:** Angular components need to react to authentication
  state without boilerplate. The `AuthService` exposes `user`,
  `isAuthenticated`, and `authError` as signals suitable for template control
  flow.
- **Route Protection:** Many applications need to gate routes behind
  authentication. `authGuard` is a `CanActivateFn` that redirects
  unauthenticated users to sign in before a route activates.
- **Token Attachment:** Protected API calls need a bearer token. The
  `authzTokenInterceptor` attaches the current access token to outgoing
  `HttpClient` requests automatically.

This integration, `@zitadel/angular-auth`, aims to provide the flexibility to
handle such scenarios. It allows you to leverage the OIDC ecosystem while
maintaining Angular best practices, ultimately leading to a more effective and
less burdensome authentication implementation.

## Installation

Install using NPM by using the following command:

```sh
npm install @zitadel/angular-auth oidc-client-ts
```

## Usage

To use this integration, spread `provideZitadelAuth()` into your application
providers. It registers the `AuthService`, an `HttpClient` configured with the
bearer-token interceptor, and the pre-built `ZITADEL_ROUTES`.

```ts
// src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { provideZitadelAuth } from '@zitadel/angular-auth';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, {
  providers: [
    provideZitadelAuth({
      authority: 'https://example.zitadel.cloud',
      client_id: 'my-client-id',
      redirect_uri: 'http://localhost:4200/auth/callback',
      post_logout_redirect_uri: 'http://localhost:4200/',
      scope: 'openid profile email offline_access',
    }),
  ],
});
```

#### Using the Authentication System

The integration provides several injectables, functions, and components for
handling authentication:

**Core Utilities:**

- `provideZitadelAuth(config)` (alias `initOidc`): Registers the
  `AuthService`, the `authzTokenInterceptor`, and the `ZITADEL_ROUTES`
- `AuthService`: Exposes the `user`, `isAuthenticated`, and `authError`
  signals plus `signinRedirect`/`signinPopup`/`signinSilent`/`signoutRedirect`/
  `signoutPopup` and callback handlers
- `authGuard`: A `CanActivateFn` that redirects to sign-in when unauthenticated
- `authzTokenInterceptor`: An `HttpInterceptorFn` that attaches the bearer token
- `OIDC_CONFIG_TOKEN`: The `InjectionToken` carrying the OIDC configuration

**Bundled UI Components:**

- `SignIn`, `SignInCallback`, `SignInError`, `SignOutCallback`, `Account`
  (selectors `zitadel-signin`, `zitadel-signin-callback`,
  `zitadel-signin-error`, `zitadel-signout-callback`, `zitadel-account`)

**Bundled Routes:**

- `ZITADEL_ROUTES`: A ready-made `Route[]` under the `/auth` prefix
  (`auth/signin`, `auth/callback`, `auth/error`, `auth/logout/callback`,
  `auth/account` — the last guarded by `authGuard`)

**Basic Usage in a Component:**

```ts
import { Component, inject } from '@angular/core';
import { AuthService } from '@zitadel/angular-auth';

@Component({
  selector: 'app-nav',
  standalone: true,
  template: `
    @if (auth.isAuthenticated()) {
      <span>Hello {{ auth.user()?.profile?.sub }}</span>
      <button (click)="auth.signoutRedirect()">Log out</button>
    } @else {
      <button (click)="auth.signinRedirect()">Log in</button>
    }
  `,
})
export class NavComponent {
  protected readonly auth = inject(AuthService);
}
```

**Protecting a Route:**

```ts
import { Routes } from '@angular/router';
import { authGuard } from '@zitadel/angular-auth';

export const routes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard.component'),
    canActivate: [authGuard],
  },
];
```

##### Example: Advanced Configuration with Multiple Providers

`provideZitadelAuth()` mounts `ZITADEL_ROUTES` for you. When you maintain your
own router, you can instead compose the bundled routes alongside your
application routes:

```ts
// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { ZITADEL_ROUTES } from '@zitadel/angular-auth';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./home.component') },
  ...ZITADEL_ROUTES,
];
```

With the bundle mounted, configure your Zitadel application's redirect URIs to
`[origin]/auth/callback` and post-logout redirect to
`[origin]/auth/logout/callback`.

## Known Issues

- **Client-Side Only:** This integration runs entirely in the browser and
  performs the Authorization Code flow with PKCE. It does not require, and does
  not provide, a server-side session store.
- **Callback URLs:** Your Zitadel application must be configured with the
  correct redirect URI matching `redirect_uri` (e.g. `[origin]/auth/callback`)
  and post-logout redirect URI matching `post_logout_redirect_uri`.
- **TypeScript Version:** The Angular compiler does not yet support TypeScript
  6, so this package builds against TypeScript 5.8 (the rest of the toolchain
  and the Node 24 runtime are unchanged).
- **No Client Secret:** PKCE public clients must never be configured with a
  client secret; do not ship one in browser-exposed environment variables.

## Useful links

- **[oidc-client-ts](https://github.com/authts/oidc-client-ts):** The
  underlying OIDC client this integration builds on.
- **[Angular](https://angular.dev/):** The framework this integration targets.

## Contributing

If you have suggestions for how this integration could be improved, or
want to report a bug, open an issue — we'd love all and any contributions.

## License

Apache-2.0
