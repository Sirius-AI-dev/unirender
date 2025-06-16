import { Config } from "../types";
import UniUrl from "../UniUrl";

type HTMLTag = HTMLStyleElement | HTMLScriptElement | HTMLMetaElement

type customTag = HTMLTag & { customId?: number } | null

export { CSSLoader, JSLoader, UMDLoader } from './loaders'

// Function caller
export function callFunc(params: { beforeSwitch: string, data: object }): boolean {
    const f = new Function('return ' + params.beforeSwitch)();
    if (typeof f === 'function') {
        f(params.data);
        return false;
    }
    return true;
}

// Handle for composition config
export function compositionHandler({ newConfig: config }: { newConfig: Config }): boolean {

    if (this.config && this.config.composition) {
        if (this.config.composition.title) {
            document.title = this.config.composition.title;
        }

        if (this.config.composition.head) {
            this.config.composition.head.forEach(headItem => {
                let url: string | undefined;
                let tag: customTag = null
                switch (headItem.type) {
                    case 'style':
                        tag = document.createElement('style')
                        break;
                    case 'link':
                        url = headItem.src;
                        if (url) {
                            this.CSSLoader(url, null, null, headItem.attributes, headItem.id);
                        } else {
                            tag = document.createElement('link')
                        }
                        break;
                    case 'script':
                        url = headItem.src || headItem.attributes?.src;
                        if (url) {
                            this.JSLoader(url, null, null, headItem.attributes, headItem.id);
                        } else if (headItem.innerHTML) {
                            tag = document.createElement('script')
                        }
                        break;
                    case 'meta':
                        tag = document.createElement('meta')
                        break;
                }

                if (!tag) return

                if (headItem.attributes && typeof headItem.attributes !== 'string' && Object.keys(headItem.attributes).length && Object.values(headItem.attributes).length) {
                    Object.keys(headItem.attributes).forEach((key) => {
                        tag!.setAttribute(key, headItem.attributes[key])
                    })
                }

                if (headItem.innerHTML) {
                    tag.innerHTML = headItem.innerHTML
                }

                tag.setAttribute('customId', headItem.id.toString())

                document.head.append(tag)
            });
        }
    }

    return true;
}

export function iFrame({ newConfig: config }: { newConfig: Config }): boolean {
    const iframes = document.querySelectorAll('iframe')
    if (iframes.length) {
        iframes.forEach(iframe => {
            try {
                iframe.contentWindow!.uni.apply(config)
            } catch (error) {
            }
        })
    }
    return true;
}

export function wait(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

export function pushConfigToCache({ mergedConfig: config }: { mergedConfig: Config }) {
    localStorage.setItem('lastConfig', JSON.stringify(config))
}