import htm from 'htm';
import { isStore } from './store';
import { isBinding } from './bind';
import { queueRender } from './queue';
import { attach } from './bindings';
import { uuid } from './util';

const build = htm.bind(createElement);

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

function createElement(nodeName, attributes, ...children) {
    attributes = attributes || {};
    if (typeof nodeName === 'function') {
        attributes.children = children;
        return nodeName(attributes);
    }
    const isSvg = SVG_TAGS.includes(nodeName);
    const element = isSvg ? document.createElementNS('http://www.w3.org/2000/svg', nodeName) : document.createElement(nodeName);
    if (children) {
        element.appendChild(arrayToFrag(children));
    }
    if (attributes) {
        for (const name in attributes) {
            let value = attributes[name];
            if (isBinding(value)) {
                value(element, name);
            } else if (isStore(value)) {
                const store = value;
                value = store.get();
                observeAttribute(element, store, name, value, isSvg);
            } else {
                patchAttribute(element, name, null, value, isSvg);
            }
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

function observeAttribute(element, store, name, prevVal, isSvg) {
    const key = uuid();
    const unsubscribe = store.subscribe((nextVal) => {
        if (nextVal !== prevVal && !(prevVal == null && nextVal == null)) {           
            queueRender(key, nextVal, (value) => {
                patchAttribute(element, name, prevVal, value, isSvg);
                prevVal = value;
            });
        }
    });
    attach(element, unsubscribe);
    patchAttribute(element, name, null, prevVal, isSvg);
}

function observeNode(store) {
    let prevVal = store.get();
    const key = uuid();
    const node = createNode(prevVal);
    const marker = document.createTextNode('');
    let prevNode = getNodes(node);
    const unsubscribe = store.subscribe((nextVal) => {
        if (nextVal !== prevVal) { 
            queueRender(key, nextVal, (value) => {
                prevNode = patchNode(prevNode, value, marker);
                prevVal = value;

                attach(prevNode, unsubscribe);
            });
        }
    });
    attach(prevNode, unsubscribe);
    const frag = document.createDocumentFragment();
    frag.appendChild(node);
    frag.appendChild(marker);
    attach(frag, unsubscribe);
    return frag;
}

function patchAttribute(element, name, prevVal, nextVal, isSvg = false) {
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

export function html(...args) {
    const result = build(...args);
    return Array.isArray(result) ? arrayToFrag(result) : getNode(result);
}
