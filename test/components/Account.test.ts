import { describe, expect, it } from '@jest/globals';
import { Injector, runInInjectionContext } from '@angular/core';
import { Account } from '../../src/lib/components/account/account.component.js';
import { AuthService } from '../../src/lib/auth/auth.service.js';

/**
 * No `TestBed` is available, so the template is not rendered; the component is
 * instantiated within an injection context and the `isAuthenticated`/`user`
 * signals it exposes are asserted directly.
 */
const makeComponent = (auth: Partial<AuthService>): Account => {
  const injector = Injector.create({
    providers: [{ provide: AuthService, useValue: auth }],
  });
  return runInInjectionContext(injector, () => new Account());
};

describe('Account', () => {
  it('should render the user profile when authenticated', () => {
    const user = { profile: { sub: 'user-1' } };
    const auth = {
      isAuthenticated: () => true,
      user: () => user,
    } as unknown as Partial<AuthService>;

    const component = makeComponent(auth);

    expect(component.isAuthenticated()).toBe(true);
    expect(component.user()).toBe(user);
  });

  it('should prompt to sign in when unauthenticated', () => {
    const auth = {
      isAuthenticated: () => false,
      user: () => null,
    } as unknown as Partial<AuthService>;

    const component = makeComponent(auth);

    expect(component.isAuthenticated()).toBe(false);
    expect(component.user()).toBeNull();
  });
});
