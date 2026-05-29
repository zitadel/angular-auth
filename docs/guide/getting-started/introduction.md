---
title: Introduction
group: Getting Started
children:
  - ./installation.md
---

# Introduction

`@zitadel/angular-auth` is an open source library that provides client-side
authentication for Angular single-page applications. It wraps
[`oidc-client-ts`](https://github.com/authts/oidc-client-ts) to bring the
OpenID Connect **Authorization Code Flow with PKCE** to Angular with a native,
signal-based developer experience.

Because the entire flow runs in the browser, there is no server component, no
session cookie and no client secret. The library exposes a small set of
Angular providers, a root-provided service, an `HttpClient` interceptor and a
route guard so you can wire authentication into a standalone Angular app with a
single `provideZitadelAuth()` call.

## Features

### Authentication

- Authorization Code Flow with **PKCE** for public clients
- Redirect, popup and silent (iframe) sign-in
- Redirect and popup sign-out, including the ZITADEL end-session flow
- Automatic callback handling for both sign-in and sign-out

### Application-side session management

- Reactive state through Angular signals: `user()`, `isAuthenticated()` and
  `authError()`
- Direct access to the OIDC `User` (including `access_token` and `profile`)
- Full TypeScript support for every method and signal

### Application protection

- `authGuard` `CanActivateFn` to protect any route
- `authzTokenInterceptor` that attaches the bearer token to outgoing
  `HttpClient` requests
- Pre-built `ZITADEL_ROUTES` for sign-in, callback, error, logout-callback and
  account pages
