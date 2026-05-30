import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Injector, runInInjectionContext } from '@angular/core';
import type { Router } from '@angular/router';
import type { User, UserManager, UserManagerSettings } from 'oidc-client-ts';
import { createFakeUser, createFakeUserManager } from './helpers.js';

/**
 * The `AuthService` constructor eagerly builds a `UserManager` (via the
 * `oidc-client-ts` `UserManager` constructor) and wires its event registrars.
 * To drive the service deterministically the whole `oidc-client-ts` module is
 * mocked so that `new UserManager(...)` returns the per-test fake whose
 * `events.*` registrars capture the wired callbacks for direct invocation.
 */
interface Harness {
  service: InstanceType<typeof AuthService>;
  manager: UserManager;
  router: { navigate: jest.Mock };
  handlers: Record<string, (arg?: unknown) => void>;
}

const baseConfig: UserManagerSettings = {
  authority: 'https://example.zitadel.cloud',
  client_id: 'my-client-id',
  redirect_uri: 'http://localhost:4200/auth/callback',
};

// The next fake returned by the mocked `UserManager` constructor.
let nextManager: UserManager;

jest.unstable_mockModule('oidc-client-ts', () => ({
  UserManager: jest.fn(() => nextManager),
}));

const { AuthService } = await import('../src/lib/auth/auth.service.js');

const buildHarness = (
  overrides: Partial<Record<keyof UserManager, unknown>> = {},
): Harness => {
  const handlers: Record<string, (arg?: unknown) => void> = {};
  const manager = createFakeUserManager({
    events: {
      addUserLoaded: jest.fn((cb: (arg?: unknown) => void) => {
        handlers.userLoaded = cb;
      }),
      addUserUnloaded: jest.fn((cb: (arg?: unknown) => void) => {
        handlers.userUnloaded = cb;
      }),
      addUserSignedOut: jest.fn((cb: (arg?: unknown) => void) => {
        handlers.userSignedOut = cb;
      }),
      addSilentRenewError: jest.fn((cb: (arg?: unknown) => void) => {
        handlers.silentRenewError = cb;
      }),
    },
    ...overrides,
  });
  nextManager = manager;

  const router = { navigate: jest.fn(async () => true) } as unknown as {
    navigate: jest.Mock;
  };

  // `AuthService` initialises signals via `toSignal()` in its field
  // initialisers, which requires an active injection context; construct it
  // inside one.
  const injector = Injector.create({ providers: [] });
  const service = runInInjectionContext(
    injector,
    () => new AuthService({ ...baseConfig }, router as unknown as Router),
  );

  return { service, manager, router, handlers };
};

