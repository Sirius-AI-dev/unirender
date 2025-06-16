import { JSONPath } from "jsonpath-plus";
import { UniAction, Config } from "../types";
import { wait } from "../utils";

// services
import BaseService from "./BaseService";
import HookService from "./HookService";
import MethodService from "./MethodService";
import ConfigService from "./ConfigService";
import axios from "axios";
import UniUrl from "../UniUrl";
import { apiEndpoint } from "../constants";
import {isArray} from "lodash";

interface SeqAction {
  id: number;
  data: { wait: number; config: {} }[];
  cycles: number;
  flag: string[];
}

export default class ActionService extends BaseService {
  private currentSeqActions: {
    id: {
      timeout: number
    }
  } | {};

  constructor(hookService: HookService, private configService: ConfigService, private methodService: MethodService) {
    super(hookService);

    this.currentSeqActions = {};

    this.hookService.subscribe("config.beforeApply", [
      ({ newConfig }: { newConfig: Config }) => {
        if (!newConfig.actions) return;
        Object.keys(newConfig.actions).forEach(async (idx) => {
          const action = newConfig.actions![idx];
          if (!action.when || action?.when == "beforeApply") {
            // Pause before do action
            if (action.pauseBefore > 0) {
              await wait(action.pauseBefore);
            }

            // Do action
            if (this[action.action]) {
              this[action.action](action);
            }
            this.hookService.call(`action.${action.action}`, action);

            // Pause after do action
            if (action.pauseAfter > 0) {
              await wait(action.pauseAfter);
            }
          }
        });
      },
    ]);

    this.hookService.subscribe("config.afterApply", [
      ({ newConfig }: { newConfig: Config }) => {
        if (!newConfig.actions) return;
        Object.keys(newConfig.actions).forEach(async (idx) => {
          const action = newConfig.actions![idx];
          if (action?.when == "afterApply") {
            // Pause before do action
            if (action.pauseBefore > 0) {
              await wait(action.pauseBefore);
            }

            // Do action
            if (this[action.action]) {
              this[action.action](action);
            }
            this.hookService.call(`action.${action.action}`, action);

            // Pause after do action
            if (action.pauseAfter > 0) {
              await wait(action.pauseAfter);
            }
          }
        });
      },
    ]);
  }

  delete(action: UniAction) {
    if (action.key) {
      this.configService.delete(action.key);
    }
  }

  config(action: UniAction) {
    if (!action.url) {
      return;
    }

    axios({
      method: "get",
      url: action.url,
    })
      .then((res) => {
        this.configService.apply(res.data);
      })
      .catch((error: any) => {
        this.hookService.call("error", error);
      });
  }

  update(action: UniAction) {
    if (action.path && action.data) {
      JSONPath({
        path: action.path,
        json: this.configService.config,
        callback: (item: any, value: string, obj: { parent: {}; parentProperty: string }) => {
          if (action.type === "replace") {
            obj.parent[obj.parentProperty] = action.data;
          } else {
            if (action.type === 'merge' && isArray(item) && isArray(action.data)) {
              obj.parent[obj.parentProperty] = item.concat(action.data);
            } else {
              this.configService.merge(item, action.data!);
            }
          }
        },
      });
    }
  }

  async seqApply(action: SeqAction) {
    if (action.flag.includes("stop") && action.id) {
      const timeout = this.currentSeqActions[action.id].timeout
      if (timeout) {
        clearTimeout(timeout)
      }
      delete this.currentSeqActions[action.id]
      return;
    }

    const applyCurrentConfig = (currentConfigObject, id) => {
      return new Promise((res) => {
        this.currentSeqActions[id].timeout = setTimeout(() => {
          // console.log("applying delayed config: ", currentConfigObject.config);
          this.configService.apply(currentConfigObject.config);
          this.currentSeqActions[id].timeout = null
          res(true);
        }, currentConfigObject.wait);
      });
    };

    const oneCycle = async (id) => {
      const configArr = [...action.data];

      do {
        if (!this.currentSeqActions[action.id]) {
          break;
        }
        const currentConfig = configArr.shift();
        await applyCurrentConfig(currentConfig, id);
      } while (configArr.length);
    };

    const processSeqActionQueue = async () => {
      this.currentSeqActions[action.id] = {};
      let cyclesLeft = action.cycles;

      do {
        await oneCycle(action.id);
        cyclesLeft -= 1;
      } while (cyclesLeft > 0);
    };

    await processSeqActionQueue();

    delete this.currentSeqActions[action.id];
  }

  jsonpath_update(action: UniAction) {
    this.update(action);
  }

  call(action: UniAction) {
    const { method, ...params } = action;
    this.methodService.call(method!, params);
  }
}
