import {AppService} from "./appService";

export class ValidatorService {
  public constructor(private _app: AppService) {
  }

  public validateTotp(totpCode: any): string {
    if (typeof totpCode !== "string" || !totpCode.length) {
      throw new Error('2FA TOTP code is required');
    }

    if (!/^[0-9]{6}$/.test(totpCode)) {
      throw new Error('Incomplete/Invalid TOTP code');
    }

    return totpCode;
  }

  public validateInput(input: any, required: boolean = true): string {
    if (typeof input === "number") {
      input = input.toString();
    }

    if (typeof input !== "string") {
      if (required) {
        throw new Error('This field is required');
      }

      return "";
    }

    if (!this.isASCII(input, true, false)) {
      throw new Error('Input contains an illegal character');
    }

    return input;
  }

  public validatePassword(password: any): string {
    if (typeof password !== "string" || !password.length) {
      throw new Error('Password is required');
    }

    if (!this.isASCII(password, true, false)) {
      throw new Error('Password contains illegal character');
    }

    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }

    if (password.length > 32) {
      throw new Error('Password cannot exceed 32 characters');
    }

    return password;
  }

  public validateEmail(email: any): string {
    if (typeof email !== "string" || !email.length) {
      throw new Error('E-mail address is required');
    }

    if (!this.isValidEmail(email)) {
      throw  new Error('Invalid e-mail address');
    }

    if (email.length > 32) {
      throw new Error('E-mail address must not exceed 32 characters');
    }

    return email;
  }

  public isValidEmail(email: any): boolean {
    if (typeof email !== "string") {
      return false;
    }

    if (/^\w+@[a-z0-9]+(\.[a-z0-9]{2,8}){1,3}$/.test(email)) {
      return false;
    }

    return false;
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
