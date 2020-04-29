import htm from 'htm';
import createStore from '@ryanmorr/create-store';
import { scheduleRender } from '@ryanmorr/schedule-render';
import SVG_TAGS from './svg-tags';

const BINDING = Symbol('binding');
const renderQueue = new Map();
const build = htm.bind(createElement);

function uuid() {
    return Math.random().toString(36).substr(2, 9);
}

function isStore(obj) {
    return obj && typeof obj.subscribe === 'function';
}

function isBinding(obj) {
    return obj && obj[BINDING] === true;
}

function createClass(obj) {
    let output = '';
    if (typeof obj === 'string') {
        return obj;
    }
    if (Array.isArray(obj) && obj.length > 0) {
        for (let i = 0, len = obj.length, tmp; i < len; i++) {
            if ((tmp = createClass(obj[i])) !== '') {
                output += (output && ' ') + tmp;
            }
        }
    } else {
        for (const cls in obj) {
            if (obj[cls]) {
                output += (output && ' ') + cls;
            }
        }
    }
    return output;
}

function arrayToFrag(nodes) {
    return nodes.reduce((frag, node) => {
        if (node != null) {
            frag.appendChild(getNode(node));
        }
        return frag;
    }, document.createDocumentFragment());
}

function getNodes(node) {
    if (node.nodeType === 11) {
        return Array.from(node.childNodes);
    }
    return node;
}

function clearNodes(parent, element) {
    if (Array.isArray(element)) {
        element.forEach((node) => parent.removeChild(node));
    } else {
        parent.removeChild(element);
    }
}

function createElement(nodeName, attributes, ...children) {
    attributes = attributes || {};
    const isSvg = SVG_TAGS.includes(nodeName);
    const element = isSvg ? document.createElementNS('http://www.w3.org/2000/svg', nodeName) : document.createElement(nodeName);
    if (children) {
        element.appendChild(arrayToFrag(children));
    }
    if (attributes) {
        for (const name in attributes) {
            patchAttribute(element, name, null, attributes[name], isSvg);
        }
    }
    return element;
}

function createNode(value) {
    if (value == null) {
        return document.createTextNode('');
    }
    if (typeof value === 'number') {
        value = String(value);
    }
    if (typeof value === 'string') {
        return document.createTextNode(value);
    }
    if (Array.isArray(value)) {
        return arrayToFrag(value);
    }
    return value;
}

function getNode(node) {
    if (isStore(node)) {
        return observeNode(node);
    }
    return createNode(node);
}

function queue(key, value, callback) {
    if (!renderQueue.has(key)) {
        scheduleRender(() => {
            const val = renderQueue.get(key);
            renderQueue.delete(key);
            callback(val);
        });
    }
    renderQueue.set(key, value);
}

function observeAttribute(element, store, name, prevVal, isSvg) {
    const key = uuid();
    store.subscribe((nextVal) => {
        if (nextVal !== prevVal && !(prevVal == null && nextVal == null)) {           
            queue(key, nextVal, (value) => {
                patchAttribute(element, name, prevVal, value, isSvg);
                prevVal = value;
            });
        }
    });
}

function observeNode(store) {
    let prevVal = store.get();
    const key = uuid();
    const node = createNode(prevVal);
    const marker = document.createTextNode('');
    let prevNode = getNodes(node);
    store.subscribe((nextVal) => {
        if (nextVal !== prevVal) { 
            queue(key, nextVal, (value) => {
                prevNode = patchNode(prevNode, value, marker);
                prevVal = value;
            });
        }
    });
    const frag = document.createDocumentFragment();
    frag.appendChild(node);
    frag.appendChild(marker);
    return frag;
}

function patchAttribute(element, name, prevVal, nextVal, isSvg = false) {
    if (isBinding(nextVal)) {
        return nextVal(element, name);
    }
    if (isStore(nextVal)) {
        const store = nextVal;
        nextVal = store.get();
        observeAttribute(element, store, name, nextVal, isSvg);
    }
    if (name === 'class') {
		name = 'className';
    }
    if (name === 'class' || name === 'className') {
        nextVal = createClass(nextVal);
    }
    if (name === 'style') {
        if (typeof nextVal === 'string') {
            element.style.cssText = nextVal;
        } else {
            for (const key in Object.assign({}, nextVal, prevVal)) {
                const style = nextVal == null || nextVal[key] == null ? '' : nextVal[key];
                if (key.includes('-')) {
                    element.style.setProperty(key, style);
                } else {
                    element.style[key] = style;
                }
            }
        }
    } else if (name.startsWith('on') && (typeof prevVal === 'function' || typeof nextVal === 'function')) {
        name = name.slice(2).toLowerCase();
        if (nextVal) {
            element.addEventListener(name, nextVal);
        }
        if (prevVal) {
            element.removeEventListener(name, prevVal);
        }
    } else if (!isSvg && name !== 'list' && name !== 'form' && name in element) {
        element[name] = nextVal == null ? '' : nextVal;
    } else if (nextVal == null || nextVal === false) {
        element.removeAttribute(name);
    } else {
        element.setAttribute(name, nextVal);
    }
}

