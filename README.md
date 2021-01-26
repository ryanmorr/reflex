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

Reflex is a small UI library that combines declarative DOM building with reactive stores to create direct data-node bindings for fast DOM updates with no unnecessary overhead:

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

Create a reactive store that encapsulates a value and notifies subscribers when the value changes:

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

// Subscribe a callback function to be invoked when the value changes
count.subscribe((nextVal, prevVal) => {

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

// Supports event listeners (indicated by a prefix of "on")
const button = html`<button onclick=${(e) => console.log('clicked!')}>Click Me</button>`;

// Supports stateless functional components
const Component = (props, children) => html`<div ...${props}>${children}</div>`;
const cmp = html`<${Component} id="foo">bar<//>`;
```

When a reactive store is interpolated into a DOM element created with `html`, it creates a reactive binding that will automatically update that portion of the DOM, and only that portion, when the internal store value changes. Reflex uses deferred rendering to batch DOM updates together, the `set` and `update` methods of a `val` store return a promise that is resolved when all queued DOM updates have finished rendering:

```javascript
const name = val('John');

// Interpolate a store into an element
const element = html`<div>My name is ${name}</div>`;

// The store value is appended as a text node
element.textContent; //=> "My name is John"

// The store is bound to the text node, changing
// the store value automatically updates the DOM
await name.set('Jim');
element.textContent; //=> "My name is Jim"
```

Similarly to stores, promises can also be interpolated into a DOM element created with `html`, setting the value of the node/attribute when the promise resolves:

```javascript
const promise = new Promise((resolve) => setTimeout(() => resolve('World'), 1000));

const element = html`<div>Hello ${promise}</div>`;

await promise;
element.textContent; //=> "Hello World"
```

### component(callback)

Create a stateful functional component that automatically converts the provided properties into `val` stores unless it already is a store:

```javascript
import { component, html } from '@ryanmorr/reflex';

const Counter = component(({count}) => html`
    <div class="container">
        <p>Count: ${count}</p>
        <button onclick=${() => count.update((val) => val + 1)}>Increment</button>
    </div>
`);

document.body.appendChild(html`<${Counter} count=${0} />`);
```

### bind(store)

Create a two-way binding between a `val` store and a form field, allowing the store to be automatically updated with the current value of the form element when the user changes it, and vice-versa. It supports inputs, checkboxes, radio buttons, selects, and textareas:

```javascript
import { bind, html, val } from '@ryanmorr/reflex';

const value = val('foo');

const element = html`<input value=${bind(value)} />`;
```

### each(store, callback)

Efficiently diffs and renders lists when provided a reactive store that encapsulates an array value:

```javascript
import { each, html, val } from '@ryanmorr/reflex';

const items = val([1, 2, 3, 4, 5]);

const element = html`
    <ul>
        ${each(items, (item) => html`<li>${item}</li>`)}
    </ul>
`;
```

### ref(...elements?)

A special reactive store for element references, `ref` can be used to be notified when an element is added or removed from a collection. Elements are added by assigning the store to the ref attribute of the element when created with `html` or by calling the `add` method of the store. Elements are removed as a result of a `dispose` call or by calling the `remove` method of the store:

```javascript
import { ref, html } from '@ryanmorr/reflex';

// Create a ref store
const foo = ref();

// Create a DOM tree and add all `li` elements to the `foo` store
const element1 = html`
    <ul>
        <li> ref=${foo}</li>
        <li> ref=${foo}</li>
        <li> ref=${foo}</li>
        <li> ref=${foo}</li>
    </ul>
`;

// Get all the elements
const els = foo.get();

// Get the element at index 1
const el = foo.get(1);

// Add elements to the store
foo.add(element);

// Remove elements from the store
foo.remove(element);

// Subscribe a callback function to be invoked when an element is added or removed
foo.subscribe((nextElements, prevElements, element, delta) => {
    // `delta` is 1 if the element was added and -1 if the element was removed
});
```

### dispose(element)

Destroy all node-store bindings for an element and its descendants to prevent future DOM updates. It will also remove the element and its descendants from any `ref` store they might happen to belong to:

```javascript
import { dispose, val, html } from '@ryanmorr/reflex';

// Create an element-store binding
const foo = val('foo');
const element = html`<div>${foo}</div>`;

// Update element
await foo.set('bar');
console.log(element.textContent); //=> "bar"

// Destroy the element-store binding
dispose(element);

// The element is no longer updated
await foo.set('baz');
console.log(element.textContent); //=> "bar"
```

### hook(callback, ...args?)

A basic means for creating custom attributes that initiate specialized behavior for DOM elements created with `html`. Hooks are provided the DOM element, the attribute name, the full attributes object, and any additional arguments provided to the hook function. Hooks always run before normal attributes, providing the opportunity to add, remove, and change other attributes for greater customization:

```javascript
import { hook, html } from '@ryanmorr/reflex';

const foo = (element, name, attributes, ...args) => {
    // Add customized behavior for the element
};

// Define the hook using any attribute name
const element = html`<div foo=${hook(foo)}></div>`;
```

### tick(...callbacks?)

Returns a promise that is resolved when all previously queued DOM updates have been rendered:

```javascript
import { tick } from '@ryanmorr/reflex';

// DOM is up-to-date when the promise resolves
await tick();

// Alternatively, provide one or more callbacks to be executed when the DOM is up-to-date
tick(callback1, callback2);
```

## License

This project is dedicated to the public domain as described by the [Unlicense](http://unlicense.org/).

[project-url]: https://github.com/ryanmorr/reflex
[version-image]: https://img.shields.io/github/package-json/v/ryanmorr/reflex?color=blue&style=flat-square
[build-url]: https://travis-ci.com/github/ryanmorr/reflex
[build-image]: https://img.shields.io/travis/com/ryanmorr/reflex?style=flat-square
[license-image]: https://img.shields.io/github/license/ryanmorr/reflex?color=blue&style=flat-square
[license-url]: UNLICENSE