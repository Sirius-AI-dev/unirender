import UniUrl from './UniUrl'

declare global {
    interface Window {
        apiHost: string
    }
}

type HTMLTag = HTMLStyleElement | HTMLScriptElement | HTMLMetaElement

type customTag = HTMLTag & { customId?: number } | null

// Application config from server or init config file
export type Config = {
    params?: UniParams
    composition?: CompositionConfig
    url?: InputUrl
    components?: ComponentsList
    methods?: object
    service?: object
    store?: object
    actions?: UniAction[]
    websocket?: string
};

export interface UniParams {
    instanceId: number
    version: string
    apiHost?: string // Base URL for API calls
    debug?: boolean  // debug mode
    toast?: {
        errorTimeout?: number
    }
    components?: {
        host: string
    }
    newTab: boolean
}

export type CompositionConfig = {
    point: string // Old format

    // Start component of document
    points: Object

    // Title of document
    title?: string

    // List of hooks, with list of methods
    hooks?: {
        [hookName: string]: string[]
    }

    // Static css and js files
    css?: string[]
    js?: string[]
    head?: CompositionHead[]
    html?: { style?: {} }

    config_url?: string
};

export type CompositionHead = {
    type: string, // link | style | css, js | script, meta
    id: number | string
    src: string
    innerHTML: string
    attributes: JSLoaderOptions | CSSLoaderOptions
};

export type ComponentConfig = {
    key: string
    url?: string
    name?: string
    components?: ComponentConfig[]
    attributes?: object
    options?: object
    store?: object
    methods?: object,
    css?: string[],
    callMethod?: () => {},
    callEvent?: () => {},
    getComponent?: () => {},
};

export interface ComponentsList {
    [key: string]: ComponentConfig
}

export type UniConfig = {
    params: UniParams;
    store: object;
    service: object;
    components: ComponentsList;
    composition: CompositionConfig;
    methods: object
}

export type SwitchParams = {
    uniKeys?: string[][][],
    url?: UrlObject,
    js?: string,
    event?: any,
    props?: {},
    threads?: SwitchThreads
}

export type SwitchThreads = {
    max: number,
    action?: 'ignore' | 'queue'
    message?: string
}

export type HookOptions = {
    stopOnError: boolean
    stopOnFalse: boolean
}

// Type for subscribe to hook
export type HookSubscribe = {
    // Function that called
    func: (any) => boolean
    hookOptions: HookOptions
}

export type Hooks = {
    beforeSwitch: HookSubscribe[],
    beforeSendSwitch: HookSubscribe[],
    afterSwitch: HookSubscribe[],
    beforeApply: HookSubscribe[],
    afterApply: HookSubscribe[],
}

export type UniAction = {
    action: string
    // change to updateType
    type?: 'update' | 'replace'
    key?: string[][][]
    section?: string
    data?: object
    path?: string
    when?: string
    method?: string
    enabled?: boolean
    esId?: string
    url?: string
}

export type JSLoaderOptions = {
    async?: boolean,
    defer?: boolean
    language?: string
    src?: string
    type?: string,
    href?: string
}

export type CSSLoaderOptions = {
    charset?: string,
    href?: string
    src?: string
    media?: string
    rel?: string
    sizes?: string
    type?: string
}

export type ServiceWorkerConfig = {
    apiHost: string
}

export type InputUrl = undefined | string | UrlObject | UniUrl | URL

export interface UrlObject {
    protocol?: string,
    host?: string,
    path: string,
    parameters?: string,
    anchor?: string
    target?: string
}