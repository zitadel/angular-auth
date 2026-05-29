---
title: Silent Renew
group: Advanced
---

# Silent renew

A browser SPA cannot safely store a long-lived refresh token, so access tokens
are short-lived. **Silent renew** keeps the session alive by transparently
obtaining a fresh token in a hidden iframe before the current one expires,
using the existing ZITADEL session.

## Enabling automatic renewal

Silent renew is driven by `oidc-client-ts`. Enable it through the
`UserManagerSettings` you pass to `provideZitadelAuth()`:

```ts
provideZitadelAuth({
  authority: import.meta.env.NG_APP_ZITADEL_DOMAIN,
  client_id: import.meta.env.NG_APP_ZITADEL_CLIENT_ID,
  redirect_uri: import.meta.env.NG_APP_ZITADEL_REDIRECT_URI,
  post_logout_redirect_uri:
    import.meta.env.NG_APP_ZITADEL_POST_LOGOUT_REDIRECT_URI,
  // Silent renew settings
  automaticSilentRenew: true,
  silent_redirect_uri: 'http://localhost:4200/auth/callback',
  accessTokenExpiringNotificationTimeInSeconds: 60,
});
```

With `automaticSilentRenew: true`, the underlying `UserManager` performs the
renewal in the background and emits a fresh `User`, which `AuthService`
republishes through the `user()` signal. Components reading the signal — and the
[HTTP interceptor](../angular/interceptor.md) — pick up the new token
automatically.

## Triggering renewal manually

You can also renew on demand, for example on window focus:

```ts
import { inject } from '@angular/core';
import { AuthService } from '@zitadel/angular-auth';

const auth = inject(AuthService);
const user = await auth.signinSilent();
```

## Handling renewal errors

When a silent renew fails (for example because the ZITADEL session has ended),
`AuthService` records the error on the `authError()` signal and logs it. Watch
that signal to prompt the user to sign in again:

```ts
import { effect, inject } from '@angular/core';
import { AuthService } from '@zitadel/angular-auth';

const auth = inject(AuthService);
effect(() => {
  if (auth.authError()) {
    void auth.signinRedirect();
  }
});
```

## ZITADEL configuration

For silent renew to work, the `silent_redirect_uri` must be registered as a
**Redirect URI** in your ZITADEL application, and third-party iframe cookies
must be permitted by the browser. Where iframe-based renewal is blocked, fall
back to a redirect-based `signinRedirect()`.
