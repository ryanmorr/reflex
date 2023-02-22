import htm from 'htm';
import { createComponent } from './component';
import { isBinding } from './bind';
import { render } from './scheduler';
import { cleanup } from './disposal';
import { uuid, isStore, isPromise } from './util';

const buildHTML = htm.bind(createElement);

const SVG_TAGS = [
    'svg',
    'altGlyph',
    'altGlyphDef',
    'altGlyphItem',
    'animate',
    'animateColor',
    'animateMotion',
    'animateTransform',
    'circle',
    'clipPath',
    'color-profile',
    'cursor',
    'defs',
    'desc',
    'ellipse',
    'feBlend',
    'feColorMatrix',
    'feComponentTransfer',
    'feComposite',
    'feConvolveMatrix',
    'feDiffuseLighting',
    'feDisplacementMap',
    'feDistantLight',
    'feFlood',
    'feFuncA',
    'feFuncB',
    'feFuncG',
    'feFuncR',
    'feGaussianBlur',
    'feImage',
    'feMerge',
    'feMergeNode',
    'feMorphology',
    'feOffset',
    'fePointLight',
    'feSpecularLighting',
    'feSpotLight',
    'feTile',
    'feTurbulence',
    'filter',
    'font',
    'font-face',
    'font-face-format',
    'font-face-name',
    'font-face-src',
    'font-face-uri',
    'foreignObject',
    'g',
    'glyph',
    'glyphRef',
    'hkern',
    'image',
    'line',
    'linearGradient',
    'marker',
    'mask',
    'metadata',
    'missing-glyph',
    'mpath',
    'path',
    'pattern',
    'polygon',
    'polyline',
    'radialGradient',
    'rect',
    'set',
    'stop',
    'switch',
    'symbol',
    'text',
    'textPath',
    'title',
    'tref',
    'tspan',
    'use',
    'view',
    'vkern'
];

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

function addRef(store, element) {
    if (typeof store === 'function') {
        addRef(store(element), element);
    } else if (isStore(store)) {
        store.update((prev) => {
            if (prev) {
                const next = prev.slice();
                next.push(element);
                return next;
            } else {
                return [element];
            }
        });
        cleanup(element, () => store.update((prev) => {
            const next = prev.slice();
            const index = prev.indexOf(element);
            next.splice(index, 1);
            return next;
        }));
    }
}

function createElement(nodeName, attributes, ...children) {
    this[0] = 3; // Disable htm caching
    attributes = attributes || {};
    if (typeof nodeName === 'function') {
        return createComponent(nodeName, attributes, children);
    }
    const isSvg = SVG_TAGS.includes(nodeName);
    const element = isSvg ? document.createElementNS('http://www.w3.org/2000/svg', nodeName) : document.createElement(nodeName);
    if (children) {
        element.appendChild(arrayToFrag(children));
    }
    if (attributes) {
        Object.keys(attributes).forEach((name) => {
            const value = attributes[name];
            if (isBinding(value)) {
                value(element, name);
            } else if (name === 'ref') {
                addRef(value, element);
            } else {
                defineProperty(element, name, value, isSvg);
            }
        });
    }
    return element;
}

function defineProperty(element, name, value, isSvg) {
    if (isStore(value)) {
        observeAttributeStore(element, value, name, isSvg);
    } else if (isPromise(value)) {
        observeAttributePromise(element, value, name, isSvg);
    } else {
        patchAttribute(element, name, null, value, isSvg);
    }
}

function createNode(value) {
    if (typeof value === 'function') {
        return createNode(value());
    }
    if (value == null || isPromise(value)) {
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
        return observeNodeStore(node);
    }
    if (isPromise(node)) {
        return observeNodePromise(node);
    }
    if (typeof node === 'function') {
        return getNode(node());
    }
    return createNode(node);
}

function observeAttributeStore(element, store, name, isSvg) {
    const key = uuid();
    let initialRender = true;
    let prevVal;
    const setValue = (nextVal) => {
        if (isPromise(nextVal)) {
            nextVal.then(setValue);
        } else if (nextVal !== prevVal && !(prevVal == null && nextVal == null)) {
            render(key, () => {
                patchAttribute(element, name, prevVal, nextVal, isSvg);
                prevVal = nextVal;
            });
        }
    };
    const unsubscribe = store.subscribe((nextVal) => {
        if (!initialRender) {           
            setValue(nextVal);
        } else {
            prevVal = nextVal;
            initialRender = false;
            if (isPromise(nextVal)) {
                nextVal.then(setValue);
            } else {
                patchAttribute(element, name, null, nextVal, isSvg);
            }
        }
    });
    cleanup(element, unsubscribe);
}

function observeNodeStore(store) {
    const key = uuid();
    const marker = document.createTextNode('');
    let initialRender = true;
    let prevVal;
    let prevNode;
    const setValue = (nextVal) => {
        if (typeof nextVal === 'function') {
            setValue(nextVal());
        } else if (isPromise(nextVal)) {
            nextVal.then(setValue);
        } else if (nextVal !== prevVal) {
            render(key, () => {
                prevNode = patchNode(prevNode, nextVal, marker);
                prevVal = nextVal;
                cleanup(prevNode, unsubscribe);
            });
        }
    };
    const onSubscribe = (nextVal) => {
        if (typeof nextVal === 'function') {
            onSubscribe(nextVal());
        } else if (!initialRender) { 
            setValue(nextVal);
        } else {
            prevVal = nextVal;
            initialRender = false;
            if (isPromise(nextVal)) {
                nextVal.then(setValue);
            }
        }
    };
    const unsubscribe = store.subscribe(onSubscribe);
    const node = createNode(prevVal);
    prevNode = getNodes(node);
    cleanup(prevNode, unsubscribe);
    const frag = document.createDocumentFragment();
    frag.appendChild(node);
    frag.appendChild(marker);
    return frag;
}

function observeNodePromise(promise) {
    const node = document.createTextNode('');
    const marker = document.createTextNode('');
    promise.then((nextVal) => render(uuid(), () => patchNode(node, nextVal, marker)));
    const frag = document.createDocumentFragment();
    frag.appendChild(node);
    frag.appendChild(marker);
    return frag;
}

function observeAttributePromise(element, promise, name, isSvg) {
    promise.then((nextVal) => render(uuid(), () => patchAttribute(element, name, null, nextVal, isSvg)));
}

function patchAttribute(element, name, prevVal, nextVal, isSvg = false) {
    const nextType = typeof nextVal;
    if (name.startsWith('on') && (typeof prevVal === 'function' || nextType === 'function')) {
        name = name.slice(2).toLowerCase();
        if (nextVal) {
            element.addEventListener(name, nextVal);
        }
        if (prevVal) {
            element.removeEventListener(name, prevVal);
        }
        return;
    }
    if (nextType === 'function') {
        return defineProperty(element, name, nextVal(element, name), isSvg);
    }
    if (name === 'class' && !isSvg) {
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
    } else if (!isSvg && name !== 'list' && name !== 'form' && name in element) {
        element[name] = nextVal == null ? '' : nextVal;
    } else if (nextVal == null || nextVal === false) {
        element.removeAttribute(name);
    } else {
        element.setAttribute(name, nextVal);
    }
}

export function patchNode(prevNode, nextVal, marker) {
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

export function html(...args) {
    const result = buildHTML(...args);
    return Array.isArray(result) ? arrayToFrag(result) : getNode(result);
}
