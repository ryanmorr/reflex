import { html, store, effect, tick } from '../../src/reflex';

describe('effect', () => {
    it('should execute a side effect after a store dependency has changed and the DOM is updated', async () => {
        const foo = store();
        const spy = sinon.spy();
        effect(foo, spy);

        const el = html`<div>${foo}</div>`;

        expect(spy.callCount).to.equal(0);
        expect(el.outerHTML).to.equal('<div></div>');

        foo.set('foo');

        await tick();

        expect(spy.callCount).to.equal(1);
        expect(spy.args[0][0]).to.equal('foo');
        expect(el.outerHTML).to.equal('<div>foo</div>');
    });

    it('should execute a side effect after multiple store dependencies have changed and the DOM is updated', async () => {
        const foo = store('a');
        const bar = store('b');
        const baz = store('c');
        const spy = sinon.spy();
        effect(foo, bar, baz, spy);

        const el = html`<div id=${foo}>${bar} ${baz}</div>`;

        expect(spy.callCount).to.equal(0);
        expect(el.outerHTML).to.equal('<div id="a">b c</div>');

        foo.set('x');

        await tick();

        expect(spy.callCount).to.equal(1);
        expect(spy.args[0][0]).to.equal('x');
        expect(spy.args[0][1]).to.equal('b');
        expect(spy.args[0][2]).to.equal('c');
        expect(el.outerHTML).to.equal('<div id="x">b c</div>');

        bar.set('y');

        await tick();

        expect(spy.callCount).to.equal(2);
        expect(spy.args[1][0]).to.equal('x');
        expect(spy.args[1][1]).to.equal('y');
        expect(spy.args[1][2]).to.equal('c');
        expect(el.outerHTML).to.equal('<div id="x">y c</div>');

        baz.set('z');

        await tick();

        expect(spy.callCount).to.equal(3);
        expect(spy.args[2][0]).to.equal('x');
        expect(spy.args[2][1]).to.equal('y');
        expect(spy.args[2][2]).to.equal('z');
        expect(el.outerHTML).to.equal('<div id="x">y z</div>');
    });

    it('should not execute a side effect more than once per cycle', async () => {
        const foo = store('foo');
        const spy = sinon.spy();
        effect(foo, spy);

        const el = html`<div>${foo}</div>`;

        expect(spy.callCount).to.equal(0);
        expect(el.outerHTML).to.equal('<div>foo</div>');

        foo.set('bar');
        foo.set('baz');
        foo.set('qux');

        await tick();

        expect(spy.callCount).to.equal(1);
        expect(spy.args[0][0]).to.equal('qux');
        expect(el.outerHTML).to.equal('<div>qux</div>');
    });

    it('should not execute a side effect if a non-dependency is updated', async () => {
        const foo = store('a');
        const bar = store('b');
        const spy = sinon.spy();
        effect(foo, spy);

        const el = html`<div>${foo}</div>`;

        expect(spy.callCount).to.equal(0);
        expect(el.outerHTML).to.equal('<div>a</div>');

        foo.set('b');

        await tick();

        expect(spy.callCount).to.equal(1);
        expect(spy.args[0][0]).to.equal('b');
        expect(el.outerHTML).to.equal('<div>b</div>');

        bar.set('x');

        await tick();

        expect(spy.callCount).to.equal(1);
        expect(el.outerHTML).to.equal('<div>b</div>');
    });

    it('should support a side effect defined after a html-store interpolation', async () => {
        const foo = store('foo');
        const el = html`<div>${foo}</div>`;
        const spy = sinon.spy();
        effect(foo, spy);

        expect(spy.callCount).to.equal(0);
        expect(el.outerHTML).to.equal('<div>foo</div>');

        foo.set('bar');

        await tick();

        expect(spy.callCount).to.equal(1);
        expect(spy.args[0][0]).to.equal('bar');
        expect(el.outerHTML).to.equal('<div>bar</div>');
    });

    it('should execute a side effect after the store\'s promise is resolved', async () => {
        const foo = store();
        const spy = sinon.spy(() => {
            expect(el.outerHTML).to.equal('<div>foo</div>');
        });
        effect(foo, spy);
    
        const el = html`<div>${foo}</div>`;
    
        expect(spy.callCount).to.equal(0);
        expect(el.outerHTML).to.equal('<div></div>');
        
        const promise = Promise.resolve('foo');
        foo.set(promise);

        await promise;
        await tick();

        expect(spy.callCount).to.equal(1);
        expect(spy.args[0][0]).to.equal('foo');
    });

    it('should execute a side effect after multiple store\'s promises have been resolved', async () => {
        const foo = store('foo');
        const bar = store('bar');
        const spy = sinon.spy();
        effect(foo, bar, spy);
    
        const el = html`<div>${foo} ${bar}</div>`;
    
        expect(spy.callCount).to.equal(0);
        expect(el.outerHTML).to.equal('<div>foo bar</div>');
        
        const promise1 = new Promise((resolve) => setTimeout(() => resolve('baz'), 10));
        const promise2 = new Promise((resolve) => setTimeout(() => resolve('qux'), 20));
        foo.set(promise1);
        bar.set(promise2);

        await promise1;
        await tick();

        expect(spy.callCount).to.equal(1);
        expect(spy.args[0][0]).to.equal('baz');
        expect(spy.args[0][1]).to.equal('bar');
        expect(el.outerHTML).to.equal('<div>baz bar</div>');

        await promise2;
        await tick();

        expect(spy.callCount).to.equal(2);
        expect(spy.args[1][0]).to.equal('baz');
        expect(spy.args[1][1]).to.equal('qux');
        expect(el.outerHTML).to.equal('<div>baz qux</div>');
    });

    it('should not execute a side effect if the store\'s promise is rejected', async () => {
        const foo = store();
        const spy = sinon.spy();
    
        effect(foo, spy);
    
        const el = html`<div>${foo}</div>`;
        
        const promise = Promise.reject();
        foo.set(promise);

        try {
            await promise;
        } catch {
            await tick();

            expect(spy.callCount).to.equal(0);
            expect(el.outerHTML).to.equal('<div></div>');
        }
    });
    
    it('should not execute a side effect for a single dependency if it\'s stopped', async () => {
        const foo = store();
        const spy = sinon.spy();
        const stop = effect(foo, spy);

        const el = html`<div>${foo}</div>`;

        foo.set('foo');

        await tick();

        expect(spy.callCount).to.equal(1);
        expect(el.outerHTML).to.equal('<div>foo</div>');
        expect(stop).to.be.a('function');

        stop();

        foo.set('bar');

        await tick();

        expect(spy.callCount).to.equal(1);
        expect(el.outerHTML).to.equal('<div>bar</div>');
    });

    it('should not execute a side effect for multiple dependencies if it\'s stopped', async () => {
        const foo = store();
        const bar = store();
        const spy = sinon.spy();
        const stop = effect(foo, bar, spy);

        const el = html`<div class=${foo}>${bar}</div>`;

        foo.set('a');
        bar.set('b');

        await tick();

        expect(spy.callCount).to.equal(1);
        expect(el.outerHTML).to.equal('<div class="a">b</div>');
        expect(stop).to.be.a('function');

        stop();

        foo.set('x');
        bar.set('y');

        await tick();

        expect(spy.callCount).to.equal(1);
        expect(el.outerHTML).to.equal('<div class="x">y</div>');
    });

    it('should execute a side effect without dependencies for all DOM updates', async () => {
        const spy = sinon.spy();
        effect(spy);

        const foo = store();
        const fooEl = html`<div>${foo}</div>`;
        const bar = store();
        const barEl = html`<div>${bar}</div>`;
        const baz = store();
        const bazEl = html`<div>${baz}</div>`;

        expect(spy.callCount).to.equal(0);
        expect(fooEl.outerHTML).to.equal('<div></div>');
        expect(barEl.outerHTML).to.equal('<div></div>');
        expect(bazEl.outerHTML).to.equal('<div></div>');

        foo.set('a');
        bar.set('b');
        baz.set('c');

        await tick();

        expect(spy.callCount).to.equal(1);
        expect(fooEl.outerHTML).to.equal('<div>a</div>');
        expect(barEl.outerHTML).to.equal('<div>b</div>');
        expect(bazEl.outerHTML).to.equal('<div>c</div>');

        bar.set('y');

        await tick();

        expect(spy.callCount).to.equal(2);
        expect(fooEl.outerHTML).to.equal('<div>a</div>');
        expect(barEl.outerHTML).to.equal('<div>y</div>');
        expect(bazEl.outerHTML).to.equal('<div>c</div>');
        
        baz.set('z');

        await tick();

        expect(fooEl.outerHTML).to.equal('<div>a</div>');
        expect(barEl.outerHTML).to.equal('<div>y</div>');
        expect(bazEl.outerHTML).to.equal('<div>z</div>');
    });

    it('should not execute a side effect with no dependencies if it\'s stopped', async () => {
        const foo = store();
        const bar = store();
        const spy = sinon.spy();
        const stop = effect(spy);

        const el = html`<div class=${foo}>${bar}</div>`;

        foo.set('a');
        bar.set('b');

        await tick();

        expect(spy.callCount).to.equal(1);
        expect(el.outerHTML).to.equal('<div class="a">b</div>');
        expect(stop).to.be.a('function');

        stop();

        foo.set('x');

        await tick();

        expect(spy.callCount).to.equal(1);
        expect(el.outerHTML).to.equal('<div class="x">b</div>');

        bar.set('y');

        await tick();

        expect(spy.callCount).to.equal(1);
        expect(el.outerHTML).to.equal('<div class="x">y</div>');
    });

    it('should support updates within a side effect', async () => {
        const foo = store();
        const bar = store();

        const spy = sinon.spy(() => {
            expect(el.outerHTML).to.equal('<div class="a"></div>');
            bar.set('b');
        });
        effect(foo, spy);

        const el = html`<div class=${foo}>${bar}</div>`;

        foo.set('a');

        await tick();

        expect(spy.callCount).to.equal(1);
        expect(el.outerHTML).to.equal('<div class="a"></div>');

        await tick();

        expect(spy.callCount).to.equal(1);
        expect(el.outerHTML).to.equal('<div class="a">b</div>');
    });

    it('should support triggering a side effect within another side effect', async () => {
        const foo = store();
        const bar = store();

        const fooSpy = sinon.spy(() => bar.set('b'));
        effect(foo, fooSpy);

        const barSpy = sinon.spy(() => {
            expect(el.outerHTML).to.equal('<div class="a">b</div>');
        });
        effect(bar, barSpy);

        const el = html`<div class=${foo}>${bar}</div>`;

        foo.set('a');

        await tick();

        expect(fooSpy.callCount).to.equal(1);
        expect(barSpy.callCount).to.equal(0);
        expect(el.outerHTML).to.equal('<div class="a"></div>');

        await tick();

        expect(fooSpy.callCount).to.equal(1);
        expect(barSpy.callCount).to.equal(1);
        expect(el.outerHTML).to.equal('<div class="a">b</div>');
    });
});
