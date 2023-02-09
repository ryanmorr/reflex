import { html, tick } from '../../src/reflex';

describe('interpolation-promise', () => {
    it('should render a promise as a text node', async () => {
        const promise = Promise.resolve('foo');
        const el = html`<div>${promise}</div>`;

        expect(el.outerHTML).to.equal('<div></div>');

        await promise;
        await tick();
        expect(el.outerHTML).to.equal('<div>foo</div>');
    });

    it('should render a promise as an attribute', async () => {
        const promise = Promise.resolve('foo');
        const el = html`<div class=${promise}></div>`;

        expect(el.outerHTML).to.equal('<div></div>');

        await promise;
        await tick();
        expect(el.outerHTML).to.equal('<div class="foo"></div>');
    });

    it('should render a promise that resolves with a text node', async () => {
        const promise = Promise.resolve(document.createTextNode('foo'));
        const el = html`<div>${promise}</div>`;

        expect(el.outerHTML).to.equal('<div></div>');

        await promise;
        await tick();
        expect(el.outerHTML).to.equal('<div>foo</div>');
    });

    it('should render a promise that resolves with an element', async () => {
        const promise = Promise.resolve(html`<span />`);
        const el = html`<div>${promise}</div>`;

        expect(el.outerHTML).to.equal('<div></div>');

        await promise;
        await tick();
        expect(el.outerHTML).to.equal('<div><span></span></div>');
    });

    it('should render a promise that resolves with a document fragment', async () => {
        const promise = Promise.resolve(html`<p />foo<i />`);
        const el = html`<div>${promise}</div>`;

        expect(el.outerHTML).to.equal('<div></div>');

        await promise;
        await tick();
        expect(el.outerHTML).to.equal('<div><p></p>foo<i></i></div>');
    });

    it('should render child nodes with a promise that resolves with an array', async () => {
        const promise = Promise.resolve([
            html`<em />`,
            'bar',
            null,
            document.createElement('span'),
            50
        ]);

        const el = html`<div>${promise}</div>`;

        expect(el.outerHTML).to.equal('<div></div>');
        
        await promise;
        await tick();
        expect(el.outerHTML).to.equal('<div><em></em>bar<span></span>50</div>');
    });

    it('should set the class attribute with a promise that resolves with an array', async () => {
        const promise = Promise.resolve(['foo', 'bar', 'baz', 'qux']);
        const el = html`<div class=${promise}></div>`;
        
        await promise;
        await tick();
        expect(el.className).to.equal('foo bar baz qux');
    });

    it('should set the class attribute with a promise that resolves with an object', async () => {  
        const promise = Promise.resolve({foo: true, bar: false, baz: true});
        const el = html`<div class=${promise}></div>`;
        
        await promise;
        await tick();
        expect(el.className).to.equal('foo baz');
    });

    it('should set CSS styles with a promise that resolves with a key/value map', async () => {
        const promise = Promise.resolve({width: '60px', height: '60px'});
        const el = html`<div style=${promise}></div>`;

        await promise;
        await tick();
        expect(el.outerHTML).to.equal('<div style="width: 60px; height: 60px;"></div>');
    });

    it('should set CSS styles with a promise that resolves with styles as a string', async () => {
        const promise = Promise.resolve('color: rgb(90, 20, 70); position: relative;');
        const el = html`<div style=${promise}></div>`;

        await promise;
        await tick();
        expect(el.outerHTML).to.equal('<div style="color: rgb(90, 20, 70); position: relative;"></div>');
    });

    it('should set a DOM property with a promise', async () => {
        const promise = Promise.resolve('foo');
        const el = html`<input type="text" value=${promise} />`;

        await promise;
        await tick();
        expect(el.value).to.equal('foo');
    });
    
    it('should set an event listener', (done) => {
        const event = new MouseEvent('click');

        const onClick = (e) => {
            expect(e).to.equal(event);
            document.body.removeChild(el);

            done();
        };

        const promise = Promise.resolve(onClick);
        const el = html`<div onclick=${promise}></div>`;

        promise.then(tick).then(() => {
            document.body.appendChild(el);
            el.dispatchEvent(event);
        });
    });

    it('should render a text node with a promise that resolves with a function', async () => {
        const fn = () => 'baz';
        const promise = Promise.resolve(fn);
        const el = html`<div>${promise}</div>`;

        expect(el.outerHTML).to.equal('<div></div>');

        await promise;
        await tick();
        expect(el.outerHTML).to.equal('<div>baz</div>');
    });

    it('should set an attribute with a promise that resolves with a function', async () => {
        const fn = sinon.spy(() => 'foo');
        const promise = Promise.resolve(fn);
        const el = html`<div id=${promise}></div>`;

        expect(el.id).to.equal('');

        await promise;
        await tick();
        expect(el.id).to.equal('foo');
        expect(fn.callCount).to.equal(1);
        expect(fn.args[0][0]).to.equal(el);
    });

    it('should support multiple interpolations of the same promise', async () => {
        const promise = Promise.resolve('foo');
        const el = html`<div id=${promise}>${promise}</div>`;

        expect(el.outerHTML).to.equal('<div></div>');

        await promise;
        await tick();
        expect(el.outerHTML).to.equal('<div id="foo">foo</div>');
    });

    it('should not render a rejected promise', async () => {
        const promise = Promise.reject();
        const el = html`<div>${promise}</div>`;

        expect(el.outerHTML).to.equal('<div></div>');

        try {
            await promise;
        } catch {
            await tick();
            expect(el.outerHTML).to.equal('<div></div>');
        }
    });

    it('should not render an element if a promise resolves with a value of null or undefined', async () => {
        const nullPromise = Promise.resolve(null);
        const undefinedPromise = Promise.resolve(undefined);

        const el = html`<div>${nullPromise}${undefinedPromise}</div>`;

        await Promise.all([nullPromise, undefinedPromise]);
        await tick();
        expect(el.outerHTML).to.equal('<div></div>');
    });

    it('should not set an attribute if a promise resolves with a value of null, undefined, or false', async () => {
        const nullPromise = Promise.resolve(null);
        const undefinedPromise = Promise.resolve(undefined);
        const falsePromise = Promise.resolve(false);

        const el = html`<div foo=${nullPromise} bar=${undefinedPromise} baz=${falsePromise}></div>`;

        await Promise.all([nullPromise, undefinedPromise, falsePromise]);
        await tick();
        expect(el.outerHTML).to.equal('<div></div>');
    });

    it('should render a text node with a promise that resolves with nested functions', async () => {
        const promise = Promise.resolve(() => () => () => 'foo');
        const el = html`<div>${promise}</div>`;

        expect(el.outerHTML).to.equal('<div></div>');

        await promise;
        await tick();
        expect(el.outerHTML).to.equal('<div>foo</div>');
    });

    it('should set an attribute with a promise that resolves with nested functions', async () => {
        const fn1 = sinon.spy(() => 'bar');
        const fn2 = sinon.spy(fn1);
        const fn3 = sinon.spy(fn2);
        const promise = Promise.resolve(fn3);

        const el = html`<div foo=${promise}></div>`;

        await promise;
        await tick();
        expect(el.outerHTML).to.equal('<div foo="bar"></div>');
        expect(fn1.callCount).to.equal(1);
        expect(fn1.args[0][0]).to.equal(el);
        expect(fn2.callCount).to.equal(1);
        expect(fn2.args[0][0]).to.equal(el);
        expect(fn3.callCount).to.equal(1);
        expect(fn3.args[0][0]).to.equal(el);
    });
});
