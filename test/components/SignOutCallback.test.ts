import { describe, expect, it, jest } from '@jest/globals';
import { Injector, runInInjectionContext } from '@angular/core';
import { Router } from '@angular/router';
import { SignOutCallback } from '../../src/lib/components/signout-callback/signout-callback.component.js';
import { AuthService } from '../../src/lib/auth/auth.service.js';

type NavigateMock = jest.Mock<(commands: unknown[]) => Promise<boolean>>;

const makeComponent = (
  auth: Partial<AuthService>,
  router: { navigate: NavigateMock },
): SignOutCallback => {
  const injector = Injector.create({
    providers: [
      { provide: AuthService, useValue: auth },
      { provide: Router, useValue: router },
    ],
  });
  return runInInjectionContext(injector, () => new SignOutCallback());
};

describe('SignOutCallback', () => {
  it('should navigate to the application root once settled', async () => {
    const router = {
      navigate: jest.fn(async () => true),
    } as { navigate: NavigateMock };
    const signoutCallback = jest.fn(async () => undefined);
    const auth = {
      signoutCallback,
    } as unknown as Partial<AuthService>;

    const component = makeComponent(auth, router);
    await component.ngOnInit();

    expect(signoutCallback).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });
});
