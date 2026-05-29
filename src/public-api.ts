/**
 * Public API surface of `@zitadel/angular-auth`.
 *
 * @example
 * ```ts
 * import {
 *   provideZitadelAuth,
 *   AuthService,
 *   authGuard,
 *   ZITADEL_ROUTES,
 * } from '@zitadel/angular-auth';
 * ```
 */

export {
  AuthService,
  authGuard,
  authzTokenInterceptor,
} from './lib/auth/index.js';
export {
  OIDC_CONFIG_TOKEN,
  ZITADEL_API_URLS,
} from './lib/oidc-config.token.js';
export { provideZitadelAuth, initOidc, ZitadelAuthConfig } from './lib/init.js';
export {
  Account,
  SignIn,
  SignInCallback,
  SignInError,
  SignOutCallback,
} from './lib/components/index.js';
export { ZITADEL_ROUTES } from './lib/routes.js';
export {
  hasAuthParams,
  applyOidcConfigDefaults,
  DEFAULT_OIDC_SCOPE,
  ZitadelScopeConfig,
} from './lib/utils.js';
export { hasRole } from './lib/has-role.js';
