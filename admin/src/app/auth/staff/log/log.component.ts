import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-log',
  templateUrl: './log.component.html',
  styleUrls: ['./log.component.scss']
})
export class LogComponent implements OnInit {

  public currentPage: number = 1;
  public perPage: number = 50;
  public totalRows: number = 2000;

  constructor() {
  }

  public changePage(e: any) {
    this.currentPage = e;
  }

  ngOnInit(): void {
  }

}
