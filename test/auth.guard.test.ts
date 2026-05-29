import { describe, expect, it, jest } from '@jest/globals';
import { Injector, runInInjectionContext } from '@angular/core';
import type {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { firstValueFrom, type Observable } from 'rxjs';
import { authGuard } from '../src/lib/auth/auth.guard.js';
import { AuthService } from '../src/lib/auth/auth.service.js';

/**
 * Runs the functional `authGuard` inside an injection context backed by a
 * mocked {@link AuthService}, returning the boolean it emits.
 */
const runGuard = (
  auth: Partial<AuthService>,
  url = '/protected',
): Promise<boolean> => {
  const injector = Injector.create({
    providers: [{ provide: AuthService, useValue: auth }],
  });
  const route = {} as ActivatedRouteSnapshot;
  const state = { url } as RouterStateSnapshot;

  return runInInjectionContext(injector, () => {
    const result = authGuard(route, state);
    return firstValueFrom(result as unknown as Observable<boolean>);
  }) as Promise<boolean>;
};

describe('authGuard', () => {
  it('should redirect to signin when the user is unauthenticated', async () => {
    const setAuthGuardInterceptedPathname = jest.fn();
    const signinRedirect = jest.fn(async () => undefined);
    const auth = {
      isAuthenticated: () => false,
      setAuthGuardInterceptedPathname,
      signinRedirect,
    } as unknown as Partial<AuthService>;

    const result = await runGuard(auth, '/dashboard');

    expect(result).toBe(false);
    expect(setAuthGuardInterceptedPathname).toHaveBeenCalledWith('/dashboard');
    expect(signinRedirect).toHaveBeenCalled();
  });

  it('should render the component when the user is authenticated', async () => {
    const signinRedirect = jest.fn(async () => undefined);
    const auth = {
      isAuthenticated: () => true,
      setAuthGuardInterceptedPathname: jest.fn(),
      signinRedirect,
    } as unknown as Partial<AuthService>;

    const result = await runGuard(auth);

    expect(result).toBe(true);
    expect(signinRedirect).not.toHaveBeenCalled();
  });

  it('should render the OnRedirecting fallback while redirecting', async () => {
    // Angular has no dedicated redirecting state; the guard denies activation
    // (emitting `false`) while the redirect it triggered is in flight, which is
    // the equivalent of rendering the redirecting fallback in the siblings.
    const auth = {
      isAuthenticated: () => false,
      setAuthGuardInterceptedPathname: jest.fn(),
      signinRedirect: jest.fn(async () => undefined),
    } as unknown as Partial<AuthService>;

    const result = await runGuard(auth);

    expect(result).toBe(false);
  });
});
