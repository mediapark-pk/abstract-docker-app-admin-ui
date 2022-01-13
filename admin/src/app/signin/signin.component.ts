import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup} from "@angular/forms";
import {ApiErrorHandleOpts, AppService} from "../../services/appService";
import {ApiQueryFail, ApiSuccess} from "../../services/apiService";
import {AuthSessionMeta} from "../../services/authService";
import {ValidatorService} from "../../services/validatorService";

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss']
})
export class SigninComponent implements OnInit {
  public validator: ValidatorService;
  public authSessionMsg?: string;
  public signinDisabled: boolean = true;
  public signinLoading: boolean = false;
  public signinForm = new FormGroup({
    email: new FormControl(),
    password: new FormControl(),
    totp: new FormControl()
  });

  constructor(private app: AppService) {
    this.validator = app.validator;
    if (app.flash.authSessionSignin) {
      this.authSessionMsg = app.flash.authSessionSignin;
      app.flash.authSessionSignin = undefined;
    }

    if (this.app.auth.hasToken()) {
      this.app.router.navigate(["/auth/dashboard"]).then();
      return;
    } else {
      this.signinDisabled = false;
    }
  }

  public async signinSubmit() {
    let inputErrors = 0;
    let email: string = "",
      password: string = "",
      totpCode: string = "";
    let validator = this.app.validator;

    // E-mail address
    try {
      email = validator.validateEmail(this.signinForm.get("email")?.value);
    } catch (e) {
      this.signinForm.get("email")?.setErrors({message: e.message});
      inputErrors++;
    }

    // Password
    try {
      password = validator.validatePassword(this.signinForm.get("password")?.value);
    } catch (e) {
      this.signinForm.get("password")?.setErrors({message: e.message});
      inputErrors++;
    }

    // TOTP
    try {
      totpCode = validator.validateTotp(this.signinForm.get("totp")?.value);
    } catch (e) {
      this.signinForm.get("totp")?.setErrors({message: e.message});
      inputErrors++;
    }

    if (inputErrors !== 0) {
      return;
    }

    this.signinForm.get("totp")?.setValue(""); // Clear out TOTP input field

    this.signinDisabled = true;
    this.signinLoading = true;
    let signinData = {
      email: email,
      password: password,
      totp: totpCode
    };

    let sessionToken: AuthSessionMeta | undefined = undefined;
    await this.app.api.callServer("post", "/signin", signinData, {authSession: false}).then((success: ApiSuccess) => {
      try {
        if (!success.result.hasOwnProperty("token") || typeof success.result.token !== "string" || !/^[a-f0-9]{64}$/i.test(success.result.token)) {
          throw new Error('Invalid API session token');
        }

        if (!success.result.hasOwnProperty("secret") || typeof success.result.secret !== "string" || success.result.secret.length !== 16) {
          throw new Error('Invalid API session HMAC secret');
        }
      } catch (e) {
        this.app.notify.error(e.message);
        return;
      }

      sessionToken = {
        token: success.result.token,
        hmacSecret: success.result.secret
      };
    }).catch((error: ApiQueryFail) => {
      this.app.handleAPIError(error, <ApiErrorHandleOpts>{
        preventAuthSession: true,
        formGroup: this.signinForm
      });
    });

    if (!sessionToken) {
      this.signinDisabled = false;
      this.signinLoading = false;
      return;
    }

    let authenticated: boolean = false;
    await this.app.auth.authenticate(sessionToken, <ApiErrorHandleOpts>{preventAuthSession: true}).then(() => {
      authenticated = true;
    });

    if (authenticated) {
      this.signinLoading = false;
      this.app.router.navigate(["/auth/dashboard"]).then();
      return;
    }

    this.signinDisabled = false;
    this.signinLoading = false;
  }

  public totpType(e: any): void {
    this.app.validator.parseTotpField(e, () => {
      this.signinSubmit().then();
      return;
    });
  }

  ngOnInit(): void {
  }

}
