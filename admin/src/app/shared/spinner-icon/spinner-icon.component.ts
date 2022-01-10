import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-spinner-icon',
  templateUrl: './spinner-icon.component.html',
  styleUrls: ['./spinner-icon.component.scss']
})
export class SpinnerIconComponent implements OnInit {
  @Input() spinnerClass: string = "text-white";

  constructor() {
  }

  ngOnInit(): void {
  }

}
