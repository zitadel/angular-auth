/**
 * Type declarations for the build-time environment variables exposed by
 * `@ngx-env/builder` under the `NG_APP_` prefix on `import.meta.env`.
 */
interface ImportMetaEnv {
  readonly NG_APP_ZITADEL_DOMAIN: string;
  readonly NG_APP_ZITADEL_CLIENT_ID: string;
  readonly NG_APP_ZITADEL_REDIRECT_URI: string;
  readonly NG_APP_ZITADEL_POST_LOGOUT_REDIRECT_URI: string;
  readonly NG_APP_ZITADEL_SCOPE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
