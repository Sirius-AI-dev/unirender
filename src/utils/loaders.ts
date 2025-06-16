import UniUrl from "../UniUrl";
import { componentsHost } from "../constants";

export function CSSLoader(
    url: string,
    resolve: Function | any = () => { },
    reject: Function | any = () => { },
    // @ts-ignore
    options: CSSLoaderOptions = {},
    id?: number
): HTMLLinkElement {
    // check for duplicate css
    let link = [...document.head.querySelectorAll("link")].find(
        (link) => link.href === url
    );
    if (link) {
        return link;
    }

    // if (this.params.debug) {
    //     console.debug(`Loading stylesheet from ${url}`);
    // }

    link = document.createElement("link");
    link.rel = options.rel || 'stylesheet';
    link.type = options.type || 'text/css';
    if (id) {
        link.setAttribute('customId', id.toString())
    }
    link.href = url;
    link.addEventListener("load", resolve);
    link.addEventListener("error", reject);
    document.head.appendChild(link);
    return link;
}

export function JSLoader(
    url: string,
    resolve: Function | any = () => { },
    reject: Function | any = () => { },
    // @ts-ignore
    options: JSLoaderOptions = {},
    id?: number
): HTMLScriptElement {
    // check for duplicate js script
    let script = [...document.head.querySelectorAll("script")].find(
        (script) => script.src === url
    );
    if (script) {
        return script;
    }

    // if (this.params.debug) {
    //     console.debug(`Loading script from ${url}`);
    // }

    script = document.createElement("script");

    if (options.defer) {
        script.defer = true;
    } else if (options.async) {
        script.async = true;
    }

    script.addEventListener("load", resolve);
    script.addEventListener("error", reject);
    script.type = options.type || 'text/javascript';
    script.src = url;
    if (id !== null && typeof id !== 'undefined') {
        script.setAttribute('customId', id.toString())
    }
    document.head.appendChild(script);
    return script;
}

export async function UMDLoader(url: string, params: { components: any }) {
    let name: string = url!.split("/")!.reverse()[0]!.match(/^(.*?)\.umd/)![1];

    // don't load the component if it has already been loaded
    if (window[name]) return window[name];

    window[name] = new Promise((resolve, reject) => {
        JSLoader(
            params.debug ? new UniUrl(url).setHost(componentsHost).toString() : new UniUrl(url).toString(),
            () => {
                resolve(window[name]);
            },
            () => {
                reject(new Error(`Error loading ${url}`));
            },
            {
                defer: true
            }
        );
    });
    return window[name];
}