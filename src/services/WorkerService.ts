import HookService from "./HookService";
import BaseService from "./BaseService";
import { UniAction } from "../types";
import ConfigService from "./ConfigService";
import { apiHost as apiHostConstant } from "../constants";
import BackendService from "./BackendService";

export default class WorkerService extends BaseService {
  private worker: SharedWorker;
  private apiHost: string = apiHostConstant;
  private messageQueue: {}[];

  constructor(hookService: HookService, configService: ConfigService, backendService: BackendService) {
    super(hookService);

    this.messageQueue = [];

    hookService.subscribe("config.afterApply", [
      () => {
        this.processMessageQueue();
      },
    ]);

    // Get apiHost from parameters
    if (configService.config.params?.apiHost) {
      this.apiHost = configService.config.params.apiHost;
    }

    try {
      this.worker = new SharedWorker("/sharedWorker.js", { credentials: "include" });

      if (!this.worker?.port) {
        return
      }

      // Message handler
      this.worker.port.onmessage = (msg) => {
        const requestId = msg.data?.requestId;

        // Check for requestId is waiting primary request/response, after received primary response we can receive messages from event stream
        // Until then, put them in queue.
        if (requestId && backendService.requestId.length > 0 && backendService.requestId.indexOf(requestId) >= 0) {
          this.messageQueue.push(msg.data);
        } else {
          this.hookService.call("worker.onmessage", msg.data);
        }
      };
    } catch (error) {
      this.hookService.call("error", new Error(`Shared worker registration failed with ${error}`));
    }

    // Enable / Disable eventstream
    hookService.subscribe("action.eventstream", [
      (action: UniAction) => {
        if (action.enabled) {
          this.postMessage({
            action: "createEventStream",
            apiHost: this.apiHost,
            esId: action.esId,
          });
        } else {
          this.postMessage({
            action: "stopEventStream",
          });
        }
      },
    ]);
  }

  processMessageQueue() {
    if (!this.messageQueue.length) {
      return;
    }

    const currentMessage = this.messageQueue.shift();
    this.hookService.call("worker.onmessage", currentMessage);
    this.processMessageQueue();
  }

  get started(): boolean {
    //return false; // temporary
    return !!this.worker;
  }

  postMessage(msg) {
    this.worker?.port.postMessage(msg);
  }
}
