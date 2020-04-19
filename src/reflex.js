import htm from 'htm';
import createStore from '@ryanmorr/create-store';

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
    store.subscribe((value) => patchAttribute(element, name, value));
}

function observeNode(store) {
    let prevValue = store();
    let prevNode = createNode(prevValue);
    store.subscribe((nextValue) => {
        prevNode = patchNode(prevNode, nextValue);
        prevValue = nextValue;
    });
    return prevNode;
}

function patchAttribute(element, name, value) {
    if (isStore(value)) {
        const store = value;
        value = store();
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

export const val = createStore((get, set) => (value) => {
    set(value);
    return (...args) => {
        if (args.length > 0) {
            set(...args);
        }
        return get();
    };
});
