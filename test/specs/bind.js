import { html, store, bind } from '../../src/reflex';

describe('bind', () => {
    it('should support two-way binding for a text input', (done) => {
        const value = store('foo');
        const el = html`<input type="text" value=${bind(value)} />`;

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

    it('should support two-way binding for a single checkbox', (done) => {
        const checked = store(true);
        const el = html`<input type="checkbox" checked=${bind(checked)} />`;

        expect(el.checked).to.equal(true);

        checked.set(false);
        expect(el.checked).to.equal(false);

        el.addEventListener('change', () => {
            expect(checked.get()).to.equal(true);
            done();
        });
        
        el.checked = true;
        el.dispatchEvent(new Event('change'));
    });

    it('should support two-way binding for a single radio button', (done) => {
        const checked = store(true);
        const el = html`<input type="radio" checked=${bind(checked)} />`;

        expect(el.checked).to.equal(true);

        checked.set(false);
        expect(el.checked).to.equal(false);

        el.addEventListener('change', () => {
            expect(checked.get()).to.equal(true);
            done();
        });
        
        el.checked = true;
        el.dispatchEvent(new Event('change'));
    });
});
