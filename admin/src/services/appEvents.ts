import {AppService} from "./appService";
import {BehaviorSubject} from "rxjs";

export class AppEvents {
  private _signinChange: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(private app: AppService) {
  }

  public onSigninChange(): BehaviorSubject<boolean> {
    return this._signinChange;
  }
}
