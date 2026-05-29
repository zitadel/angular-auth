module.exports = {
  ignoreDependencies: [
    '@zitadel/angular-auth',
    // Angular build toolchain referenced via angular.json builders rather than
    // direct imports, so knip cannot trace them.
    '@angular-devkit/build-angular',
    '@angular/compiler-cli',
    // Runtime/peer dependencies not imported directly: @angular/compiler is
    // required by the Angular runtime, and oidc-client-ts is the peer the
    // configuration object passed to provideZitadelAuth() conforms to.
    '@angular/compiler',
    'oidc-client-ts',
  ],
  rules: {
    unresolved: 'off',
  },
  entry: ['src/**/*.ts'],
  ignore: ['commitlint.config.js'],
};
