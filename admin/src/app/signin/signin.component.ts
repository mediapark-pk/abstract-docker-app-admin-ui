import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup} from "@angular/forms";
import {AppService} from "../../services/appService";

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss']
})
export class SigninComponent implements OnInit {
  public authSessionMsg?: string;
  public signinDisabled: boolean = false;
  public signinLoading: boolean = false;
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

  public signinSubmit(): void {
    let inputErrors: number = 0;
    let email: string, password: string, totpCode: string;
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

  }

  public totpType(e: any): void {
    let enteredCode = e.target.value;
    if (typeof enteredCode === "string") {
      enteredCode = enteredCode.replace(/[^0-9]/, '');
      e.target.value = enteredCode;
    }

    if (enteredCode.length === 6) {
      return this.signinSubmit();
    }
  }

  ngOnInit(): void {
  }

}
