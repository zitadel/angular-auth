# Angular SPA with ZITADEL

[Angular](https://angular.dev/) is a TypeScript-first framework for building
single-page applications. This example shows how to add ZITADEL authentication
to a standalone Angular app using [`@zitadel/angular-auth`](../), a thin,
signal-based wrapper around [`oidc-client-ts`](https://github.com/authts/oidc-client-ts).

Authentication runs **entirely in the browser** using the **OpenID Connect
(OIDC) Authorization Code Flow with PKCE** — the industry best practice for
public clients. There is no backend, no session cookie and no client secret;
the SPA talks directly to ZITADEL and stores tokens in the browser. You can
learn more in the [guide to OAuth 2.0 recommended flows](https://zitadel.com/docs/guides/integrate/login/oidc/oauth-recommended-flows).

This example consumes the sibling library directly via a `file:..` dependency
(`"@zitadel/angular-auth": "file:.."`), so it exercises the real published
package — including its `ngc` partial-Ivy output — through a production AOT
build.

## Example Application

The app demonstrates a typical SPA authentication pattern: visitors start on a
public home page, sign in against ZITADEL (redirect or popup), and are returned
to a protected `/profile` page that displays their OIDC claims. An `/api-demo`
page makes an authenticated `HttpClient` request whose bearer token is attached
automatically by the library's HTTP interceptor. Sign-out clears the local
session and ends the ZITADEL session.

### Prerequisites

#### System Requirements

- Node.js v24 or later (see `.nvmrc`); [devbox](https://www.jetify.com/devbox)
  is used to pin the toolchain.
- npm

#### Account Setup

You need a ZITADEL account and an application configured for a single-page app.
Create an **Application** of type **User Agent** (SPA) with the **PKCE**
authentication method. Follow the
[ZITADEL docs on creating applications](https://zitadel.com/docs/guides/integrate/login/oidc/web-app).

> **Important:** Configure these URLs on your ZITADEL application:
>
> - **Redirect URIs:** `http://localhost:4200/auth/callback`
> - **Post Logout Redirect URIs:** `http://localhost:4200/auth/logout/callback`
>
> They must match exactly what the app uses. Add your production URLs too.

### Configuration

Copy `.env.example` to `.env` and fill in your ZITADEL values. Every variable
uses the `NG_APP_` prefix so that [`@ngx-env/builder`](https://github.com/chihab/dotenv-run/tree/main/packages/angular)
exposes it to the browser bundle on `import.meta.env`. Because these values ship
to the client, **none of them are secret** — a PKCE public client does not use a
client secret.

```dotenv
# OIDC `authority` — your ZITADEL instance domain.
NG_APP_ZITADEL_DOMAIN="https://your-zitadel-domain"

# The Client ID of your ZITADEL SPA application.
NG_APP_ZITADEL_CLIENT_ID="your-zitadel-application-client-id"

# Where ZITADEL redirects back after login (must be a registered Redirect URI).
NG_APP_ZITADEL_REDIRECT_URI="http://localhost:4200/auth/callback"

# Where ZITADEL redirects after logout (must be a registered Post Logout URI).
NG_APP_ZITADEL_POST_LOGOUT_REDIRECT_URI="http://localhost:4200/auth/logout/callback"

# Requested OIDC scopes.
NG_APP_ZITADEL_SCOPE="openid profile email"
```

### Installation and Running

```bash
# 1. Install dependencies (resolves @zitadel/angular-auth from the parent dir)
devbox run -- npm install

# 2. Start the dev server
devbox run -- npm start
# or
make start
```

The app runs at `http://localhost:4200`.

To produce a production AOT build:

```bash
devbox run -- npm run build
```

## How it works

`src/main.ts` bootstraps the app with `provideZitadelAuth(...)`, reading the
`NG_APP_ZITADEL_*` values, and merges the app's own routes with the library's
`ZITADEL_ROUTES`:

```ts
bootstrapApplication(AppComponent, {
  providers: [
    provideZitadelAuth({
      authority: import.meta.env.NG_APP_ZITADEL_DOMAIN,
      client_id: import.meta.env.NG_APP_ZITADEL_CLIENT_ID,
      redirect_uri: import.meta.env.NG_APP_ZITADEL_REDIRECT_URI,
      post_logout_redirect_uri: import.meta.env
        .NG_APP_ZITADEL_POST_LOGOUT_REDIRECT_URI,
      scope: import.meta.env.NG_APP_ZITADEL_SCOPE,
    }),
    provideRouter([...routes, ...ZITADEL_ROUTES]),
  ],
});
```

- **Home** (`/`) reads `AuthService` signals (`user()`, `isAuthenticated()`,
  `authError()`) and triggers sign-in/out.
- **Profile** (`/profile`) is protected by `authGuard` and renders `user()` claims.
- **API demo** (`/api-demo`) uses `HttpClient`; the `authzTokenInterceptor`
  registered by `provideZitadelAuth()` attaches the bearer token.
- **Auth routes** (`/auth/callback`, `/auth/logout/callback`, …) come from
  `ZITADEL_ROUTES`.

## Resources

- **Angular Documentation:** <https://angular.dev/>
- **oidc-client-ts:** <https://github.com/authts/oidc-client-ts>
- **ZITADEL Documentation:** <https://zitadel.com/docs>
