import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-button-loader',
  templateUrl: './button-loader.component.html',
  styleUrls: ['./button-loader.component.scss']
})
export class ButtonLoaderComponent implements OnInit {
  @Input() disabled: boolean = true;
  @Input() btnClass: string = "btn-primary";
  @Input() spinnerClass: string = "text-white";

  constructor() {
  }

  ngOnInit(): void {
  }

}
