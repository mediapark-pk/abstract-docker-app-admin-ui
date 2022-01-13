import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {FormControl, FormGroup} from "@angular/forms";
import {ApiErrorHandleOpts, AppService} from "../../../services/appService";
import {AdminPanelService} from "../../../services/adminPanelService";
import {ApiQueryFail, ApiSuccess} from "../../../services/apiService";
import {ValidatorService} from "../../../services/validatorService";

interface AccountPageAdmin {
  email: string,
  phone: string | null
}

interface AccountPageData {
  admin: AccountPageAdmin,
  suggestedAuthSeed: string
}

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit {
  public validator: ValidatorService;
  public appName: string;
  public accountData?: AccountPageData;
  public formsDisabled: boolean = true;
  public editAccountSubmit: boolean = false;
  public changePwSubmit: boolean = false;
  public changeTotpSubmit: boolean = false;
  public successEditAccount: boolean = false;
  public successChangePassword: boolean = false;
  public successChangeSeed: boolean = false;

  public editAccountForm: FormGroup = new FormGroup({
    phone: new FormControl()
  });

  public changePasswordForm: FormGroup = new FormGroup({
    newPassword: new FormControl(),
    retypeNewPassword: new FormControl(),
    totp: new FormControl()
  });

  public changeTotpForm: FormGroup = new FormGroup({
    currentTotp: new FormControl(),
    newTotp: new FormControl()
  });

  constructor(private app: AppService, private adminPanel: AdminPanelService) {
    this.appName = app.appName;
    this.validator = app.validator;
  }

  private async loadAccountPageData() {
    this.formsDisabled = true;

    await this.app.api.callServer("get", "/auth/account", {}).then((success: ApiSuccess) => {
      if (success.result.hasOwnProperty("admin") && success.result.hasOwnProperty("suggestedAuthSeed")) {
        this.accountData = <AccountPageData>success.result;
        this.formsDisabled = false;

        if (typeof this.accountData.admin.phone === "string") {
          this.editAccountForm.get("phone")?.setValue(this.accountData.admin.phone);
        }
      }
    }).catch((error: ApiQueryFail) => {
      this.app.handleAPIError(error);
    });
  }

  public async submitEditAccountForm() {
    let inputErrors: number = 0;
    let phone: string | any;

    this.successEditAccount = false;

    // Phone number
    try {
      phone = this.validator.validateInput(this.editAccountForm.get("phone")?.value);
      if (!this.validator.isValidPhNum(phone)) {
        throw new Error('Invalid phone number format');
      }
    } catch (e) {
      this.editAccountForm.get("phone")?.setErrors({message: e.message});
      inputErrors++;
    }

    if (inputErrors !== 0) {
      return;
    }

    this.formsDisabled = true;
    this.editAccountSubmit = true;

    await this.app.api.callServer("post", "/auth/account", {
      action: "account",
      phone: phone
    }).then(() => {
      this.successEditAccount = true;
    }).catch((error: ApiQueryFail) => {
      this.app.handleAPIError(error, <ApiErrorHandleOpts>{formGroup: this.editAccountForm});
    });

    this.editAccountSubmit = false;
    this.formsDisabled = false;
  }

  public async submitChangePassword() {
    let inputErrors: number = 0;
    let newPassword: string = "",
      retypeNewPassword: string = "",
      totpCode: string = "";

    // New Password
    try {
      newPassword = this.app.validator.validatePassword(
        this.changePasswordForm.get("newPassword")?.value,
        'New password'
      );
    } catch (e) {
      this.changePasswordForm.get("newPassword")?.setErrors({message: e.message});
      inputErrors++;
    }

    try {
      retypeNewPassword = this.changePasswordForm.get("retypeNewPassword")?.value;
      if (retypeNewPassword !== newPassword) {
        throw new Error('You must retype the same password');
      }
    } catch (e) {
      this.changePasswordForm.get("retypeNewPassword")?.setErrors({message: e.message});
      inputErrors++;
    }

    // TOTP
    try {
      totpCode = this.app.validator.validateTotp(this.changePasswordForm.get("totp")?.value);
    } catch (e) {
      this.changePasswordForm.get("totp")?.setErrors({message: e.message});
      inputErrors++;
    }

    // Errors?
    if (inputErrors !== 0) {
      return;
    }

    this.changePasswordForm.get("totp")?.setValue(""); // Clear out TOTP code

    this.formsDisabled = true;
    this.changePwSubmit = true;

    await this.app.api.callServer("post", "/auth/account", {
      action: "password",
      newPassword: newPassword,
      retypeNewPassword: retypeNewPassword,
      totp: totpCode
    }).then(() => {
      this.successChangePassword = true;
      this.app.flash.authSessionSignin = 'Your password has been changed!';
      this.app.auth.clear();
      setTimeout(() => {
        this.app.router.navigate(["/signin"]).then();
      }, 2000);
    }).catch((error: ApiQueryFail) => {
      this.changePwSubmit = false;
      this.app.handleAPIError(error, <ApiErrorHandleOpts>{formGroup: this.changePasswordForm});
    });

    this.formsDisabled = false;
  }

  public async submitChangeTotp() {
    let inputErrors: number = 0;
    let newTotp: string = "",
      currentTotp: string = "";

    // TOTP Codes
    try {
      newTotp = this.app.validator.validateTotp(this.changeTotpForm.get("newTotp")?.value);
    } catch (e) {
      this.changeTotpForm.get("newTotp")?.setErrors({message: e.message});
      inputErrors++;
    }

    try {
      currentTotp = this.app.validator.validateTotp(this.changeTotpForm.get("currentTotp")?.value);
    } catch (e) {
      this.changeTotpForm.get("currentTotp")?.setErrors({message: e.message});
      inputErrors++;
    }

    if (inputErrors !== 0) {
      return;
    }

    this.changeTotpForm.get("currentTotp")?.setValue(""); // Clear out TOTP code

    this.formsDisabled = true;
    this.changeTotpSubmit = true;

    await this.app.api.callServer("post", "/auth/account", {
      action: "auth_seed",
      newTotp: newTotp,
      currentTotp: currentTotp
    }).then(() => {
      this.successChangeSeed = true;
    }).catch((error: ApiQueryFail) => {
      this.app.handleAPIError(error, <ApiErrorHandleOpts>{formGroup: this.changeTotpForm});
    });

    this.formsDisabled = false;
    this.changeTotpSubmit = false;
  }

  public changeSeedTotpType(e: any): void {
    this.validator.parseTotpField(e, () => {
      this.submitChangeTotp().then();
    });
  }

  public changePwTotpType(e: any): void {
    this.validator.parseTotpField(e, () => {
      this.submitChangePassword().then();
    });
  }

  ngOnInit(): void {
    this.loadAccountPageData().then();
    this.adminPanel.breadcrumbs.next([
      {page: 'My Account', active: true, icon: 'fas fa-user-edit'}
    ]);
    this.adminPanel.titleChange.next(["My Account"]);
  }
}
