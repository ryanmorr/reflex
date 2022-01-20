import { addEffect } from './scheduler';
import { uuid } from './util';

export function effect(...deps) {
    let initialized = false;
    const key = uuid();
    const callback = deps.pop();
    const values = [];
    deps.forEach((dep, i) => dep.subscribe((value) => {
        values[i] = value;
        if (initialized) {
            addEffect(key, () => callback(...values));
        }
    }));
    initialized = true;
}
