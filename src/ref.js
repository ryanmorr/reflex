import createStore from '@ryanmorr/create-store';
import { attach } from './bindings';

const REF = Symbol('ref');

export function isRef(obj) {
    return obj && obj[REF] === true;
}

export const ref = createStore((get, set) => () => {
    set([]);
    return {
        [REF]: true,
        get(index) {
            const elements = get();
            if (typeof index === 'number') {
                return elements[index];
            }
            return elements;
        },
        add(...elements) {
            elements.forEach((element) => {
                const prevElements = get();
                if (element.nodeName && prevElements.indexOf(element) === -1) {
                    const nextElements = prevElements.slice();
                    nextElements.push(element);
                    set(nextElements, prevElements, element, 1);
                    attach(element, () => this.remove(element));
                }
            });
        },
        remove(...elements) {
            elements.forEach((element) => {
                const prevElements = get();
                const index = prevElements.indexOf(element);
                if (index !== -1) {
                    const nextElements = prevElements.slice();
                    nextElements.splice(index, 1);
                    set(nextElements, prevElements, element, -1);
                }
            });
        }
    };
});