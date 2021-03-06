import createStore from '@ryanmorr/create-store';
import { tick } from './render';

export function isStore(obj) {
    return obj && typeof obj.subscribe === 'function';
}

export const val = createStore((get, set) => (value) => {
    set(value);
    const setValue = (val) => {
        set(val, get());
        return tick();
    };
    return {
        get,
        set: setValue,
        update(callback) {
            return setValue(callback(get()));
        }
    };
});

export const derived = createStore((get, set) => (...deps) => {
    let initialized = false;
    const callback = deps.pop();
    const values = [];
    const sync = () => set(callback(...values), get());
    deps.forEach((dep, i) => dep.subscribe((value) => {
        values[i] = value;
        if (initialized) {
            sync();
        }
    }));
    initialized = true;
    sync();
    return {
        get
    };
});
