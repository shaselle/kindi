const HASH = '#'.charCodeAt(0);
const DOT = '.'.charCodeAt(0);

const TAG_NAME = 0;
const ID = 1;
const CLASS_NAME = 2;

const parseQuery = (query) => {
    let tag = null;
    let id = null;
    let className = null;
    let mode = TAG_NAME;
    let offset = 0;

    for (let i = 0; i <= query.length; i++) {
        const char = query.charCodeAt(i);
        const isHash = char === HASH;
        const isDot = char === DOT;
        const isEnd = !char;

        if (isHash || isDot || isEnd) {
            if (mode === TAG_NAME) {
                if (i === 0) {
                    tag = 'div';
                } else {
                    tag = query.substring(offset, i);
                }
            } else if (mode === ID) {
                id = query.substring(offset, i);
            } else {
                if (className) {
                    className += ' ' + query.substring(offset, i);
                } else {
                    className = query.substring(offset, i);
                }
            }

            if (isHash) {
                mode = ID;
            } else if (isDot) {
                mode = CLASS_NAME;
            }

            offset = i + 1;
        }
    }

    return {tag, id, className};
};

const memory = {};

class Elem {
    constructor(ele) {
        this.ele = ele;
        this.isElem = true;
    }

    append(...children) {
        children.forEach(element => {
            if (element.isElem) {
                element = element.ele;
            } else if (typeof element === "string") {
                element = document.createTextNode(element);
            }
            this.ele.appendChild(element);
        });
    }

    setAll(attributes) {
        Object.keys(attributes).forEach(name => {
            const value = attributes[name];
            if (name === "css") {
                this.css(value);
            } else if (["click"].indexOf(name) > -1) {
                this.on(name, value);
            } else if (name === "text") {
                this.ele.innerText = "";
                this.append(document.createTextNode(value));
            } else {
                this.ele.setAttribute(name, value);
            }
        });
    }

    css(css) {
        css
            .toString()
            .trim()
            .replace(new RegExp(/\s*:host\s*{|\s*}/gi), "")
            .split(";")
            .forEach(cssPropString => {
                const result = cssPropString.trim().split(":");
                let [name, value] = result;
                value = result.slice(1).join(":");
                this.ele.style.setProperty(name.trim(), value.trim());
            });
    }

    on(name, action) {
        this.ele.addEventListener(name, () => action(this), false);
    }

    static element(query, ns) {
        let element;
        if (memory[query]) {
            element = memory[query].cloneNode(false);
        } else {
            const {tag, id, className} = parseQuery(query);
            element = ns ? document.createElementNS(ns, tag) : document.createElement(tag);
            if (id) {
                element.id = id;
            }
            if (className) {
                if (ns) {
                    element.setAttribute('class', className);
                } else {
                    element.className = className;
                }
            }
            memory[query] = element;
        }
        return new Elem(element);
    }

    static create(query, props, ...children) {
        const el = Elem.element(query);
        el.setAll(props);
        el.append(...children);
        return el;
    }

    render(...children) {
        this.ele.innerHTML = "";
        this.append(...children);
    }
}

// Request->ActiveRequest->Action>->State
const FETCH_REQUEST = (request) => (state) => ({
    ...state, loader: {
        ...state.loader,
        loading: true,
        status: `Requesting ${request.name}.`,
        progress: request.progress,
        description: "Fetching data from " + request.url
    }
});

const FETCH_SUCCEEDED = (request) => (state) => ({
    ...state, loader: {
        ...state.loader,
        status: `Requesting ${request.name} succeeded.`,
        progress: request.progress,
        description: `Fetching data from ${request.url} completed!`
    },
    [request.name]: request.data
});

const FETCH_FAILED = (request) => (state) => ({
    ...state, loader: {
        ...state.loader,
        status: `Requesting ${request.name} Failed.`,
        progress: request.progress,
        description: `Fetching data from ${request.url} Failed!`
    },
    error: {...request.error}
});

const FETCH_COMPLETED = (state) => ({
    ...state, loader: {
        ...state.loader,
        loading: false,
        status: "",
        progress: {...state.loader.progress, value: 0},
        description: ""
    },
});

class State {
    get state() {
        return this._state;
    }

    constructor(initialState) {
        const state = initialState || {};
        const fetch = state.fetch || [];
        this._state = {
            ...state,
            fetch: [
                {
                    name: "manifest",
                    options: {},
                    url: `manifest.json`,
                },
                ...fetch
            ],
            loader: {
                icon: "icon.png",
                background: "blue",
                animation: "pulse",
                status: "Loading",
                description: "",
                progress: 0,
                ...state.loader,
            },
        };
        this.onCreate();
    }

