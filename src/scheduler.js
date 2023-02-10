import scheduleRender from '@ryanmorr/schedule-render';

let currentTask;
const tasks = new Map();
const effects = new Map();
const resolvedPromise = Promise.resolve();

export function addEffect(key, callback) {
    effects.set(key, callback);
}

export function render(key, callback) {
    if (!tasks.has(key)) {
        currentTask = scheduleRender(() => {
            tasks.get(key)();
            tasks.delete(key);
            if (tasks.size === 0) {
                currentTask = null;
                if (effects.size > 0) {
                    effects.forEach((callback, key) => effects.delete(key) && render(key, callback));
                }
            }
        });
    }
    tasks.set(key, callback);
}

export function tick() {
    if (!currentTask) {
        return resolvedPromise;
    }
    return currentTask;
}
