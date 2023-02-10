import { addEffect } from './scheduler';
import { uuid, isPromise } from './util';

export function effect(...deps) {
    let initialized = false;
    const key = uuid();
    const callback = deps.pop();
    const values = [];
    deps.forEach((dep, i) => dep.subscribe((value) => {
        if (isPromise(value)) {
            value.then((v) => {
                values[i] = v;
                if (initialized) {
                    addEffect(key, () => callback(...values));
                }
            });
        } else {
            values[i] = value;
            if (initialized) {
                addEffect(key, () => callback(...values));
            }
        }
    }));
    initialized = true;
}
