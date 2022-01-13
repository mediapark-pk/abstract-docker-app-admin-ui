import {AppService} from "./appService";
import {BehaviorSubject} from "rxjs";
import {ApiWarningMsg} from "./apiService";

export class AppEvents {
  private _signinChange: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private _apiCallWarnings: BehaviorSubject<Array<ApiWarningMsg>> = new BehaviorSubject<Array<ApiWarningMsg>>([]);

  constructor(private app: AppService) {
  }

  public apiCallWarnings(): BehaviorSubject<Array<ApiWarningMsg>> {
    return this._apiCallWarnings;
  }

  public onSigninChange(): BehaviorSubject<boolean> {
    return this._signinChange;
  }
}
