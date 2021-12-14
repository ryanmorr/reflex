export function uuid() {
    return Math.random().toString(36).substr(2, 9);
}

export function isPromise(obj) {
    return Promise.resolve(obj) === obj;
}

export function unpack(fn, arg) {
    const val = fn(arg);
    if (typeof val === 'function') {
        return unpack(val, arg);
    }
    return val;
}
