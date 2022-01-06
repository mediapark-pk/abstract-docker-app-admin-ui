import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup} from "@angular/forms";
import {AppService} from "../../services/appService";

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss']
})
export class SigninComponent implements OnInit {
  public signinLoading: boolean = false;
  public signinForm = new FormGroup({
    email: new FormControl(),
    password: new FormControl(),
    totp: new FormControl()
  });

  constructor(private app: AppService) {
  }

  public testDemo(): void {
    this.signinForm.get("email")?.setErrors({message: 'This looks like a bad e-mail address!'});
    this.app.notify.success('Pressed the button!');
  }

  ngOnInit(): void {
  }

}
