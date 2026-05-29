import { Routes } from '@angular/router';
import { authGuard } from '@zitadel/angular-auth';
import { HomeComponent } from './home.component';
import { ProfileComponent } from './profile.component';
import { ApiDemoComponent } from './api-demo.component';

/**
 * The playground's own application routes. The library's `ZITADEL_ROUTES` are
 * spread in alongside these in `main.ts`.
 */
export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'api-demo', component: ApiDemoComponent },
];
