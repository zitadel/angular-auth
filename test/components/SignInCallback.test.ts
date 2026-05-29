import { describe, expect, it, jest } from '@jest/globals';
import { Injector, runInInjectionContext } from '@angular/core';
import { Router } from '@angular/router';
import { SignInCallback } from '../../src/lib/components/signin-callback/signin-callback.component.js';
import { AuthService } from '../../src/lib/auth/auth.service.js';

/**
 * Instantiates the component within an injection context backed by mocked
 * {@link AuthService} and {@link Router}, then drives `ngOnInit` and asserts on
 * the router navigation that results.
 */
type NavigateMock = jest.Mock<(commands: unknown[]) => Promise<boolean>>;

const makeComponent = (
  auth: Partial<AuthService>,
  router: { navigate: NavigateMock },
): SignInCallback => {
  const injector = Injector.create({
    providers: [
      { provide: AuthService, useValue: auth },
      { provide: Router, useValue: router },
    ],
  });
  return runInInjectionContext(injector, () => new SignInCallback());
};

describe('SignInCallback', () => {
  it('should navigate to the stored return path on success', async () => {
    const router = {
      navigate: jest.fn(async () => true),
    } as { navigate: NavigateMock };
    const signinCallback = jest.fn(async () => undefined);
    const auth = {
      signinCallback,
      getAuthGuardInterceptedPathname: jest.fn(() => '/dashboard'),
    } as unknown as Partial<AuthService>;

    const component = makeComponent(auth, router);
    await component.ngOnInit();

    expect(signinCallback).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should navigate to the stored return path after a successful callback', async () => {
    const router = {
      navigate: jest.fn(async () => true),
    } as { navigate: NavigateMock };
    const signinCallback = jest.fn(async () => undefined);
    const auth = {
      signinCallback,
      getAuthGuardInterceptedPathname: jest.fn(() => '/settings/profile'),
    } as unknown as Partial<AuthService>;

    const component = makeComponent(auth, router);
    await component.ngOnInit();

    expect(signinCallback).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/settings/profile']);
  });

  it('should navigate to the auth error route on failure', async () => {
    const router = {
      navigate: jest.fn(async () => true),
    } as { navigate: NavigateMock };
    // The service navigates to the error route internally and re-throws; the
    // component awaits that call, so a rejection here surfaces as a rejected
    // `ngOnInit` while the error navigation has already been issued.
    const signinCallback = jest.fn(async () => {
      await router.navigate(['/auth/error']);
      throw new Error('callback failed');
    });
    const auth = {
      signinCallback,
      getAuthGuardInterceptedPathname: jest.fn(() => '/dashboard'),
    } as unknown as Partial<AuthService>;

    const component = makeComponent(auth, router);

    await expect(component.ngOnInit()).rejects.toThrow('callback failed');
    expect(router.navigate).toHaveBeenCalledWith(['/auth/error']);
    expect(router.navigate).not.toHaveBeenCalledWith(['/dashboard']);
  });
});
