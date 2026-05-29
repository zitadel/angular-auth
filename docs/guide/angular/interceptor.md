---
title: HTTP Interceptor
group: Angular
---

# HTTP interceptor

`authzTokenInterceptor` is an Angular `HttpInterceptorFn` that attaches the
authenticated user's bearer access token to outgoing requests as an
`Authorization: Bearer <token>` header. When the user is not authenticated, the
request is forwarded unchanged.

## Automatic registration

`provideZitadelAuth()` already registers the interceptor for you via
`provideHttpClient(withFetch(), withInterceptors([authzTokenInterceptor]))`, so
in most apps there is nothing to do — every `HttpClient` request made through
the configured client carries the token automatically.

## Manual registration

If you configure `HttpClient` yourself (for example to add your own
interceptors), include `authzTokenInterceptor` in the chain:

```ts
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { authzTokenInterceptor } from '@zitadel/angular-auth';

providers: [
  provideHttpClient(
    withFetch(),
    withInterceptors([authzTokenInterceptor /*, yourOtherInterceptor */]),
  ),
];
```

## How it works

The interceptor injects `AuthService` and checks `isAuthenticated()`. When
`true`, it clones the request and sets the `Authorization` header from
`user()?.access_token`. The token therefore stays in sync with the current
session signal — when the user signs out, requests revert to being sent without
the header.

See [Making API calls](./api-calls.md) for a request example.
