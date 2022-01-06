import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {AbstractControl} from "@angular/forms";

@Component({
  selector: 'app-form-field-error',
  templateUrl: './form-field-error.component.html',
  styleUrls: ['./form-field-error.component.scss']
})
export class FormFieldErrorComponent implements OnInit, OnDestroy {
  @Input("formField") formField!: AbstractControl;

  constructor() {
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
  }
}
