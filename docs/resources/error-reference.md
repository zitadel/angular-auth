---
title: Error Reference
group: Resources
---

# Errors and warnings

This page lists the common errors surfaced by `@zitadel/angular-auth` and the
underlying `oidc-client-ts`, what each means and how to resolve it. Runtime
errors are recorded on the `authError()` signal of `AuthService` and logged to
the console.

## Sign-in callback errors

When the sign-in callback fails, `AuthService.signinCallback()` records the
error on `authError()`, navigates to `/auth/error` and re-throws. The most
common causes are:

### `No matching state found in storage`

The callback ran without the matching PKCE state — usually because the user
opened the callback URL directly, the sign-in was started in a different tab, or
storage was cleared mid-flow. Start the flow again with `signinRedirect()`.

### `redirect_uri` mismatch

ZITADEL returns an error when the `redirect_uri` sent during sign-in does not
exactly match a **Redirect URI** registered on the application. Ensure the
`redirect_uri` in your configuration and the URL in the ZITADEL console match
character-for-character (scheme, host, port and path).

## Silent renew errors

When `automaticSilentRenew` is enabled and a renewal fails, the error is
recorded on `authError()`. Typical causes:

- The ZITADEL session ended, so no fresh token can be issued silently — prompt
  the user to sign in again with `signinRedirect()`.
- The browser blocked the renewal iframe's third-party cookies — fall back to a
  redirect-based sign-in. See [Silent Renew](../guide/advanced/silent-renew.md).

## Token not attached to requests

If outgoing `HttpClient` requests are missing the `Authorization` header,
confirm that:

- the request is made through the `HttpClient` configured by
  `provideZitadelAuth()` (or a client that includes `authzTokenInterceptor`),
  and
- `isAuthenticated()` is `true` at the time of the request.

The interceptor only attaches the token when the user is authenticated. See the
[HTTP Interceptor](../guide/angular/interceptor.md) guide.

## Routes 404 on reload

A reload of `/auth/callback` or another client-side route returning a 404 means
the static host is not falling back to `index.html`. Configure a history
fallback as described in [Hosting](../guide/advanced/hosting.md).
