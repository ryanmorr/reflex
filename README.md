# reflex

[![Version Badge][version-image]][project-url]
[![License][license-image]][license-url]
[![Build Status][build-image]][build-url]

> Reactive DOM

## Install

Download the [CJS](https://github.com/ryanmorr/reflex/raw/master/dist/cjs/reflex.js), [ESM](https://github.com/ryanmorr/reflex/raw/master/dist/esm/reflex.js), [UMD](https://github.com/ryanmorr/reflex/raw/master/dist/umd/reflex.js) versions or install via NPM:

```sh
npm install @ryanmorr/reflex
```

## Usage

Reflex is a small, but versatile UI library that combines declarative DOM building with reactive stores that bind data to DOM nodes, automatically keeping the DOM in sync when the data is changed:

```javascript
import { html, store } from '@ryanmorr/reflex';

const count = store(0);

const element = html`
    <div>
        <p>Count: ${count}</p>
        <button onclick=${() => count.update((val) => val + 1)}>Increment</button>
    </div>
`;

document.body.appendChild(element);
```

## API

### `store(value?)`

Create a reactive store that encapsulates a value and can notify subscribers when the value changes:

```javascript
import { store } from '@ryanmorr/reflex';

// Create a store with an initial value
const count = store(0);

// Get the store value
count.value(); //=> 0

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

------

### `derived(...stores, callback)`

Create a reactive store that is based on the value of one or more other stores:

```javascript
import { derived, store } from '@ryanmorr/reflex';

const firstName = store('John');
const lastName = store('Doe');
const fullName = derived(firstName, lastName, (first, last) => `${first} ${last}`);

fullName.value(); //=> "John Doe"

firstName.set('Jane');

fullName.value(); //=> "Jane Doe"

// Subscribe to be notified of changes
const unsubscribe = fullName.subscribe((nextVal, prevVal) => {
    // Do something
});
```

If the callback function defines an extra parameter in its signature, the derived store is treated as asynchronous. The callback function is provided a setter for the store's value and no longer relies on the return value:

```javascript
import { derived, store } from '@ryanmorr/reflex';

const query = store();

// Perform an ajax request when the query changes
// and notify subscribers with the results
const results = derived(query, (string, set) => {
    fetch(`path/to/server/${encodeURIComponent(string)}`).then(set);
});
```

------

### `html(strings, ...values?)`

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

// Supports functions for setting child nodes
const header = html`<header>${(parentElement) => html`<h1>Title</h1>`}</header>`;

// Supports functions for setting attributes (except event listeners)
const footer = html`<footer class=${(element, attributeName) => 'foo'}></footer>`;

// Supports event listeners (indicated by a prefix of "on")
const button = html`<button onclick=${(e) => console.log('clicked!')}>Click Me</button>`;
```

#### Bindings

When a reactive store is interpolated into a DOM element created with `html`, it creates a reactive binding that will automatically update that portion of the DOM, and only that portion, when the internal store value changes:

```javascript
import { html, store } from '@ryanmorr/reflex';

const name = store('John');

// Interpolate a store into an element
const element = html`<div>My name is ${name}</div>`;

// The store value is appended as a text node
element.textContent; //=> "My name is John"

// The store is bound to the text node, changing
// the store value automatically updates the text
// node and only that text node
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

#### Components

Functional components are also supported. Since reflex is not virtual DOM, a component is only executed once, making both stateless and stateful components easy:

```javascript
import { html, store } from '@ryanmorr/reflex';

// A simple component to wrap a common pattern with props and child nodes
const Stateless = ({id, children}) => {
    return html`<section id=${id}>${children}</section>`;
};

// Create the component and return a DOM element
const section = html`<${Stateless} id="foo">bar<//>`;

// A component that holds state
const Stateful = () => {
    const getTime = () => new Date().toLocaleTimeString();
    const time = store(getTime());
    setInterval(() => time.set(getTime()), 1000);
    return html`<div>Time: ${time}</div>`;
};

// Create the stateful component just like a stateless one
const div = html`<${Stateful} />`;
```

If the component function defines an extra parameter as part of its signature, it is provided a function for registering callbacks to be invoked when the component is mounted to the DOM. Optionally, the mount callback can return a cleanup function that is executed when the component is disposed:

```javascript
import { html } from '@ryanmorr/reflex';

const Component = (props, mount) => {

    mount((element) => {
        // Executed when the component is appended to 
        // the DOM and is provided the root element(s)

        return () => {
            // Executed when the component is disposed
        };
    });

    return html`<div></div>`;
};
```

#### Refs

When creating elements with `html`, the `ref` attribute can be used to invoke a function when the element is first created. This is useful for initializing elements and collecting references to deeply nested elements:

```javascript
import { html } from '@ryanmorr/reflex';

const element = html`<div ref=${el => /* initialize element */}></div>`;
```

Additionally, assigning a store as the value of a `ref` attribute will add the element to an internal array within the store. Subscribers of the store will be notified when elements are added and removed:

```javascript
import { html, store, dispose } from '@ryanmorr/reflex';

// Use a store to group multiple element references
const foo = store();
const element = html`
    <ul>
        <li ref=${foo}></li>
        <li ref=${foo}></li>
        <li ref=${foo}></li>
        <li ref=${foo}></li>
    </ul>
`;

// Returns an array of all elements in the store
const elements = foo.value();

// Subscribe to be called when elements are added or removed
foo.subscribe((nextElements, prevElements) => {
    // Do something
});

// Disposing an element will automatically remove it from the store
dispose(element.lastChild);
```

------

### `effect(...stores?, callback)`

Create a side effect that is executed every time the DOM has been updated and return a function to stop future calls:

```javascript
import { effect } from '@ryanmorr/reflex';

const stop = effect(() => {
    // DOM has been updated
});
```

Providing one or more dependencies will create a side effect that is guaranteed to execute after a store value changes and any portion of the DOM that depends on that store has been updated:

```javascript
import { effect, store } from '@ryanmorr/reflex';

const id = store('foo');
const content = store('bar');

const stop = effect(id, content, (idVal, contentVal) => {
    // Invoked anytime `id` or `content` changes and the DOM has been updated
});
```

------

### `bind(store)`

Create a two-way binding between a store and a form field, allowing the store to be automatically updated with the current value of the form element when the user changes it, and vice-versa. It supports inputs, checkboxes, radio buttons, selects, and textareas:

```javascript
import { bind, html, store } from '@ryanmorr/reflex';

const value = store('foo');
const element = html`<input value=${bind(value)} />`;
```

Alternatively, `bind` can be used to support stores as event listeners:

```javascript
import { bind, html, store } from '@ryanmorr/reflex';

const clicked = store();
const button = html`<button onclick=${bind(clicked)}>Click Me</button>`;
clicked.subscribe((event) => console.log('clicked'));
```

------

### `each(store, callback, fallback?)`

Efficiently diffs and renders lists when provided a reactive store that encapsulates an iterable value. Upon reconciliation, the `each` function uses a strict equality operator (`===`) to compare the indexed values of the iterable and determine if an element has been removed or relocated:

```javascript
import { each, html, store } from '@ryanmorr/reflex';

const items = store([1, 2, 3, 4, 5]);

const element = html`
    <ul>
        ${each(items, (item, index, array) => html`<li>${index + 1}: ${item}</li>`)}
    </ul>
`;
```

Provide a fallback function as an optional third argument to render content when the store contains an empty iterable or non-iterable value:

```javascript
import { each, html, store } from '@ryanmorr/reflex';

const items = store([]);

const element = html`
    <section>
        ${each(items, 
            (item) => html`<div>${item}</div>`,
            () => html`<div>No Results</div>`
        )}
    </section>
`;
```

------

### `tick()`

Reflex uses deferred rendering to batch DOM updates. The `tick` function returns a promise that is resolved when all previously queued DOM updates have been rendered:

```javascript
import { tick } from '@ryanmorr/reflex';

// Embed a store in the DOM
const store = store('foo');
const element = html`<div>${store}</div>`;

// Change a store value to trigger a re-render
store.set('bar');

// The DOM is up-to-date when the `tick` promise resolves
await tick();
```

------

### `cleanup(element, callback)`

Register a callback function to be invoked when an element is disposed. An element is disposed implicitly only during an `each` DOM reconciliation or explicitly when the `dispose` function is called on the element or an ancestor element:

```javascript
import { cleanup } from '@ryanmorr/reflex';

cleanup(element, () => console.log('element and child nodes disposed'));
```

------

### `dispose(element)`

Destroy all node-store bindings to prevent future DOM updates and invoke any registered `cleanup` functions for an element and its descendants. It will also remove the element and its descendants from any store it was added to via the `ref` attribute:

```javascript
import { dispose, store, html, tick } from '@ryanmorr/reflex';

// Create an element-store binding
const foo = store('foo');
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
[build-url]: https://github.com/ryanmorr/reflex/actions
[build-image]: https://img.shields.io/github/actions/workflow/status/ryanmorr/reflex/node.js.yml?style=flat-square
[license-image]: https://img.shields.io/github/license/ryanmorr/reflex?color=blue&style=flat-square
[license-url]: UNLICENSE
