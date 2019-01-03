import {parseQuery} from './parse-query.js';

const memory = {};

export class Elem {
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