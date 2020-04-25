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

    it('should support two-way binding for a number input', (done) => {
        const value = store(2);
        const el = html`<input type="number" min="0" max="10" value=${bind(value)} />`;

        expect(el.value).to.equal('2');

        value.set(8);
        expect(el.value).to.equal('8');

        el.addEventListener('input', () => {
            expect(value.get()).to.equal(5);
            done();
        });
        
        el.value = 5;
        el.dispatchEvent(new Event('input'));
    });

    it('should support two-way binding for a range input', (done) => {
        const value = store(2);
        const el = html`<input type="range" min="0" max="10" value=${bind(value)} />`;

        expect(el.value).to.equal('2');

        value.set(8);
        expect(el.value).to.equal('8');

        el.addEventListener('input', () => {
            expect(value.get()).to.equal(5);
            done();
        });
        
        el.value = 5;
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

    it('should support two-way binding for a textarea', (done) => {
        const value = store('foo');
        const el = html`<textarea value=${bind(value)}></textarea>`;

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
