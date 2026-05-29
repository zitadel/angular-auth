// noinspection JSUnusedGlobalSymbols
/** @type {import('typedoc').TypeDocOptions} */
export default {
  entryPoints: ['src/public-api.ts'],
  out: '.out/docs',
  tsconfig: './tsconfig.json',
  readme: 'README.md',
  projectDocuments: [
    'docs/guide/getting-started/introduction.md',
    'docs/guide/angular/quick-start.md',
    'docs/guide/application-side/configuration.md',
    'docs/guide/advanced/silent-renew.md',
  ],
  excludeInternal: true,
  excludePrivate: true,
  highlightLanguages: [
    'typescript',
    'javascript',
    'json',
    'jsx',
    'tsx',
    'bash',
    'sh',
    'html',
  ],
  externalSymbolLinkMappings: {
    'oidc-client-ts': {
      User: 'https://authts.github.io/oidc-client-ts/classes/User.html',
      UserManager:
        'https://authts.github.io/oidc-client-ts/classes/UserManager.html',
      UserManagerSettings:
        'https://authts.github.io/oidc-client-ts/interfaces/UserManagerSettings.html',
    },
    typescript: {
      URLSearchParams:
        'https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams',
    },
  },
  cleanOutputDir: true,
  treatWarningsAsErrors: false,
  validation: {
    invalidLink: true,
    notExported: true,
    notDocumented: false,
  },
};
