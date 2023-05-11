import { cleanup } from './disposal';

let observer;
const listeners = new Map();
const docElement = window.document.documentElement;

function checkListeners(mutations) {
    mutations.forEach((mutation) => mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1) {
            for (const [element, {root, callbacks}] of listeners) {
                if (node === element || node.contains(element)) {
                    const cleanupCallbacks = callbacks.map((callback) => callback(root)).filter((value) => typeof value === 'function');
                    if (cleanupCallbacks.length > 0) {
                        onCleanup(element, root, cleanupCallbacks);
                    }
                    listeners.delete(element);
                    if (listeners.size === 0) {
                        observer.disconnect();
                        observer = null;
                    }
                }
            }
        }
    }));
}

function onCleanup(element, root, cleanupCallbacks) {
    let disposed = false;
    cleanupCallbacks.forEach((callback) => {
        if (Array.isArray(root)) {
            root.forEach((node) => {
                cleanup(node, () => {
                    if (!disposed) {
                        callback(root);
                        disposed = true;
                    }
                });
            });
        } else {
            cleanup(element, callback);
        }
    });
}

function onMount(element, callback) {
    if (observer == null) {
        observer = new MutationObserver(checkListeners);
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
    const element = component(props, (callback) => mountCallbacks.push(callback));
    mountCallbacks.forEach((callback) => onMount(element, callback));
    return element;
}
