import {ApiErrorHandleOpts, AppService} from "./appService";
import {ApiQueryFail, ApiSuccess} from "./apiService";

export type authSessionType = "web" | "app";

export interface AuthSessionMeta {
  token: string,
  hmacSecret: string
}

export interface AuthAdminPrivileges {
  [key: string]: boolean
}

export interface AuthAdmin {
  email: string,
  isRoot: boolean,
  privileges: AuthAdminPrivileges
}

export interface AuthSession {
  type: authSessionType,
  archived: boolean,
  admin: AuthAdmin,
  issuedOn: number,
  lastUsedOn: number,
  last2faOn: number,
}

export class AuthService {
  private authSessionMeta?: AuthSessionMeta;
  private authSession?: AuthSession;

  public constructor(private app: AppService) {
    if (!this.app.persistent) {
      return;
    }

    try {
      this.authSessionMeta = this.loadSessionMeta();
    } catch (e) {
      // Delete invalid values from localStorage
      this.clear();
    }
  }

  public clear(): void {
    let prevStatus: boolean = this.isAuthenticated();
    localStorage.removeItem(this.app.localStorageMap.authSessionId);
    localStorage.removeItem(this.app.localStorageMap.authSessionHmacSecret);
    this.authSessionMeta = undefined;
    this.authSession = undefined;

    if (prevStatus) {
      this.app.events.onSigninChange().next(false);
    }
  }

  public authenticate(meta: AuthSessionMeta, errorOpts?: ApiErrorHandleOpts): Promise<void> {
    return new Promise<void>((authenticated, problem) => {
      this.app.api.callServer("get", "/auth/session", {}, {useSessionToken: meta}).then((success: ApiSuccess) => {
        let authSession: AuthSession = <AuthSession>success.result;

        // Authenticate
        this.authSessionMeta = meta;
        this.authSession = authSession;

        if (this.app.persistent) {
          localStorage.setItem(this.app.localStorageMap.authSessionId, meta.token);
          localStorage.setItem(this.app.localStorageMap.authSessionHmacSecret, meta.hmacSecret);
        }

        // Fire event
        this.app.events.onSigninChange().next(true);

        return authenticated();
      }).catch((error: ApiQueryFail) => {
        this.app.handleAPIError(error, errorOpts);
        return problem();
      });
    });
  }

  private loadSessionMeta(): AuthSessionMeta {
    let sessionToken = localStorage.getItem(this.app.localStorageMap.authSessionId);
    let hmacSecret = localStorage.getItem(this.app.localStorageMap.authSessionHmacSecret);

    // noinspection SuspiciousTypeOfGuard
    if (typeof sessionToken !== "string" || !sessionToken.match(/[a-f0-9]{64}/i)) {
      throw new Error('Invalid token');
    }

    // noinspection SuspiciousTypeOfGuard
    if (typeof hmacSecret !== "string" || hmacSecret.length !== 16) {
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

  public hasToken(): boolean {
    return !!this.authSessionMeta;
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
}
