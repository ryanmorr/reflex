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
        if (nextVal !== prevVal && !(prevVal == null && nextVal == null)) {           
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
    const node = createNode(prevVal);
    const marker = document.createTextNode('');
    let prevNode = getNodes(node);
    store.subscribe((nextVal) => {
        if (nextVal !== prevVal) { 
            if (!renderQueue.has(prevNode)) {
                scheduleRender(() => {
                    const value = renderQueue.get(prevNode);
                    renderQueue.delete(prevNode);
                    prevNode = patchNode(prevNode, value, marker);
                    prevVal = value;
                });
            }
            renderQueue.set(prevNode, nextVal);
        }
    });
    const frag = document.createDocumentFragment();
    frag.appendChild(node);
    frag.appendChild(marker);
    return frag;
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
