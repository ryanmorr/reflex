import { addSideEffect, addPersistentSideEffect } from './scheduler';
import { uuid, isPromise } from './util';

export function effect(...deps) {
    const key = uuid();
    const callback = deps.pop();
    if (deps.length > 0) {
        let initialized = false;
        const values = [];
        const unsubscribes = deps.map((dep, i) => dep.subscribe((value) => {
            if (isPromise(value)) {
                value.then((v) => {
                    values[i] = v;
                    if (initialized) {
                        addSideEffect(key, () => callback(...values));
                    }
                });
            } else {
                values[i] = value;
                if (initialized) {
                    addSideEffect(key, () => callback(...values));
                }
            }
        }));
        initialized = true;
        return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
    }
    return addPersistentSideEffect(key, callback);
}
