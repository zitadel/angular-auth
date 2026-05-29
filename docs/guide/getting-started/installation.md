---
title: Installation
group: Getting Started
---

# Installation

Install `@zitadel/angular-auth` and its `oidc-client-ts` peer dependency:

```bash
# npm
npm i @zitadel/angular-auth oidc-client-ts

# pnpm
pnpm add @zitadel/angular-auth oidc-client-ts

# yarn
yarn add @zitadel/angular-auth oidc-client-ts
```

The library targets Angular 18 and later and lists `@angular/common`,
`@angular/core`, `@angular/router`, `oidc-client-ts` and `rxjs` as peer
dependencies, so they are resolved from your application's own versions.

Once installed, register the providers in your application bootstrap. See the
[Configuration](../application-side/configuration.md) guide for the full
provider setup, or the [Angular Quick Start](../angular/quick-start.md) for an
end-to-end example.
