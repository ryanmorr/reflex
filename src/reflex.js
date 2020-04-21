import htm from 'htm';
import createStore from '@ryanmorr/create-store';
import { scheduleRender } from '@ryanmorr/schedule-render';

const renderQueue = new Map();

function isStore(obj) {
    return obj && typeof obj.subscribe === 'function';
}

function createElement(nodeName, attributes, ...children) {
    attributes = attributes || {};
    const element = document.createElement(nodeName);
    if (attributes) {
        for (const name in attributes) {
            patchAttribute(element, name, attributes[name]);
        }
    }
    if (children) {
        children.forEach((child) => element.appendChild(getNode(child)));
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
    return value;
}

function getNode(node) {
    if (isStore(node)) {
        return observeNode(node);
    }
    return createNode(node);
}

function observeAttribute(element, store, name) {
    let firstRender = true;
    let prevValue = store.get();
    const attrNode = element.getAttributeNode(name);
    store.subscribe((nextValue) => {
        if (firstRender) {
            firstRender = false;
            return;
        }
        if (nextValue !== prevValue) {
            if (renderQueue.has(attrNode)) {
                renderQueue.set(attrNode, nextValue);
            } else {
                renderQueue.set(attrNode, nextValue);
                scheduleRender(() => {
                    const value = renderQueue.get(attrNode);
                    patchAttribute(element, name, value);
                    renderQueue.delete(attrNode);
                    prevValue = value;
                });
            }
        }
    });
}

function observeNode(store) {
    let firstRender = true;
    let prevValue = store.get();
    let prevNode = createNode(prevValue);
    store.subscribe((nextValue) => {
        if (firstRender) {
            firstRender = false;
            return;
        }
        if (nextValue !== prevValue) {
            if (renderQueue.has(prevNode)) {
                renderQueue.set(prevNode, nextValue);
            } else {
                renderQueue.set(prevNode, nextValue);
                scheduleRender(() => {
                    const value = renderQueue.get(prevNode);
                    renderQueue.delete(prevNode);
                    prevNode = patchNode(prevNode, value);
                    prevValue = value;
                });
            }
        }
    });
    return prevNode;
}

function patchAttribute(element, name, value) {
    if (isStore(value)) {
        const store = value;
        value = store.get();
        observeAttribute(element, store, name);
    }
    if (value != null) {
        element.setAttribute(name, value);
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

export const html = htm.bind(createElement);

export const store = createStore((get, set) => (value) => {
    set(value);
    return {
        get,
        set,
    };
});
