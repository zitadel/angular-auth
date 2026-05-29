---
title: Components
group: Angular
---

# Components

The library ships five standalone components, all wired to `AuthService`. They
are the components mounted by `ZITADEL_ROUTES`, but you can also use them
directly by importing and referencing them in your own routes or templates.

| Export          | Selector                  | Purpose                                                              |
| --------------- | ------------------------- | -------------------------------------------------------------------- |
| `SignIn`        | `zitadel-signin`          | Interactive sign-in / sign-out buttons for every flow.               |
| `SignInCallback`| `zitadel-callback`        | Handles the sign-in redirect/popup callback.                         |
| `SignInError`   | `zitadel-error`           | Displays a sign-in error.                                            |
| `SignOutCallback`| `zitadel-signout-callback`| Handles the sign-out (end-session) callback.                        |
| `Account`       | `zitadel-account`         | Shows the authenticated user's claims, or a sign-in prompt.          |

## Using the bundled routes

The simplest path is to spread `ZITADEL_ROUTES`, which lazily loads each
component at the conventional path:

```ts
import { ZITADEL_ROUTES } from '@zitadel/angular-auth';

export const routes = [
  // ... your routes
  ...ZITADEL_ROUTES,
];
```

This mounts `auth/signin`, `auth/callback`, `auth/error`,
`auth/logout/callback` and `auth/account` (the last guarded by `authGuard`).

## Using a component directly

Because the components are standalone, you can import one into your own
component and reference it by selector:

```ts
import { Component } from '@angular/core';
import { Account } from '@zitadel/angular-auth';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [Account],
  template: `<zitadel-account />`,
})
export class ProfileComponent {}
```
