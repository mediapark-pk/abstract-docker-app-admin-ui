import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup} from "@angular/forms";
import {ApiErrorHandleOpts, AppService} from "../../services/appService";
import {sign} from "chart.js/helpers";
import {ApiQueryFail, ApiSuccess} from "../../services/apiService";
import {AuthSessionMeta} from "../../services/authService";

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss']
})
export class SigninComponent implements OnInit {
  public authSessionMsg?: string;
  public signinDisabled: boolean = false;
  public signinLoading: boolean = false;
  public totpSubmit: boolean = false;
  public signinForm = new FormGroup({
    email: new FormControl(),
    password: new FormControl(),
    totp: new FormControl()
  });

  constructor(private app: AppService) {
    if (app.flash.authSessionSignin) {
      this.authSessionMsg = app.flash.authSessionSignin;
      app.flash.authSessionSignin = undefined;
    }

    if (this.app.auth.isAuthenticated()) {
      this.app.router.navigate(["/auth/dashboard"]).then();
      return;
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
        console.log(success.result);
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

    await this.app.auth.authenticate(sessionToken);


  }

  public totpType(e: any): void {
    let enteredCode = e.target.value;
    if (typeof enteredCode === "string") {
      enteredCode = enteredCode.replace(/[^0-9]/, '');
      e.target.value = enteredCode;
    }

    if (enteredCode.length === 6 && !this.totpSubmit) {
      this.totpSubmit = true;
      this.signinSubmit().then();
      return;
    }

    if (enteredCode.length < 6) {
      this.totpSubmit = false;
      return;
    }
  }

  ngOnInit(): void {
  }

}
