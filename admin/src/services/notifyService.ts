import {ActiveToast, IndividualConfig, ToastrService} from "ngx-toastr";
import {Injectable} from "@angular/core";

export type notifyType = "success" | "error" | "info" | "warning";
export type notifyPos =
  "top-left"
  | "top-full-width"
  | "top-right"
  | "bottom-full-width"
  | "bottom-left"
  | "bottom-right";

@Injectable({providedIn: "root"})

export class NotifyService {
  public toastConfig = <IndividualConfig>{
    timeOut: 6000,
    closeButton: true,
    extendedTimeOut: 3000,
    progressBar: true,
    enableHtml: true,
    tapToDismiss: true,
    positionClass: 'toast-bottom-right'
  };

  constructor(private toasts: ToastrService) {
    toasts.toastrConfig.maxOpened = 10;
  }

  public error(text: string, title?: string, pos: notifyPos = "top-right"): void {
    this.toastr("error", pos, text, title);
  }

  public info(text: string, title?: string, pos: notifyPos = "bottom-right"): void {
    this.toastr("info", pos, text, title);
  }

  public warning(text: string, title?: string, pos: notifyPos = "bottom-right"): void {
    this.toastr("warning", pos, text, title);
  }

  public success(text: string, title?: string, pos: notifyPos = "bottom-full-width"): void {
    this.toastr("success", pos, text, title);
  }

  /**
   * Show toast
   * @param type
   * @param pos
   * @param text
   * @param title
   * @private
   */
  public toastr(type: notifyType, pos: notifyPos, text: string, title?: string): ActiveToast<any> {
    let config = Object.assign({}, this.toastConfig);
    return this.toasts.show(
      text,
      title,
      Object.assign(config, {positionClass: "toast-" + pos}),
      "toast-" + type
    );
  }
}
