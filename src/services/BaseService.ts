import HookService from "./HookService";

export default class BaseService {
  constructor(protected hookService: HookService) {
    this.hookService = hookService;
  }
}
