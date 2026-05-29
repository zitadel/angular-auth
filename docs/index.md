---
layout: home

title: Auth

hero:
  name: AngularAuth
  text: PKCE OIDC for Angular SPAs!
  tagline: Client-side ZITADEL authentication via oidc-client-ts!
  actions:
    - theme: brand
      text: Get started!
      link: /guide/getting-started/introduction
    - theme: alt
      text: GitHub
      link: https://github.com/zitadel/angular-auth

features:
  - title: PKCE by default
    details: Authorization Code Flow with PKCE for public clients — no client secret in the browser.
  - title: Signal-based state
    details: Read user(), isAuthenticated() and authError() directly in your component templates.
  - title: Drop-in providers
    details: A single provideZitadelAuth() call wires the service, HTTP interceptor and routes.
  - title: Ready-made routes
    details: Sign-in, callback, error, logout-callback and account routes ship pre-built.
  - title: HTTP interceptor
    details: Outgoing HttpClient requests automatically carry the bearer access token.
  - title: Route guards
    details: Protect any route with the authGuard CanActivateFn.
  - title: Made for Angular
    details: Standalone components, bootstrapApplication and the modern Angular DI work out of the box.
  - title: Static hosting
    details: Ships as a pure client-side SPA — deploy to any static host with a history fallback.
---
