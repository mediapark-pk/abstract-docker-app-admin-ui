import {Injectable} from "@angular/core";
import {BehaviorSubject} from "rxjs";

export interface breadcrumb {
  icon?: string,
  page: string,
  link?: string,
  active?: boolean
}

@Injectable({providedIn: "root"})

export class AdminPanelService {
  public readonly titleChange: BehaviorSubject<Array<string>> = new BehaviorSubject<Array<string>>([]);
  public readonly breadcrumbs: BehaviorSubject<Array<breadcrumb>> = new BehaviorSubject<Array<breadcrumb>>([]);
}
