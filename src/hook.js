const HOOK = Symbol('hook');

export function isHook(obj) {
    return typeof obj === 'function' && obj[HOOK] === true;
}

export function hook(fn, ...args) {
    const callback = (element, name, attributes) => fn(element, name, attributes, ...args);
    callback[HOOK] = true;
    return callback;
}
