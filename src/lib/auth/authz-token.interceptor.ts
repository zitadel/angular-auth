import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from './auth.service.js';
import { ZITADEL_API_URLS } from '../oidc-config.token.js';

/**
 * Angular `HttpInterceptorFn` that attaches the authenticated user's bearer
 * access token to outgoing requests as an `Authorization` header. When the user
 * is not authenticated, the request is forwarded unchanged.
 *
 * When an allowlist is configured via {@link ZITADEL_API_URLS}, the token is
 * only attached to requests whose URL starts with one of the configured
 * prefixes; an empty allowlist (the default) preserves the attach-when-
 * authenticated behavior.
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

  const isAllowlisted =
    apiUrls.length === 0 || apiUrls.some((url) => req.url.startsWith(url));

  if (authService.isAuthenticated() && isAllowlisted) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${authService.user()?.access_token}`,
      },
    });
  }

  return next(req);
};
