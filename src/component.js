import { cleanup } from './disposal';

let isListening = false;
const listeners = new Map();
const observer = new MutationObserver(checkListeners);
const docElement = window.document.documentElement;

function checkListeners(mutations) {
    mutations.forEach((mutation) => {
        if (mutation.addedNodes.length > 0) {
            const addedNodes = mutation.addedNodes;
            for (let i = 0, len = addedNodes.length; i < len; i++) {
                const node = addedNodes[i];
                if (node.nodeType === 1) {
                    for (const [element, {root, callbacks}] of listeners) {
                        if (node === element || node.contains(element)) {
                            callbacks.forEach((callback) => callback(root));
                            listeners.delete(element);
                            if (listeners.size === 0) {
                                observer.disconnect();
                                isListening = false;
                            }
                        }
                    }
                }
            }
        }
    });
}

function mount(element, callback) {
    if (!isListening) {
        isListening = true;
        observer.observe(docElement, {
            childList: true,
            subtree: true
        });
    }
    let root = element;
    if (element.nodeType === 11) {
        root = Array.from(element.childNodes);
        element = element.children[0];
    }
    let callbacks;
    const data = listeners.get(element);
    if (data) {
        callbacks = data.callbacks;
        callbacks.push(callback);
    } else {
        callbacks = [callback];
    }
    listeners.set(element, {root, callbacks});
}

export function createComponent(component, props, children) {
    props.children = children;
    if (component.length <= 1) {
        return component(props);
    }
    const mountCallbacks = [];
    const cleanupCallbacks = [];
    const onMount = (callback) => mountCallbacks.push(callback);
    const onCleanup = (callback) => cleanupCallbacks.push(callback);
    const element = component(props, onMount, onCleanup);
    mountCallbacks.forEach((callback) => mount(element, callback));
    if (cleanupCallbacks.length > 0) {
        let disposed = false;
        cleanupCallbacks.forEach((callback) => {
            if (element.nodeType === 11) {
                const elements = Array.from(element.childNodes);
                elements.forEach((node) => {
                    cleanup(node, () => {
                        if (!disposed) {
                            callback(elements);
                            disposed = true;
                        }
                    });
                });
            } else {
                cleanup(element, callback);
            }
        });
    }
    return element;
}