    onCreate() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker
                    .register('sw.js')
                    .then((registration) => {
                        // Registration was successful
                        console.log('ServiceWorker registration successful with scope: ', registration.scope);
                    }, (err) => {
                        // registration failed :(
                        console.log('ServiceWorker registration failed: ', err);
                    });
            });
        }
        this.fetch();
    }

    fetch() {
        const requests = this.state.fetch;
        const rise = 100 / requests.length;
        this._state.loader = {
            ...this._state.loader,
            loading: true
        };
        requests.map(request => ({...request, progress: 0, description: ""}))
            .forEach(request => {
                this.dispatch(FETCH_REQUEST({
                    ...request,
                    progress: request.progress + rise,
                }));
                fetch(request.url, request.options)
                    .then(request => {
                        this.dispatch(FETCH_REQUEST({
                            ...request,
                            progress: request.progress + rise,
                        }));
                        return request.json();
                    })
                    .then(data => {
                        this.dispatch(FETCH_SUCCEEDED({...request, progress: request.progress + rise, data}));
                    })
                    .catch(error => {
                        this.dispatch(FETCH_FAILED({...request, error}));
                    }).finally(() => this.dispatch(FETCH_COMPLETED));
            });
    }

    // noinspection JSMethodCanBeStatic
    onLoading() {
        console.log("loading.....");
    }

    onUpdate() {

    }

    dispatch(action) {
        this._state = action(this.state);
        this.onUpdate();
    }
}

const elem = element => (props, ...children) => {
    const b = new Elem(element);
    b.setAll(props);
    b.ele.innerHTML = "";
    b.append(...children);
};
const body = (props, ...children) => {
    return elem(document.body)(props, ...children);
};
const head = (props, ...children) => {
    return elem(document.head)(props, ...children);
};
const h = Elem.create;
const div = (query, props, ...children) => h(query, props, ...children);
const header = (query, props, ...children) => h(`header${query}`, props, ...children);
const h1 = (query, props, ...children) => h(`h1${query}`, props, ...children);
const h2 = (query, props, ...children) => h(`h2${query}`, props, ...children);
const h3 = (query, props, ...children) => h(`h3${query}`, props, ...children);
const h4 = (query, props, ...children) => h(`h4${query}`, props, ...children);
const h5 = (query, props, ...children) => h(`h5${query}`, props, ...children);
const h6 = (query, props, ...children) => h(`h6${query}`, props, ...children);
const li = (query, props, ...children) => h(`li${query}`, props, ...children);
const main = (query, props, ...children) => h(`main${query}`, props, ...children);
const i = (query, props, ...children) => h(`i${query}`, props, ...children);
const span = (query, props, ...children) => h(`span${query}`, props, ...children);
const p = (query, props, ...children) => h(`p${query}`, props, ...children);
const footer = (query, props, ...children) => h(`footer${query}`, props, ...children);
const aside = (query, props, ...children) => h(`aside${query}`, props, ...children);
const meta = (name, content) => h("meta", {name, content});
const charset = (charset = "UTF-8") => h("meta", {charset});
const link = (rel, href, type) => h("link", {rel, href, type});
const icon = (href, type, sizes) => h("link", {rel:"icon", href, type, sizes});
const apple_icon = (href, sizes) => h("link", {rel:"apple-touch-icon", href, sizes});
const mask_icon = (href, color) => h("link", {rel: "mask-icon", href, color});
const manifest = (href) => h("link", {rel: "manifest", href});
const title = (text) => h("title", {text});
const load = (loader) => {
    body({
            // language=CSS
            css: `:host {
                background: #ffc61e;
                width: 100%;
                height: 100%;
                margin: 0;
                padding: 0;
            }`
        },
        div("#loader",
            {
                // language=CSS
                css: `:host {
                    background: rgba(96, 106, 255, 0.63);
                    width: 80%;
                    height: 80%;
                    margin: 10% auto;
                    border-radius: 1rem;
                    padding: 2rem;
                    box-shadow: rgba(22, 22, 18, 0.67) 5px 5px 4px 3px;
                    z-index: 999999999999999999999999999999999999999;
                }`
            },
            h2("#loader_status", {
                text: loader.status + `\n${loader.progress}%`,
                // language=CSS
                css: `:host {
                    color: white;
                    font-size: 1.7rem;
                }`,
            }),
            h("progress#loader_progress", {
                max: 100,
                value: loader.progress,
                text: `${loader.progress}%`,
                // language=CSS
                css: `:host {
                    width: 70%;
                    display: block;
                }`
            }),
            p("#loader_desc", {
                text: loader.description,
                // language=CSS
                css: `:host {
                    color: white;
                    font-size: medium;
                }`
            })
        )
    );
};

export { body, head, h, div, header, h1, h2, h3, h4, h5, h6, li, main, i, span, p, footer, aside, meta, charset, link, icon, apple_icon, mask_icon, manifest, title, load, State };
