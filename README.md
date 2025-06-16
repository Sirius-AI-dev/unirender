# Unirender v1.1.0

> The goal of this package is to convert a UniRender config file (local or remote)
> into a web page instantly. JSON format of this file is described under **"Wiki"** section


## Quick deploy
> 1. Copy **"build"** folder to your web server
> 2. Setup a correct **API host** in index.html, e.g. "https://api.my_domain.app"
> 3. Support an API host "/ub/render" for the API host: all API request will be sent with this API path
> 4. Add any business-logic on backend. The main rules are described under **"Wiki"** section


## Installation

Using npm:

```shell
$ npm i unirender
```

Using yarn:

```shell
$ yarn add unirender
```

## Usage

For Vue add following to main.js:

1. Import everything needed:

```js
import { UniRender, UniUrl, apiHost } from "unirender-npm-package";
```

2. Create an init config and give in to unirender constructor:

```js
const initConfig = {
  store: Vue.reactive(storageData["store"] || {}),
  service: Vue.reactive(storageData["service"] || {}),
  components: Vue.reactive(storageData["components"] || {}),
  composition: Vue.reactive(storageData["composition"] || {}),
  methods: Vue.reactive(storageData["methods"] || {}),
};

uniRender = new UniRender(initConfig);
```

3. Subscribe to basic hooks:

```js
uniRender.services.hookService
  .subscribe("error", [
    (error) => {
      console.error(error);
    },
  ])
  .subscribe("component.load", [
    ({ loader, name }) => {
      uniRender.services.componentService.putCompiledComponent(
        name,
        Vue.defineAsyncComponent(() => loader())
      );
    },
  ]);
```

4. Start it up:

```js
await uniRender.start();
```
