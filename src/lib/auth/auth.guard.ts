import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  RouterStateSnapshot,
} from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from './auth.service.js';

/**
 * Angular route guard that permits activation only when the user is
 * authenticated. When unauthenticated, it stores the intercepted URL and
 * triggers a redirect-based sign-in, denying the current navigation.
 *
 * @param route - The activated route snapshot (unused, required by the
 *   `CanActivateFn` signature).
 * @param state - The router state snapshot, used to capture the intercepted URL.
 * @returns An observable emitting `true` if authenticated, otherwise `false`.
 *
 * @example
 * ```ts
 * import { Routes } from '@angular/router';
 * import { authGuard } from '@zitadel/angular-auth';
 *
 * export const routes: Routes = [
 *   { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
 * ];
 * ```
 */
export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
) => {
  const authService = inject(AuthService);

  if (authService.isAuthenticated()) {
    return of(true);
  } else {
    authService.setAuthGuardInterceptedPathname(state.url);
    void authService.signinRedirect();
    return of(false);
  }
};
