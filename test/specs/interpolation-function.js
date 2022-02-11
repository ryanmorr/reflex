import { html, val, tick } from '../../src/reflex';

describe('interpolation-function', () => {
    it('should render a function as a text node', () => {
        const fn = sinon.spy(() => 'foo');
        const el = html`<div>${fn}</div>`;

        expect(el.outerHTML).to.equal('<div>foo</div>');
        expect(fn.callCount).to.equal(1);
    });

    it('should render a function as an attribute', () => {
        const fn = sinon.spy(() => 'foo');
        const el = html`<div class=${fn}></div>`;

        expect(el.outerHTML).to.equal('<div class="foo"></div>');
        expect(fn.callCount).to.equal(1);
    });

    it('should render a function that returns a text node', () => {
        const fn = () => document.createTextNode('foo');
        const el = html`<div>${fn}</div>`;

        expect(el.outerHTML).to.equal('<div>foo</div>');
    });
    
    it('should render a function that returns an element', () => {
        const fn = () => document.createElement('span');
        const el = html`<div>${fn}</div>`;

        expect(el.outerHTML).to.equal('<div><span></span></div>');
    });

    it('should render a function that returns a document fragment', () => {
        const fn = () => html`<i></i><em></em>`;

        const el = html`<div>${fn}</div>`;

        expect(el.outerHTML).to.equal('<div><i></i><em></em></div>');
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
    });
    
    it('should set the class attribute with a function that returns an array', () => {
        const fn = sinon.spy(() => ['foo', 'bar', 'baz', 'qux']);
        const el = html`<div class=${fn}></div>`;
        
        expect(el.className).to.equal('foo bar baz qux');
        expect(fn.callCount).to.equal(1);
        expect(fn.args[0][0]).to.equal(el);
    });

    it('should set the class attribute with a function that returns an object', () => {  
        const fn = sinon.spy(() => ({foo: true, bar: false, baz: true}));
        const el = html`<div class=${fn}></div>`;
        
        expect(el.className).to.equal('foo baz');
        expect(fn.callCount).to.equal(1);
        expect(fn.args[0][0]).to.equal(el);
    });

    it('should set CSS styles with a function that returns a key/value map', () => {
        const fn = sinon.spy(() => ({width: '60px', height: '60px'}));
        const el = html`<div style=${fn}></div>`;

        expect(el.outerHTML).to.equal('<div style="width: 60px; height: 60px;"></div>');
        expect(fn.callCount).to.equal(1);
        expect(fn.args[0][0]).to.equal(el);
    });

    it('should set CSS styles with a function that returns a string', () => {
        const fn = sinon.spy(() => 'color: rgb(90, 20, 70); position: relative;');
        const el = html`<div style=${fn}></div>`;

        expect(el.outerHTML).to.equal('<div style="color: rgb(90, 20, 70); position: relative;"></div>');
        expect(fn.callCount).to.equal(1);
        expect(fn.args[0][0]).to.equal(el);
    });

    it('should set a DOM property with a function', () => {
        const fn = sinon.spy(() => 'foo');
        const el = html`<input type="text" value=${fn} />`;

        expect(el.value).to.equal('foo');
        expect(fn.callCount).to.equal(1);
        expect(fn.args[0][0]).to.equal(el);
    });

    it('should render a text node for a function that returns a promise', (done) => {
        const promise = Promise.resolve('qux');
        const fn = () => promise;
        const el = html`<div>${fn}</div>`;

        expect(el.outerHTML).to.equal('<div></div>');

        promise.then(tick).then(() => {
            expect(el.outerHTML).to.equal('<div>qux</div>');
            
            done();
        });
    });

    it('should render an attribute for a function that returns a promise', (done) => {
        const promise = Promise.resolve('bar');
        const fn = sinon.spy(() => promise);
        const el = html`<div id=${fn}></div>`;

        expect(el.id).to.equal('');

        promise.then(tick).then(() => {
            expect(el.id).to.equal('bar');
            expect(fn.callCount).to.equal(1);
            expect(fn.args[0][0]).to.equal(el);

            done();
        });
    });

    it('should update an element with a function that returns a store', (done) => {
        const child = val('foo');
        const fn = () => child;
        const el = html`<div>${fn}</div>`;

        expect(el.outerHTML).to.equal('<div>foo</div>');

        child.set('bar').then(() => {
            expect(el.outerHTML).to.equal('<div>bar</div>');
            
            child.set('baz').then(() => {
                expect(el.outerHTML).to.equal('<div>baz</div>');

                done();
            });
        });
    });

    it('should update an attribute with a function that returns a store', (done) => {
        const child = val('foo');
        const fn = () => child;
        const el = html`<div class=${fn}></div>`;

        expect(el.outerHTML).to.equal('<div class="foo"></div>');

        child.set('bar').then(() => {
            expect(el.outerHTML).to.equal('<div class="bar"></div>');
            
            child.set('baz').then(() => {
                expect(el.outerHTML).to.equal('<div class="baz"></div>');

                done();
            });
        });
    });

    it('should not render a node for a function that returns null or undefined', () => {
        const el = html`<div>${() => null}${() => undefined}</div>`;

        expect(el.outerHTML).to.equal('<div></div>');
    });

    it('should not render an attribute for a function that returns null, undefined, or false', () => {
        const el = html`<div foo=${() => null} bar=${() => undefined} baz=${() => false}></div>`;

        expect(el.outerHTML).to.equal('<div></div>');
    });

    it('should not render a text node for a function that returns a promise that resolves with null or undefined', (done) => {
        const nullPromise = Promise.resolve(null);
        const undefinedPromise = Promise.resolve(undefined);

        const el = html`<div>${() => nullPromise}${() => undefinedPromise}</div>`;

        Promise.all([nullPromise, undefinedPromise]).then(tick).then(() => {
            expect(el.outerHTML).to.equal('<div></div>');

            done();
        });
    });

    it('should not render an attribute for a function that returns a promise that resolves with null, undefined, or false', (done) => {
        const nullPromise = Promise.resolve(null);
        const undefinedPromise = Promise.resolve(undefined);
        const falsePromise = Promise.resolve(false);

        const el = html`<div foo=${() => nullPromise} bar=${() => undefinedPromise} baz=${() => falsePromise}></div>`;

        Promise.all([nullPromise, undefinedPromise, falsePromise]).then(tick).then(() => {
            expect(el.outerHTML).to.equal('<div></div>');

            done();
        });
    });

    it('should render nested functions as a text node', () => {
        const fn = () => () => () => 'foo';
        const el = html`<div>${fn}</div>`;

        expect(el.outerHTML).to.equal('<div>foo</div>');
    });

    it('should render nested functions as an attribute', () => {
        const fn1 = sinon.spy(() => 'bar');
        const fn2 = sinon.spy(fn1);
        const fn3 = sinon.spy(fn2);

        const el = html`<div foo=${fn3}></div>`;

        expect(el.outerHTML).to.equal('<div foo="bar"></div>');
        expect(fn1.callCount).to.equal(1);
        expect(fn1.args[0][0]).to.equal(el);
        expect(fn2.callCount).to.equal(1);
        expect(fn2.args[0][0]).to.equal(el);
        expect(fn3.callCount).to.equal(1);
        expect(fn3.args[0][0]).to.equal(el);
    });
});
