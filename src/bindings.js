const bindings = new Map();

export function attach(node, callback) {
    if (Array.isArray(node)) {
        return node.forEach((n) => attach(n, callback));
    }
    let callbacks = bindings.get(node);
    if (callbacks) {
        callbacks.push(callback);
    } else {
        callbacks = [callback];
    }
    bindings.set(node, callbacks);
}

export function dispose(node) {
    const callbacks = bindings.get(node);
    if (callbacks) {
        callbacks.forEach((callback) => callback());
        bindings.delete(node);
    }
    if (node.hasChildNodes()) {
        Array.from(node.childNodes).forEach(dispose);
    }
}
