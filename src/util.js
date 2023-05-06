export function uuid() {
    return Math.random().toString(36).substring(2, 11);
}

export function isStore(obj) {
    return obj && typeof obj.subscribe === 'function';
}

export function isPromise(obj) {
    return Promise.resolve(obj) === obj;
}

export function isIterable(obj) {
    return obj != null && typeof obj !== 'string' && typeof obj[Symbol.iterator] === 'function';
}

export function isValidNodeValue(value) {
    return value != null && typeof value != 'boolean';
}
