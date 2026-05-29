import type { UserManagerSettings } from 'oidc-client-ts';

/**
 * The default OIDC scope applied by {@link applyOidcConfigDefaults} when a
 * configuration does not specify one. Requests the standard identity scopes
 * plus a refresh token for silent renewal.
 */
export const DEFAULT_OIDC_SCOPE = 'openid profile email offline_access';

/**
 * Zitadel-specific configuration that expands into OIDC scopes.
 */
export interface ZitadelScopeConfig {
  /** Zitadel project resource ID; adds the project-audience + roles scopes. */
  project_resource_id?: string;
  /** Restrict login to a single Zitadel organization; adds the org scope. */
  org_id?: string;
}

/**
 * Applies Zitadel-friendly defaults to OIDC settings: a sensible default
 * `scope`, userinfo enrichment, automatic silent renewal, and the
 * `urn:zitadel:*` scopes derived from {@link ZitadelScopeConfig}. All defaults
 * remain overridable by the caller. Returns a new object (no mutation). The
 * user-store default is intentionally left to the runtime service since it
 * depends on a browser `window`.
 *
 * @param config - The incoming {@link UserManagerSettings} plus optional
 *   {@link ZitadelScopeConfig}.
 * @returns A new {@link UserManagerSettings} with defaults applied.
 *
 * @example
 * ```ts
 * import { applyOidcConfigDefaults } from '@zitadel/angular-auth';
 *
 * const settings = applyOidcConfigDefaults({
 *   authority: 'https://example.zitadel.cloud',
 *   client_id: 'my-client-id',
 *   redirect_uri: 'http://localhost:4200/auth/callback',
 * });
 * // settings.scope === 'openid profile email offline_access'
 * ```
 */
export function applyOidcConfigDefaults(
  config: UserManagerSettings & ZitadelScopeConfig,
): UserManagerSettings {
  const { project_resource_id, org_id, ...settings } = config;
  const baseScopes = (settings.scope ?? DEFAULT_OIDC_SCOPE)
    .split(' ')
    .filter(Boolean);
  const zitadelScopes: string[] = [];
  if (project_resource_id) {
    zitadelScopes.push(
      `urn:zitadel:iam:org:project:id:${project_resource_id}:aud`,
    );
    zitadelScopes.push('urn:zitadel:iam:org:projects:roles');
  }
  if (org_id) {
    zitadelScopes.push(`urn:zitadel:iam:org:id:${org_id}`);
  }
  const scope = [...new Set([...baseScopes, ...zitadelScopes])].join(' ');
  return {
    loadUserInfo: true,
    automaticSilentRenew: true,
    ...settings,
    scope,
  };
}

/**
 * Determines whether the given query string contains the OAuth/OIDC redirect
 * callback parameters (`code` + `state`, or an `error`) that signal an
 * in-progress authorization response.
 *
 * This is a pure helper with no Angular dependency, useful for deciding whether
 * the current location is an OIDC callback before invoking the callback flow.
 *
 * @param searchParams - A query string (e.g. `window.location.search`) or a
 *   pre-parsed {@link URLSearchParams}. Defaults to `''`.
 * @returns `true` when auth callback parameters are present, otherwise `false`.
 *
 * @example
 * ```ts
 * import { hasAuthParams } from '@zitadel/angular-auth';
 *
 * if (hasAuthParams(window.location.search)) {
 *   await auth.signinCallback();
 * }
 * ```
 */
export function hasAuthParams(
  searchParams: string | URLSearchParams = '',
): boolean {
  const params =
    typeof searchParams === 'string'
      ? new URLSearchParams(searchParams)
      : searchParams;

  const hasCodeAndState = params.has('code') && params.has('state');
  const hasError = params.has('error');

  return hasCodeAndState || hasError;
}
