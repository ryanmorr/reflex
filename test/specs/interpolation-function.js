import { html, store, tick } from '../../src/reflex';

describe('interpolation-function', () => {
    it('should render a function as a text node', () => {
        const fn = sinon.spy(() => 'foo');
        const el = html`<div>${fn}</div>`;

        expect(el.outerHTML).to.equal('<div>foo</div>');
        expect(fn.callCount).to.equal(1);
        expect(fn.args[0][0]).to.equal(el);
    });

    it('should render a function as an attribute', () => {
        const fn = sinon.spy(() => 'foo');
        const el = html`<div class=${fn}></div>`;

        expect(el.outerHTML).to.equal('<div class="foo"></div>');
        expect(fn.callCount).to.equal(1);
        expect(fn.args[0][0]).to.equal(el);
        expect(fn.args[0][1]).to.equal('class');
    });

    it('should render a function that returns a text node', () => {
        const fn = sinon.spy(() => document.createTextNode('foo'));
        const el = html`<div>${fn}</div>`;

        expect(el.outerHTML).to.equal('<div>foo</div>');
        expect(fn.callCount).to.equal(1);
        expect(fn.args[0][0]).to.equal(el);
    });
    
    it('should render a function that returns an element', () => {
        const fn = sinon.spy(() => document.createElement('span'));
        const el = html`<div>${fn}</div>`;

        expect(el.outerHTML).to.equal('<div><span></span></div>');
        expect(fn.callCount).to.equal(1);
        expect(fn.args[0][0]).to.equal(el);
    });

    it('should render a function that returns a document fragment', () => {
        const fn = sinon.spy(() => html`<i></i><em></em>`);

        const el = html`<div>${fn}</div>`;

        expect(el.outerHTML).to.equal('<div><i></i><em></em></div>');
        expect(fn.callCount).to.equal(1);
        expect(fn.args[0][0]).to.equal(el);
    });

    it('should render child nodes with a function that returns an array', () => {
        const fn = sinon.spy(() => [
            html`<em />`,
            'bar',
            null,
            document.createElement('span'),
            50
        ]);

        const el = html`<div>${fn}</div>`;
        expect(el.outerHTML).to.equal('<div><em></em>bar<span></span>50</div>');
        expect(fn.callCount).to.equal(1);
        expect(fn.args[0][0]).to.equal(el);
    });
    
    it('should set the class attribute with a function that returns an array', () => {
        const fn = sinon.spy(() => ['foo', 'bar', 'baz', 'qux']);
        const el = html`<div class=${fn}></div>`;
        
        expect(el.className).to.equal('foo bar baz qux');
        expect(fn.callCount).to.equal(1);
        expect(fn.args[0][0]).to.equal(el);
        expect(fn.args[0][1]).to.equal('class');
    });

    it('should set the class attribute with a function that returns an object', () => {  
        const fn = sinon.spy(() => ({foo: true, bar: false, baz: true}));
        const el = html`<div class=${fn}></div>`;
        
        expect(el.className).to.equal('foo baz');
        expect(fn.callCount).to.equal(1);
        expect(fn.args[0][0]).to.equal(el);
        expect(fn.args[0][1]).to.equal('class');
    });

    it('should set CSS styles with a function that returns a key/value map', () => {
        const fn = sinon.spy(() => ({width: '60px', height: '60px'}));
        const el = html`<div style=${fn}></div>`;

        expect(el.outerHTML).to.equal('<div style="width: 60px; height: 60px;"></div>');
        expect(fn.callCount).to.equal(1);
        expect(fn.args[0][0]).to.equal(el);
        expect(fn.args[0][1]).to.equal('style');
    });

    it('should set CSS styles with a function that returns a string', () => {
        const fn = sinon.spy(() => 'color: rgb(90, 20, 70); position: relative;');
        const el = html`<div style=${fn}></div>`;

        expect(el.outerHTML).to.equal('<div style="color: rgb(90, 20, 70); position: relative;"></div>');
        expect(fn.callCount).to.equal(1);
        expect(fn.args[0][0]).to.equal(el);
        expect(fn.args[0][1]).to.equal('style');
    });

    it('should set a DOM property with a function', () => {
        const fn = sinon.spy(() => 'foo');
        const el = html`<input type="text" value=${fn} />`;

        expect(el.value).to.equal('foo');
        expect(fn.callCount).to.equal(1);
        expect(fn.args[0][0]).to.equal(el);
        expect(fn.args[0][1]).to.equal('value');
    });

    it('should render a text node for a function that returns a promise', async () => {
        const promise = Promise.resolve('qux');
        const fn = () => promise;
        const el = html`<div>${fn}</div>`;

        expect(el.outerHTML).to.equal('<div></div>');

        await promise;
        await tick();
        expect(el.outerHTML).to.equal('<div>qux</div>');
    });

    it('should render an attribute for a function that returns a promise', async () => {
        const promise = Promise.resolve('bar');
        const fn = sinon.spy(() => promise);
        const el = html`<div id=${fn}></div>`;

        expect(el.id).to.equal('');

        await promise;
        await tick();
        expect(el.id).to.equal('bar');
        expect(fn.callCount).to.equal(1);
        expect(fn.args[0][0]).to.equal(el);
        expect(fn.args[0][1]).to.equal('id');
    });

    it('should update an element with a function that returns a store', async () => {
        const child = store('foo');
        const fn = () => child;
        const el = html`<div>${fn}</div>`;

        expect(el.outerHTML).to.equal('<div>foo</div>');

        child.set('bar');
        
        await tick();
        expect(el.outerHTML).to.equal('<div>bar</div>');
            
        child.set('baz');
        
        await tick();
        expect(el.outerHTML).to.equal('<div>baz</div>');
    });

    it('should update an attribute with a function that returns a store', async () => {
        const child = store('foo');
        const fn = () => child;
        const el = html`<div class=${fn}></div>`;

        expect(el.outerHTML).to.equal('<div class="foo"></div>');

        child.set('bar');
        
        await tick();
        expect(el.outerHTML).to.equal('<div class="bar"></div>');
            
        child.set('baz');
        
        await tick();
        expect(el.outerHTML).to.equal('<div class="baz"></div>');
    });

    it('should not render a node for a function that returns null or undefined', () => {
        const el = html`<div>${() => null}${() => undefined}</div>`;

        expect(el.outerHTML).to.equal('<div></div>');
    });

    it('should not render an attribute for a function that returns null, undefined, or false', () => {
        const el = html`<div foo=${() => null} bar=${() => undefined} baz=${() => false}></div>`;

        expect(el.outerHTML).to.equal('<div></div>');
    });

    it('should not render a text node for a function that returns a promise that resolves with null or undefined', async () => {
        const nullPromise = Promise.resolve(null);
        const undefinedPromise = Promise.resolve(undefined);

        const el = html`<div>${() => nullPromise}${() => undefinedPromise}</div>`;

        await Promise.all([nullPromise, undefinedPromise]);
        await tick();
        expect(el.outerHTML).to.equal('<div></div>');
    });

    it('should not render an attribute for a function that returns a promise that resolves with null, undefined, or false', async () => {
        const nullPromise = Promise.resolve(null);
        const undefinedPromise = Promise.resolve(undefined);
        const falsePromise = Promise.resolve(false);

        const el = html`<div foo=${() => nullPromise} bar=${() => undefinedPromise} baz=${() => falsePromise}></div>`;

        await Promise.all([nullPromise, undefinedPromise, falsePromise]);
        await tick();
        expect(el.outerHTML).to.equal('<div></div>');
    });

    it('should render nested functions as a text node', () => {
        const spy = sinon.spy(() => 'foo');
        const fn = () => () => spy;
        const el = html`<div>${fn}</div>`;

        expect(el.outerHTML).to.equal('<div>foo</div>');
        expect(spy.callCount).to.equal(1);
        expect(spy.args[0][0]).to.equal(el);
    });

    it('should render nested functions as an attribute', () => {
        const spy = sinon.spy(() => 'bar');
        const fn = () => () => spy;

        const el = html`<div foo=${fn}></div>`;

        expect(el.outerHTML).to.equal('<div foo="bar"></div>');
        expect(spy.callCount).to.equal(1);
        expect(spy.args[0][0]).to.equal(el);
        expect(spy.args[0][1]).to.equal('foo');
    });

    it('should support multiple interpolations of the same function', () => {
        const fn = sinon.spy(() => 'foo');
        const el = html`<div id=${fn}>${fn}</div>`;

        expect(el.outerHTML).to.equal('<div id="foo">foo</div>');
        expect(fn.callCount).to.equal(2);
    });

    it('should render a function as a text node in a nested array', () => {
        const fn = sinon.spy(() => 'foo');

        const children = [
            html`<span />`,
            [
                html`<em />`,
                [
                    fn,
                ]
            ],
            html`<section />`,
        ];

        const el = html`<div>${children}</div>`;

        expect(el.outerHTML).to.equal('<div><span></span><em></em>foo<section></section></div>');
        expect(fn.callCount).to.equal(1);
        expect(fn.args[0][0]).to.equal(el);
    });
});
