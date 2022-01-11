import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {AppService} from "../../services/appService";
import {AdminPanelService, breadcrumb} from "../../services/adminPanelService";
import {Title} from "@angular/platform-browser";

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {
  public appName: string;
  public displaySidenav: boolean;
  public screenSize: number;
  public breadcrumbs: Array<breadcrumb> = [];

  constructor(private app: AppService, private adminPanel: AdminPanelService, private titleChange: Title, private cdr: ChangeDetectorRef) {
    this.appName = app.appName;
    this.screenSize = window.innerWidth;
    this.displaySidenav = window.innerWidth >= 769;
  }

  ngOnInit(): void {
    this.adminPanel.breadcrumbs.subscribe((change: Array<breadcrumb>) => {
      let breadcrumbs = [];
      breadcrumbs.push({page: "Home", link: "dashboard", icon: "fal fa-home"});
      change.forEach(function (breadcrumb: breadcrumb) {
        breadcrumbs.push(breadcrumb);
      })

      this.breadcrumbs = breadcrumbs;

      this.cdr.detectChanges();
    });

    this.adminPanel.titleChange.subscribe((pageTitle: Array<string>) => {
      this.titleChange.setTitle(pageTitle.concat([this.appName]).join(" / "))

      this.cdr.detectChanges();
    });
  }
}
