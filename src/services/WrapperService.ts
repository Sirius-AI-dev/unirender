import HookService from "./HookService";
import BaseService from "./BaseService";
import ConfigService from "./ConfigService";
import MethodService from "./MethodService";
import ComponentService from "./ComponentService";

export default class WrapperService extends BaseService {
  constructor(hookService: HookService, private configService: ConfigService, private componentService: ComponentService, private methodService: MethodService) {
    super(hookService);
  }

  getComponent(componentKey) {
    return this.componentService.getCompiledComponent(componentKey);
  }

  getComponentConfig(componentKey) {
    return this.componentService.getConfig(componentKey);
  }

  callComponentEvent(props: { componentKey: string }, eventName: string, event: object) {
    return this.componentService.callEvent(props.componentKey, eventName, { event, props });
  }

  callEvent(eventName: string, payload: {}) {
    return this.methodService.call(eventName, payload);
  }

  get store() {
    return this.configService.store;
  }
}
