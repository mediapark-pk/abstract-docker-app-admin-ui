import {Injectable} from "@angular/core";
import {Router} from "@angular/router";
import {HttpService} from "./httpService";
import {ValidatorService} from "./validatorService";
import {AppEvents} from "./appEvents";
import {NotifyService} from "./notifyService";

export interface PlainObject {
  [key: string]: any
}

@Injectable({providedIn: "root"})

export class AppService {
  public readonly localStorageMap = {};

  public readonly validator: ValidatorService;
  public readonly events: AppEvents;

  /**
   * AppService Constructor
   * @param http
   * @param router
   * @param notify
   */
  public constructor(
    public readonly http: HttpService,
    public readonly router: Router,
    public readonly notify: NotifyService
  ) {
    this.validator = new ValidatorService(this);
    this.events = new AppEvents(this);
  }

  /**
   * sprintf the PHP way!
   * @param str
   * @param data
   */
  public sprintf(str: string, data?: Array<any>): string {
    if (data && data.length > 0) {
      for (let i = 0; i < data.length; i++) {
        str = str.replace(/%d|%s/, data[i])
      }
    }

    return str;
  }

  /**
   * Copy text to clipboard
   * @param text
   * @param showNoty
   */
  public copyToClipboard(text: string, showNoty: boolean = true): void {
    let listener = (e: ClipboardEvent) => {
      if (e.clipboardData) {
        e.clipboardData.setData("text/plain", (text));
        e.preventDefault();
      }
    };

    document.addEventListener("copy", listener);
    document.execCommand("copy");
    document.removeEventListener("copy", listener);

    if (showNoty) {
      this.notify.info("Copied to clipboard!");
    }
  }
}
