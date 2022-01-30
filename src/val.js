import createStore from '@ryanmorr/create-store';
import { tick } from './scheduler';

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
