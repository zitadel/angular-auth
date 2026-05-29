import { describe, expect, it, jest } from '@jest/globals';
import { Injector, runInInjectionContext } from '@angular/core';
import type {
  HttpEvent,
  HttpHandlerFn,
  HttpRequest,
} from '@angular/common/http';
import { of } from 'rxjs';
import { authzTokenInterceptor } from '../src/lib/auth/authz-token.interceptor.js';
import { AuthService } from '../src/lib/auth/auth.service.js';
import { ZITADEL_API_URLS } from '../src/lib/oidc-config.token.js';

/**
 * Minimal `HttpRequest` stub whose `clone` records the headers it was given so
 * the test can assert on the `Authorization` header without a real HttpClient.
 */
const makeRequest = (
  url = 'https://example.com/resource',
): {
  req: HttpRequest<unknown>;
  cloned: HttpRequest<unknown>;
} => {
  const cloned = { __cloned: true } as unknown as HttpRequest<unknown>;
  const req = {
    url,
    clone: jest.fn(() => cloned),
  } as unknown as HttpRequest<unknown>;
  return { req, cloned };
};

const run = (
  auth: Partial<AuthService>,
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  apiUrls?: string[],
) => {
  const injector = Injector.create({
    providers: [
      { provide: AuthService, useValue: auth },
      ...(apiUrls === undefined
        ? []
        : [{ provide: ZITADEL_API_URLS, useValue: apiUrls }]),
    ],
  });
  return runInInjectionContext(injector, () =>
    authzTokenInterceptor(req, next),
  );
};

describe('authzTokenInterceptor', () => {
  it('should attach a bearer token when authenticated', () => {
    const { req, cloned } = makeRequest();
    const handled = of({} as HttpEvent<unknown>);
    const next = jest.fn(() => handled) as unknown as HttpHandlerFn;
    const auth = {
      isAuthenticated: () => true,
      user: () => ({ access_token: 'tok-123' }),
    } as unknown as Partial<AuthService>;

    const result = run(auth, req, next);

    expect(req.clone).toHaveBeenCalledWith({
      setHeaders: { Authorization: 'Bearer tok-123' },
    });
    expect(next).toHaveBeenCalledWith(cloned);
    expect(result).toBe(handled);
  });

  it('should forward the request unchanged when unauthenticated', () => {
    const { req } = makeRequest();
    const handled = of({} as HttpEvent<unknown>);
    const next = jest.fn(() => handled) as unknown as HttpHandlerFn;
    const auth = {
      isAuthenticated: () => false,
      user: () => null,
    } as unknown as Partial<AuthService>;

    const result = run(auth, req, next);

    expect(req.clone).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(req);
    expect(result).toBe(handled);
  });

  it('should attach the token only to allowlisted URLs when an allowlist is configured', () => {
    const auth = {
      isAuthenticated: () => true,
      user: () => ({ access_token: 'tok-123' }),
    } as unknown as Partial<AuthService>;
    const apiUrls = ['https://api.example.com'];

    const allowed = makeRequest('https://api.example.com/v1/users');
    const allowedNext = jest.fn(() =>
      of({} as HttpEvent<unknown>),
    ) as unknown as HttpHandlerFn;
    run(auth, allowed.req, allowedNext, apiUrls);

    expect(allowed.req.clone).toHaveBeenCalledWith({
      setHeaders: { Authorization: 'Bearer tok-123' },
    });
    expect(allowedNext).toHaveBeenCalledWith(allowed.cloned);

    const blocked = makeRequest('https://other.example.com/v1/users');
    const blockedNext = jest.fn(() =>
      of({} as HttpEvent<unknown>),
    ) as unknown as HttpHandlerFn;
    run(auth, blocked.req, blockedNext, apiUrls);

    expect(blocked.req.clone).not.toHaveBeenCalled();
    expect(blockedNext).toHaveBeenCalledWith(blocked.req);
  });

  it('should attach the token to all requests when no allowlist is configured', () => {
    const { req, cloned } = makeRequest('https://anything.example.com/path');
    const handled = of({} as HttpEvent<unknown>);
    const next = jest.fn(() => handled) as unknown as HttpHandlerFn;
    const auth = {
      isAuthenticated: () => true,
      user: () => ({ access_token: 'tok-123' }),
    } as unknown as Partial<AuthService>;

    const result = run(auth, req, next, []);

    expect(req.clone).toHaveBeenCalledWith({
      setHeaders: { Authorization: 'Bearer tok-123' },
    });
    expect(next).toHaveBeenCalledWith(cloned);
    expect(result).toBe(handled);
  });
});
