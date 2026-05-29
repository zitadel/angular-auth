import { Route } from '@angular/router';
import { authGuard } from './auth/index.js';

/**
 * Pre-built Angular routes for the Zitadel auth flows, mounted under the
 * `auth/` prefix:
 *
 * - `auth/signin` — interactive sign-in component ({@link SignIn})
 * - `auth/callback` — sign-in redirect callback ({@link SignInCallback})
 * - `auth/error` — sign-in error display ({@link SignInError})
 * - `auth/logout/callback` — sign-out redirect callback ({@link SignOutCallback})
 * - `auth/account` — authenticated account view ({@link Account}), guarded by
 *   {@link authGuard}
 *
 * Components are lazily loaded via `loadComponent`.
 *
 * @example
 * ```ts
 * import { provideRouter } from '@angular/router';
 * import { ZITADEL_ROUTES } from '@zitadel/angular-auth';
 *
 * bootstrapApplication(AppComponent, {
 *   providers: [provideRouter([...ZITADEL_ROUTES])],
 * });
 * ```
 */
export const ZITADEL_ROUTES: Route[] = [
  {
    path: 'auth',
    children: [
      {
        path: 'signin',
        loadComponent: () =>
          import('./components/index.js').then((m) => m.SignIn),
      },
      {
        path: 'callback',
        loadComponent: () =>
          import('./components/index.js').then((m) => m.SignInCallback),
      },
      {
        path: 'error',
        loadComponent: () =>
          import('./components/index.js').then((m) => m.SignInError),
      },
      {
        path: 'logout/callback',
        loadComponent: () =>
          import('./components/index.js').then((m) => m.SignOutCallback),
      },
      {
        path: 'account',
        loadComponent: () =>
          import('./components/index.js').then((m) => m.Account),
        canActivate: [authGuard],
      },
    ],
  },
];
