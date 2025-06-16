// types
import { Config, SwitchParams } from "./types";

// services
import ConfigService from "./services/ConfigService";
import HookService from "./services/HookService";
import ActionService from "./services/ActionService";
import ComponentService from "./services/ComponentService";
import MethodService from "./services/MethodService";
import BrowserService from "./services/BrowserService";
import BackendService from "./services/BackendService";
import WrapperService from "./services/WrapperService";

type Services = {
  hookService: HookService;
  configService: ConfigService;
  componentService: ComponentService;
  methodService: MethodService;
  actionService: ActionService;
  browserService: BrowserService | undefined;
  backendService: BackendService;
  wrapperService: WrapperService;
};

export default class UniRender {
  private id: number = Math.floor(Math.random() * 2147483648);
  private version: string = "1.0.1";
  private started_at: Date | null = null;
  public services: Services | Record<string, never> = {};

  constructor(initConfig: Config) {
    console.info(`Unirender version: ${this.version}`);
    let unirender: UniRender = this;

    initConfig.params = {
      ...initConfig.params,
      instanceId: this.id,
      version: this.version, // or window.__APP_VERSION__  ?
      newTab: true,
    };

    let hookService = new HookService();
    hookService.getUniRender = function (): UniRender {
      return unirender;
    };

    // Init services
    this.services.hookService = hookService;
    this.services.configService = new ConfigService(this.services.hookService, initConfig);
    this.services.methodService = new MethodService(this.services.hookService, this.services.configService);
    this.services.componentService = new ComponentService(this.services.hookService, this.services.configService, this.services.methodService);
    this.services.actionService = new ActionService(this.services.hookService, this.services.configService, this.services.methodService);
    this.services.backendService = new BackendService(this.services.hookService, this.services.configService);
    this.services.wrapperService = new WrapperService(this.services.hookService, this.services.configService, this.services.componentService, this.services.methodService);

    // Without SSR
    if (window) {
      if (sessionStorage.getItem("uniRenderId")) {
        this.services.configService.config.params!.instanceId = +sessionStorage.getItem("uniRenderId")!;
        this.services.configService.config.params!.newTab = false;
      } else {
        sessionStorage.setItem("uniRenderId", this.services.configService.id.toString());
      }

      this.services.browserService = new BrowserService(this.services.hookService, this.services.configService, this.services.backendService);
    }
  }

  async start() {
    if (this.services.configService.params.local) {
      this.apply(this.config);
      return;
    }

    const params: SwitchParams = {
      uniKeys: [[["regex", "^components.*"]], [["regex", "^methods.*"]], [["regex", "^service.*"]], [["regex", "^store.*"]]],
    };

    await this.switch(params);
    this.started_at = new Date();

    this.services.hookService.call("unirender.start", params);
  }

  apply(config: Config) {
    this.services.configService.apply(config);
  }

  async switch(params: SwitchParams) {
    await this.services.backendService.switch(params);
  }

  isStarted(): boolean {
    return this.started_at ? new Date() > this.started_at : false;
  }

  get config(): Config {
    return this.services.configService.config;
  }
}
