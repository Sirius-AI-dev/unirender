# UniRender

UniRender is a compact JavaScript library that provides **full rendering and business logic** for web and mobile applications using a special config in JSON format.

This approach significantly simplifies project development (especially complex ones) by **removing two layers**:
*   Frontend business logic
*   API layer for interaction between frontend and backend

Currently, the [VUE framework](https://vuejs.org/) is supported for rendering, with components from the [PrimeVUE package](https://primevue.org/introduction/). Custom components can be added as needed.

The modular architecture of the project allows for easy addition of new components and new frameworks (React, React Native, etc.). **Contributors are welcome to participate in the project's development**.

## Table of Contents

*   [How it Works](#how-it-works)
*   [Advantages of the Backend-Driven Approach](#advantages-of-the-backend-driven-approach)
    *   [System Simplification](#system-simplification)
    *   [Decomposition of Large Tasks](#decomposition-of-large-tasks)
    *   [AI Development for up to 100% of Complex Projects](#ai-development-for-up-to-100-of-complex-projects)
    *   [No Scalability Limitations](#no-scalability-limitations)
*   [UniRender Blocks in Existing Websites](#unirender-blocks-in-existing-websites)
    *   [Template Library with Complex Business Logic](#template-library-with-complex-business-logic)
    *   [Personalized Design](#personalized-design)
    *   [Dynamic Containers](#dynamic-containers)
*   [Terminology](#terminology)
    *   [Component](#component)
    *   [Element](#element)
    *   [View](#view)
    *   [Page](#page)
    *   [UniRender Config](#unirender-config-1)
    *   [Storage](#storage)
    *   [UniRender (JS Library)](#unirender-js-library)
*   [Installation](#installation)
    *   [Quick Deploy](#quick-deploy)
    *   [Prompts to Setup Projects](#prompts-to-setup-projects)
*   [Examples](#examples)
    *   [UniRender Configs](#unirender-configs)
    *   [Interactive Components](#interactive-components)
    *   [Tokling.com](#toklingcom)
    *   [Python Routes](#python-routes)
    *   [NodeJS Routes](#nodejs-routes)
*   [Workflow](#workflow)
    *   [Preparation for Work](#preparation-for-work)
    *   [Backend Response Format](#backend-response-format)
    *   [Request to Backend Format](#request-to-backend-format)
    *   [Logic of UniRender Operation](#logic-of-unirender-operation)
*   [Structure of Storage](#structure-of-storage)
*   [Function `window.uni.switch()`](#function-windowuniswitch)
*   [Supported Actions](#supported-actions)
    *   [1. `delete`](#1-delete)
    *   [2. `update` (or alias `jsonpath_update`)](#2-update-or-alias-jsonpath_update)
    *   [3. `call`](#3-call)
    *   [4. `localStorage`](#4-localstorage)
    *   [5. `config`](#5-config)
    *   [6. `trigger`](#6-trigger)
    *   [7. `seqApply`](#7-seqapply)
*   [Embedded UniRender](#embedded-unirender)
*   [UniRender Config Format (Detailed)](#unirender-config-format-detailed)
    *   [`components` (JSON-object)](#components-json-object)
    *   [`composition` (JSON-object)](#composition-json-object)
    *   [`methods` (JSON-object)](#methods-json-object)
    *   [`store` (JSON-object)](#store-json-object)
*   [Component Wrapper](#component-wrapper)
    *   [Functionality](#functionality)
    *   [`slotProps`](#slotprops)
    *   [Store (Component-Specific)](#store-component-specific)
    *   [Props (Component-Specific)](#props-component-specific)
    *   [Methods (Component-Specific)](#methods-component-specific)

---

## How it Works

1.  Upon the first visit to the site, `index.html`, which is **only 400 bytes** in size, is loaded. This file loads the `unirender.js` library and specifies the **unified API URL** for backend interaction.

2.  UniRender immediately sends a request to the API URL, along with referer, user-agent, and other session attributes.

3.  In response, the backend sends a [**UniRender config**](#unirender-config-format-detailed), containing a flat list of all [elements](#element), their structural placement, attribute values, and necessary methods for events that are handled on that page.

4.  UniRender processes the received [UniRender config](#unirender-config-format-detailed), unpacks keys into [Storage](#structure-of-storage), and initiates rendering using VUE (or another framework). **Important: all components must be reactive.**

5.  When an event is triggered, UniRender executes the specified JavaScript code for the event, or it executes the UniRender function [`window.uni.switch()`](#function-windowuniswitch), which collects the necessary keys from [Storage](#structure-of-storage) and calls the API URL.

6.  In response, the backend sends a new [UniRender config](#unirender-config-format-detailed), containing keys only for the [elements](#element) that need to be updated (or added), along with new attribute values. Typically, this involves only a few dozen elements.

7.  UniRender processes the received [UniRender config](#unirender-config-format-detailed) and unpacks the keys into [Storage](#structure-of-storage). Since all components are reactive, the data is immediately updated on the web page.

Thus, all project business logic is moved to the backend. This is known as the **Backend-Driven approach**.

## Advantages of the Backend-Driven Approach

### System Simplification

**Removes two complex layers**: frontend business logic + API layer.

### Decomposition of Large Tasks

A detailed project description transforms into a set of short prompts, describing specific events – user actions. This improves the quality and speed of each step: the LLM is not required to flawlessly solve a large task, and the user does not need to rewrite the prompt 10 times.

### AI Development for up to 100% of Complex Projects

Detailed context for the entire project in a language understandable by LLMs:
*   Frontend in the form of a JSON object.
*   Data structure in the form of a JSON object.
*   Separate functions (routes) with detailed descriptions for each event.

### No Scalability Limitations

*   Backend logic of any complexity: all code is under developer control.
*   Simple integration of third-party developers to extend the business logic of a specific event – using standard IDE tools.

## UniRender Blocks in Existing Websites

You can embed UniRender forms into any existing landing page / website without overhauling the entire site. Simply load `unirender.js` into a `<div>` container and set the correct `apiHost`.

This allows **expanding existing products created with No Code / Low Code builders**, adding business logic of any complexity.

### Template Library with Complex Business Logic

Seamless integration of UI templates with backend business logic. A template is simply added to the form – and interaction with the backend is ready. Deep integration with existing functions can be achieved with AI, as there is full context on the component and data structure.

In the classical approach, implementing complex templates requires integration on the frontend (SDK), at the API level (with documentation updates), and at the backend level. Updates to such templates are fraught with risks of consistency violations.

### Personalized Design

The goal is to make the interface as convenient as possible for a specific user.

In a backend-driven solution, not only text but also the set of components, their arrangement, colors, styles, and any other attributes can be easily changed. **The customization logic can be determined with the help of AI.**

Any page on a site is critical. And any of them can be optimized not manually, but with AI. And any of them can and should be optimized not generally – but adapted to each visitor, taking into account their profile, where they came to the site from now, and the history of their past visits.

### Dynamic Containers

Automatic generation of **multi-level admin panels from data structure** descriptions. Flexible visualization settings at both the individual field level and the field set level.

A Product Manager gets a full-fledged CMS already at the project development stage – each new entity and field is automatically ready for population.

## Terminology

### Component

A JavaScript component of the corresponding framework (VUE / React / etc):
*   Saved in [.umd](https://github.com/umdjs/umd) format, with all necessary dependencies.
*   Accessible via a public URL.
*   Reactive: display automatically changes when any properties change.
*   Component wrapping rules are described in the "[Component Wrapper](#component-wrapper)" section

### Element

An instance of a component within a specific View:
*   The "key" value is unique within the View.
*   Contains its own `attributes.*`, `options.*`, `store.*`, and `methods.*` values.
*   Other elements, including container elements, can be added to elements of type "container".
*   Business logic of any complexity can be prepared on the backend for any method.

### View

One or more related [elements](#element):
*   Can be assigned one or more URL paths (for direct access via the address bar).
*   A separate .umd file **is not created** for a View.
*   Can be cloned into a container [element](#element) of another View. In this case, a prefix is added to the key of each [element](#element) in the cloned View to keep the keys of the added elements unique within the View.
*   Can contain its own `head[]` with styles and scripts.
*   Can be embedded in a `<div>` container of any website.

### Page

A logically complete construct consisting of one or more View(s). A project can have any number of Pages.

### UniRender Config

A JSON object that describes all [elements](#element) and their attributes and methods, as well as auxiliary data and the URL for display in the address bar.

### Storage

A [JSON object](#structure-of-storage) in browser storage that stores Element settings (`attributes`, `options`, `methods`), dynamic data (input fields, table cells, etc.), and auxiliary data.

### UniRender (JS Library)

The JavaScript library for the following tasks:
*   Interaction with the backend, including sending and receiving [UniRender config](#unirender-config-format-detailed).
*   Rendering Elements, including loading Components in `.umd` format.
*   Creating and updating [Storage](#structure-of-storage) based on data received from the backend.

## Installation

### Quick Deploy

1.  Copy the [“Build”](https://github.com/Sirius-AI-dev/unirender/tree/main/build) folder into your Web project.
    Dependencies are minimum:
    *   `"axios": "^1.6.0"`
    *   `"jsonpath-plus": "^7.2.0"`
    *   `"lodash": "^4.17.21"`
2.  Specify a correct API URL in `index.html`.
3.  Add any business logic on the backend to process the API calls.

That's all! Now your frontend is ready for work.

### Install UniRender package

#### Using npm:

```shell
$ npm i unirender
```

#### Using yarn:

```shell
$ yarn add unirender
```

#### Usage

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

### Prompts to Setup Projects

*   **Replit**: TBD

## Examples

### UniRender config builder

Run UniRender config builder: <https://dev.unibackend.com/config>

View [UniRender config](https://github.com/Sirius-AI-dev/unirender/blob/main/examples/UniRender%20config/build_config.json)

You can make changes in the [UniRender config](#unirender-config-format-detailed) to change layout in the right part of the screen.

### Interactive Components

Demo with interactive components: <https://dev.unibackend.com/demo>

View [UniRender config](https://github.com/Sirius-AI-dev/unirender/blob/main/examples/UniRender%20config/demo_config.json)

Click buttons to change [elements](#element) layout and attributes.

### Tokling.com

Multiplayer word battles to practise 42 foreign languages: <https://tokling.com>

View [UniRender config](https://github.com/Sirius-AI-dev/unirender/blob/main/examples/UniRender%20config/toking_config.json)

You can check http requests and responses in the Developer Console to understand the UniRender principles better. Pay attention, that all requests in all the projects have the same format.

And all the projects have the same Page Source.

### Python Routes

TBD

### NodeJS Routes

TBD

## Workflow

### Preparation for Work

1.  Install the UniRender project or just copy the “Build” folder into your Web project.
    Dependencies are minimum:
    *   `"axios": "^1.6.0"`,
    *   `"jsonpath-plus": "^7.2.0"`,
    *   `"lodash": "^4.17.21"`
2.  Specify a correct API URL in the `index.html`.
3.  Add any business-logic on backend to process the API calls.

That’s all! Now your frontend is ready for work.


### API Request Format

API request parameters from `window.uni.switch()`:

*   `url`:
    ```json
    {
      "protocol": "https", // optional
      "host": "<my_domain.org>", // optional
      "path": "/path/to/part",
      "parameters": "params", // string, optional
      "anchor": "#myhash", // string, optional
      "tab_id": "active browser tab ID"
    }
    ```
*   `query`: `{ <required keys and values from [Storage](#structure-of-storage), event, and props> }`
    Example:
    ```json
    {
      "query": {
        "components": {
          "element_1": {
            "attributes": {
              "label": "Text 1",
              "class": ["class_1"]
            }
          }
        },
        "store": {
          "element_2": {
            "input": "New text"
          }
        }
      }
    }
    ```
*   `uniData`:
    ```json
    {
      "device": "desktop | tablet | mobile", // user's device
      "window": {
        "width": 800, // resolution: width
        "height": 600 // resolution: height
      }
    }
    ```

### API Response Format

The response includes the [UniRender config](#unirender-config-format-detailed), which may contain all or part of the following sections:

*   `composition`: An object specifying the list of top-level [elements](#element):
    ```json
    {
      "point": "<name of the topmost component>",
      "title": "",
      "css": [],
      "js": [],
      "config_url": "<optional: .json file with [UniRender config](#unirender-config-format-detailed)>"
    }
    ```
*   `components`: A flat list of all [elements](#element) on the page. All container [elements](#element) specify which elements are included in them. The nesting level is unlimited.
*   `store`: An object with dynamic keys; each [elements](#element) can have from 0 to several such keys. For example, a button might not have such a key, but a table has a key with an array of data (objects), a key for storing a list of selected records, a key with sort statuses, etc.
*   `methods`: An object with methods that handle the necessary [elements](#element) events. Typically, this is a call to the `window.uni.switch()` function.
*   `service`: An object with auxiliary keys; these keys are not processed on the frontend.
*   `url`: An object with the URL of the current page; this URL can include various parameters:
    ```json
    {
      "protocol": "https", // optional
      "host": "<my_domain.org>", // optional
      "path": "/path/to/part",
      "parameters": "params", // string, optional
      "anchor": "#myhash", // string, optional
      "target": "blank", // string, optional
      "tab_id": "active browser tab ID"
    }
    ```
*   `actions`: `[{<action to run>}]` (Array of action objects.)

### Logic of UniRender Operation

1.  Upon first launch, it contacts the backend via the API URL. The request sends the "url" and "uniData" sections.
2.  Upon receiving a response from the backend:
    *   Unpacks keys into [Storage](#structure-of-storage).
    *   During the first launch, it renders [elements](#element). Subsequently, element visualization changes due to component reactivity.
    *   Executes actions.
    *   For [elements](#element) with methods, it adds events that execute the `window.uni.switch()` function or a JavaScript script.
3.  When the `switch()` function is called, it forms and sends a request to the backend. Upon receiving a response, it proceeds to step 2.

## Structure of Storage

The Storage JSON object has the following sections:

*   `"components"`: Stores the settings for all [elements](#element). For each [element](#element), it specifies which keys in `"store"` and `"methods"` it is linked to.
*   `"methods"`: A list of methods with JavaScript code. Typically, this is a call to the `window.uni.switch()` function.
*   `"params"`: `{"initUrl", "apiHost"}`
*   `"store"`: Dynamic data that changes with the [element](#element) (input field content, selected records, etc.).
*   `"service"`: An object with auxiliary data. A checksum is also saved for consistency verification.
*   `"config"`: The current config from the server, excluding `store` and `service`.

## Function `window.uni.switch()`

For handling methods (e.g., a button click), the `window.uni.switch()` function is used, through which all [elements](#element) can interact with the backend.

Parameters for calling `window.uni.switch()` from an [element](#element):

*   `event`: Event object - mandatory.
*   `props`: Props passed to the [element](#element) from which the event was called - mandatory.
*   `uniKeys`: A list of keys from Storage, event, and props, whose values need to be sent in the request to the backend. Regex can be used - optional.
    *   Each key like `"components.my_element_1.attributes.label"` should be passed as an array of arrays:
        ```json
        [
          ["exact", "components"],
          ["exact", "action_add_elements"],
          ["exact", "attributes"],
          ["exact", "label"]
        ]
        ```
    *   If, for example, you need to pass attributes of all keys that start with `"input_form_"`:
        ```json
        [
          ["exact", "store"],
          ["regex", "^input_form_.*"]
        ]
        ```
*   `js`: JavaScript code to execute on the frontend (optional). If specified, no API call occurs.
*   `js-hooks`: `afterApply`, `beforeApply`. This is JavaScript code that will run before and after the `window.uni.switch()` call.
*   `url`: Where to navigate. Object (optional):
    ```json
    {
      "protocol": "https", // optional
      "host": "<my_domain.org>", // optional
      "path": "/path/to/part",
      "parameters": "params", // string, optional
      "anchor": "#myhash",  // string, optional
      "target": "blank",   // string, optional
      "tab_id": "active browser tab ID"
    }
    ```

## Supported Actions

An array of objects describing actions. The rules are as follows:

*   The moment an action triggers is determined by the "when" key.
*   If "when" is not specified or is "beforeApply", the action will execute BEFORE data merge.
*   If "when" is "afterApply", the action will execute AFTER data merge.
*   If an action needs to be executed with a delay, specify `"pauseBefore": <msec>`.

List of actions:

### 1. `delete`

Deletes all keys specified in the `key[]` array, from the section: `"store"` \| `"components"` \| `"methods"` \| `"service"`. Regular expressions are supported for key searching.

**Example:**
```json
{
  "action": "delete",
  "when": "afterApply"  | "beforeApply",
  "key": [
    [["exact", "components"], ["regex", "^filter_.*"]],
    [["exact", "store"], ["exact", "key_01"]]
  ]
}
```
**Result:**
1.  All [elements](#element) from "components" whose `element_key` starts with "filter_" are deleted.
2.  The [element](#element) with `element_key` = "key_01" is deleted.

### 2. `update` (or alias `jsonpath_update`)

Updates keys in an array based on a JSONPath condition.

**Example:**
```json
{
  "action": "update",
  "type": "replace" | "merge" | "add",
  "when": "afterApply" (default) | "beforeApply",
  "path": "$.store.my_table[?(@id===2)]",
  "data": { "label": "new label", "desc": "new desc" }
}
```
**`type` options:**
*   `replace`: Replace one object/array/any type with another.
*   `merge`: Merge objects, replace non-object types.
*   `add`: Expand arrays (not applicable for other types).

### 3. `call`

Executes any method. All method parameters are passed at the top level.

**Example:**
```json
{
  "action": "call",
  "method": "goto",
  "path": "/admin",
  "pauseBefore": 3000
}
```

### 4. `localStorage`

Saves the specified keys to the client's `localStorage`. Subsequently, values saved in `localStorage` will be sent in the initial request (e.g., when the page refreshes).

**Example:**
```json
{
  "action": "localStorage",
  "key": [
    [["exact", "components"], ["regex", "^filter_.*"]],
    [["exact", "store"], ["exact", "key_01"]]
  ]
}
```

### 5. `config`

Loads [UniRender config](#unirender-config-format-detailed) from a file. Convenient for quickly displaying a web page.

**Example:**
```json
{
  "action": "config",
  "url": "https://static-dev.tokling.com/config.json",
  "when": "beforeApply"
}
```

### 6. `trigger`

Executes a method on a specific [element](#element).

**Example:**
```json
{
  "action": "trigger",
  "event": "click",
  "key": [
    ["exact", "key_01"]
  ],
  "uniKeys": [[...], [...]],
  "when": "afterApply"
}
```

### 7. `seqApply`

Applies the [UniRender config](#unirender-config-format-detailed) step-by-step, with timeline support. This allows for demonstrations (showing order of actions) and animations (rapid changes in colors / element sizes, hiding / showing, gradual changes in values, etc.).

**Example:**
```json
{
  "action": "seqApply",
  "when": "afterApply",
  "id": "seq_id_1",
  "data": [
    {
      "wait": "<milliseconds since last event>",
      "config": {"components": {}, "store": {}}
    }
  ],
  "cycles": "<how many times to repeat the whole cycle, default 1>",
  "flag": ["stop" = "stop seqApply execution"]
}
```

## Embedded UniRender

Ability to embed UniRender into any website:
```html
<div id="unirender1"></div>
<div id="unirender2"></div>
```
[UniRender config](#unirender-config-format-detailed) will be rendered in these containers.

How to connect UniRender:
1.  In the `<head>`: `<script src="<URL to load unirender.js>"></script>`
2.  Further in the code: `<script>(new Unirender({...})).mount('#unirender1')</script>`
3.  In the config, define:
    ```json
    {
      "components": {
        "element_1": {},
        "element_2": {}
      },
      "composition": {
        "point": {
          "#div1": "element_1",
          "#div2": "element_2"
        }
      }
    }
    ```

This provides the following capabilities:
1.  A UniRender-based widget can be easily installed on any website, with customized design for each site.
2.  Phased implementation of UniRender into any project: first one container, then a page, then other pages (migration to UniRender).

## UniRender Config Format (Detailed)

### `components` (JSON-object)

Contains all [elements](#element) necessary for rendering. Each [element](#element) has a unique name, consisting only of Latin letters, numbers, and the symbols `_`, `-`, `~`, `#`.

The element's name is the key of the `components` JSON object.

Properties of each [element](#element):
*   `key` (string): Unique name of the element. Must match the component's key in `components` (mandatory).
*   `url` (string): Full link to the `.umd` file of the component (mandatory).
*   `attributes` (object): Object with the element's main attributes, their names strictly defined in the base component (e.g., `label`, `style`). Only properties passed to the original component are listed here (mandatory).
*   `options` (object): Object with additional element attributes. These properties are processed in the [Component wrapper](#component-wrapper) (optional).
*   `methods` (object): Element methods, their names strictly defined in the component (e.g., `click`, `focus`, `scroll`) (optional).
*   `components` (array): Array of components that will be created inside this container component (optional).
*   `store` (object): Component's store. Each component can have only one store (mandatory).
*   `css` (array): CSS files for styling this component (optional).

### `composition` (JSON-object)

The entry point to the application.

Properties of `composition`:
*   `point` (string): Indicates the name of the main (parent) [element](#element).
*   `title` (string): Page title.
*   `head`: (array of objects)
    *   `type` (string): Can contain the following values: `script`, `style`, `link`, `meta`.
    *   `innerHTML` (string): For specifying content inside the tag.
    *   `id` (string): Identifier for the script, style, or meta-data.
    *   `attributes` (object): Attributes specific to a particular head tag according to specification.

In `head` are loaded page settings. Static data for all project pages can be loaded in `index.html`.

**Example:**
```json
[
  {"type": "script", "src": "https://….js"},
  {"type": "css", "innerHTML": ".container { font-size: 12px; }"}
]
```

### `methods` (JSON-object)

A call to `window.uni.switch()` or any JavaScript code that is executed by this method.

The key of the `methods` object is the method name, as specified in "methods" when describing the [element](#element) (e.g., `"element_1-click"`).

The property of the `methods` object is executable JavaScript code.

When calling the function `window.uni.switch()`, the following parameters can be passed:

*   `uniKeys`: A list of keys from [Storage](#structure-of-storage), event, and props, whose values need to be sent in the request to the backend. Regex can be used (optional).
    *   Each key like `"components.my_element_1.attributes.label"` should be passed as an array of arrays:
        ```json
        [
          ["exact", "components"],
          ["exact", "action_add_elements"],
          ["exact", "attributes"],
          ["exact", "label"]
        ]
        ```
    *   If, for example, you need to pass attributes of all keys that start with `"input_form_"`:
        ```json
        [
          ["exact", "store"],
          ["regex", "^input_form_.*"]
        ]
        ```
*   `js-hooks`: `beforeApply`, `afterApply`. This is JavaScript code that will run before and after the `window.uni.switch()` call.

**Example:**
```javascript
(event) => { window.uni.switch({ apiUrl:'/ub/render', uniKeys: [[["exact", "components"], ["exact", "action_add_elements"], ["exact", "attributes"], ["exact", "label"]]], ...event }); }
```

### `store` (JSON-object)

Properties of `store`:
All components refer to this. Property names are the same as the `store` value of the element.

**Example `store` reference within an [element](#element):**
```json
{
  "input_text_1": {
    "store": "input_text_1"
  }
}
```

**Example global `store` settings:**
```json
{
  "store": {
    "input_text_1": {
      "input": "foo bar"
    }
  }
}
```

## Component Wrapper

A special universal wrapper over any component, providing everything necessary for its connection.

A wrapper is (usually) a renderless component that has no layout but simply passes everything necessary for its operation to the nested component.

### Functionality

1.  Has all necessary functions for working with the component (currently: `getComponent` and `callMethod`).
2.  Passes all standard props to the component (`componentKey`, `modelValue`).
3.  Finds the component's store from `config.store` and passes it to the component via `slotProps` as `data`.
4.  Passes all attributes and methods from `config.attributes` and `config.methods` to the component.
5.  Ensures two-way data binding (reactivity) between the component and data.
6.  Extends component logic if necessary.

### `slotProps`

`slotProps` are passed to any component!
1.  `Data`: Component's store.
2.  `Config`: Component's config.
3.  `Props`: Component's props.
4.  `Attrs`: Component's attributes (`config.attributes`).
5.  `Options`: Component's options (`config.options`).
6.  `Events`: Component's methods (`config.methods`).
7.  `Components`: Components nested within this component (`config.components`).
8.  `getComponent`: Function to create a component from the config.
9.  `callMethod`: Function to create a method from the config.
10. `fallthroughAttrs`: Attributes that are automatically assigned to the inner component (currently only `componentKey`).

### Store (Component-Specific)

Each [element](#element) has only one store. Anything can be created inside it. An [element](#element) must refer to its store – typically, this is an object within `Storage.store`, with a key matching the element's name.

From the wrapper, the store arrives at the component as a reactive `data` object. From there, you can take what is needed: `data.input`, `data.selected`, etc.

A component can take data from both `props.modelValue` and `store`, so logic for both cases must be written inside the component. Props also come from the wrapper.

### Props (Component-Specific)

The wrapper accepts standard props for correct operation and passes them to nested components.
```javascript
const propsList = {
  componentKey: String,
  modelValue: String,
};
```
*   `componentKey`: Component name.
*   `modelValue`: Component value when working via store.

### Methods (Component-Specific)

An [element](#element) may have many methods. They are described in UniRender-config, inside the `"components"` object:
```json
{
  "components": {
    "button_1": {
      "methods": {
        "click": "button_1_update"
      }
    }
  }
}
```

The method's behavior is described in UniRender-config, in the `"methods"` object:
```json
{
  "methods": {
    "button_1_update": "(event) => { console.error(event)}"
  }
}
```

All methods will be automatically passed to the component by the wrapper.
