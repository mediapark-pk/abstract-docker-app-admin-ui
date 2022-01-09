import {Component, OnInit} from '@angular/core';
import {AppService} from "../../services/appService";

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {
  public appName: string;
  public displaySidenav: boolean;
  public screenSize: number;

  constructor(private app: AppService) {
    this.appName = app.appName;
    this.screenSize = window.innerWidth;
    this.displaySidenav = window.innerWidth >= 769;
  }

  ngOnInit(): void {
  }

}
