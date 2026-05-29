import { JsonPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { AuthService } from '@zitadel/angular-auth';

/**
 * Demonstrates a real `HttpClient` call. Because `provideZitadelAuth()`
 * registers `authzTokenInterceptor`, the request automatically carries the
 * bearer access token when the user is authenticated.
 */
@Component({
  selector: 'app-api-demo',
  standalone: true,
  imports: [JsonPipe],
  template: `
    <h2>API demo</h2>
    <p>
      Calls the ZITADEL <code>/oidc/v1/userinfo</code> endpoint. The auth token
      interceptor attaches the bearer token automatically.
    </p>
    <button (click)="callApi()" [disabled]="!isAuthenticated()">
      Call userinfo
    </button>
    @if (!isAuthenticated()) {
      <p>Sign in first to call the API.</p>
    }
    @if (result()) {
      <pre>{{ result() | json }}</pre>
    }
    @if (error()) {
      <p>Request failed — see the console.</p>
    }
  `,
})
export class ApiDemoComponent {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  readonly isAuthenticated = this.auth.isAuthenticated;
  readonly result = signal<unknown>(null);
  readonly error = signal<boolean>(false);

  callApi(): void {
    const url = `${import.meta.env.NG_APP_ZITADEL_DOMAIN}/oidc/v1/userinfo`;
    this.error.set(false);
    this.http.get(url).subscribe({
      next: (data) => this.result.set(data),
      error: (err) => {
        console.error('API call failed', err);
        this.error.set(true);
      },
    });
  }
}
