import scheduleRender from '@ryanmorr/schedule-render';

let currentTask;
const tasks = new Map();
const resolvedPromise = Promise.resolve();

export function render(key, value, callback) {
    if (!tasks.has(key)) {
        currentTask = scheduleRender(() => {
            tasks.get(key)();
            tasks.delete(key);
            if (tasks.size === 0) {
                currentTask = null;
            }
        });
    }
    tasks.set(key, () => callback(value));
}

export function tick() {
    if (!currentTask) {
        return resolvedPromise;
    }
    return currentTask;
}