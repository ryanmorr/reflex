import { html, val, effect } from '../../src/reflex';

describe('effect', () => {
    it('should run effects after a store is changed and the DOM is updated', (done) => {
        const store = val('foo');
        const spy = sinon.spy();

        effect(store, spy);

        expect(spy.callCount).to.equal(0);

        const el = html`<div>${store}</div>`;

        expect(spy.callCount).to.equal(0);
        expect(el.outerHTML).to.equal('<div>foo</div>');

        store.set('bar');

        requestAnimationFrame(() => {
            expect(spy.callCount).to.equal(1);
            expect(spy.args[0][0]).to.equal('bar');
            expect(el.outerHTML).to.equal('<div>bar</div>');
            done();
        });
    });

    it('should run effects after multiple stores are changed and the DOM is updated', (done) => {
        const foo = val('a');
        const bar = val('b');
        const baz = val('c');
        const spy = sinon.spy();

        effect(foo, bar, baz, spy);

        expect(spy.callCount).to.equal(0);

        const el = html`<div id=${foo}>${bar} ${baz}</div>`;

        expect(spy.callCount).to.equal(0);
        expect(el.outerHTML).to.equal('<div id="a">b c</div>');

        foo.set('x');

        requestAnimationFrame(() => {
            expect(spy.callCount).to.equal(1);
            expect(spy.args[0][0]).to.equal('x');
            expect(spy.args[0][1]).to.equal('b');
            expect(spy.args[0][2]).to.equal('c');
            expect(el.outerHTML).to.equal('<div id="x">b c</div>');

            bar.set('y');

            requestAnimationFrame(() => {
                expect(spy.callCount).to.equal(2);
                expect(spy.args[1][0]).to.equal('x');
                expect(spy.args[1][1]).to.equal('y');
                expect(spy.args[1][2]).to.equal('c');
                expect(el.outerHTML).to.equal('<div id="x">y c</div>');

                baz.set('z');

                requestAnimationFrame(() => {
                    expect(spy.callCount).to.equal(3);
                    expect(spy.args[2][0]).to.equal('x');
                    expect(spy.args[2][1]).to.equal('y');
                    expect(spy.args[2][2]).to.equal('z');
                    expect(el.outerHTML).to.equal('<div id="x">y z</div>');

                    done();
                });
            });
        });
    });

    it('should not call an effect more than once per cycle', (done) => {
        const spy = sinon.spy();
        const store = val('foo');

        effect(store, spy);

        const el = html`<div>${store}</div>`;

        expect(el.outerHTML).to.equal('<div>foo</div>');

        store.set('bar');
        store.set('baz');
        store.set('qux');

        requestAnimationFrame(() => {
            expect(spy.callCount).to.equal(1);
            expect(spy.args[0][0]).to.equal('qux');
            expect(el.outerHTML).to.equal('<div>qux</div>');
            done();
        });
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
});
