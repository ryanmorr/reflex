import { scheduleRender } from '@ryanmorr/schedule-render';

let promise;
const queue = new Map();

function render() {
    for (const [key, callback] of queue) {
        callback();
        queue.delete(key);
    }
    promise = null;
}

function scheduleFrame() {
    if (!promise) {
        promise = scheduleRender(render);
    }
}

export function queueRender(key, value, callback) {
    scheduleFrame();
    queue.set(key, () => callback(value));
}

export function tick(...callbacks) {
    scheduleFrame();
    if (callbacks.length > 0) {
        callbacks.forEach((callback) => promise.then(callback));
    }
    return promise;
}
