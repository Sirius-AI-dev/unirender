import { Config } from "../types";
import HookService from "./HookService";
import { isArray } from "lodash";
import { CSSLoader, UMDLoader } from "../utils/loaders";
import BaseService from "./BaseService";
import ConfigService from "./ConfigService";
import MethodService from "./MethodService";

export default class ComponentService extends BaseService {
  private compiledComponents: { [name: string]: any };

  constructor(hookService: HookService, private configService: ConfigService, private methodService: MethodService) {
    super(hookService);
    this.configService = configService;
    this.methodService = methodService;
    this.compiledComponents = {};

    this.hookService.subscribe("config.afterApply", [
      ({ newConfig }: { newConfig: Config }) => {
        if (!newConfig.components) return;
        Object.keys(newConfig.components).forEach((componentName: string) => {
          if (configService.components[componentName].url) {
            configService.components[componentName].name = configService.components[componentName]
              .url!.split("/")
              .reverse()[0]
              .match(/^(.*?)\.umd/)![1];
          }
          this.load(componentName);
        });
      },
    ]);
  }

  getCompiledComponent(name: string) {
    console.debug(`Starting getComponent for ${name}`);

    if (!this.configService.components?.[name]) {
      // this.hookService.call('error', new Error(`Component not found: "${name}"`))
      console.error(`Component not found: "${name}"`);
      return;
    }

    return this.compiledComponents[this.configService.components[name].name!];
  }

  putCompiledComponent(name: string, component: any) {
    this.compiledComponents[name] = component;
  }

  load(componentName: string) {
    if (this.configService.config.components![componentName].css && isArray(this.configService.config.components![componentName].css)) {
      this.configService.config.components![componentName].css!.forEach((url: string) => {
        CSSLoader(url);
      });
    }

    if (!this.configService.config.components![componentName].url) return;

    let name: string = this.configService.config
      .components![componentName].url!.split("/")!
      .reverse()[0]!
      .match(/^(.*?)\.umd/)![1];

    if (this.compiledComponents[name]) return;

    let umdLoader = () => UMDLoader(this.configService.config.components![componentName].url!, this.configService.params);
    this.hookService.call("component.load", { loader: umdLoader, name });
  }

  getConfig(name: string) {
    if (!this.configService.components) return;

    try {
      return this.configService.components[name];
    } catch (error: any) {
      this.hookService.call("error", new Error(`Component not found: "${name}"`));
    }

    if (this.configService.params!.debug) {
      console.debug("Component config for", name, "is", this.configService.components[name]);
    }
  }

  callEvent(componentName: string, eventName: string, payload: object) {
    if (this.configService.config.params!.debug) {
      console.debug("Call method for", componentName, "with event", eventName, "and payload", payload);
    }

    if (!this.configService.config.components?.[componentName]?.methods?.[eventName]) return;

    try {
      return this.methodService.get(this.configService.config.components[componentName].methods![eventName])(payload);
    } catch (error: any) {
      this.hookService.call("error", new Error(`Method for component "${componentName}" with event "${eventName}" not found`));
    }
  }
}
