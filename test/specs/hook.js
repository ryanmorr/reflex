import { waitForRender } from '../setup';
import { html, store, hook } from '../../src/reflex';

describe('hook', () => {
    it('should call a hook when creating an element', () => {
        const callback = sinon.spy();
        const hooked = hook(callback);
        const el = html`<div id="abc" class="xyz" foo=${hooked}></div>`;

        expect(callback.callCount).to.equal(1);
        expect(callback.args[0][0]).to.equal(el);
        expect(callback.args[0][1]).to.equal('foo');
        expect(callback.args[0][2]).to.deep.equal({id: 'abc', class: 'xyz', foo: hooked});
    });

    it('should call a hook with custom spread arguments', () => {
        const callback = sinon.spy();

        const array = [];
        const obj = {};
        const hooked = hook(callback, array, obj, 123, 'bar');

        const el = html`<div foo=${hooked}></div>`;

        expect(callback.callCount).to.equal(1);
        expect(callback.args[0][0]).to.equal(el);
        expect(callback.args[0][1]).to.equal('foo');
        expect(callback.args[0][2]).to.deep.equal({foo: hooked});
        expect(callback.args[0][3]).to.equal(array);
        expect(callback.args[0][4]).to.equal(obj);
        expect(callback.args[0][5]).to.equal(123);
        expect(callback.args[0][6]).to.equal('bar');
    });

    it('should call multiple hooks', () => {
        const callback1 = sinon.spy();
        const callback2 = sinon.spy();
        html`<div foo=${hook(callback1)} bar=${hook(callback2)}></div>`;

        expect(callback1.callCount).to.equal(1);
        expect(callback2.callCount).to.equal(1);
    });

    it('should not render hooks', () => {
        const callback1 = sinon.spy();
        const callback2 = sinon.spy();
        const el = html`<div id="abc" class="xyz" foo=${hook(callback1)} bar=${hook(callback2)}></div>`;

        expect(el.outerHTML).to.equal('<div id="abc" class="xyz"></div>');
    });

    it('should call hooks before normal attributes', () => {
        const callback = (element, name, attributes) => {
            attributes.id = 'bar';
            attributes.class = 'baz';
        };

        const el = html`<div id="abc" class="xyz" foo=${hook(callback)}></div>`;

        expect(el.outerHTML).to.equal('<div id="bar" class="baz"></div>');
    });
});
