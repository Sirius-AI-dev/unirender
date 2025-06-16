import { apiHost as defaultApiHost } from './constants';
// import { UrlObject, InputUrl } from "./types"

export default class UniUrl {
    private url: URL;
    private _target?: string = '';

    constructor(url: InputUrl, baseUrl: string = defaultApiHost) {

        this.url = new URL('/', baseUrl);

        switch (true) {
            case typeof url === 'undefined':
                url = window.location.href;
            case typeof url === 'string':
                this.url = new URL(url as string, baseUrl);
                break;
            case url instanceof UniUrl:
                this.apply(url as UniUrl);
                break;
            case typeof url === 'object' && url as UrlObject && typeof (url as UrlObject).path === 'string':
                this.apply(url as UrlObject);
                break;
            case url instanceof URL:
                this.url = url as URL;
                break;
            default:
                throw 'Invalid URL';
        }
    }

    apply(url: UniUrl | UrlObject): UniUrl {
        this.url.pathname = url.path;

        if (url.protocol) { this.url.protocol = url.protocol; }
        if (url.host) { this.url.host = url.host; }
        if (url.parameters) { this.url.search = url.parameters; }
        if (url.anchor) { this.url.hash = url.anchor; }

        if (url.target) { this._target = url.target; }
        return this;
    }

    // Goto URL for client
    go(target: string = '') {
        switch (target || this._target) {
            case 'blank':
                window.open(this.toString()); // Open link on new tab
                return;
            case 'self':
                const newUrl = this.toString();
                if (window.location.href != newUrl) {
                    window.location.href = this.toString(); // Open link on self tab
                } else {
                    window.location.reload()
                }

                return;
            default:
                history.pushState({}, '', this.toString(true)); // Open link on self tab without reload
        }
    }

    setParameter(name: string, value: string): UniUrl {
        const params = new URLSearchParams(this.url.search);
        params.set(name, value);
        this.url.search = params.toString();
        return this;
    }

    getParameter(name: string): string {
        const params = new URLSearchParams(this.url.search);

        // @ts-ignore
        return params.get(name)
    }

    removeParameter(name: string) {
        const params = new URLSearchParams(this.url.search);
        params.delete(name)
        this.url.search = params.toString()
    }

    setHost(host: string) {
        this.url.host = host;
        return this;
    }

    toString(withoutOrigin: boolean = false): string {
        if (withoutOrigin) {
            return this.url.pathname + this.url.search + this.url.hash;
        }
        return this.url.toString();
    }

    static isValid(url: string): boolean {
        try {
            new URL(url)
        } catch (e) {
            return false
        }
        return true
    }

    toObject(): UrlObject {
        let obj: UrlObject = {
            path: this.url.pathname
        };
        if (this.url.protocol) obj.protocol = this.url.protocol;
        if (this.url.host) obj.host = this.url.host;
        if (this.url.search) obj.parameters = this.url.search;
        if (this.url.hash) obj.anchor = this.url.hash;
        return obj;
    }

    get target(): string {
        return this._target || '';
    }

    get protocol(): string {
        return this.url.protocol;
    }

    get host(): string {
        return this.url.host;
    }

    get path(): string {
        return this.url.pathname;
    }

    get parameters(): string {
        return this.url.search.substring(1);
    }

    get anchor(): string {
        return this.url.hash.substring(1);
    }
}
