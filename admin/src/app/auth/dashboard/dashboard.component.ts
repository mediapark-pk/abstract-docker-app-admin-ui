import {Component, OnInit} from '@angular/core';
import {AdminPanelService} from "../../../services/adminPanelService";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  constructor(private adminPanel: AdminPanelService) {
  }

  ngOnInit(): void {
    this.adminPanel.breadcrumbs.next([{page: "Dashboard", active: true}]);
    this.adminPanel.titleChange.next(["Dashboard"]);
  }

}
