import { Config, UniParams, ComponentsList, CompositionConfig } from "../types";
// @ts-ignore
import { isArray, mergeWith } from "lodash";
import HookService from "./HookService";
import BaseService from "./BaseService";

export default class ConfigService extends BaseService {
  public params: UniParams;
  public store: object;
  public service: object;
  public components: ComponentsList;
  public composition: CompositionConfig;
  public methods: object;

  constructor(hookService: HookService, config: Config) {
    super(hookService);

    this.params = config.params!;
    this.store = config.store!;
    this.service = config.service!;
    this.components = config.components!;
    this.composition = config.composition!;
    this.methods = config.methods!;
  }

  apply(config: Config) {
    if (this.params.debug) {
      console.log("Apply config", config);
    }

    this.hookService.call("config.beforeApply", { newConfig: config });

    let { store, service, components, composition, methods } = config;

    this.merge(this.components, components!);
    this.merge(this.composition, composition!);

    //this.storeMerge(store!)
    this.merge(this.store, store!);

    this.merge(this.service, service!);
    this.merge(this.methods, methods!);

    this.hookService.call("config.afterApply", {
      newConfig: config,
      mergedConfig: this.config,
    });
  }

  delete(query: string[][][]) {
    this.search(query, undefined, ({ parent, key }) => {
      delete parent[key];
    });
  }

  search(query: string[][][], origin: {} | undefined = this.config, callback?: (arg: any) => void) {
    let resultObj = {};

    const searchSingleItem = (location: [], key: string[], callback?: ({}) => void) => {
      switch (key[0]) {
        case "exact":
          if (callback) {
            callback({ parent: location, key: key[1] });
          }
          return [
            {
              propKey: key[1],
              propValue: location[key[1]],
            },
          ];
        case "regex":
          const regexp = new RegExp(key[1]);
          const found = Object.keys(location).filter((l) => regexp.test(l));
          if (callback) {
            found.forEach((item) => {
              callback({ parent: location, key: item });
            });
          }
          return found.map((filteredItem) => ({
            propKey: filteredItem,
            propValue: location[filteredItem],
          }));
        default:
          return null;
      }
    };

    query.forEach((innerKey: string[][]) => {
      let lastObj = resultObj;
      let found: any[] | null;

      innerKey.forEach((key, index) => {
        let searchArray = found || [origin];

        searchArray.forEach((location: { lastObj?: {}; propKey: string; propValue: [] }) => {
          if (location.lastObj) {
            lastObj = location.lastObj;
          }

          if (index === innerKey.length - 1) {
            found = searchSingleItem(location.propValue || location, key, callback);
          } else {
            found = searchSingleItem(location.propValue || location, key);
          }

          found?.forEach((item) => {
            if (index === innerKey.length - 1) {
              lastObj[item.propKey] = item.propValue;
            } else {
              if (!lastObj[item.propKey]) {
                lastObj[item.propKey] = {};
              }
            }
            item.lastObj = lastObj[item.propKey];
          });
        });
      });
    });

    return resultObj;
  }

  merge(config: {}, newConfig: {}) {
    const mergeCustomizer = (srcValue: any, newValue: any) => {
      if (isArray(newValue)) {
        // was reactive
        return newValue;
      }
    };
    mergeWith(config, newConfig, mergeCustomizer);
  }

  storeMerge(newStore: {}) {
    for (let storeItem in newStore) {
      if (typeof newStore[storeItem] === "object" && !Object.keys(newStore[storeItem]).length) {
        // console.error(`creating empty object ${storeItem}`);

        this.store[storeItem] = {};
      }

      for (let item in newStore[storeItem]) {
        if (typeof this.store[storeItem] === "undefined") {
          // console.error(`parsing undefined ${storeItem}`);
          // console.error(newStore[storeItem]);

          this.store[storeItem] = newStore[storeItem];
        } else {
          if (isArray(newStore[storeItem][item])) {
            // ARRAYS

            // console.error(`parsing array ${storeItem}`);
            // console.error(newStore[storeItem]);

            this.store[storeItem][item] = newStore[storeItem][item];
          } else if (typeof newStore[storeItem][item] === "object") {
            // OBJECTS

            // console.error(`parsing object ${storeItem}`);
            // console.error(newStore[storeItem]);

            if (!Object.keys(newStore[storeItem]).length) {
              this.store[storeItem] = {};
            } else {
              if (newStore[storeItem][item] === null) {
                // console.error(`creating null value`);

                this.store[storeItem][item] = null;
              } else {
                this.store[storeItem][item] = { ...(this.store[storeItem][item] || {}), ...newStore[storeItem][item] } || {};
              }
            }
          } else {
            // OTHER

            // console.error(`parsing other ${storeItem}`);
            // console.error(newStore[storeItem]);

            this.store[storeItem][item] = newStore[storeItem][item];
          }
        }
      }
    }
  }

  size(): number {
    return JSON.stringify(this.config).length;
  }

  get config(): Config {
    return {
      params: this.params,
      store: this.store,
      service: this.service,
      components: this.components,
      composition: this.composition,
      methods: this.methods,
    };
  }

  get version(): string {
    return this.params.version;
  }

  get id(): number {
    return this.params.instanceId;
  }
}
