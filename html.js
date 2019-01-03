import {Elem} from "./element.js";

export {State} from "./state";
const elem = element => (props, ...children) => {
    const b = new Elem(element);
    b.setAll(props);
    b.ele.innerHTML = "";
    b.append(...children);
};
export const body = (props, ...children) => {
    return elem(document.body)(props, ...children);
};
export const head = (props, ...children) => {
    return elem(document.head)(props, ...children);
};
export const h = Elem.create;
export const div = (query, props, ...children) => h(query, props, ...children);
export const header = (query, props, ...children) => h(`header${query}`, props, ...children);
export const h1 = (query, props, ...children) => h(`h1${query}`, props, ...children);
export const h2 = (query, props, ...children) => h(`h2${query}`, props, ...children);
export const h3 = (query, props, ...children) => h(`h3${query}`, props, ...children);
export const h4 = (query, props, ...children) => h(`h4${query}`, props, ...children);
export const h5 = (query, props, ...children) => h(`h5${query}`, props, ...children);
export const h6 = (query, props, ...children) => h(`h6${query}`, props, ...children);
export const li = (query, props, ...children) => h(`li${query}`, props, ...children);
export const main = (query, props, ...children) => h(`main${query}`, props, ...children);
export const i = (query, props, ...children) => h(`i${query}`, props, ...children);
export const span = (query, props, ...children) => h(`span${query}`, props, ...children);
export const p = (query, props, ...children) => h(`p${query}`, props, ...children);
export const footer = (query, props, ...children) => h(`footer${query}`, props, ...children);
export const aside = (query, props, ...children) => h(`aside${query}`, props, ...children);
export const meta = (name, content) => h("meta", {name, content});
export const charset = (charset = "UTF-8") => h("meta", {charset});
export const link = (rel, href, type) => h("link", {rel, href, type});
export const icon = (href, type, sizes) => h("link", {rel:"icon", href, type, sizes});
export const apple_icon = (href, sizes) => h("link", {rel:"apple-touch-icon", href, sizes});
export const mask_icon = (href, color) => h("link", {rel: "mask-icon", href, color});
export const manifest = (href) => h("link", {rel: "manifest", href});
export const title = (text) => h("title", {text});
export const load = (loader) => {
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
    )
};