function patchNode(prevNode, nextVal, marker) {
    if (typeof nextVal === 'number') {
        nextVal = String(nextVal);
    }
    if (prevNode.nodeType === 3 && typeof nextVal === 'string') {
        prevNode.data = nextVal;
        return prevNode;
    }
    const parent = marker.parentNode;
    const nextNode = createNode(nextVal);
    const nodes = getNodes(nextNode);
    if (Array.isArray(prevNode)) {
        if (prevNode.length === 0) {
            parent.insertBefore(nextNode, marker);
        } else if (prevNode.length === 1) {
            parent.replaceChild(nextNode, prevNode[0]);
        } else {
            clearNodes(parent, prevNode);
            parent.insertBefore(nextNode, marker);
        }
    } else {
        prevNode.replaceWith(nextNode);
    }
    return nodes;
}

function bindInput(el, store) {
    let prevVal = store.get();
    if (prevVal == null) {
        prevVal = '';
    }
    const key = uuid();
    store.subscribe((nextVal) => {
        if (nextVal !== prevVal) {
            queue(key, nextVal, (value) => {
                el.value = prevVal = value;
            });
        }
    });
    el.addEventListener('input', () => {
        prevVal = el.value;
        store.set(prevVal);
    });
    el.value = prevVal;
}

function bindNumericInput(el, store) {
    let prevVal = store.get();
    if (prevVal == null) {
        prevVal = 0;
    }
    const key = uuid();
    store.subscribe((nextVal) => {
        if (nextVal !== prevVal) {
            queue(key, nextVal, (value) => {
                el.value = prevVal = value;
            });
        }
    });
    el.addEventListener('input', () => {
        prevVal = Number(el.value);
        store.set(prevVal);
    });
    el.value = prevVal;
}

function bindCheckboxAndRadio(el, store) {
    let prevVal = store.get();
    if (prevVal == null) {
        prevVal = false;
    }
    const key = uuid();
    store.subscribe((nextVal) => {
        if (nextVal !== prevVal) {
            queue(key, nextVal, (value) => {
                el.checked = prevVal = value;
            });
        }
    });
    el.addEventListener('change', () => {
        prevVal = el.checked;
        store.set(prevVal);
    });
    el.checked = prevVal;
}

function bindSelect(el, store) {
    let prevVal = store.get();
    if (prevVal == null) {
        prevVal = '';
    }
    const key = uuid();
    const setValue = (value) => {
        for (let i = 0; i < el.options.length; i++) {
            const option = el.options[i];
            if (option.value === value) {
                option.selected = true;
                prevVal = value;
                return;
            }
        }
    };
    store.subscribe((nextVal) => {
        if (nextVal !== prevVal) {
            queue(key, nextVal, setValue);
        }
    });
    el.addEventListener('input', () => {
        const option = el.options[el.selectedIndex];
        if (option) {
            prevVal = option.value;
            store.set(prevVal);
        }
    });
    setValue(prevVal);
}

function bindSelectMultiple(el, store) {
    let initialized = false;
    const key = uuid();
    const setValue = (value) => {
        if (value == null) {
            value = [];
        }
        for (let i = 0; i < el.options.length; i++) {
            const option = el.options[i];
            option.selected = ~value.indexOf(option.value);
        }
    };
    store.subscribe((nextVal) => {
        if (initialized) {
            queue(key, nextVal, setValue);
        }
    });
    el.addEventListener('input', () => store.set(Array.from(el.selectedOptions).map((option) => option.value)));
    initialized = true;
    setValue(store.get());
}

export function bind(store) {
    const binding = (el, attr) => {
        const nodeName = el.nodeName.toLowerCase();
        if (nodeName === 'textarea' && attr === 'value') {
            return bindInput(el, store);
        } else if (nodeName === 'select' && attr === 'value') {
            if (el.type === 'select-multiple') {
                return bindSelectMultiple(el, store);
            }
            return bindSelect(el, store);
        } else if (nodeName === 'input') {
            if ((el.type === 'checkbox' || el.type === 'radio') && attr === 'checked') {
                return bindCheckboxAndRadio(el, store);
            } else if (attr === 'value') {
                if (el.type === 'number' || el.type === 'range') {
                    return bindNumericInput(el, store);
                }
                return bindInput(el, store);
            }
        }
    };
    binding[BINDING] = true;
    return binding;
}

export function html(...args) {
    const result = build(...args);
    return Array.isArray(result) ? arrayToFrag(result) : getNode(result);
}

export const store = createStore((get, set) => (value) => {
    set(value);
    const setValue = (val) => set(val, get());
    return {
        get,
        set: setValue,
        update(callback) {
            return setValue(callback(get()));
        }
    };
});

export const derived = createStore((get, set) => (...deps) => {
    let initialized = false;
    const callback = deps.pop();
    const values = [];
    const sync = () => set(callback(...values), get());
    deps.forEach((dep, i) => dep.subscribe((value) => {
        values[i] = value;
        if (initialized) {
            sync();
        }
    }));
    initialized = true;
    sync();
    return {
        get
    };
});
