import {AppService, PlainObject} from "./appService";
import {AppHttpRequest, AppHttpResponse, HttpMethod, HttpSimpleObject} from "./httpService";
import * as crypto from "crypto-js";
import {AuthSessionMeta} from "./authService";

export interface ApiConfig {
  server: string,
  authHeaderToken: string,
  authHeaderSignature: string
}

export type ApiPayloadData = PlainObject;

export interface ApiCallOptions {
  authSession?: boolean,
  timeOut?: number,
  hmacExcludeParams?: Array<string>
}

export interface ApiResponseMeta {
  method: string,
  endpoint: string,
  httpResponse?: AppHttpResponse
}

export interface ApiResponseBase {
  meta: ApiResponseMeta
  warnings?: Array<ApiWarningMsg>
}

export interface ApiSuccess extends ApiResponseBase {
  result: PlainObject
}

export interface ApiQueryFail extends ApiResponseBase {
  error?: string,
  exception?: ApiException
}

export interface ApiException {
  message: string,
  param?: string,
  caught?: string,
  file?: string,
  line?: number,
  trace?: Array<any>
}

export interface ApiWarningMsg {
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

  public translateSessionError(error: string): string {
    switch (error.toLowerCase()) {
      case "session_token_req":
        return "A valid session token is required for this endpoint";
      case "session_redundant":
        return "This session is no longer valid";
      case "session_retrieve_error":
      case "session_not_found":
        return "Authenticated session could not be retrieved";
      case "session_archived":
        return "Authenticated session was archived";
      case "session_ip_error":
        return "Your IP address has changed";
      case "session_timed_out":
        return "Authenticated session timed out";
      default:
        return error;
    }
  }

  public callServer(method: HttpMethod, endpoint: string, data: ApiPayloadData, options: ApiCallOptions): Promise<ApiSuccess> {
    return new Promise<ApiSuccess>((success, fail) => {
      let httpService = this.app.http;
      let timeStamp = (new Date()).getTime();
      let apiCallMeta: ApiResponseMeta = {
        method: method,
        endpoint: endpoint,
      };

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
        let sessionMeta: AuthSessionMeta;

        try {
          sessionMeta = this.app.auth.meta();
        } catch (e) {
          return fail(<ApiQueryFail>{
            meta: apiCallMeta,
            error: e.message
          })
        }

        let authHeader: Array<string> = [];
        authHeader.push(this.config.authHeaderToken + " " + sessionMeta.token);

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
        let userSignature = crypto.HmacSHA512(queryStr, sessionMeta.hmacSecret).toString(crypto.enc.Hex);
        authHeader.push(this.config.authHeaderSignature + " " + userSignature);

        // Set "Authorization" headers
        headers["Authorization"] = authHeader.join(", ");
      }

      httpService.send(<AppHttpRequest>{
        method: method,
        url: this.config.server + endpoint,
        payload: data,
        timeout: options.timeOut
      }).then((response: AppHttpResponse) => {
        let apiQueryFail: ApiQueryFail = {
          meta: apiCallMeta
        };

        // HTTP request was successful?
        if (!response.success || typeof response.body !== "string") {
          apiQueryFail.error = `API call to ${method.toUpperCase()} ${endpoint} failed with HTTP status code ${response.code}; Check network XHR logs`;
          return fail(apiQueryFail);
        }

        // Check Content-Type header
        let contentType = response.headers.get("content-type");
        if (typeof contentType !== "string" || !contentType.match(/^application\/json/)) {
          let badContentType = typeof contentType === "string" ? contentType : typeof contentType;
          apiQueryFail.error = `Expected content type header value "application/json"; got ${badContentType}`;
          return fail(apiQueryFail);
        }

        // Decode JSON body
        let result: PlainObject;
        try {
          result = JSON.parse(response.body);
        } catch (e) {
          apiQueryFail.error = "Failed to decode JSON body; " + e.toString();
          return fail(apiQueryFail);
        }

        // Check if boolean "status" is present
        if (!result.hasOwnProperty("status") || typeof result.status !== "boolean") {
          apiQueryFail.error = 'Malformed response from server; Expected "status" as boolean';
          return fail(apiQueryFail);
        }

        // Look for server side warnings
        let apiWarnings: Array<ApiWarningMsg> = [];
        if (result.hasOwnProperty("warnings") && Array.isArray(result.warnings)) {
          result.warnings.forEach(function (warning) {
            apiWarnings.push(<ApiWarningMsg>warning);
          });

          delete result.warnings;
        }

        // Look for server side exception
        if (!result.status) {
          if (result.hasOwnProperty("exception") && typeof result.exception === "object") {
            apiQueryFail.warnings = apiWarnings; // Append warnings to apiQueryFail object
            apiQueryFail.exception = <ApiException>result.exception;
            return fail(apiQueryFail);
          }
        }

        // Successful response
        let apiSuccess: ApiSuccess = {
          meta: apiCallMeta,
          warnings: apiWarnings,
          result: result
        };

        return success(apiSuccess);
      });
    });
  }
}
