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

export function tick() {
    return new Promise((resolve) => scheduleRender(resolve));
}
