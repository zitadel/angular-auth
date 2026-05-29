---
title: Protecting Pages
group: Application Side
---

# Protecting pages

Routes are protected with `authGuard`, a `CanActivateFn`. When the user is
authenticated it allows the navigation; otherwise it stores the intercepted URL
and triggers a redirect-based sign-in, denying the current navigation.

## Guarding a route

Add `authGuard` to a route's `canActivate` array:

```ts
import { Routes } from '@angular/router';
import { authGuard, ZITADEL_ROUTES } from '@zitadel/angular-auth';
import { ProfileComponent } from './profile.component';

export const routes: Routes = [
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [authGuard],
  },
  ...ZITADEL_ROUTES,
];
```

## How it works

When an unauthenticated user hits a guarded route, `authGuard`:

1. calls `setAuthGuardInterceptedPathname(state.url)` to remember where the user
   was heading,
2. calls `signinRedirect()` to start the PKCE login, and
3. returns `false` so the current navigation is cancelled.

After the callback completes you can read the stored path with
`AuthService.getAuthGuardInterceptedPathname()` (it defaults to `'/'`) to return
the user to their original destination.

## Lazy-loaded and child routes

`authGuard` works the same on lazily loaded routes via `canActivate` or
`canActivateChild`. Attach it to a parent route to gate an entire feature area.
