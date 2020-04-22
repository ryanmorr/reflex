import htm from 'htm';
import createStore from '@ryanmorr/create-store';
import { scheduleRender } from '@ryanmorr/schedule-render';
import SVG_TAGS from './svg-tags';

const renderQueue = new Map();
const build = htm.bind(createElement);

function isStore(obj) {
    return obj && typeof obj.subscribe === 'function';
}

function arrayToFrag(nodes) {
    return nodes.reduce((frag, node) => {
        if (node != null) {
            frag.appendChild(getNode(node));
        }
        return frag;
    }, document.createDocumentFragment());
}

function createElement(nodeName, attributes, ...children) {
    attributes = attributes || {};
    const isSvg = SVG_TAGS.includes(nodeName);
    const element = isSvg ? document.createElementNS('http://www.w3.org/2000/svg', nodeName) : document.createElement(nodeName);
    if (attributes) {
        for (const name in attributes) {
            patchAttribute(element, name, null, attributes[name], isSvg);
        }
    }
    if (children) {
        element.appendChild(arrayToFrag(children));
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
    const attrNode = element.getAttributeNode(name);
    store.subscribe((nextVal) => {
        if (nextVal !== prevVal) {           
            if (!renderQueue.has(attrNode)) {
                scheduleRender(() => {
                    const value = renderQueue.get(attrNode);
                    patchAttribute(element, name, prevVal, value, isSvg);
                    renderQueue.delete(attrNode);
                    prevVal = value;
                });
            }
            renderQueue.set(attrNode, nextVal);
        }
    });
}

function observeNode(store) {
    let prevVal = store.get();
    let prevNode = createNode(prevVal);
    store.subscribe((nextVal) => {
        if (nextVal !== prevVal) { 
            if (!renderQueue.has(prevNode)) {
                scheduleRender(() => {
                    const value = renderQueue.get(prevNode);
                    renderQueue.delete(prevNode);
                    prevNode = patchNode(prevNode, value);
                    prevVal = value;
                });
            }
            renderQueue.set(prevNode, nextVal);
        }
    });
    return prevNode;
}

function patchAttribute(element, name, prevVal, nextVal, isSvg = false) {
    if (isStore(nextVal)) {
        const store = nextVal;
        nextVal = store.get();
        observeAttribute(element, store, name, nextVal, isSvg);
    }
    if (name === 'class') {
		name = 'className';
    }
    if (name === 'style') {
        if (typeof nextVal === 'string') {
            element.style.cssText = nextVal;
        } else {
            for (const key in nextVal) {
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

function patchNode(prevNode, nextValue) {
    if (typeof nextValue === 'number') {
        nextValue = String(nextValue);
    }
    if (prevNode.nodeType === 3 && typeof nextValue === 'string') {
        prevNode.data = nextValue;
        return prevNode;
    }
    const nextNode = createNode(nextValue);
    prevNode.replaceWith(nextNode);
    return nextNode;
}

export function html(...args) {
    const result = build(...args);
    return Array.isArray(result) ? arrayToFrag(result) : getNode(result);
}

export const store = createStore((get, set) => (value) => {
    set(value);
    return {
        get,
        set,
    };
});
