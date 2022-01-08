import {AppService} from "./appService";
import {CanActivate} from "@angular/router";

export type authSessionType = "web" | "app";

export interface AuthSessionMeta {
  token: string,
  hmacSecret: string
}

export interface AuthSession {
  type: authSessionType,
  archived: boolean,
  adminEmail: string,
  issuedOn: number,
  lastUsedOn: number,
  last2faOn: number,
}

export class AuthService implements CanActivate {
  private authSessionMeta?: AuthSessionMeta;
  private authSession?: AuthSession;

  public constructor(private app: AppService) {
    try {
      let authSessionMeta = this.loadSessionMeta();
    } catch (e) {
      // Delete invalid values from localStorage
      localStorage.removeItem(this.app.localStorageMap.authSessionId);
      localStorage.removeItem(this.app.localStorageMap.authSessionHmacSecret);
    }
  }

  public authenticate(meta: AuthSessionMeta): void {

  }

  private loadSessionMeta(): AuthSessionMeta {
    let sessionToken = localStorage.getItem(this.app.localStorageMap.authSessionId);
    let hmacSecret = localStorage.getItem(this.app.localStorageMap.authSessionHmacSecret);

    if (!sessionToken || !sessionToken.match(/[a-f0-9]{64}/i)) {
      throw new Error('Invalid token');
    }

    if (!hmacSecret || hmacSecret.length !== 16) {
      throw new Error('Invalid HMAC secret');
    }

    return <AuthSessionMeta>{
      token: sessionToken,
      hmacSecret: hmacSecret
    };
  }

  public isAuthenticated(): boolean {
    return !!this.authSession;
  }

  public meta(): AuthSessionMeta {
    if (!this.authSessionMeta) {
      throw new Error('Session Token and HMAC secret not set');
    }

    return this.authSessionMeta;
  }

  public session(): AuthSession {
    if (!this.authSession) {
      throw new Error('Not logged in');
    }

    return this.authSession;
  }

  public canActivate(): boolean {
    if (this.authSession) {
      return true;
    }

    this.app.router.navigate(["/signin"]).then();
    return false;
  }
}
