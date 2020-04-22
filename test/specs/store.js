import { html, store } from '../../src/reflex';

describe('store', () => {
    it('should get the internal value', () => {
        const foo = store();
        const bar = store(123);
        
        expect(foo.get()).to.equal(undefined);
        expect(bar.get()).to.equal(123);
    });

    it('should set the internal value', () => {
        const value = store('foo');
        
        expect(value.get()).to.equal('foo');

        value.set('bar');
        expect(value.get()).to.equal('bar');

        value.set('baz');
        expect(value.get()).to.equal('baz');
    });

    it('should update the internal value with a callback function', () => {
        const value = store(1);
        
        expect(value.get()).to.equal(1);

        value.update((val) => val + 10);
        expect(value.get()).to.equal(11);

        value.update((val) => val + 100);
        expect(value.get()).to.equal(111);
    });

    it('should call subscribers immediately and when the internal value changes', () => {
        const value = store(10);
        
        const spy = sinon.spy();
        value.subscribe(spy);

        expect(spy.callCount).to.equal(1);
        expect(spy.args[0][0]).to.equal(10);

        value.set(20);
        expect(spy.callCount).to.equal(2);
        expect(spy.args[1][0]).to.equal(20);

        value.update((val) => val + 100);
        expect(spy.callCount).to.equal(3);
        expect(spy.args[2][0]).to.equal(120);
    });

    it('should update a text node', (done) => {
        const text = store();
        const el = html`<div>${text}</div>`;

        expect(el.outerHTML).to.equal('<div></div>');

        text.set('foo');
        requestAnimationFrame(() => {
            expect(el.outerHTML).to.equal('<div>foo</div>');
            done();
        });
    });

    it('should update an element', (done) => {
        const child = store();
        const el = html`<div>${child}</div>`;

        expect(el.innerHTML).to.equal('');

        child.set(html`<span />`);
        requestAnimationFrame(() => {
            expect(el.outerHTML).to.equal('<div><span></span></div>');
            done();
        });
    });

    it('should update an attribute', (done) => {
        const attr = store();
        const el = html`<div foo=${attr}></div>`;

        expect(el.outerHTML).to.equal('<div></div>');

        attr.set('bar');
        requestAnimationFrame(() => {
            expect(el.outerHTML).to.equal('<div foo="bar"></div>');
            done();
        });
    });
});
