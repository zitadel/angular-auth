import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  template: `
    <header>
      <h1>ZITADEL Angular Auth Playground</h1>
      <nav>
        <a routerLink="/">Home</a>
        <a routerLink="/profile">Profile</a>
        <a routerLink="/api-demo">API demo</a>
      </nav>
    </header>
    <main>
      <router-outlet />
    </main>
  `,
})
export class AppComponent {}
