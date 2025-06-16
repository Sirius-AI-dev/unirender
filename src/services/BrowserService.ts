import HookService from "./HookService";
import BaseService from "./BaseService";
import ConfigService from "./ConfigService";
import MethodService from "./MethodService";
import EventStream from "./EventStream";
import WorkerService from "./WorkerService";
import BackendService from "./BackendService";

import UniUrl from "../UniUrl";
import {CompositionConfig, Config, customTag} from "../types";
import { CSSLoader, JSLoader } from "../utils/loaders";

export default class BrowserService extends BaseService {
  private sharedWorker: WorkerService;
  private eventStream: EventStream;

  private composition: CompositionConfig;
  private compositionSum: number = 0;

  constructor(hookService: HookService, private configService: ConfigService, backendService: BackendService) {
    super(hookService);

    hookService.subscribe("config.beforeApply", [
      ({ newConfig }: { newConfig: Config }) => {
        if (newConfig?.composition) {
          this.headHandler(newConfig.composition);
        }
      },
    ]);

    hookService.subscribe("config.afterApply", [
      ({ newConfig, mergedConfig }: { newConfig: Config, mergedConfig: Config }) => {

        const compositionSum: number = this.calculateHeadSum(mergedConfig.composition)
        if (this.compositionSum != compositionSum) {
          this.headHandler(mergedConfig.composition);
          this.compositionSum = compositionSum;
        }

        if (newConfig.url) {
          new UniUrl(newConfig.url, window.location.href).go();
        }
      },
    ]);

    hookService.subscribe("backend.beforeSendSwitch", [
      (data) => {
        data.data.uniData["device"] = this.device;
        data.data.uniData["window"] = {
          height: window.innerHeight,
          width: window.innerWidth,
        };
    
        // get timezone
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        data.data.uniData["timezone"] = timezone;
    
        // get OS
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        if (userAgent.match(/iPad/i) || userAgent.match(/iPhone/i) || userAgent.match(/iPod/i)) {
          data.data.uniData["os"] = "iOS";
        } else if (userAgent.match(/Android/i)) {
          data.data.uniData["os"] = "Android";
        }
      },
    ]);

    // Shared worker
    // If the browser is running, then we can try to launch the shared worker, with assigning need subscribers to it
    this.sharedWorker = new WorkerService(hookService, configService, backendService);

    if (this.sharedWorker.started) {
      this.sharedWorker.postMessage({
        action: this.configService.params.newTab ? "openNewTab" : "reloadTab",
        data: {
          id: this.configService.id,
        },
      });

      hookService.subscribe("worker.onmessage", [
        (msg: Config) => {
          this.configService.apply(msg);
        },
      ]);

      window.addEventListener("beforeunload", (e) => {
        this.sharedWorker.postMessage({
          action: "closeTab",
          data: {
            id: this.configService.id,
          },
        });
      });
    } else {
      // Shared worker is unavailable
      // Event stream service start on main browser thread and wait for action: eventstream with enabled: true
      this.eventStream = new EventStream(hookService, configService);
    }
  }

  calculateHeadSum(composition: CompositionConfig): number {
    return JSON.stringify(composition).length;
  }

  headHandler(composition) {
    if (composition.title) {
      document.title = composition.title;
    }

    if (composition.head) {
      composition.head.forEach((headItem) => {
        let url: string | undefined;
        let tag: customTag = null;
        switch (headItem.type) {
          case "style":
            tag = document.createElement("style");
            break;
          case "link":
            url = headItem.src;
            if (url) {
              CSSLoader(url, null, null, headItem.attributes, headItem.id);
            } else {
              tag = document.createElement("link");
            }
            break;
          case "script":
            url = headItem.src || headItem.attributes?.src;
            if (url) {
              JSLoader(url, null, null, headItem.attributes, headItem.id);
            } else if (headItem.innerHTML) {
              tag = document.createElement("script");
            }
            break;
          case "meta":
            tag = document.createElement("meta");
            break;
        }

        if (!tag) return;

        if (headItem.attributes && typeof headItem.attributes !== "string" && Object.keys(headItem.attributes).length && Object.values(headItem.attributes).length) {
          Object.keys(headItem.attributes).forEach((key) => {
            tag!.setAttribute(key, headItem.attributes[key]);
          });
        }

        if (headItem.innerHTML) {
          tag.innerHTML = headItem.innerHTML;
        }

        tag.setAttribute("customId", headItem.id.toString());

        document.head.append(tag);
      });
    }
  }

  get device(): string {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      return "tablet";
    }
    if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
      return "mobile";
    }
    return "desktop";
  }

  localStorage() {}
}
