import { describe, expect, it } from '@jest/globals';
import type { Provider } from '@angular/core';
import type { UserManagerSettings } from 'oidc-client-ts';
import { initOidc, provideZitadelAuth } from '../src/lib/init.js';
import { AuthService } from '../src/lib/auth/auth.service.js';
import {
  OIDC_CONFIG_TOKEN,
  ZITADEL_API_URLS,
} from '../src/lib/oidc-config.token.js';

const config: UserManagerSettings = {
  authority: 'https://example.zitadel.cloud',
  client_id: 'my-client-id',
  redirect_uri: 'http://localhost:4200/auth/callback',
};

/**
 * Narrows the heterogeneous provider array to the plain `{ provide, ... }`
 * class/value provider records so individual registrations can be located.
 */
const classValueProviders = (
  providers: ReturnType<typeof provideZitadelAuth>,
): Array<Provider & { provide: unknown }> =>
  providers.filter(
    (p): p is Provider & { provide: unknown } =>
      typeof p === 'object' && p !== null && 'provide' in p,
  );

describe('provideZitadelAuth', () => {
  it('should register the OIDC config token', () => {
    const providers = classValueProviders(provideZitadelAuth(config));
    const tokenProvider = providers.find(
      (p) => p.provide === OIDC_CONFIG_TOKEN,
    );

    expect(tokenProvider).toBeDefined();
    expect((tokenProvider as { useValue: unknown }).useValue).toEqual(config);
  });

  it('should strip apiUrls from the OIDC config and expose them via the allowlist token', () => {
    const providers = classValueProviders(
      provideZitadelAuth({ ...config, apiUrls: ['https://api.example.com'] }),
    );
    const tokenProvider = providers.find(
      (p) => p.provide === OIDC_CONFIG_TOKEN,
    );
    const urlsProvider = providers.find((p) => p.provide === ZITADEL_API_URLS);

    expect((tokenProvider as { useValue: unknown }).useValue).toEqual(config);
    expect(
      'apiUrls' in ((tokenProvider as { useValue: object }).useValue as object),
    ).toBe(false);
    expect((urlsProvider as { useValue: unknown }).useValue).toEqual([
      'https://api.example.com',
    ]);
  });

  it('should default the API allowlist to an empty array', () => {
    const providers = classValueProviders(provideZitadelAuth(config));
    const urlsProvider = providers.find((p) => p.provide === ZITADEL_API_URLS);

    expect((urlsProvider as { useValue: unknown }).useValue).toEqual([]);
  });

  it('should provide the AuthService', () => {
    const providers = classValueProviders(provideZitadelAuth(config));
    const serviceProvider = providers.find((p) => p.provide === AuthService);

    expect(serviceProvider).toBeDefined();
    expect((serviceProvider as { useClass: unknown }).useClass).toBe(
      AuthService,
    );
  });

  it('should register the auth routes', () => {
    // The router providers come back as opaque EnvironmentProviders, so we
    // assert that something beyond the two plain providers (the config token
    // and the service) was contributed by the router/http registrations.
    const providers = provideZitadelAuth(config);

    expect(providers.length).toBeGreaterThan(2);
  });

  it('initOidc should be an alias of provideZitadelAuth', () => {
    const viaAlias = initOidc(config);
    const direct = provideZitadelAuth(config);

    expect(viaAlias).toHaveLength(direct.length);
    expect(classValueProviders(viaAlias)).toEqual(classValueProviders(direct));
  });
});
