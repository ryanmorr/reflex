import htm from 'htm';
import { createComponent } from './component';
import { isBinding } from './bind';
import { render } from './scheduler';
import { cleanup } from './disposal';
import { uuid, isStore, isPromise, isValidNodeValue } from './util';

const buildHTML = htm.bind(createElement);

const IS_NON_DIMENSIONAL = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;
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

function getNodeRef(node) {
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
        element.appendChild(arrayToFrag(children, element));
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

function arrayToFrag(nodes, parent) {
    return nodes.reduce((frag, value) => {
        const node = resolveNode(value, parent);
        if (isValidNodeValue(node)) {
            frag.appendChild(node);
        }
        return frag;
    }, document.createDocumentFragment());
}

function createNode(value, parent) {
    if (typeof value === 'function') {
        return createNode(value(parent), parent);
    }
    if (!isValidNodeValue(value)) {
        return null;
    }
    if (typeof value === 'number') {
        value = String(value);
    }
    if (typeof value === 'string') {
        return document.createTextNode(value);
    }
    if (Array.isArray(value)) {
        return arrayToFrag(value, parent);
    }
    return value;
}

function resolveNode(value, parent) {
    if (typeof value === 'function') {
        return resolveNode(value(parent), parent);
    }
    if (isStore(value)) {
        return createNodeStoreBinding(parent, value);
    }
    if (isPromise(value)) {
        return createNodePromiseBinding(parent, value);
    }
    return createNode(value, parent);
}

function createAttributeStoreBinding(element, store, name, isSvg) {
    const key = uuid();
    let initialRender = true;
    let prevVal;
    const setValue = (nextVal) => {
        prevVal = name === 'value' || name === 'selected' || name === 'checked' ? element[name] : prevVal;
        if (isPromise(nextVal)) {
            nextVal.then(setValue);
        } else if (!(prevVal == null && nextVal == null)) {
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

function createNodeStoreBinding(parent, store) {
    const key = uuid();
    const marker = document.createTextNode('');
    let initialRender = true;
    let prevVal;
    let prevNode;
    const setValue = (nextVal) => {
        if (typeof nextVal === 'function') {
            setValue(nextVal(parent));
        } else if (isPromise(nextVal)) {
            nextVal.then(setValue);
        } else {
            if (prevNode == null && !isValidNodeValue(nextVal)) {
                return;
            }
            render(key, () => {
                prevNode = patchNode(parent, marker, prevNode, nextVal);
                prevVal = nextVal;
            });
        }
    };
    const onSubscribe = (nextVal) => {
        if (typeof nextVal === 'function') {
            onSubscribe(nextVal(parent));
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
    cleanup(marker, unsubscribe);
    if (isValidNodeValue(prevVal) && !isPromise(prevVal)) {
        const node = createNode(prevVal);
        prevNode = getNodeRef(node);
        const frag = document.createDocumentFragment();
        frag.appendChild(node);
        frag.appendChild(marker);
        return frag;
    }
    return marker;
}

function createNodePromiseBinding(parent, promise) {
    const marker = document.createTextNode('');
    promise.then((value) => {
        if (isValidNodeValue(value)) {
            render(uuid(), () => patchNode(parent, marker, null, value));
        }
    });
    return marker;
}

function createAttributePromiseBinding(element, promise, name, isSvg) {
    promise.then((nextVal) => render(uuid(), () => patchAttribute(element, name, null, nextVal, isSvg)));
}

function defineProperty(element, name, value, isSvg) {
    if (isStore(value)) {
        createAttributeStoreBinding(element, value, name, isSvg);
    } else if (isPromise(value)) {
        createAttributePromiseBinding(element, value, name, isSvg);
    } else {
        patchAttribute(element, name, null, value, isSvg);
    }
}

function setStyle(element, name, value) {
    if (name.startsWith('--')) {
        element.style.setProperty(name, value == null ? '' : value);
    } else if (value == null) {
        element.style[name] = '';
    } else if (typeof value !== 'number' || IS_NON_DIMENSIONAL.test(name)) {
        element.style[name] = value;
    } else {
        element.style[name] = value + 'px';
    }
}

function patchAttribute(element, name, prevVal, nextVal, isSvg = false) {
    const nextType = typeof nextVal;
    if (name.startsWith('on') && (typeof prevVal === 'function' || nextType === 'function')) {
        name = (name.toLowerCase() in element) ? name.toLowerCase().slice(2) : name.slice(2);
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
    if (name === 'style') {
        if (typeof nextVal === 'string') {
            element.style.cssText = nextVal;
        } else {
            if (typeof prevVal === 'string') {
				element.style.cssText = prevVal = '';
			}
            for (const key in Object.assign({}, nextVal, prevVal)) {
                setStyle(element, key, nextVal == null ? '' : nextVal[key]);
            }
        }
    } else {
        if (!isSvg && name === 'class') {
            name = 'className';
        }
        if (name === 'class' || name === 'className') {
            nextVal = createClass(nextVal);
        }
        if (
            !isSvg &&
            name !== 'width' &&
            name !== 'height' &&
            name !== 'href' &&
            name !== 'list' &&
            name !== 'form' &&
            name !== 'tabIndex' &&
            name !== 'download' &&
            name in element
        ) {
            try {
                element[name] = nextVal == null ? '' : nextVal;
                return;
            } catch (e) {} // eslint-disable-line no-empty
        }
        if (nextVal != null && (nextVal !== false || name.indexOf('-') != -1)) {
            element.setAttribute(name, nextVal);
        } else {
            element.removeAttribute(name);
        }
    } 
}

function patchNode(parent, marker, prevNode, nextVal) {
    if (typeof nextVal === 'number') {
        nextVal = String(nextVal);
    }
    if (prevNode && prevNode.nodeType === 3 && typeof nextVal === 'string') {
        prevNode.data = nextVal;
        return prevNode;
    }
    if (!isValidNodeValue(nextVal)) {
        if (Array.isArray(prevNode)) {
            clearNodes(parent, prevNode);
        } else {
            parent.removeChild(prevNode);
        }
        return null;
    }
    const nextNode = createNode(nextVal, parent);
    const node = getNodeRef(nextNode);
    if (prevNode == null) {
        parent.insertBefore(nextNode, marker);
        return node;
    }
    if (Array.isArray(prevNode)) {
        if (prevNode.length === 1) {
            parent.replaceChild(nextNode, prevNode[0]);
        } else {
            clearNodes(parent, prevNode);
            parent.insertBefore(nextNode, marker);
        }
    } else {
        prevNode.replaceWith(nextNode);
    }
    return node;
}

export function html(...args) {
    const result = buildHTML(...args);
    return Array.isArray(result) ? arrayToFrag(result) : resolveNode(result);
}
