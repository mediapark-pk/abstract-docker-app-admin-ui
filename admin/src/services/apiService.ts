import {AppService, PlainObject} from "./appService";
import {HttpMethod, HttpSimpleObject} from "./httpService";
import * as crypto from "crypto-js";

export interface ApiConfig {
  server: string,
  authHeaderToken: string,
  authHeaderSignature: string
}

export type ApiPayloadData = PlainObject;

export interface ApiCallOptions {
  authSession?: boolean,
  timeOut?: number,
  preventDefault?: boolean
  hmacExcludeParams?: Array<string>
}

export interface ApiResponseBase {
  status: boolean,
  exception?: ApiException
  errors?: Array<ApiErrorMsg>
}

export interface ApiException {
  message: string,
  param?: string,
  caught?: string,
  file?: string,
  line?: number,
  trace?: Array<any>
}

export interface ApiErrorMsg {
  type: number,
  typeStr: string,
  message: string,
  file: string,
  line: number,
  triggered: boolean,
  timeStamp: number | string
}

export class ApiService {
  public readonly config: ApiConfig = {
    server: "https://test-admin.comely.io:2087",
    authHeaderToken: "admin-sess-token",
    authHeaderSignature: "admin-signature"
  };

  public constructor(private app: AppService) {
  }

  public sendCall(method: HttpMethod, endpoint: string, data: ApiPayloadData, options: ApiCallOptions): Promise<ApiResponseBase> {
    let httpService = this.app.http;
    let timeStamp = (new Date()).getTime();

    // Headers
    let headers = <HttpSimpleObject>{};
    headers["Content-Type"] = "application/json";
    headers["Accept"] = "application/json";

    // API Call Options
    options = Object.assign(<ApiCallOptions>{
      authSession: true,
      preventDefault: false,
    }, options);

    // Data
    data = Object.assign(data, {
      timeStamp: Math.floor(timeStamp / 1000)
    });

    // Authenticated Session Call?
    if (options.authSession) {
      let authHeader: Array<string> = [];
      authHeader.push(this.config.authHeaderToken + " " + this.app.auth.meta().token);

      // HMAC user signature
      let hmacExcludeKeys: Array<string> = [];
      if (options.hmacExcludeParams) {
        options.hmacExcludeParams.forEach(function (param: string) {
          hmacExcludeKeys.push(param.toLowerCase());
        });
      }

      // RFC3986 compatible URI encoding
      let queryEncodedParts = Object.keys(data).map(function (key: string) {
        if (hmacExcludeKeys.indexOf(key.toLowerCase()) > -1) {
          return;
        }

        return httpService.encodeURIComponent(key) + "=" + httpService.encodeURIComponent(data[key]);
      });

      let queryStr = queryEncodedParts.filter(function (part: undefined | string) {
        return !!part;
      }).join("&");

      // Compute HMAC for payload as Signature
      let userSignature = CryptoJS.HmacSHA512(queryStr, this.app.auth.meta().hmacSecret).toString(CryptoJS.enc.Hex);
      authHeader.push(this.config.authHeaderSignature + " " + userSignature);

      // Set "Authorization" headers
      headers["Authorization"] = authHeader.join(", ");
    }

    return new Promise<ApiResponseBase>(() => {
    });
  }
}
