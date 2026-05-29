import { jest } from '@jest/globals';
import type { User, UserManager } from 'oidc-client-ts';

/**
 * Builds a stub `UserManager` good enough to drive the service in tests,
 * without contacting a real identity provider. Override any method or the
 * event registrars via `overrides`.
 *
 * Mirrors the keys/naming of the React sibling's `createFakeUserManager`
 * (see `react-auth/test/helpers.tsx`).
 */
export const createFakeUserManager = (
  overrides: Partial<Record<keyof UserManager, unknown>> = {},
): UserManager => {
  const noop = jest.fn();
  const events = {
    addUserLoaded: noop,
    removeUserLoaded: noop,
    addUserUnloaded: noop,
    removeUserUnloaded: noop,
    addUserSignedOut: noop,
    removeUserSignedOut: noop,
    addSilentRenewError: noop,
    removeSilentRenewError: noop,
  };

  const manager = {
    settings: { authority: 'authority', client_id: 'client' },
    events,
    getUser: jest.fn(async () => null),
    signinCallback: jest.fn(async () => undefined),
    signoutCallback: jest.fn(async () => undefined),
    removeUser: jest.fn(async () => undefined),
    signinRedirect: jest.fn(async () => undefined),
    signinPopup: jest.fn(async () => undefined as unknown as User),
    signinSilent: jest.fn(async () => null),
    signinResourceOwnerCredentials: jest.fn(async () => undefined),
    signoutRedirect: jest.fn(async () => undefined),
    signoutPopup: jest.fn(async () => undefined),
    signoutSilent: jest.fn(async () => undefined),
    clearStaleState: jest.fn(async () => undefined),
    querySessionStatus: jest.fn(async () => null),
    revokeTokens: jest.fn(async () => undefined),
    startSilentRenew: jest.fn(),
    stopSilentRenew: jest.fn(),
    ...overrides,
  };

  return manager as unknown as UserManager;
};

/**
 * Builds a minimal `User`-like object for tests, defaulting to a non-expired
 * user carrying an access token.
 */
export const createFakeUser = (overrides: Partial<User> = {}): User =>
  ({
    access_token: 'access-token',
    expired: false,
    profile: { sub: 'user-1' },
    ...overrides,
  }) as unknown as User;
