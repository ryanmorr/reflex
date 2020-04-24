import { html, store, bind } from '../../src/reflex';

describe('bind', () => {
    it('should support two-way binding for text inputs', (done) => {
        const value = store('foo');
        const el = html`<input type="text" value=${bind(value)} />`;

        expect(el.outerHTML).to.equal('<input type="text">');
        expect(el.value).to.equal('foo');

        value.set('bar');
        expect(el.value).to.equal('bar');

        el.addEventListener('input', () => {
            expect(value.get()).to.equal('baz');
            done();
        });
        
        el.value = 'baz';
        el.dispatchEvent(new Event('input'));
    });
});
