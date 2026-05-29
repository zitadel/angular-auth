---
title: Configuration
group: Application Side
children:
  - ./protecting-pages.md
  - ./session-access.md
---

# Configuration

The library is configured through the `provideZitadelAuth()` provider factory,
which accepts an `oidc-client-ts` `UserManagerSettings` object. Register it in
your application's providers (typically `app.config.ts` or directly in
`bootstrapApplication`).

## `provideZitadelAuth(config)`

`provideZitadelAuth()` returns the full set of providers needed to wire up
client-side OIDC. Internally it:

- registers the configuration under `OIDC_CONFIG_TOKEN`,
- provides the root `AuthService`,
- configures `HttpClient` via `provideHttpClient(withInterceptors([...]))` with
  the `authzTokenInterceptor`, and
- registers the pre-built `ZITADEL_ROUTES` with `provideRouter`.

```ts
// src/app/app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideZitadelAuth } from '@zitadel/angular-auth';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZitadelAuth({
      authority: 'https://your-zitadel-domain',
      client_id: 'your-client-id',
      redirect_uri: 'http://localhost:4200/auth/callback',
      post_logout_redirect_uri: 'http://localhost:4200/',
      scope: 'openid profile email',
    }),
  ],
};
```

`initOidc()` is an alias of `provideZitadelAuth()` for drop-in compatibility
with the upstream `@edgeflare/ngx-oidc` naming.

## `OIDC_CONFIG_TOKEN`

If you prefer to wire the providers yourself, provide the configuration under
`OIDC_CONFIG_TOKEN` directly. `AuthService` injects this token to build its
`UserManager`:

```ts
import { OIDC_CONFIG_TOKEN } from '@zitadel/angular-auth';

providers: [
  {
    provide: OIDC_CONFIG_TOKEN,
    useValue: {
      authority: 'https://your-zitadel-domain',
      client_id: 'your-client-id',
      redirect_uri: 'http://localhost:4200/auth/callback',
    },
  },
];
```

## Defaults — `applyOidcConfigDefaults` / `DEFAULT_OIDC_SCOPE`

When a configuration omits `scope`, the library applies `DEFAULT_OIDC_SCOPE`
(`'openid profile email'`). The pure helper `applyOidcConfigDefaults(config)`
returns a new settings object with this default filled in:

```ts
import { applyOidcConfigDefaults, DEFAULT_OIDC_SCOPE } from '@zitadel/angular-auth';

const settings = applyOidcConfigDefaults({
  authority: 'https://your-zitadel-domain',
  client_id: 'your-client-id',
  redirect_uri: 'http://localhost:4200/auth/callback',
});
// settings.scope === DEFAULT_OIDC_SCOPE
```

`AuthService` applies these defaults automatically and supplies a
`localStorage`-backed user store when one is not provided.

## Environment variables

In a typical Angular SPA the OIDC settings come from build-time environment
variables. Using an env plugin such as `@ngx-env/builder`, the values are
exposed on `import.meta.env` under the `NG_APP_` prefix:

```ts
provideZitadelAuth({
  authority: import.meta.env.NG_APP_ZITADEL_DOMAIN,
  client_id: import.meta.env.NG_APP_ZITADEL_CLIENT_ID,
  redirect_uri: import.meta.env.NG_APP_ZITADEL_REDIRECT_URI,
  post_logout_redirect_uri: import.meta.env.NG_APP_ZITADEL_POST_LOGOUT_REDIRECT_URI,
  scope: import.meta.env.NG_APP_ZITADEL_SCOPE,
});
```

Because every `NG_APP_ZITADEL_*` value is shipped to the browser, never place a
client secret there — the PKCE flow does not require one.
