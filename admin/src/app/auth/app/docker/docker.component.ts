import {Component, OnInit} from '@angular/core';
import {AppService} from "../../../../services/appService";
import {ApiQueryFail, ApiSuccess} from "../../../../services/apiService";
import {AdminPanelService} from "../../../../services/adminPanelService";

export interface DockerConfig {
  files: Array<DockerConfigFile>,
  network: DockerConfigNetwork,
  volumes: Array<string>,
  services: Map<string, DockerConfigService>
}

export interface DockerConfigFile {
  basename: string,
  version: string
}

export interface DockerConfigNetwork {
  name: string,
  driver: string,
  subnet: string
}

export interface DockerConfigService {
  id: string,
  status: null | undefined | boolean,
  internalPort: null | undefined | number,
  externalPort: null | undefined | number | string,
  appDebug: null | undefined | boolean,
  appCachedConfig: null | undefined | boolean,
  ipAddress: null | undefined | string,
}

@Component({
  selector: 'app-docker',
  templateUrl: './docker.component.html',
  styleUrls: ['./docker.component.scss']
})
export class DockerComponent implements OnInit {
  public dockerConfig?: DockerConfig;
  public dockerPingCheck: boolean = false;
  public dataLoading: boolean = true;

  constructor(private app: AppService, private adminPanel: AdminPanelService) {
  }

  public getTypeof(arg: any): string {
    return typeof arg;
  }

  private async fetchDockerConfig() {
    await this.app.api.callServer("get", "/auth/docker", {ping: false}).then((result: ApiSuccess) => {
      if (result.result.hasOwnProperty("docker") && typeof result.result.docker === "object") {
        this.dockerConfig = <DockerConfig>result.result.docker;
        this.dataLoading = false;
      }
    }).catch((error: ApiQueryFail) => {
      this.app.handleAPIError(error);
    });

    if (this.dockerConfig) {
      await this.app.api.callServer("get", "/auth/docker", {ping: true}, {timeOut: 30}).then((result: ApiSuccess) => {
        if (result.result.hasOwnProperty("docker") && typeof result.result.docker === "object") {
          this.dockerConfig = <DockerConfig>result.result.docker;
          this.dockerPingCheck = true;
        }
      }).catch((error: ApiQueryFail) => {
        this.app.handleAPIError(error);
      });
    }

    if (!this.dockerConfig) {
      setTimeout(() => {
        this.fetchDockerConfig();
      }, 6000);
    }
  }

  ngOnInit(): void {
    this.fetchDockerConfig().then();
    this.adminPanel.breadcrumbs.next([
      {page: 'Application', active: true},
      {page: 'Docker', active: true, icon: 'fab fa-docker'}
    ]);
    this.adminPanel.titleChange.next(["Docker", "Application"]);
  }

}
