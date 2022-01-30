import { patchNode } from './dom';
import { render } from './scheduler';
import { cleanup, dispose } from './disposal';
import { uuid, isStore, isPromise } from './util';

const MARKER = Symbol('marker');

function getPromiseState(promise) {
    return Promise.race([promise, MARKER]).then(
        (value) => (value === MARKER) ? 'pending' : 'fulfilled',
        () => 'rejected'
    );
}

export function when(value, {idle, pending, fulfilled, rejected}) {
    const key = uuid();
    const marker = document.createTextNode('');
    let initialRender = true;
    let unsubscribe, prevNode;
    const doRender = (nextVal) => render(key, () => {
        dispose(prevNode);
        prevNode = patchNode(prevNode, nextVal, marker);
    });
    const setValue = (promise) => {
        if (isPromise(promise)) {
            getPromiseState(promise).then((state) => {
                if (state === 'pending' && pending) {
                    doRender(pending(promise));
                }
                if (state !== 'rejected' && fulfilled) {
                    promise.then((nextVal) => doRender(fulfilled(nextVal, promise)));
                }
                if (state !== 'fulfilled' && rejected) {
                    promise.catch((error) => doRender(rejected(error, promise)));
                }
            });
        } else if (idle) {
            doRender(idle(promise));
        }
    };
    if (isStore(value)) {
        unsubscribe = value.subscribe((nextVal) => {
            if (!initialRender) { 
                setValue(nextVal);
            } else {
                if (!isPromise(nextVal) && idle) {
                    prevNode = idle(nextVal);
                } else {
                    prevNode = document.createTextNode('');
                    setValue(nextVal);
                }
                initialRender = false;
            }
        });
        cleanup(marker, unsubscribe);
    } else {
        prevNode = document.createTextNode('');
        setValue(value);
    }
    const frag = document.createDocumentFragment();
    frag.appendChild(prevNode);
    frag.appendChild(marker);
    return frag;
}
