import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideZitadelAuth, ZITADEL_ROUTES } from '@zitadel/angular-auth';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [
    provideZitadelAuth({
      authority: import.meta.env.NG_APP_ZITADEL_DOMAIN,
      client_id: import.meta.env.NG_APP_ZITADEL_CLIENT_ID,
      redirect_uri: import.meta.env.NG_APP_ZITADEL_REDIRECT_URI,
      post_logout_redirect_uri: import.meta.env
        .NG_APP_ZITADEL_POST_LOGOUT_REDIRECT_URI,
      scope: import.meta.env.NG_APP_ZITADEL_SCOPE,
    }),
    // Register the application's own routes alongside the pre-built auth routes.
    provideRouter([...routes, ...ZITADEL_ROUTES]),
  ],
}).catch((err) => console.error(err));
