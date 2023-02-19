import { cleanup } from './disposal';
import { render } from './scheduler';
import { uuid } from './util';

const BINDING = Symbol('binding');

function bindInput(element, store) {
    let prevVal = store.value();
    if (prevVal == null) {
        prevVal = '';
        store.set(prevVal);
    }
    const key = uuid();
    const unsubscribe = store.subscribe((nextVal) => {
        if (nextVal !== prevVal) {
            render(key, () => {
                element.value = prevVal = nextVal;
            });
        }
    });
    const onInput = () => {
        prevVal = element.value;
        store.set(prevVal);
    };
    element.addEventListener('input', onInput);
    element.value = prevVal;
    cleanup(element, () => {
        unsubscribe();
        element.removeEventListener('input', onInput);
    });
}

function bindNumericInput(element, store) {
    let prevVal = store.value();
    if (prevVal == null) {
        prevVal = 0;
        store.set(prevVal);
    }
    const key = uuid();
    const unsubscribe = store.subscribe((nextVal) => {
        if (nextVal !== prevVal) {
            render(key, () => {
                element.value = prevVal = nextVal;
            });
        }
    });
    const onInput = () => {
        prevVal = Number(element.value);
        store.set(prevVal);
    };
    element.addEventListener('input', onInput);
    element.value = prevVal;
    cleanup(element, () => {
        unsubscribe();
        element.removeEventListener('input', onInput);
    });
}

function bindCheckboxAndRadio(element, store) {
    let prevVal = store.value();
    if (prevVal == null) {
        prevVal = false;
        store.set(prevVal);
    }
    const key = uuid();
    const unsubscribe = store.subscribe((nextVal) => {
        if (nextVal !== prevVal) {
            render(key, () => {
                element.checked = prevVal = nextVal;
            });
        }
    });
    const onChange = () => {
        prevVal = element.checked;
        store.set(prevVal);
    };
    element.addEventListener('change', onChange);
    element.checked = prevVal;
    cleanup(element, () => {
        unsubscribe();
        element.removeEventListener('change', onChange);
    });
}

function bindSelect(element, store) {
    let prevVal = store.value();
    if (prevVal == null) {
        const option = element.options[element.selectedIndex];
        prevVal = option ? option.value : '';
        store.set(prevVal);
    }
    const key = uuid();
    const setOption = (value) => {
        for (let i = 0; i < element.options.length; i++) {
            const option = element.options[i];
            if (option.value === value) {
                option.selected = true;
                prevVal = value;
                return;
            }
        }
    };
    const unsubscribe = store.subscribe((nextVal) => {
        if (nextVal !== prevVal) {
            render(key, () => setOption(nextVal));
        }
    });
    const onInput = () => {
        const option = element.options[element.selectedIndex];
        if (option) {
            prevVal = option.value;
            store.set(prevVal);
        }
    };
    element.addEventListener('input', onInput);
    setOption(prevVal);
    cleanup(element, () => {
        unsubscribe();
        element.removeEventListener('input', onInput);
    });
}

function bindSelectMultiple(element, store) {
    let initialized = false;
    let prevVal = store.value();
    if (prevVal == null) {
        prevVal = [];
        store.set(prevVal);
    }
    const key = uuid();
    const setOptions = (value) => {
        for (let i = 0; i < element.options.length; i++) {
            const option = element.options[i];
            option.selected = ~value.indexOf(option.value);
        }
    };
    const unsubscribe = store.subscribe((nextVal) => {
        if (initialized) {
            render(key, () => setOptions(nextVal));
        }
    });
    const onInput = () => store.set(Array.from(element.selectedOptions).map((option) => option.value));
    element.addEventListener('input', onInput);
    initialized = true;
    setOptions(prevVal);
    cleanup(element, () => {
        unsubscribe();
        element.removeEventListener('input', onInput);
    });
}

function bindEvent(element, store, type) {
    const callback = (event) => store.set(event);
    element.addEventListener(type, callback);
    cleanup(element, () => element.removeEventListener(type, callback));
}

export function bind(store) {
    const binding = (element, attr) => {
        if (attr.startsWith('on')) {
            return bindEvent(element, store, attr.slice(2).toLowerCase());
        }
        const nodeName = element.nodeName.toLowerCase();
        if (nodeName === 'textarea' && attr === 'value') {
            return bindInput(element, store);
        } else if (nodeName === 'select' && attr === 'value') {
            if (element.type === 'select-multiple') {
                return bindSelectMultiple(element, store);
            }
            return bindSelect(element, store);
        } else if (nodeName === 'input') {
            if ((element.type === 'checkbox' || element.type === 'radio') && attr === 'checked') {
                return bindCheckboxAndRadio(element, store);
            } else if (attr === 'value') {
                if (element.type === 'number' || element.type === 'range') {
                    return bindNumericInput(element, store);
                }
                return bindInput(element, store);
            }
        }
    };
    binding[BINDING] = true;
    return binding;
}

export function isBinding(obj) {
    return obj && obj[BINDING] === true;
}
