import { apiHost as apiHostConstant, apiEndpoint } from "../constants";
import axios from "axios";
import {Config, SwitchParams} from "../types";

// services
import HookService from "./HookService";
import BaseService from "./BaseService";
import ConfigService from "./ConfigService";
import UniUrl from "../UniUrl";
import {mergeWith, isArray} from "lodash";

export default class BackendService extends BaseService {
  private apiHost: string = apiHostConstant;
  // Queue of the switch functions
  private switchQueue: (() => void)[] = [];
  // Needed to stop premature event stream updates
  public requestId: number[] = [];

  constructor(hookService: HookService, private configService: ConfigService) {
    super(hookService);

    // Get apiHost from parameters
    if (this.configService.config.params?.apiHost) {
      this.apiHost = this.configService.config.params.apiHost;
    }
  }

  async switch(params: SwitchParams) {
    // console.time("Switch time");

    let maxThreads = params.threads?.max > 0 ? params.threads.max : 1;
    let maxThreadsAction = params.threads?.action ? params.threads.action : 'ignore';

    if (this.requestId.length == maxThreads) {
      if (maxThreadsAction === 'ignore') {
          this.hookService.call("backend.blockSwitch", params);
          return;
      }
    }

    const requestId = Math.floor(Math.random() * 999999999);
    this.requestId.push(requestId);

    this.hookService.call("backend.beforeSwitch", params);

    const { uniKeys, event, props } = params;

    // Prepare request body for backand render method
    const data = {
      query: uniKeys ? this.configService.search(uniKeys, { ...this.configService.config, event, props }) : {},
      url: new UniUrl(window.location.href).toObject(),
      tabId: this.configService.params.instanceId,
      uniData: {
        size: this.configService.size(),
        requestId: requestId,
      },
    };

    this.hookService.call("backend.beforeSendSwitch", { params, data });

    // Switch function for add to the queue
    const switchFunc = () =>
      axios({
        withCredentials: true,
        method: "post",
        url: new UniUrl(`${this.apiHost}${apiEndpoint}`).toString(),
        headers: {
          "X-Uni-Render": this.configService.version,
        },
        data,
      })
        .then(async (res) => {
          // console.timeEnd("Switch time");
          // console.time("Apply time");

          this.hookService.call("backend.afterSwitch", {params, data, res});

          let config = res.data

          // Try to load remote config from composition.config_url
          if (config.composition?.config_url) {
              const remoteConfigResponse = await axios({ url: config.composition.config_url })

              // Preload external config (default as static json file) before loading dynamic config
              this.configService.apply(remoteConfigResponse.data);
          }

          this.configService.apply(config);

          // remove request id
          const index = this.requestId.indexOf(requestId);
          this.requestId.splice(index, 1);

          // console.timeEnd("Apply time");
        })
        .catch((error: any) => {
          this.hookService.call("error", error);
        });

    if (this.requestId.length == maxThreads && maxThreadsAction === 'queue') {
        this.switchQueue.push(switchFunc); // add to queue
        // Running the queue of call switch functions
        await this.doSwitch(true);
    } else {
        await switchFunc();
    }
  }

  async doSwitch(runQueue: boolean = false) {
    if (!this.switchQueue.length) {
      // Stop queue
      this.hookService.call("backend.stopSwitchQueue", {});
      return;
    }

    if (runQueue) {
      this.hookService.call("backend.startSwitchQueue", {});
    }

    const switchFunc = this.switchQueue.shift();

    // execute switch function
    if (switchFunc) {
      await switchFunc();
    }

    this.doSwitch(false);
  }
}
