import { render } from './scheduler';
import { cleanup, dispose } from './disposal';
import { uuid, isIterable } from './util';

// Adapted from https://github.com/Freak613/stage0/blob/master/reconcile.js

function longestPositiveIncreasingSubsequence(ns, newStart) {
    let seq = [], is = [], l = -1, pre = new Array(ns.length);
    for (let i = newStart, len = ns.length; i < len; i++) {
        let n = ns[i];
        if (n < 0) continue;
        let j = findGreatestIndexLEQ(seq, n);
        if (j !== -1) pre[i] = is[j];
        if (j === l) {
            l++;
            seq[l] = n;
            is[l]  = i;
        } else if (n < seq[j + 1]) {
            seq[j + 1] = n;
            is[j + 1] = i;
        }
    }
    for (let i = is[l]; l >= 0; i = pre[i], l--) {
        seq[l] = i;
    }
    return seq;
}

function findGreatestIndexLEQ(seq, n) {
    let lo = -1, hi = seq.length;
    if (hi > 0 && seq[hi - 1] <= n) {
        return hi - 1;
    }
    while (hi - lo > 1) {
        let mid = Math.floor((lo + hi) / 2);
        if (seq[mid] > n) {
            hi = mid;
        } else {
            lo = mid;
        }
    }
    return lo;
}

function reconcile(parent, renderedValues, data, source, createFn, beforeNode, afterNode) {
    if (data.length === 0) {
        if (beforeNode !== undefined || afterNode !== undefined) {
            let node = beforeNode !== undefined ? beforeNode.nextSibling : parent.firstChild, tmp;
            if (afterNode === undefined) {
                afterNode = null;
            }
            while(node !== afterNode) {
                tmp = node.nextSibling;
                removeNode(parent, node);
                node = tmp;
            }
        } else {
            parent.textContent = '';
        }
        return;
    }
    if (renderedValues.length === 0) {
        let node, mode = afterNode !== undefined ? 1 : 0;
        for(let i = 0, len = data.length; i < len; i++) {
            node = createFn(data[i], i, source);
            mode ? parent.insertBefore(node, afterNode) : parent.appendChild(node);
        }
        return;
    }
    let prevStart = 0,
        newStart = 0,
        loop = true,
        prevEnd = renderedValues.length-1, newEnd = data.length-1,
        a, b,
        prevStartNode = beforeNode ? beforeNode.nextSibling : parent.firstChild,
        newStartNode = prevStartNode,
        prevEndNode = afterNode ? afterNode.previousSibling : parent.lastChild;
    fixes: while(loop) {
        loop = false;
        let _node;
        a = renderedValues[prevStart], b = data[newStart];
        while (a === b) {
            prevStart++;
            newStart++;
            newStartNode = prevStartNode = prevStartNode.nextSibling;
            if (prevEnd < prevStart || newEnd < newStart) {
                break fixes;
            }
            a = renderedValues[prevStart];
            b = data[newStart];
        }
        a = renderedValues[prevEnd], b = data[newEnd];
        while (a === b) {
            prevEnd--;
            newEnd--;
            afterNode = prevEndNode;
            prevEndNode = prevEndNode.previousSibling;
            if (prevEnd < prevStart || newEnd < newStart) {
                break fixes;
            }
            a = renderedValues[prevEnd];
            b = data[newEnd];
        }
        a = renderedValues[prevEnd], b = data[newStart];
        while (a === b) {
            loop = true;
            _node = prevEndNode.previousSibling;
            parent.insertBefore(prevEndNode, newStartNode);
            prevEndNode = _node;
            newStart++;
            prevEnd--;
            if (prevEnd < prevStart || newEnd < newStart) {
                break fixes;
            }
            a = renderedValues[prevEnd];
            b = data[newStart];
        }
        a = renderedValues[prevStart], b = data[newEnd];
        while (a === b) {
            loop = true;
            _node = prevStartNode.nextSibling;
            parent.insertBefore(prevStartNode, afterNode);
            prevStart++;
            afterNode = prevStartNode;
            prevStartNode = _node;
            newEnd--;
            if (prevEnd < prevStart || newEnd < newStart) {
                break fixes;
            }
            a = renderedValues[prevStart];
            b = data[newEnd];
        }
    }
    if (newEnd < newStart) {
        if (prevStart <= prevEnd) {
            let next;
            while (prevStart <= prevEnd) {
                if (prevEnd === 0) {
                    removeNode(parent, prevEndNode);
                } else {
                    next = prevEndNode.previousSibling;
                    removeNode(parent, prevEndNode);
                    prevEndNode = next;
                }
                prevEnd--;
            }
        }
        return;
    }
    if (prevEnd < prevStart) {
        if (newStart <= newEnd) {
            let node, mode = afterNode ? 1 : 0;
            while(newStart <= newEnd) {
                node = createFn(data[newStart], newStart, source);
                mode ? parent.insertBefore(node, afterNode) : parent.appendChild(node);
                newStart++;
            }
        }
        return;
    }
    const P = new Array(newEnd + 1 - newStart);
    for (let i = newStart; i <= newEnd; i++) {
        P[i] = -1;
    }
    const I = new Map();
    for (let i = newStart; i <= newEnd; i++) {
        I.set(data[i], i);
    }
    let reusingNodes = newStart + data.length - 1 - newEnd, toRemove = [];
    for (let i = prevStart; i <= prevEnd; i++) {
        if (I.has(renderedValues[i])) {
            P[I.get(renderedValues[i])] = i;
            reusingNodes++;
        } else {
            toRemove.push(i);
        }
    }
    if (reusingNodes === 0) {
        if (beforeNode !== undefined || afterNode !== undefined) {
            let node = beforeNode !== undefined ? beforeNode.nextSibling : parent.firstChild, tmp;
            if (afterNode === undefined) {
                afterNode = null;
            }
            while (node !== afterNode) {
                tmp = node.nextSibling;
                removeNode(parent, node);
                node = tmp;
                prevStart++;
            }
        } else {
            parent.textContent = '';
        }
        let node, mode = afterNode ? 1 : 0;
        for (let i = newStart; i <= newEnd; i++) {
            node = createFn(data[i], i, source);
            mode ? parent.insertBefore(node, afterNode) : parent.appendChild(node);
        }
        return;
    }
    const longestSeq = longestPositiveIncreasingSubsequence(P, newStart);
    const nodes = [];
    let tmpC = prevStartNode;
    for (let i = prevStart; i <= prevEnd; i++) {
        nodes[i] = tmpC;
        tmpC = tmpC.nextSibling;
    }
    for (let i = 0; i < toRemove.length; i++) {
        const node = nodes[toRemove[i]];
        removeNode(parent, node);
    }
    let lisIdx = longestSeq.length - 1, tmpD;
    for (let i = newEnd; i >= newStart; i--) {
        if (longestSeq[lisIdx] === i) {
            afterNode = nodes[P[longestSeq[lisIdx]]];
            lisIdx--;
        } else {
            if (P[i] === -1) {
                tmpD = createFn(data[i], i, source);
            } else {
                tmpD = nodes[P[i]];
            }
            parent.insertBefore(tmpD, afterNode);
            afterNode = tmpD;
        }
    }
}

