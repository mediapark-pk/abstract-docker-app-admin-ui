import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup} from "@angular/forms";
import {AppService} from "../../../services/appService";
import {AdminPanelService} from "../../../services/adminPanelService";
import {ApiQueryFail, ApiSuccess} from "../../../services/apiService";

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
  public appName: string;
  public accountData?: AccountPageData;
  public formsDisabled: boolean = true;
  public editAccountSubmit: boolean = false;
  public changePwSubmit: boolean = false;
  public changeTotpSubmit: boolean = false;

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
    this.appName = this.app.appName;
  }

  private async loadAccountPageData() {
    this.formsDisabled = true;

    await this.app.api.callServer("get", "/auth/account", {}).then((success: ApiSuccess) => {
      if (success.result.hasOwnProperty("admin") && success.result.hasOwnProperty("suggestedAuthSeed")) {
        this.accountData = <AccountPageData>success.result;
        this.formsDisabled = false;
      }
    }).catch((error: ApiQueryFail) => {
      this.app.handleAPIError(error);
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
