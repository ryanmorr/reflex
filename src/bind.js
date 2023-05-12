import { cleanup } from './disposal';
import { render } from './scheduler';
import { uuid } from './util';

function getDefault(store, defaultValue) {
    let value = store.value();
    if (value == null) {
        value = defaultValue;
        store.set(value);
    }
    return value;
}

function setOption(element, value) {
    for (let i = 0; i < element.options.length; i++) {
        const option = element.options[i];
        if (option.value === value) {
            option.selected = true;
            return;
        }
    }
}

function setOptions (element, value) {
    for (let i = 0; i < element.options.length; i++) {
        const option = element.options[i];
        option.selected = ~value.indexOf(option.value);
    }
}

function bindEvent(element, type, callback) {
    element.addEventListener(type, callback);
    cleanup(element, () => element.removeEventListener(type, callback));
}

function bindInput(element, store, defaultValue = '') {
    let prevVal = getDefault(store, defaultValue);
    const key = uuid();
    const unsubscribe = store.subscribe((nextVal) => {
        if (nextVal !== prevVal) {
            render(key, () => {
                element.value = prevVal = nextVal;
            });
        }
    });
    element.value = prevVal;
    cleanup(element, unsubscribe);
    bindEvent(element, 'input', () => {
        prevVal = element.value;
        if (defaultValue === 0) {
            prevVal = Number(prevVal);
        }
        store.set(prevVal);
    });
}

function bindCheckboxAndRadio(element, store) {
    let prevVal = getDefault(store, false);
    const key = uuid();
    const unsubscribe = store.subscribe((nextVal) => {
        if (nextVal !== prevVal) {
            render(key, () => {
                element.checked = prevVal = nextVal;
            });
        }
    });
    element.checked = prevVal;
    cleanup(element, unsubscribe);
    bindEvent(element, 'change', () => {
        prevVal = element.checked;
        store.set(prevVal);
    });
}

function bindSelect(element, store) {
    const option = element.options[element.selectedIndex];
    let prevVal = getDefault(store, option ? option.value : '');
    const key = uuid();
    const unsubscribe = store.subscribe((nextVal) => {
        if (nextVal !== prevVal) {
            render(key, () => {
                setOption(element, nextVal);
                prevVal = nextVal;
            });
        }
    });
    setOption(element, prevVal);
    cleanup(element, unsubscribe);
    bindEvent(element, 'input', () => {
        const option = element.options[element.selectedIndex];
        if (option) {
            prevVal = option.value;
            store.set(prevVal);
        }
    });
}

function bindSelectMultiple(element, store) {
    let initialized = false;
    const key = uuid();
    const unsubscribe = store.subscribe((nextVal) => {
        if (initialized) {
            render(key, () => setOptions(element, nextVal));
        }
    });
    initialized = true;
    setOptions(element, getDefault(store, []));
    cleanup(element, unsubscribe);
    bindEvent(element, 'input', () => {
        store.set(Array.from(element.selectedOptions).map((option) => option.value));
    });
}

export function bind(store) {
    const binding = (element, attr) => {
        if (attr.startsWith('on')) {
            return bindEvent(element, attr.slice(2).toLowerCase(), (event) => store.set(event));
        }
        const nodeName = element.nodeName.toLowerCase();
        if (nodeName === 'textarea' && attr === 'value') {
            return bindInput(element, store);
        }
        if (nodeName === 'select' && attr === 'value') {
            if (element.type === 'select-multiple') {
                return bindSelectMultiple(element, store);
            }
            return bindSelect(element, store);
        }
        if (nodeName === 'input') {
            if ((element.type === 'checkbox' || element.type === 'radio') && attr === 'checked') {
                return bindCheckboxAndRadio(element, store);
            }
            if (attr === 'value') {
                if (element.type === 'number' || element.type === 'range') {
                    return bindInput(element, store, 0);
                }
                return bindInput(element, store);
            }
        }
    };
    binding.isBinding = true;
    return binding;
}
