# reflex

[![Version Badge][version-image]][project-url]
[![License][license-image]][license-url]
[![Build Status][build-image]][build-url]

> Reactive DOM

## Install

Download the [CJS](https://github.com/ryanmorr/reflex/raw/master/dist/reflex.cjs.js), [ESM](https://github.com/ryanmorr/reflex/raw/master/dist/reflex.esm.js), [UMD](https://github.com/ryanmorr/reflex/raw/master/dist/reflex.umd.js) versions or install via NPM:

```sh
npm install @ryanmorr/reflex
```

## Usage

Reflex is a small, but versatile UI library that combines declarative DOM building with reactive stores to create direct data-to-node bindings for fast DOM updates with no unnecessary overhead:

```javascript
import { html, val } from '@ryanmorr/reflex';

const count = val(0);

const element = html`
    <div>
        <p>Count: ${count}</p>
        <button onclick=${() => count.update((val) => val + 1)}>Increment</button>
    </div>
`;

document.body.appendChild(element);
```

## API

### val(value?)

Create a reactive store that encapsulates a value and can notify subscribers when the value changes:

```javascript
import { val } from '@ryanmorr/reflex';

// Create a store with an initial value
const count = val(0);

// Get the store value
count.get(); //=> 0

// Set the store value
count.set(1);

// Set the store value with a callback function
count.update((val) => val + 1);

// Subscribe a callback function to be invoked when the value changes,
// it returns a function to unsubscribe from future updates
const unsubscribe = count.subscribe((nextVal, prevVal) => {
    // Do something
});
```

### derived(...stores, callback)

Create a reactive store that is based on the value of one or more other stores:

```javascript
import { derived, val } from '@ryanmorr/reflex';

const firstName = val('John');
const lastName = val('Doe');
const fullName = derived(firstName, lastName, (first, last) => `${first} ${last}`);

fullName.get(); //=> "John Doe"

firstName.set('Jane');

fullName.get(); //=> "Jane Doe"

// Subscribe to be notified of changes
const unsubscribe = fullName.subscribe((nextVal, prevVal) => {
    // Do something
});
```

### html(strings, ...values?)

Create DOM nodes declaratively via tagged template literals:

```javascript
import { html } from '@ryanmorr/reflex';

// Create an element
const el = html`<div></div>`;

// Create a text node
const text = html`Hello World`;

// Create an SVG element
const rect = html`<rect x="10" y="10" width="100" height="100" />`;

// Create a document fragment for multiple root nodes
const frag = html`<div></div><span></span>`;

// Supports attributes
const div = html`<div id="foo" class=${'bar'} />`;

// Supports spread attributes
const section = html`<section ...${{id: 'foo', class: 'bar'}} />`;

// Supports styles as an object
const header = html`<header style=${{width: '100px', height: '100px'}} />`;

// Supports styles as a string
const em = html`<em style=${'color: red; text-decoration: underline red;'} />`;

// Supports functions for setting text or attributes (except event listeners)
const footer = html`<footer class=${() => 'foo'}>${() => 'bar'}</footer>`;

// Supports event listeners (indicated by a prefix of "on")
const button = html`<button onclick=${(e) => console.log('clicked!')}>Click Me</button>`;

// Supports stateless functional components
const Component = (props, children) => html`<div ...${props}>${children}</div>`;
const cmp = html`<${Component} id="foo">bar<//>`;
```

#### Bindings

When a reactive store is interpolated into a DOM element created with `html`, it creates a reactive binding that will automatically update that portion of the DOM, and only that portion, when the internal store value changes:

```javascript
import { html, val } from '@ryanmorr/reflex';

const name = val('John');

// Interpolate a store into an element
const element = html`<div>My name is ${name}</div>`;

// The store value is appended as a text node
element.textContent; //=> "My name is John"

// The store is bound to the text node, changing
// the store value automatically updates the DOM
name.set('Jim');

// After rendering is completed
element.textContent; //=> "My name is Jim"
```

Similarly to stores, promises can also be interpolated into a DOM element created with `html`, setting the value of the node/attribute when the promise resolves:

```javascript
import { html } from '@ryanmorr/reflex';

const promise = Promise.resolve('World');

// Interpolate a promise like anything else
const element = html`<div>Hello ${promise}</div>`;

// After the promise resolves and rendering is completed
element.textContent; //=> "Hello World"
```

#### Refs

When creating elements with `html`, the `ref` attribute can be used to invoke a function when the element is first created. This is useful for initializing elements and collecting references to deeply nested elements:

```javascript
import { html, val, dispose } from '@ryanmorr/reflex';

const element = html`<div ref=${el => /* initialize element */}></div>`;
```

Additionally, assigning a `val` store as the value of a `ref` attribute will add the element to an internal array within the store. Subscribers of the store will be notified when elements are added and removed:

```javascript
import { html, val, dispose } from '@ryanmorr/reflex';

// Use a store to group multiple element references
const foo = val();
const element = html`
    <ul>
        <li ref=${foo}></li>
        <li ref=${foo}></li>
        <li ref=${foo}></li>
        <li ref=${foo}></li>
    </ul>
`;

// Returns an array of all elements in the store
const elements = foo.get();

// Subscribe to be called when elements are added or removed
foo.subscribe((nextElements, prevElements) => {
    // Do something
});

// Disposing an element will automatically remove it from the store
dispose(element.lastChild);
```

### effect(...stores, callback)

Create a side effect that is guaranteed to execute after a store value changes and any portion of the DOM that depends on that store has been updated:

```javascript
import { effect, html, val } from '@ryanmorr/reflex';

const id = val('foo');
const content = val('bar');

effect(id, content, (idVal, contentVal) => {
    // Invoked anytime `id` or `content` changes and the DOM has been updated
});
```

### bind(store)

Create a two-way binding between a `val` store and a form field, allowing the store to be automatically updated with the current value of the form element when the user changes it, and vice-versa. It supports inputs, checkboxes, radio buttons, selects, and textareas:

```javascript
import { bind, html, val } from '@ryanmorr/reflex';

const value = val('foo');
const element = html`<input value=${bind(value)} />`;
```

Alternatively, `bind` can be used to support stores as event listeners:

```javascript
import { bind, html, val } from '@ryanmorr/reflex';

const clicked = val();
const button = html`<button onclick=${bind(clicked)}>Click Me</button>`;
clicked.subscribe((event) => console.log('clicked'));
```

### each(store, callback, fallback?)

Efficiently diffs and renders lists when provided a reactive store that encapsulates an iterable value. Upon reconciliation, the `each` function uses a strict equality operator (`===`) to compare the indexed values of the iterable and determine if an element has been removed or relocated:

```javascript
import { each, html, val } from '@ryanmorr/reflex';

const items = val([1, 2, 3, 4, 5]);

const element = html`
    <ul>
        ${each(items, (item, index, array) => html`<li>${index + 1}: ${item}</li>`)}
    </ul>
`;
```

Provide a fallback function as an optional third argument to render content when the store contains an empty iterable or non-iterable value:

```javascript
import { each, html, val } from '@ryanmorr/reflex';

const items = val([]);

const element = html`
    <section>
        ${each(items, 
            (item) => html`<div>${item}</div>`,
            () => html`<div>No Results</div>`
        )}
    </section>
`;
```

### when(value, config)

For greater control of promises, `when` provides support for rendering the pending, fulfilled, and rejected states of a promise:

```javascript
import { when, html } from '@ryanmorr/reflex';

const element = html`
    <div>
        ${when(fetch('/path/to/resource'), {
            pending: (promiseInstance) => html`<div>loading...</div>`,
            fulfilled: (value, promiseInstance) => html`<div>${value}</div>`,
            rejected: (error, promiseInstance) => html`<div>${error}</div>`
        })}
    </div>
`;
```

Stores that contain promises are also supported, including an additional `idle` state for when the store contains anything other than a promise:

```javascript
import { when, html, val } from '@ryanmorr/reflex';

// Create a store with a default value
const foo = val('No Results');

// Renders the `idle` state with the default message
// because the store does not contain a promise
const element = html`
    <div>
        ${when(foo, {
            idle: (msg) => html`<div>${msg}</div>`,
            pending: (promiseInstance) => html`<div>Loading...</div>`,
            fulfilled: (value, promiseInstance) => html`<div>${value}</div>`,
            rejected: (error, promiseInstance) => html`<div>${error}</div>`
        })}
    </div>
`;

// Add the promise to the store to begin rendering
// the different states of the promise
foo.set(fetch('/path/to/resource'));
```

### tick()

Reflex uses deferred rendering to batch DOM updates. The `tick` function returns a promise that is resolved when all previously queued DOM updates have been rendered:

```javascript
import { tick } from '@ryanmorr/reflex';

// Embed a store in the DOM
const store = val('foo');
const element = html`<div>${store}</div>`;

// Change a store value to trigger a re-render
store.set('bar');

// The DOM is up-to-date when the promise resolves
await tick();
```

### cleanup(element, callback)

Register a callback function to be invoked when an element is disposed. An element is disposed implicitly when it is removed due to a DOM reconciliation internal to reflex or explicitly when the `dispose` function is called on the element or an ancestor element.

```javascript
import { cleanup } from '@ryanmorr/reflex';

cleanup(element, () => console.log('element disposed'));
```

### dispose(element)

Destroy all node-store bindings to prevent future DOM updates and invoke any registered `cleanup` functions for an element and its descendants. It will also remove the element and its descendants from any store it was added to via the `ref` attribute:

```javascript
import { dispose, val, html, tick } from '@ryanmorr/reflex';

// Create an element-store binding
const foo = val('foo');
const element = html`<div>${foo}</div>`;

// Update element
foo.set('bar');
await tick();
console.log(element.textContent); //=> "bar"

// Destroy the element-store binding
dispose(element);

// The element is no longer updated
foo.set('baz');
await tick();
console.log(element.textContent); //=> "bar"
```

## CSS

For a CSS-in-JS solution, refer to [fusion](https://github.com/ryanmorr/fusion), a similar library that brings reactivity to CSS variables, media queries, keyframes, and element queries among other helpers. It is also 100% compatible with reflex.

## License

This project is dedicated to the public domain as described by the [Unlicense](http://unlicense.org/).

[project-url]: https://github.com/ryanmorr/reflex
[version-image]: https://img.shields.io/github/package-json/v/ryanmorr/reflex?color=blue&style=flat-square
[build-url]: https://travis-ci.com/github/ryanmorr/reflex
[build-image]: https://img.shields.io/travis/com/ryanmorr/reflex?style=flat-square
[license-image]: https://img.shields.io/github/license/ryanmorr/reflex?color=blue&style=flat-square
[license-url]: UNLICENSE