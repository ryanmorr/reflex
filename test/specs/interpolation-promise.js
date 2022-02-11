import { html, tick } from '../../src/reflex';

describe('interpolation-promise', () => {
    it('should render a promise as a text node', (done) => {
        const promise = Promise.resolve('foo');
        const el = html`<div>${promise}</div>`;

        expect(el.outerHTML).to.equal('<div></div>');

        promise.then(tick).then(() => {
            expect(el.outerHTML).to.equal('<div>foo</div>');

            done();
        });
    });

    it('should render a promise as an attribute', (done) => {
        const promise = Promise.resolve('foo');
        const el = html`<div class=${promise}></div>`;

        expect(el.outerHTML).to.equal('<div></div>');

        promise.then(tick).then(() => {
            expect(el.outerHTML).to.equal('<div class="foo"></div>');

            done();
        });
    });

    it('should render a promise that resolves with a text node', (done) => {
        const promise = Promise.resolve(document.createTextNode('foo'));
        const el = html`<div>${promise}</div>`;

        expect(el.outerHTML).to.equal('<div></div>');

        promise.then(tick).then(() => {
            expect(el.outerHTML).to.equal('<div>foo</div>');

            done();
        });
    });

    it('should render a promise that resolves with an element', (done) => {
        const promise = Promise.resolve(html`<span />`);
        const el = html`<div>${promise}</div>`;

        expect(el.outerHTML).to.equal('<div></div>');

        promise.then(tick).then(() => {
            expect(el.outerHTML).to.equal('<div><span></span></div>');

            done();
        });
    });

    it('should render a promise that resolves with a document fragment', (done) => {
        const promise = Promise.resolve(html`<p />foo<i />`);
        const el = html`<div>${promise}</div>`;

        expect(el.outerHTML).to.equal('<div></div>');

        promise.then(() => tick().then(() => {
            expect(el.outerHTML).to.equal('<div><p></p>foo<i></i></div>');

            done();
        }));
    });

    it('should render child nodes with a promise that resolves with an array', (done) => {
        const promise = Promise.resolve([
            html`<em />`,
            'bar',
            null,
            document.createElement('span'),
            50
        ]);

        const el = html`<div>${promise}</div>`;

        expect(el.outerHTML).to.equal('<div></div>');
        
        promise.then(tick).then(() => {
            expect(el.outerHTML).to.equal('<div><em></em>bar<span></span>50</div>');

            done();
        });
    });

    it('should set the class attribute with a promise that resolves with an array', (done) => {
        const promise = Promise.resolve(['foo', 'bar', 'baz', 'qux']);
        const el = html`<div class=${promise}></div>`;
        
        promise.then(tick).then(() => {
            expect(el.className).to.equal('foo bar baz qux');

            done();
        });
    });

    it('should set the class attribute with a promise that resolves with an object', (done) => {  
        const promise = Promise.resolve({foo: true, bar: false, baz: true});
        const el = html`<div class=${promise}></div>`;
        
        promise.then(tick).then(() => {
            expect(el.className).to.equal('foo baz');

            done();
        });
    });

    it('should set CSS styles with a promise that resolves with a key/value map', (done) => {
        const promise = Promise.resolve({width: '60px', height: '60px'});
        const el = html`<div style=${promise}></div>`;

        promise.then(tick).then(() => {
            expect(el.outerHTML).to.equal('<div style="width: 60px; height: 60px;"></div>');

            done();
        });
    });

    it('should set CSS styles with a promise that resolves with styles as a string', (done) => {
        const promise = Promise.resolve('color: rgb(90, 20, 70); position: relative;');
        const el = html`<div style=${promise}></div>`;

        promise.then(tick).then(() => {
            expect(el.outerHTML).to.equal('<div style="color: rgb(90, 20, 70); position: relative;"></div>');

            done();
        });
    });

    it('should set a DOM property with a promise', (done) => {
        const promise = Promise.resolve('foo');
        const el = html`<input type="text" value=${promise} />`;

        promise.then(tick).then(() => {
            expect(el.value).to.equal('foo');

            done();
        });
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

    it('should render a text node with a promise that resolves with a function', (done) => {
        const fn = () => 'baz';
        const promise = Promise.resolve(fn);
        const el = html`<div>${promise}</div>`;

        expect(el.outerHTML).to.equal('<div></div>');

        promise.then(tick).then(() => {
            expect(el.outerHTML).to.equal('<div>baz</div>');
            
            done();
        });
    });

    it('should set an attribute with a promise that resolves with a function', (done) => {
        const fn = sinon.spy(() => 'foo');
        const promise = Promise.resolve(fn);
        const el = html`<div id=${promise}></div>`;

        expect(el.id).to.equal('');

        promise.then(tick).then(() => {
            expect(el.id).to.equal('foo');
            expect(fn.callCount).to.equal(1);
            expect(fn.args[0][0]).to.equal(el);

            done();
        });
    });

    it('should support multiple interpolations of the same promise', (done) => {
        const promise = Promise.resolve('foo');
        const el = html`<div id=${promise}>${promise}</div>`;

        expect(el.outerHTML).to.equal('<div></div>');

        promise.then(tick).then(() => {
            expect(el.outerHTML).to.equal('<div id="foo">foo</div>');

            done();
        });
    });

    it('should not render a rejected promise', (done) => {
        const promise = Promise.reject();
        const el = html`<div>${promise}</div>`;

        expect(el.outerHTML).to.equal('<div></div>');

        promise.catch(tick).then(() => {
            expect(el.outerHTML).to.equal('<div></div>');

            done();
        });
    });

    it('should not render an element if a promise resolves with a value of null or undefined', (done) => {
        const nullPromise = Promise.resolve(null);
        const undefinedPromise = Promise.resolve(undefined);

        const el = html`<div>${nullPromise}${undefinedPromise}</div>`;

        Promise.all([nullPromise, undefinedPromise]).then(tick).then(() => {
            expect(el.outerHTML).to.equal('<div></div>');

            done();
        });
    });

    it('should not set an attribute if a promise resolves with a value of null, undefined, or false', (done) => {
        const nullPromise = Promise.resolve(null);
        const undefinedPromise = Promise.resolve(undefined);
        const falsePromise = Promise.resolve(false);

        const el = html`<div foo=${nullPromise} bar=${undefinedPromise} baz=${falsePromise}></div>`;

        Promise.all([nullPromise, undefinedPromise, falsePromise]).then(tick).then(() => {
            expect(el.outerHTML).to.equal('<div></div>');

            done();
        });
    });

    it('should render a text node with a promise that resolves with nested functions', (done) => {
        const promise = Promise.resolve(() => () => () => 'foo');
        const el = html`<div>${promise}</div>`;

        expect(el.outerHTML).to.equal('<div></div>');

        promise.then(tick).then(() => {
            expect(el.outerHTML).to.equal('<div>foo</div>');

            done();
        });
    });

    it('should set an attribute with a promise that resolves with nested functions', (done) => {
        const fn1 = sinon.spy(() => 'bar');
        const fn2 = sinon.spy(fn1);
        const fn3 = sinon.spy(fn2);
        const promise = Promise.resolve(fn3);

        const el = html`<div foo=${promise}></div>`;

        promise.then(tick).then(() => {
            expect(el.outerHTML).to.equal('<div foo="bar"></div>');
            expect(fn1.callCount).to.equal(1);
            expect(fn1.args[0][0]).to.equal(el);
            expect(fn2.callCount).to.equal(1);
            expect(fn2.args[0][0]).to.equal(el);
            expect(fn3.callCount).to.equal(1);
            expect(fn3.args[0][0]).to.equal(el);

            done();
        });
    });
});
