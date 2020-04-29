import { queueRender } from './queue';
import { uuid } from './util';

const BINDING = Symbol('binding');

function bindInput(element, store) {
    let prevVal = store.get();
    if (prevVal == null) {
        prevVal = '';
        store.set(prevVal);
    }
    const key = uuid();
    store.subscribe((nextVal) => {
        if (nextVal !== prevVal) {
            queueRender(key, nextVal, (value) => {
                element.value = prevVal = value;
            });
        }
    });
    element.addEventListener('input', () => {
        prevVal = element.value;
        store.set(prevVal);
    });
    element.value = prevVal;
}

function bindNumericInput(element, store) {
    let prevVal = store.get();
    if (prevVal == null) {
        prevVal = 0;
        store.set(prevVal);
    }
    const key = uuid();
    store.subscribe((nextVal) => {
        if (nextVal !== prevVal) {
            queueRender(key, nextVal, (value) => {
                element.value = prevVal = value;
            });
        }
    });
    element.addEventListener('input', () => {
        prevVal = Number(element.value);
        store.set(prevVal);
    });
    element.value = prevVal;
}

function bindCheckboxAndRadio(element, store) {
    let prevVal = store.get();
    if (prevVal == null) {
        prevVal = false;
        store.set(prevVal);
    }
    const key = uuid();
    store.subscribe((nextVal) => {
        if (nextVal !== prevVal) {
            queueRender(key, nextVal, (value) => {
                element.checked = prevVal = value;
            });
        }
    });
    element.addEventListener('change', () => {
        prevVal = element.checked;
        store.set(prevVal);
    });
    element.checked = prevVal;
}

function bindSelect(element, store) {
    let prevVal = store.get();
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
    store.subscribe((nextVal) => {
        if (nextVal !== prevVal) {
            queueRender(key, nextVal, setOption);
        }
    });
    element.addEventListener('input', () => {
        const option = element.options[element.selectedIndex];
        if (option) {
            prevVal = option.value;
            store.set(prevVal);
        }
    });
    setOption(prevVal);
}

function bindSelectMultiple(element, store) {
    let initialized = false;
    let prevVal = store.get();
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
    store.subscribe((nextVal) => {
        if (initialized) {
            queueRender(key, nextVal, setOptions);
        }
    });
    element.addEventListener('input', () => store.set(Array.from(element.selectedOptions).map((option) => option.value)));
    initialized = true;
    setOptions(prevVal);
}

export function bind(store) {
    const binding = (element, attr) => {
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
