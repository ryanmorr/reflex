import { html, val, effect } from '../../src/reflex';

describe('effect', () => {
    function createPromise(value, time) {
        return new Promise((resolve) => setTimeout(() => resolve(value), time));
    }

    it('should run effects after a store is changed and the DOM is updated', (done) => {
        const store = val();

        const spy = sinon.spy((value) => {
            expect(value).to.equal('foo');
            expect(el.outerHTML).to.equal('<div>foo</div>');
            done();
        });

        effect(store, spy);

        const el = html`<div>${store}</div>`;

        expect(spy.callCount).to.equal(0);
        expect(el.outerHTML).to.equal('<div></div>');

        store.set('foo');
    });

    it('should run effects after multiple stores are changed and the DOM is updated', (done) => {
         const foo = val('a');
        const bar = val('b');
        const baz = val('c');

        const spy = sinon.spy((fooVal, barVal, bazVal) => {
            if (spy.callCount === 1) {
                expect(fooVal).to.equal('x');
                expect(barVal).to.equal('b');
                expect(bazVal).to.equal('c');
                expect(el.outerHTML).to.equal('<div id="x">b c</div>');
                bar.set('y');
            } else if (spy.callCount === 2) {
                expect(fooVal).to.equal('x');
                expect(barVal).to.equal('y');
                expect(bazVal).to.equal('c');
                expect(el.outerHTML).to.equal('<div id="x">y c</div>');
                baz.set('z');
            } else if (spy.callCount === 3) {
                expect(fooVal).to.equal('x');
                expect(barVal).to.equal('y');
                expect(bazVal).to.equal('z');
                expect(el.outerHTML).to.equal('<div id="x">y z</div>');
                done();
            }
        });

        effect(foo, bar, baz, spy);

        const el = html`<div id=${foo}>${bar} ${baz}</div>`;

        expect(spy.callCount).to.equal(0);
        expect(el.outerHTML).to.equal('<div id="a">b c</div>');

        foo.set('x');
    });

    it('should not call an effect more than once per cycle', (done) => {
        const store = val('foo');

        const spy = sinon.spy((value) => {
            expect(spy.callCount).to.equal(1);
            expect(value).to.equal('qux');
            expect(el.outerHTML).to.equal('<div>qux</div>');
            done();
        });

        effect(store, spy);

        const el = html`<div>${store}</div>`;

        expect(spy.callCount).to.equal(0);
        expect(el.outerHTML).to.equal('<div>foo</div>');

        store.set('bar');
        store.set('baz');
        store.set('qux');
    });

    it('should support effects defined after a store-html interpolation', (done) => {
        const store = val('foo');

        const el = html`<div>${store}</div>`;

        const spy = sinon.spy((value) => {
            expect(value).to.equal('bar');
            expect(el.outerHTML).to.equal('<div>bar</div>');
            done();
        });

        effect(store, spy);

        expect(spy.callCount).to.equal(0);
        expect(el.outerHTML).to.equal('<div>foo</div>');

        store.set('bar');
    });

    it('should run effects after a store\'s promise is resolved', (done) => {
        const foo = val();

        const spy = sinon.spy((value) => {
            expect(value).to.equal('foo');
            expect(el.outerHTML).to.equal('<div>foo</div>');

            done();
        });
    
        effect(foo, spy);
    
        const el = html`<div>${foo}</div>`;
    
        expect(spy.callCount).to.equal(0);
        expect(el.outerHTML).to.equal('<div></div>');
    
        foo.set(createPromise('foo', 10));
    });

    it('should run effects after multiple store\'s promises have been resolved', (done) => {
        const foo = val('foo');
        const bar = val('bar');

        const spy = sinon.spy((fooVal, barVal) => {
            if (spy.callCount === 1) {
                expect(fooVal).to.equal('baz');
                expect(barVal).to.equal('bar');
                expect(el.outerHTML).to.equal('<div>baz bar</div>');
            } else if (spy.callCount === 2) {
                expect(fooVal).to.equal('baz');
                expect(barVal).to.equal('qux');
                expect(el.outerHTML).to.equal('<div>baz qux</div>');
                done();
            }
        });
    
        effect(foo, bar, spy);
    
        const el = html`<div>${foo} ${bar}</div>`;
    
        expect(spy.callCount).to.equal(0);
        expect(el.outerHTML).to.equal('<div>foo bar</div>');
        
        foo.set(createPromise('baz', 10));
        bar.set(createPromise('qux', 20));
    });

    it('should not run effects if a store\'s promise is rejected', (done) => {
        const foo = val();
        const spy = sinon.spy();
    
        effect(foo, spy);
    
        const el = html`<div>${foo}</div>`;
        
        const promise = Promise.reject();
        foo.set(promise);

        promise.catch(() => requestAnimationFrame(() => {
            expect(spy.callCount).to.equal(0);
            expect(el.outerHTML).to.equal('<div></div>');

            done();
        }));
    });
});
