import { InjectionToken } from '@angular/core';
import { UserManagerSettings } from 'oidc-client-ts';

/**
 * Dependency-injection token carrying the {@link UserManagerSettings} used to
 * configure the underlying `oidc-client-ts` `UserManager`.
 *
 * Provide a value for this token via {@link provideZitadelAuth} (or manually in
 * an application's provider array) so that {@link AuthService} can build its
 * `UserManager`.
 *
 * @example
 * ```ts
 * import { OIDC_CONFIG_TOKEN } from '@zitadel/angular-auth';
 *
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     {
 *       provide: OIDC_CONFIG_TOKEN,
 *       useValue: {
 *         authority: 'https://example.zitadel.cloud',
 *         client_id: 'my-client-id',
 *         redirect_uri: 'http://localhost:4200/auth/callback',
 *       },
 *     },
 *   ],
 * });
 * ```
 */
export const OIDC_CONFIG_TOKEN = new InjectionToken<UserManagerSettings>(
  'OIDC_CONFIG',
);

/**
 * Dependency-injection token carrying the list of API URL prefixes that the
 * {@link authzTokenInterceptor} is allowed to attach the bearer token to. When
 * empty (the default), the interceptor attaches the token to every request made
 * while authenticated.
 *
 * Provide a value for this token via {@link provideZitadelAuth} by passing
 * `apiUrls` in the configuration.
 *
 * @example
 * ```ts
 * import { ZITADEL_API_URLS } from '@zitadel/angular-auth';
 *
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     { provide: ZITADEL_API_URLS, useValue: ['https://api.example.com'] },
 *   ],
 * });
 * ```
 */
export const ZITADEL_API_URLS = new InjectionToken<string[]>(
  'ZITADEL_API_URLS',
);
