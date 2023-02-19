export function createPromise(callback) {
    if (typeof callback !== 'function') {
        const value = callback;
        callback = (resolve) => resolve(value);
    }
    return new Promise((resolve, reject) => setTimeout(() => callback(resolve, reject), 50));
}

export function wait(promise) {
    return new Promise((resolve, reject) => {
        if (promise) {
            if (promise.subscribe) {
                promise = promise.value();
            }
            promise.then(() => setTimeout(resolve, 50));
            promise.catch(() => setTimeout(reject, 50));
        } else {
            setTimeout(resolve, 25);
        }
    });
}
