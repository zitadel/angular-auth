---
title: Making API calls
group: Angular
---

# Making API calls

Once the [interceptor](./interceptor.md) is registered (automatically by
`provideZitadelAuth()`), authenticated `HttpClient` requests carry the bearer
token without any extra work.

## A token-carrying request

```ts
import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-api-demo',
  standalone: true,
  template: `
    <button (click)="callApi()">Call API</button>
    @if (result()) {
      <pre>{{ result() | json }}</pre>
    }
  `,
})
export class ApiDemoComponent {
  private readonly http = inject(HttpClient);
  readonly result = signal<unknown>(null);

  callApi(): void {
    this.http
      .get('https://your-zitadel-domain/oidc/v1/userinfo')
      .subscribe((data) => this.result.set(data));
  }
}
```

The request above is sent with `Authorization: Bearer <access_token>` because
the user is authenticated. There is no need to read or attach the token
manually.

## Reading the token directly

For the rare case where you call a non-`HttpClient` API (for example the
`fetch` API), read the token from the session signal:

```ts
import { inject } from '@angular/core';
import { AuthService } from '@zitadel/angular-auth';

const auth = inject(AuthService);
const token = auth.user()?.access_token;

await fetch('https://api.example.com/data', {
  headers: token ? { Authorization: `Bearer ${token}` } : {},
});
```
