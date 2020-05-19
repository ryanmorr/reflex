import { scheduleRender } from '@ryanmorr/schedule-render';

const queue = new Map();

export function queueRender(key, value, callback) {
    if (!queue.has(key)) {
        scheduleRender(() => {
            const val = queue.get(key);
            queue.delete(key);
            callback(val);
        });
    }
    queue.set(key, value);
}

export function tick(...callbacks) {
    const promise = new Promise((resolve) => scheduleRender(resolve));
    if (callbacks.length > 0) {
        callbacks.forEach((callback) => promise.then(callback));
    }
    return promise;
}
