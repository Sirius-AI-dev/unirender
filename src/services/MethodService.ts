import { Config } from "../types";
import BaseService from "./BaseService";
import ConfigService from "./ConfigService";
import HookService from "./HookService";
import UniUrl from "../UniUrl";

export default class MethodService extends BaseService {
  private compiledMethods: { [name: string]: Function };

  constructor(hookService: HookService, private configService: ConfigService) {
    super(hookService);
    this.configService = configService;
    this.compiledMethods = {};

    this.hookService.subscribe("config.beforeApply", [
      ({ newConfig }: { newConfig: Config }) => {
        if (!newConfig.methods) return;
        Object.keys(newConfig.methods).forEach((methodName) => {
          this.add(methodName, newConfig.methods![methodName]);
        });
      },
    ]);

    // Built-in methods
    this.compiledMethods["goto"] = (params) => {
      new UniUrl(new URL(params.path + (params.parameters ? params.parameters : ""), window.location.href) || params.url, window.location.href).go(params.target);
    };
  }

  add(methodName: string, func: string | Function): any {
    switch (typeof func) {
      case "string":
        this.configService.methods[methodName] = func;
        func = new Function("return " + func)();
        break;
      case "function":
        this.configService.methods[methodName] = func.toString();
        break;
    }

    if (methodName) {
      // @ts-ignore
      this.compiledMethods[methodName] = func;
    }
    return func;
  }

  get(methodName: string): Function {
    return this.compiledMethods[methodName];
  }

  call(methodName: string, payload: object) {
    if (this.configService.params!.debug) {
      console.debug("Call method", methodName, "with payload", payload);
    }
    const recievedMethod = this.get(methodName);

    if (recievedMethod) {
      return recievedMethod(payload);
    }

    this.hookService.call("error", new Error(`Compiled method ${methodName} not found`));
  }
}
