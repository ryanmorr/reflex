import { attach } from './bindings';
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
    const unsubscribe = store.subscribe((nextVal) => {
        if (nextVal !== prevVal) {
            queueRender(key, nextVal, (value) => {
                element.value = prevVal = value;
            });
        }
    });
    const onInput = () => {
        prevVal = element.value;
        store.set(prevVal);
    };
    element.addEventListener('input', onInput);
    element.value = prevVal;
    attach(element, () => {
        unsubscribe();
        element.removeEventListener('input', onInput);
    });
}

function bindNumericInput(element, store) {
    let prevVal = store.get();
    if (prevVal == null) {
        prevVal = 0;
        store.set(prevVal);
    }
    const key = uuid();
    const unsubscribe = store.subscribe((nextVal) => {
        if (nextVal !== prevVal) {
            queueRender(key, nextVal, (value) => {
                element.value = prevVal = value;
            });
        }
    });
    const onInput = () => {
        prevVal = Number(element.value);
        store.set(prevVal);
    };
    element.addEventListener('input', onInput);
    element.value = prevVal;
    attach(element, () => {
        unsubscribe();
        element.removeEventListener('input', onInput);
    });
}

function bindCheckboxAndRadio(element, store) {
    let prevVal = store.get();
    if (prevVal == null) {
        prevVal = false;
        store.set(prevVal);
    }
    const key = uuid();
    const unsubscribe = store.subscribe((nextVal) => {
        if (nextVal !== prevVal) {
            queueRender(key, nextVal, (value) => {
                element.checked = prevVal = value;
            });
        }
    });
    const onChange = () => {
        prevVal = element.checked;
        store.set(prevVal);
    };
    element.addEventListener('change', onChange);
    element.checked = prevVal;
    attach(element, () => {
        unsubscribe();
        element.removeEventListener('change', onChange);
    });
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
    const unsubscribe = store.subscribe((nextVal) => {
        if (nextVal !== prevVal) {
            queueRender(key, nextVal, setOption);
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
    attach(element, () => {
        unsubscribe();
        element.removeEventListener('input', onInput);
    });
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
    const unsubscribe = store.subscribe((nextVal) => {
        if (initialized) {
            queueRender(key, nextVal, setOptions);
        }
    });
    const onInput = () => store.set(Array.from(element.selectedOptions).map((option) => option.value));
    element.addEventListener('input', onInput);
    initialized = true;
    setOptions(prevVal);
    attach(element, () => {
        unsubscribe();
        element.removeEventListener('input', onInput);
    });
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
