import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from './auth.service.js';
import { ZITADEL_API_URLS } from '../oidc-config.token.js';

/**
 * Angular `HttpInterceptorFn` that attaches the authenticated user's bearer
 * access token to outgoing requests as an `Authorization` header. When the user
 * is not authenticated, the request is forwarded unchanged.
 *
 * The token is only attached to requests whose URL starts with one of the
 * prefixes configured via {@link ZITADEL_API_URLS}. The default allowlist is
 * empty, so no token is attached until you opt specific API prefixes in. This
 * prevents leaking the access token to third-party origins.
 *
 * @param req - The outgoing HTTP request.
 * @param next - The next handler in the interceptor chain.
 * @returns The (possibly cloned) request passed to the next handler.
 *
 * @example
 * ```ts
 * import { provideHttpClient, withInterceptors } from '@angular/common/http';
 * import { authzTokenInterceptor } from '@zitadel/angular-auth';
 *
 * provideHttpClient(withInterceptors([authzTokenInterceptor]));
 * ```
 */
export const authzTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const apiUrls = inject(ZITADEL_API_URLS, { optional: true }) ?? [];

  const isAllowlisted = apiUrls.some((url) => req.url.startsWith(url));

  if (authService.isAuthenticated() && isAllowlisted) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${authService.user()?.access_token}`,
      },
    });
  }

  return next(req);
};
