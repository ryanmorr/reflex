import { store, isStore } from './store';

export function component(callback) {
    return (props) => {
        return callback(Object.keys(props).reduce((acc, key) => {
            const prop = props[key];
            acc[key] = isStore(prop) ? prop : store(prop);
            return acc;
        }, {}));
    };
}
