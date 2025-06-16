import { Config, HookOptions, HookSubscribe } from "../types";
import UniRender from "../UniRender";

export default class HookService {
  private activeHooks: any;
  private defaultHookOptions: HookOptions;

  getUniRender: () => UniRender;

  constructor() {
    this.activeHooks = {};
    this.defaultHookOptions = {
      stopOnFalse: true,
      stopOnError: false,
    };
  }

  // Subscribe to uniRender events
  subscribe(hookName: string, functions: Function[], hookOptions?: HookOptions) {
    functions.forEach((func) => {
      if (typeof func !== "function") {
        this.call("error", new Error(`Subscribe argument "func" is not a function`));
        return;
      }

      if (!hookOptions) {
        hookOptions = this.defaultHookOptions;
      } else if (typeof hookOptions === "object") {
        hookOptions = { ...this.defaultHookOptions, ...hookOptions };
      }

      // func = func.bind(uniRender, hookName) // first argument of subscribe function will be the name of hook

      if (!this.activeHooks[hookName]) {
        this.activeHooks[hookName] = [];
      }

      this.activeHooks[hookName].push({ func, hookOptions });
    });
    return this;
  }

  // add asyncCall to wait for response

  // false - stop executing
  // true - continue executing
  call(hookName: string, params: any) {
    if (!this.activeHooks[hookName]) {
      return;
    }

    this.activeHooks[hookName].forEach((hookFunction: HookSubscribe) => {
      let result;
      try {
        result = hookFunction.func.bind(this.getUniRender())(params);
      } catch (error: any) {
        this.call("error", error);
        if (hookFunction.hookOptions.stopOnError) {
          return false;
        }
      }
      if (hookFunction.hookOptions.stopOnFalse && !result) {
        return false;
      }
    });
    return true;
  }
}
