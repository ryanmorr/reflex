const nodeCleanupMap = new Map();

export function cleanup(node, callback) {
    if (Array.isArray(node)) {
        return node.forEach((n) => cleanup(n, callback));
    }
    if (node.nodeType === 11) {
        return Array.from(node.childNodes).forEach((n) => cleanup(n, callback));
    }
    let callbacks = nodeCleanupMap.get(node);
    if (callbacks) {
        callbacks.push(callback);
    } else {
        callbacks = [callback];
    }
    nodeCleanupMap.set(node, callbacks);
}

export function dispose(node) {
    const callbacks = nodeCleanupMap.get(node);
    if (callbacks) {
        callbacks.forEach((callback) => callback(node));
        nodeCleanupMap.delete(node);
    }
    if (node.hasChildNodes()) {
        Array.from(node.childNodes).forEach(dispose);
    }
}
