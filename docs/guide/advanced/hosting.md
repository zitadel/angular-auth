---
title: Hosting
group: Advanced
---

# Hosting

`@zitadel/angular-auth` runs entirely in the browser, so an app that uses it is
a plain static single-page application. After building (`ng build`) you deploy
the contents of the `dist/` output directory to any static host or CDN — there
is no Node server, no session store and no secret to manage.

## History fallback

The auth routes (`/auth/callback`, `/auth/logout/callback`, `/auth/account`,
…) and your own client-side routes are handled by the Angular Router, not by
the host. A user who reloads `/auth/callback` or deep-links to `/profile` must
still be served `index.html` so the router can take over. Configure your host
to fall back to `index.html` for unknown paths.

### Nginx

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

### Netlify (`_redirects`)

```text
/*  /index.html  200
```

### Vercel (`vercel.json`)

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### Apache (`.htaccess`)

```apacheconf
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

## Redirect URIs and origins

Register the production origin's `/auth/callback` and `/auth/logout/callback`
URLs in your ZITADEL application's **Redirect URIs** and **Post Logout Redirect
URIs**, and set the matching `redirect_uri` / `post_logout_redirect_uri` in the
configuration you pass to `provideZitadelAuth()`. Each deployment origin
(development, staging, production) needs its own registered URLs.

Serve the app over HTTPS in production — the PKCE flow and secure token storage
assume a secure origin.
