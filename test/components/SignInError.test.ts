import { describe, expect, it } from '@jest/globals';
import { Injector, runInInjectionContext } from '@angular/core';
import { SignInError } from '../../src/lib/components/signin-error/signin-error.component.js';
import { AuthService } from '../../src/lib/auth/auth.service.js';

/**
 * No `TestBed` is available, so the template is not rendered; the component is
 * instantiated within an injection context and the `authError` signal it
 * exposes is asserted directly.
 */
const makeComponent = (auth: Partial<AuthService>): SignInError => {
  const injector = Injector.create({
    providers: [{ provide: AuthService, useValue: auth }],
  });
  return runInInjectionContext(injector, () => new SignInError());
};

describe('SignInError', () => {
  it('should render the most recent error when present', () => {
    const error = new Error('boom');
    const auth = {
      authError: () => error,
    } as unknown as Partial<AuthService>;

    const component = makeComponent(auth);

    expect(component.authError()).toBe(error);
  });

  it('should render a fallback message when no error is present', () => {
    const auth = {
      authError: () => null,
    } as unknown as Partial<AuthService>;

    const component = makeComponent(auth);

    expect(component.authError()).toBeNull();
  });
});
