import {AppService} from "./appService";

export class ValidatorService {
  public constructor(private _app: AppService) {
  }

  /**
   * Checks if string is ASCII (printable OR upto index 127 OR 255)
   * @param str
   * @param printable
   * @param extended
   */
  public isASCII(str: string, printable: boolean = true, extended: boolean = false): boolean {
    if (printable) {
      return /^[\x20-\x7E]*$/i.test(str);
    }

    return (extended ? /^[\x00-\xFF]*$/ : /^[\x00-\x7F]*$/).test(str);
  }

  /**
   * @param value
   * @param retain
   * @param trimRetain
   */
  public cleanDecimals(value: any, retain?: number, trimRetain?: boolean): string {
    let clean: string = value.toString();
    if (clean.indexOf(".") > -1) {
      clean = clean.replace(/0*$/g, '');
      clean = clean.replace(/\.$/g, '');
    }

    if (retain) {
      retain = parseInt(retain.toString());
      if (retain > 0) {
        let amount = clean.split(".");
        let decimals = amount[1] ?? "";
        let has: number = decimals.length;
        let needed: number = retain - has;
        if (needed > 0) {
          let zero: string = "0";
          decimals = decimals + zero.repeat(needed);
        }

        if (has > retain) {
          if (typeof trimRetain === "boolean" && trimRetain) {
            decimals = decimals.substr(0, retain);
          }
        }

        clean = amount[0] + "." + decimals;
      }
    }

    return clean;
  }
}
