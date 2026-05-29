import { describe, expect, it, jest } from '@jest/globals';
import { Injector, runInInjectionContext } from '@angular/core';
import { SignIn } from '../../src/lib/components/signin/signin.component.js';
import { AuthService } from '../../src/lib/auth/auth.service.js';

/**
 * No `TestBed` / `jest-preset-angular` is available, so the component template
 * is never rendered. Instead the component class is instantiated within an
 * injection context backed by a mocked {@link AuthService}, and behaviour is
 * asserted via the component's own methods and the signals it reads.
 */
const makeComponent = (auth: Partial<AuthService>): SignIn => {
  const injector = Injector.create({
    providers: [{ provide: AuthService, useValue: auth }],
  });
  return runInInjectionContext(injector, () => new SignIn());
};

describe('SignIn', () => {
  it('should render the sign-in options when unauthenticated', () => {
    const auth = {
      isAuthenticated: () => false,
      user: () => null,
      getAuthGuardInterceptedPathname: jest.fn(() => '/dashboard'),
    } as unknown as Partial<AuthService>;

    const component = makeComponent(auth);
    component.ngOnInit();

    expect(component.isAuthenticated()).toBe(false);
    expect(component.authGuardReturnUrl).toBe('/dashboard');
  });

  it('should trigger a redirect sign-in when the redirect button is used', () => {
    const signinRedirect = jest.fn(async () => undefined);
    const auth = {
      isAuthenticated: () => false,
      user: () => null,
      getAuthGuardInterceptedPathname: jest.fn(() => '/'),
      signinRedirect,
    } as unknown as Partial<AuthService>;

    const component = makeComponent(auth);
    component.signinRedirect();

    expect(signinRedirect).toHaveBeenCalled();
  });

  it('should trigger a popup sign-in when the popup button is used', () => {
    const signinPopup = jest.fn(async () => undefined);
    const auth = {
      isAuthenticated: () => false,
      user: () => null,
      getAuthGuardInterceptedPathname: jest.fn(() => '/'),
      signinPopup,
    } as unknown as Partial<AuthService>;

    const component = makeComponent(auth);
    component.signinPopup();

    expect(signinPopup).toHaveBeenCalled();
  });

  it('should trigger a silent sign-in when the silent button is used', () => {
    const signinSilent = jest.fn(async () => null);
    const auth = {
      isAuthenticated: () => false,
      user: () => null,
      getAuthGuardInterceptedPathname: jest.fn(() => '/'),
      signinSilent,
    } as unknown as Partial<AuthService>;

    const component = makeComponent(auth);
    component.signinSilent();

    expect(signinSilent).toHaveBeenCalled();
  });

  it('should show the signed-in state when authenticated', () => {
    const user = { access_token: 'tok' };
    const auth = {
      isAuthenticated: () => true,
      user: () => user,
      getAuthGuardInterceptedPathname: jest.fn(() => '/dashboard'),
    } as unknown as Partial<AuthService>;

    const component = makeComponent(auth);
    component.ngOnInit();

    expect(component.isAuthenticated()).toBe(true);
    expect(component.user()).toBe(user);
    // When already authenticated the return URL is not captured.
    expect(component.authGuardReturnUrl).toBeNull();
  });

  it('should trigger a sign-out when the sign-out action is used', () => {
    const signoutRedirect = jest.fn(async () => undefined);
    const signoutPopup = jest.fn(async () => undefined);
    const auth = {
      isAuthenticated: () => true,
      user: () => ({ access_token: 'tok' }),
      getAuthGuardInterceptedPathname: jest.fn(() => '/'),
      signoutRedirect,
      signoutPopup,
    } as unknown as Partial<AuthService>;

    const component = makeComponent(auth);
    component.signoutRedirect();
    component.signoutPopup();

    expect(signoutRedirect).toHaveBeenCalled();
    expect(signoutPopup).toHaveBeenCalled();
  });
});
