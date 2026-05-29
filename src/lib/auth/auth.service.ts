import { Inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
  SigninPopupArgs,
  SigninRedirectArgs,
  SigninSilentArgs,
  SignoutPopupArgs,
  SignoutRedirectArgs,
  User,
  UserManager,
  UserManagerSettings,
  WebStorageStateStore,
} from 'oidc-client-ts';
import { BehaviorSubject, from, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { OIDC_CONFIG_TOKEN } from '../oidc-config.token.js';
import { applyOidcConfigDefaults, ZitadelScopeConfig } from '../utils.js';
import { hasRole } from '../has-role.js';

/**
 * Root-provided service that wraps the `oidc-client-ts` `UserManager` and
 * exposes a signal-based, PKCE-ready authentication API for Angular apps.
 *
 * Reactive state is published through Angular signals ({@link AuthService.user},
 * {@link AuthService.isAuthenticated}, {@link AuthService.authError}) so it can
 * be consumed directly in component templates.
 *
 * @example
 * ```ts
 * import { Component, inject } from '@angular/core';
 * import { AuthService } from '@zitadel/angular-auth';
 *
 * @Component({ selector: 'app-nav', standalone: true, template: '' })
 * export class NavComponent {
 *   private auth = inject(AuthService);
 *   isAuthenticated = this.auth.isAuthenticated;
 *
 *   login(): void {
 *     this.auth.signinRedirect();
 *   }
 * }
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  /**
   * The underlying UserManager instance handling OpenID Connect operations.
   */
  private userManager!: UserManager;

  /**
   * BehaviorSubject holding the current authenticated user or null.
   */
  protected readonly user$ = new BehaviorSubject<User | null>(null);

  /**
   * Signal representation of the current user, or `undefined` before the first
   * emission.
   */
  readonly user = toSignal(this.user$);

  /**
   * Observable indicating whether the user is currently authenticated.
   */
  private readonly isAuthenticated$: Observable<boolean> = this.user$.pipe(
    map((user) => !!user && !user.expired),
  );

  /**
   * Signal representation of the authentication status.
   */
  readonly isAuthenticated = toSignal(this.isAuthenticated$);

  /**
   * BehaviorSubject holding any authentication errors that occur.
   */
  public readonly authError$ = new BehaviorSubject<Error | null | unknown>(
    null,
  );

  /**
   * Signal representation of the authentication error status.
   */
  public readonly authError = toSignal(this.authError$);

  /**
   * Constructs the AuthService.
   *
   * @param config - The {@link UserManagerSettings} for configuring the OpenID
   *   Connect client, injected via {@link OIDC_CONFIG_TOKEN}.
   * @param router - The Angular Router used for navigation on callback errors.
   */
  constructor(
    @Inject(OIDC_CONFIG_TOKEN)
    private config: UserManagerSettings & ZitadelScopeConfig,
    private readonly router: Router,
  ) {
    this.initializeUserManager();
    // explicitly call getUser() to check if the user is already logged in
    this.getUser().subscribe();
  }

  /**
   * Initializes the UserManager with the provided configuration.
   * Configures user storage and event listeners.
   * @private
   */
  private initializeUserManager(): void {
    const withDefaults = applyOidcConfigDefaults(this.config);

    this.config = withDefaults.userStore
      ? withDefaults
      : {
          ...withDefaults,
          userStore: new WebStorageStateStore({
            store: window.localStorage,
          }),
        };

    this.userManager = new UserManager(this.config);

    this.userManager.events.addUserLoaded((user) => {
      this.user$.next(user);
    });

    this.userManager.events.addUserUnloaded(() => {
      this.user$.next(null);
    });

    this.userManager.events.addUserSignedOut(() => {
      this.user$.next(null);
    });

    this.userManager.events.addSilentRenewError((error) => {
      console.error('Silent renew error:', error);
      this.authError$.next(error);
    });
  }

  /**
   * Returns the current user from the UserManager.
   *
   * @returns An observable emitting the current {@link User} or `null` if not
   *   logged in.
   *
   * @example
   * ```ts
   * auth.getUser().subscribe((user) => console.log(user?.profile?.sub));
   * ```
   */
  getUser(): Observable<User | null> {
    return from(this.userManager.getUser()).pipe(
      tap((user) => this.user$.next(user)),
      catchError((error: Error) => {
        console.error('Error getting user:', error);
        this.authError$.next(error);
        return of(null);
      }),
    );
  }

  /**
   * Initiates a redirect-based sign-in process.
   *
   * @param args - Optional arguments forwarded to the underlying UserManager.
   * @returns A promise that resolves when the sign-in redirect is initiated.
   * @throws Re-throws any error raised by the underlying UserManager.
   *
   * @example
   * ```ts
   * await auth.signinRedirect();
   * ```
   */
  public async signinRedirect(args?: SigninRedirectArgs): Promise<void> {
    try {
      await this.userManager.signinRedirect(args);
    } catch (error) {
      console.error('Error during sign-in redirect:', error);
      this.authError$.next(error);
      throw error;
    }
  }

  /**
   * Initiates a popup-based sign-in process.
   *
   * @param args - Optional arguments forwarded to the underlying UserManager.
   * @returns A promise that resolves when the sign-in popup completes.
   * @throws Re-throws any error raised by the underlying UserManager.
   *
   * @example
   * ```ts
   * await auth.signinPopup();
   * ```
   */
  public async signinPopup(args?: SigninPopupArgs): Promise<void> {
    try {
      const user = await this.userManager.signinPopup(args);
      this.user$.next(user);
    } catch (error) {
      console.error('Error during sign-in popup:', error);
      this.authError$.next(error);
      throw error;
    }
  }

  /**
   * Attempts a silent (iframe-based) sign-in process.
   *
   * @param args - Optional arguments forwarded to the underlying UserManager.
   * @returns A promise resolving to the authenticated {@link User} or `null`.
   * @throws Re-throws any error raised by the underlying UserManager.
   *
   * @example
   * ```ts
   * const user = await auth.signinSilent();
   * ```
   */
  public async signinSilent(args?: SigninSilentArgs): Promise<User | null> {
    try {
      const user = await this.userManager.signinSilent(args);
      this.user$.next(user);
      return user;
    } catch (error) {
      console.error('Error during silent sign-in:', error);
      this.authError$.next(error);
      throw error;
    }
  }

  /**
   * Handles the sign-in callback after a redirect or popup.
   *
   * @param url - The URL to process. Defaults to the current URL.
   * @returns A promise that resolves when the callback is handled.
   * @throws Re-throws any error raised by the underlying UserManager after
   *   navigating to the error route.
   *
   * @example
   * ```ts
   * await auth.signinCallback();
   * ```
   */
  public async signinCallback(url?: string): Promise<void> {
    try {
      const user = await this.userManager.signinCallback(url);
      if (user) {
        this.user$.next(user);
      }
    } catch (error) {
      console.error('Error during sign-in callback:', error);
      this.authError$.next(error);
      await this.router.navigate(['/auth/error']);
      throw error;
    }
  }

  /**
   * Handles the sign-out callback after a redirect or popup.
   *
   * @param url - The URL to process. Defaults to the current URL.
   * @returns A promise that resolves when the callback is handled.
   * @throws Re-throws any error raised by the underlying UserManager.
   *
   * @example
   * ```ts
   * await auth.signoutCallback();
   * ```
   */
  public async signoutCallback(url?: string): Promise<void> {
    try {
      await this.userManager.signoutCallback(url);
    } catch (error) {
      console.error('Error during sign-out callback:', error);
      this.authError$.next(error);
      throw error;
    } finally {
      this.cleanupAfterSignout();
    }
  }

  /**
   * Initiates a redirect-based sign-out process.
   *
   * @param args - Optional arguments forwarded to the underlying UserManager.
   * @returns A promise that resolves when the sign-out redirect is initiated.
   * @throws Re-throws any error raised by the underlying UserManager.
   *
   * @example
   * ```ts
   * await auth.signoutRedirect();
   * ```
   */
  public async signoutRedirect(args?: SignoutRedirectArgs): Promise<void> {
    try {
      await this.userManager.signoutRedirect(args);
    } catch (error) {
      console.error('Error during sign-out redirect:', error);
      this.authError$.next(error);
      throw error;
    } finally {
      this.cleanupAfterSignout();
    }
  }

  /**
   * Initiates a popup-based sign-out process.
   *
   * @param args - Optional arguments forwarded to the underlying UserManager.
   * @returns A promise that resolves when the sign-out popup completes.
   * @throws Re-throws any error raised by the underlying UserManager.
   *
   * @example
   * ```ts
   * await auth.signoutPopup();
   * ```
   */
  public async signoutPopup(args?: SignoutPopupArgs): Promise<void> {
    try {
      await this.userManager.signoutPopup(args);
    } catch (error) {
      console.error('Error during sign-out popup:', error);
      this.authError$.next(error);
      throw error;
    } finally {
      this.cleanupAfterSignout();
    }
  }

  /**
   * Gets the underlying `oidc-client-ts` {@link UserManager} instance, for
   * advanced scenarios not covered by this service's API.
   *
   * @returns The UserManager instance.
   *
   * @example
   * ```ts
   * auth.userManagerInstance.events.addAccessTokenExpiring(() => {});
   * ```
   */
  public get userManagerInstance(): UserManager {
    return this.userManager;
  }

  /**
   * Stores the pathname intercepted by the auth guard so the user can be
   * returned to it after a successful sign-in.
   *
   * @param path - The path to store. Defaults to the current pathname.
   */
  public setAuthGuardInterceptedPathname(path?: string): void {
    const pathToStore = path || window.location.pathname;
    localStorage.setItem('authGuardInterceptedPathname', pathToStore);
  }

  /**
   * Gets the pathname previously intercepted by the auth guard.
   *
   * @returns The stored pathname, or `'/'` if none was stored.
   */
  public getAuthGuardInterceptedPathname(): string {
    return localStorage.getItem('authGuardInterceptedPathname') || '/';
  }

  /**
   * Returns whether the current user holds the given Zitadel project role.
   *
   * @param role - The Zitadel project role name to check for.
   * @returns `true` when the current user holds the role, otherwise `false`.
   *
   * @example
   * ```ts
   * if (auth.hasRole('admin')) {
   *   // show admin UI
   * }
   * ```
   */
  public hasRole(role: string): boolean {
    return hasRole(this.user() ?? null, role);
  }

  /**
   * Cleans up user session and local storage after sign-out.
   * @private
   */
  private cleanupAfterSignout(): void {
    this.user$.next(null);
    void this.userManager.removeUser();
    localStorage.removeItem('authGuardInterceptedPathname');
  }
}
