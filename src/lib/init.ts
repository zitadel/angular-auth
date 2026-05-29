import { EnvironmentProviders, Provider } from '@angular/core';
import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { UserManagerSettings } from 'oidc-client-ts';
import { AuthService, authzTokenInterceptor } from './auth/index.js';
import { OIDC_CONFIG_TOKEN, ZITADEL_API_URLS } from './oidc-config.token.js';
import { ZITADEL_ROUTES } from './routes.js';
import { ZitadelScopeConfig } from './utils.js';

/**
 * Configuration accepted by {@link provideZitadelAuth}: the OIDC
 * {@link UserManagerSettings}, the Zitadel scope shortcuts from
 * {@link ZitadelScopeConfig}, and an optional `apiUrls` allowlist that scopes
 * the {@link authzTokenInterceptor} to specific URL prefixes.
 */
export type ZitadelAuthConfig = UserManagerSettings &
  ZitadelScopeConfig & {
    /**
     * URL prefixes the bearer token is attached to. When omitted or empty, the
     * token is attached to every request made while authenticated.
     */
    apiUrls?: string[];
  };

/**
 * Builds the set of Angular providers required to wire up Zitadel client-side
 * OIDC authentication: it registers the {@link OIDC_CONFIG_TOKEN}, the
 * {@link AuthService}, an `HttpClient` configured with the
 * {@link authzTokenInterceptor}, and the {@link ZITADEL_ROUTES}.
 *
 * @param oidcConfig - The {@link UserManagerSettings} for the OIDC client.
 * @returns An array of providers/environment providers for `bootstrapApplication`.
 *
 * @example
 * ```ts
 * import { bootstrapApplication } from '@angular/platform-browser';
 * import { provideZitadelAuth } from '@zitadel/angular-auth';
 *
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     provideZitadelAuth({
 *       authority: 'https://example.zitadel.cloud',
 *       client_id: 'my-client-id',
 *       redirect_uri: 'http://localhost:4200/auth/callback',
 *       post_logout_redirect_uri: 'http://localhost:4200/',
 *     }),
 *   ],
 * });
 * ```
 */
export function provideZitadelAuth(
  oidcConfig: ZitadelAuthConfig,
): (Provider | EnvironmentProviders)[] {
  const { apiUrls, ...settings } = oidcConfig;
  return [
    {
      provide: OIDC_CONFIG_TOKEN,
      useValue: settings,
    },
    {
      provide: ZITADEL_API_URLS,
      useValue: apiUrls ?? [],
    },
    {
      provide: AuthService,
      useClass: AuthService,
    },
    provideHttpClient(withFetch(), withInterceptors([authzTokenInterceptor])),
    provideRouter(ZITADEL_ROUTES),
  ];
}

/**
 * Alias of {@link provideZitadelAuth}, mirroring the `initOidc` name from the
 * upstream `@edgeflare/ngx-oidc` API for drop-in compatibility.
 *
 * @param oidcConfig - The {@link UserManagerSettings} for the OIDC client.
 * @returns An array of providers/environment providers for `bootstrapApplication`.
 *
 * @example
 * ```ts
 * import { initOidc } from '@zitadel/angular-auth';
 *
 * bootstrapApplication(AppComponent, {
 *   providers: [initOidc({ authority: '...', client_id: '...', redirect_uri: '...' })],
 * });
 * ```
 */
export function initOidc(
  oidcConfig: ZitadelAuthConfig,
): (Provider | EnvironmentProviders)[] {
  return provideZitadelAuth(oidcConfig);
}
