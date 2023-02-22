const cleanups = new Map();

export function cleanup(node, callback) {
    if (Array.isArray(node)) {
        return node.forEach((n) => cleanup(n, callback));
    }
    if (node.nodeType === 11) {
        return Array.from(node.childNodes).forEach((n) => cleanup(n, callback));
    }
    let callbacks = cleanups.get(node);
    if (callbacks) {
        callbacks.push(callback);
    } else {
        callbacks = [callback];
    }
    cleanups.set(node, callbacks);
}

export function dispose(node) {
    const callbacks = cleanups.get(node);
    if (callbacks) {
        callbacks.forEach((callback) => callback(node));
        cleanups.delete(node);
    }
    if (node.hasChildNodes()) {
        Array.from(node.childNodes).forEach(dispose);
    }
}