function removeNode(parent, node) {
    parent.removeChild(node);
    dispose(node);
}

function removeNodeRange(parent, firstElement, lastElement) {
    let node = firstElement.nextSibling;
    while (node !== lastElement) {
        removeNode(parent, node);
        node = firstElement.nextSibling;
    }
}

export function each(store, factory, onEmpty) {
    let initialized = false;
    let isEmpty = false;
    let prevItems = [];
    const key = uuid();
    const frag = document.createDocumentFragment();
    const beforeNode = document.createTextNode('');
    const afterNode = document.createTextNode('');
    frag.appendChild(beforeNode);
    frag.appendChild(afterNode);
    const unsubscribe = store.subscribe((value) => {
        const parent = beforeNode.parentNode;
        const nextItems = isIterable(value) ? Array.from(value) : [];
        if (onEmpty && nextItems.length === 0) {
            if (isEmpty) {
                return;
            }
            if (initialized) {
                render(key, () => {
                    removeNodeRange(parent, beforeNode, afterNode);
                    parent.insertBefore(onEmpty(value), afterNode);
                    isEmpty = true;
                    prevItems = [];
                });
            } else {
                parent.insertBefore(onEmpty(value), afterNode);
                isEmpty = true;
                prevItems = [];
            }
        } else {
            if (initialized) {
                render(key, () => {
                    if (isEmpty) {
                        removeNodeRange(parent, beforeNode, afterNode);
                    }
                    reconcile(parent, prevItems, nextItems, value, factory, beforeNode, afterNode);
                    isEmpty = false;
                    prevItems = nextItems;
                });
            } else {
                reconcile(parent, prevItems, nextItems, value, factory, beforeNode, afterNode);
                isEmpty = false;
                prevItems = nextItems;
            }
        }
    });
    cleanup(beforeNode, unsubscribe);
    initialized = true;
    return frag;
}
