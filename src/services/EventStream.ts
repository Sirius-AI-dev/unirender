import { UniAction } from "../types";
import HookService from "./HookService";
import { apiHost as apiHostConstant } from "../constants";
import ConfigService from "./ConfigService";

export default class EventStream {
  private eventSource: EventSource;
  private apiHost: string = apiHostConstant;
  constructor(private hookService: HookService, configService: ConfigService) {
    this.hookService = hookService;

    // Get apiHost from parameters
    if (configService.config.params?.apiHost) {
      this.apiHost = configService.config.params.apiHost;
    }

    this.hookService.subscribe("action.eventstream", [
      (action: UniAction) => {
        switch (action.enabled) {
          case true:
            if (this.eventSource && [+EventSource.OPEN, +EventSource.CONNECTING].includes(this.eventSource.readyState)) {
              console.warn(`Event stream is already running`);
              return;
            }

            this.eventSource = new EventSource(`${this.apiHost}/ub/es/subscribe?esId=${action.esId}`, {
              withCredentials: true,
            });

            this.eventSource.onmessage = (event) => {
              try {
                const data = JSON.parse(event.data);
                configService.apply(data);
              } catch (e) {
                hookService.call("error", e);
              }
            };
            break;
          case false:
            this.eventSource.close();
            //this.stop()
            break;
        }
      },
    ]);
  }
}