describe('AuthService', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  it('should expose the restored user via the user signal', async () => {
    const user = createFakeUser();
    const { service } = buildHarness({ getUser: jest.fn(async () => user) });

    await new Promise<void>((resolve) => {
      service.getUser().subscribe(() => resolve());
    });

    expect(service.user()).toBe(user);
  });

  it('should report authenticated for a valid user', async () => {
    const user = createFakeUser({ expired: false });
    const { service } = buildHarness({ getUser: jest.fn(async () => user) });

    await new Promise<void>((resolve) => {
      service.getUser().subscribe(() => resolve());
    });

    expect(service.isAuthenticated()).toBe(true);
  });

  it('should report unauthenticated for an expired user', async () => {
    const user = createFakeUser({ expired: true });
    const { service } = buildHarness({ getUser: jest.fn(async () => user) });

    await new Promise<void>((resolve) => {
      service.getUser().subscribe(() => resolve());
    });

    expect(service.isAuthenticated()).toBe(false);
  });

  it('should push the user on the UserLoaded event', () => {
    const { service, handlers } = buildHarness();
    const user = createFakeUser();

    handlers.userLoaded(user);

    expect(service.user()).toBe(user);
  });

  it('should clear the user on the UserUnloaded event', () => {
    const { service, handlers } = buildHarness();
    handlers.userLoaded(createFakeUser());

    handlers.userUnloaded();

    expect(service.user()).toBeNull();
  });

  it('should clear the user on the UserSignedOut event', () => {
    const { service, handlers } = buildHarness();
    handlers.userLoaded(createFakeUser());

    handlers.userSignedOut();

    expect(service.user()).toBeNull();
  });

  it('should record the error on the SilentRenewError event', () => {
    const { service, handlers } = buildHarness();
    const error = new Error('renew failed');

    handlers.silentRenewError(error);

    expect(service.authError()).toBe(error);
  });

  it('should re-throw and record the error when signinRedirect fails', async () => {
    const error = new Error('redirect failed');
    const { service } = buildHarness({
      signinRedirect: jest.fn(async () => {
        throw error;
      }),
    });

    await expect(service.signinRedirect()).rejects.toBe(error);
    expect(service.authError()).toBe(error);
  });

  it('should re-throw and record the error when signinPopup fails', async () => {
    const error = new Error('popup failed');
    const { service } = buildHarness({
      signinPopup: jest.fn(async () => {
        throw error;
      }),
    });

    await expect(service.signinPopup()).rejects.toBe(error);
    expect(service.authError()).toBe(error);
  });

  it('should set the user when signinSilent resolves', async () => {
    const user = createFakeUser();
    const { service } = buildHarness({
      signinSilent: jest.fn(async () => user),
    });

    const result = await service.signinSilent();

    expect(result).toBe(user);
    expect(service.user()).toBe(user);
  });

  it('should re-throw and record the error when signinSilent fails', async () => {
    const error = new Error('silent failed');
    const { service } = buildHarness({
      signinSilent: jest.fn(async () => {
        throw error;
      }),
    });

    await expect(service.signinSilent()).rejects.toBe(error);
    expect(service.authError()).toBe(error);
  });

  it('should set the user when signinPopup resolves', async () => {
    const user = createFakeUser();
    const { service } = buildHarness({
      signinPopup: jest.fn(async () => user),
    });

    await service.signinPopup();

    expect(service.user()).toBe(user);
  });

  it('should set the user when signinCallback resolves with a user', async () => {
    const user = createFakeUser();
    const { service } = buildHarness({
      signinCallback: jest.fn(async () => user),
    });

    await service.signinCallback('http://localhost/cb');

    expect(service.user()).toBe(user);
  });

  it('should not set a user when signinCallback resolves without one', async () => {
    const { service } = buildHarness({
      signinCallback: jest.fn(async () => undefined),
    });

    await service.signinCallback();

    expect(service.user()).toBeNull();
  });

  it('should navigate to the auth error route and re-throw when signinCallback fails', async () => {
    const error = new Error('callback failed');
    const { service, router } = buildHarness({
      signinCallback: jest.fn(async () => {
        throw error;
      }),
    });

    await expect(service.signinCallback()).rejects.toBe(error);
    expect(service.authError()).toBe(error);
    expect(router.navigate).toHaveBeenCalledWith(['/auth/error']);
  });

  it('should clean up the session after signoutCallback', async () => {
    const { service, manager } = buildHarness();
    sessionStorage.setItem('zitadel:angular-auth:returnTo', '/dash');

    await service.signoutCallback('http://localhost/logout');

    expect(service.user()).toBeNull();
    expect(manager.removeUser).toHaveBeenCalled();
    expect(sessionStorage.getItem('zitadel:angular-auth:returnTo')).toBeNull();
  });

  it('should re-throw and still clean up when signoutCallback fails', async () => {
    const error = new Error('signout cb failed');
    const { service, manager } = buildHarness({
      signoutCallback: jest.fn(async () => {
        throw error;
      }),
    });

    await expect(service.signoutCallback()).rejects.toBe(error);
    expect(service.authError()).toBe(error);
    expect(manager.removeUser).toHaveBeenCalled();
  });

  it('should clean up the session after signoutRedirect', async () => {
    const { service, manager } = buildHarness();

    await service.signoutRedirect();

    expect(service.user()).toBeNull();
    expect(manager.removeUser).toHaveBeenCalled();
  });

  it('should re-throw and still clean up when signoutRedirect fails', async () => {
    const error = new Error('signout redirect failed');
    const { service } = buildHarness({
      signoutRedirect: jest.fn(async () => {
        throw error;
      }),
    });

    await expect(service.signoutRedirect()).rejects.toBe(error);
    expect(service.authError()).toBe(error);
  });

  it('should clean up the session after signoutPopup', async () => {
    const { service, manager } = buildHarness();

    await service.signoutPopup();

    expect(manager.removeUser).toHaveBeenCalled();
  });

  it('should re-throw and still clean up when signoutPopup fails', async () => {
    const error = new Error('signout popup failed');
    const { service } = buildHarness({
      signoutPopup: jest.fn(async () => {
        throw error;
      }),
    });

    await expect(service.signoutPopup()).rejects.toBe(error);
    expect(service.authError()).toBe(error);
  });

  it('should record the error from getUser without throwing', async () => {
    const error = new Error('getUser failed');
    const { service } = buildHarness({
      getUser: jest.fn(async () => {
        throw error;
      }),
    });

    const result = await new Promise<User | null>((resolve) => {
      service.getUser().subscribe((value) => resolve(value));
    });

    expect(result).toBeNull();
    expect(service.authError()).toBe(error);
  });

  it('should expose the underlying UserManager via userManagerInstance', () => {
    const { service, manager } = buildHarness();

    expect(service.userManagerInstance).toBe(manager);
  });

  it('should store and read back the auth-guard intercepted pathname', () => {
    const { service } = buildHarness();

    service.setAuthGuardInterceptedPathname('/dashboard');
    expect(service.getAuthGuardInterceptedPathname()).toBe('/dashboard');
  });

  it('should default the stored pathname to the current location', () => {
    const { service } = buildHarness();

    service.setAuthGuardInterceptedPathname();
    expect(service.getAuthGuardInterceptedPathname()).toBe(
      window.location.pathname,
    );
  });

  it('should default the intercepted pathname to the root when none is stored', () => {
    const { service } = buildHarness();

    expect(service.getAuthGuardInterceptedPathname()).toBe('/');
  });

  it('should report role membership via hasRole', () => {
    const { service, handlers } = buildHarness();
    const user = createFakeUser({
      profile: {
        sub: 'user-1',
        'urn:zitadel:iam:org:project:roles': {
          admin: { orgId: 'org-1' },
        },
      } as unknown as User['profile'],
    });

    expect(service.hasRole('admin')).toBe(false);

    handlers.userLoaded(user);

    expect(service.hasRole('admin')).toBe(true);
    expect(service.hasRole('editor')).toBe(false);
  });

  it('should keep a caller-provided userStore in the config', () => {
    const store = {} as unknown as UserManagerSettings['userStore'];
    const router = { navigate: jest.fn(async () => true) };
    nextManager = createFakeUserManager();
    const injector = Injector.create({ providers: [] });
    const service = runInInjectionContext(
      injector,
      () =>
        new AuthService(
          { ...baseConfig, userStore: store },
          router as unknown as Router,
        ),
    );

    expect(
      (service as unknown as { config: UserManagerSettings }).config.userStore,
    ).toBe(store);
  });

  it('should not override userStore when none is provided', () => {
    const router = { navigate: jest.fn(async () => true) };
    nextManager = createFakeUserManager();
    const injector = Injector.create({ providers: [] });
    const service = runInInjectionContext(
      injector,
      () => new AuthService({ ...baseConfig }, router as unknown as Router),
    );

    expect(
      (service as unknown as { config: UserManagerSettings }).config.userStore,
    ).toBeUndefined();
  });
});
