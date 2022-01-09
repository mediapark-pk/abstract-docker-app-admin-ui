import {Injectable} from "@angular/core";
import {CanActivate} from "@angular/router";
import {AppService} from "./appService";

@Injectable({providedIn: "root"})

export class AuthGuard implements CanActivate {
  public constructor(private app: AppService) {
  }

  private async authenticate(): Promise<boolean> {
    if (!this.app.auth.hasToken()) {
      this.app.router.navigate(["/signin"]).then();
      return false;
    }

    let authenticated: boolean = false;
    await this.app.auth.authenticate(this.app.auth.meta()).then(() => {
      authenticated = true;
    });

    if (authenticated) {
      return true;
    }

    this.app.router.navigate(["/signin"]).then();
    return false;
  }

  public canActivate(): Promise<boolean> {
    return this.authenticate();
  }
}
