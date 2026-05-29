import { describe, expect, it } from '@jest/globals';
import type { Route } from '@angular/router';
import { ZITADEL_ROUTES } from '../src/lib/routes.js';
import { authGuard } from '../src/lib/auth/auth.guard.js';

const authChildren = (): Route[] => {
  const parent = ZITADEL_ROUTES.find((r) => r.path === 'auth');
  return parent?.children ?? [];
};

const childByPath = (path: string): Route | undefined =>
  authChildren().find((r) => r.path === path);

describe('routes', () => {
  it('should expose five auth routes', () => {
    expect(authChildren()).toHaveLength(5);
  });

  it('should map /auth/signin to the sign-in component', async () => {
    const route = childByPath('signin');
    const loaded = await route?.loadComponent?.();

    expect((loaded as { name: string }).name).toBe('SignIn');
  });

  it('should map /auth/callback to the sign-in callback component', async () => {
    const route = childByPath('callback');
    const loaded = await route?.loadComponent?.();

    expect((loaded as { name: string }).name).toBe('SignInCallback');
  });

  it('should map /auth/error to the sign-in error component', async () => {
    const route = childByPath('error');
    const loaded = await route?.loadComponent?.();

    expect((loaded as { name: string }).name).toBe('SignInError');
  });

  it('should map /auth/logout/callback to the sign-out callback component', async () => {
    const route = childByPath('logout/callback');
    const loaded = await route?.loadComponent?.();

    expect((loaded as { name: string }).name).toBe('SignOutCallback');
  });

  it('should guard the /auth/account route', async () => {
    const route = childByPath('account');
    const loaded = await route?.loadComponent?.();

    expect((loaded as { name: string }).name).toBe('Account');
    expect(route?.canActivate).toEqual([authGuard]);
  });
});
