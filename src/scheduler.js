import scheduleRender from '@ryanmorr/schedule-render';

let currentTask;
const tasks = new Map();
const effects = new Map();
const resolvedPromise = Promise.resolve();

export function addSideEffect(key, callback) {
    effects.set(key, () => effects.delete(key) && callback());
}

export function addPersistentSideEffect(key, callback) {
    effects.set(key, callback);
    return () => effects.delete(key);
}

export function render(key, callback) {
    if (!tasks.has(key)) {
        currentTask = scheduleRender(() => {
            tasks.get(key)();
            tasks.delete(key);
            if (tasks.size === 0) {
                currentTask = null;
                if (effects.size > 0) {
                    effects.forEach((callback) => resolvedPromise.then(callback));
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
