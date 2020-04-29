import { html, store, bind } from '../../src/reflex';

describe('bind', () => {
    it('should support two-way binding for a text input', (done) => {
        const value = store('foo');
        const el = html`<input type="text" value=${bind(value)} />`;

        expect(el.value).to.equal('foo');

        value.set('bar');
        requestAnimationFrame(() => {
            expect(el.value).to.equal('bar');

            el.addEventListener('input', () => {
                expect(value.get()).to.equal('baz');
                done();
            });
            
            el.value = 'baz';
            el.dispatchEvent(new Event('input'));
        });
    });

    it('should support two-way binding for a number input', (done) => {
        const value = store(2);
        const el = html`<input type="number" min="0" max="10" value=${bind(value)} />`;

        expect(el.value).to.equal('2');

        value.set(8);
        requestAnimationFrame(() => {
            expect(el.value).to.equal('8');

            el.addEventListener('input', () => {
                expect(value.get()).to.equal(5);
                done();
            });
            
            el.value = 5;
            el.dispatchEvent(new Event('input'));
        });
    });

    it('should support two-way binding for a range input', (done) => {
        const value = store(2);
        const el = html`<input type="range" min="0" max="10" value=${bind(value)} />`;

        expect(el.value).to.equal('2');

        value.set(8);
        requestAnimationFrame(() => {
            expect(el.value).to.equal('8');

            el.addEventListener('input', () => {
                expect(value.get()).to.equal(5);
                done();
            });
            
            el.value = 5;
            el.dispatchEvent(new Event('input'));
        });
    });

    it('should support two-way binding for a single checkbox', (done) => {
        const checked = store(true);
        const el = html`<input type="checkbox" checked=${bind(checked)} />`;

        expect(el.checked).to.equal(true);

        checked.set(false);
        requestAnimationFrame(() => {
            expect(el.checked).to.equal(false);

            el.addEventListener('change', () => {
                expect(checked.get()).to.equal(true);
                done();
            });
            
            el.checked = true;
            el.dispatchEvent(new Event('change'));
        });
    });








    it('should support two-way binding for a single radio button', (done) => {
        const checked = store(true);
        const el = html`<input type="radio" checked=${bind(checked)} />`;

        expect(el.checked).to.equal(true);

        checked.set(false);
        requestAnimationFrame(() => {
            expect(el.checked).to.equal(false);

            el.addEventListener('change', () => {
                expect(checked.get()).to.equal(true);
                done();
            });
            
            el.checked = true;
            el.dispatchEvent(new Event('change'));
        });
    });

    it('should support two-way binding for a textarea', (done) => {
        const value = store('foo');
        const el = html`<textarea value=${bind(value)}></textarea>`;

        expect(el.value).to.equal('foo');

        value.set('bar');
        requestAnimationFrame(() => {
            expect(el.value).to.equal('bar');

            el.addEventListener('input', () => {
                expect(value.get()).to.equal('baz');
                done();
            });
            
            el.value = 'baz';
            el.dispatchEvent(new Event('input'));
        });
    });

    it('should support two-way binding for a select', (done) => {
        const value = store('foo');
    
        const el = html`
            <select value=${bind(value)}>
                <option value="foo">foo</option>
                <option value="bar">bar</option>
                <option value="baz">baz</option>
            </select>
        `;
    
        expect(el.value).to.equal('foo');
        expect(el.selectedIndex).to.equal(0);
        expect(Array.from(el.selectedOptions)).to.deep.equal([el.options[0]]);
    
        value.set('bar');
        requestAnimationFrame(() => {
            expect(el.value).to.equal('bar');
            expect(el.selectedIndex).to.equal(1);
            expect(Array.from(el.selectedOptions)).to.deep.equal([el.options[1]]);
        
            el.addEventListener('input', () => {
                expect(value.get()).to.equal('baz');
                expect(el.value).to.equal('baz');
                expect(el.selectedIndex).to.equal(2);
                expect(Array.from(el.selectedOptions)).to.deep.equal([el.options[2]]);
                done();
            });
            
            el.selectedIndex = 2;
            el.dispatchEvent(new Event('input'));
        });
    });

    it('should support two-way binding for a select multiple', (done) => {
        const value = store(['foo']);
    
        const el = html`
            <select multiple value=${bind(value)}>
                <option value="foo">foo</option>
                <option value="bar">bar</option>
                <option value="baz">baz</option>
                <option value="qux">qux</option>
            </select>
        `;
    
        expect(el.value).to.deep.equal('foo');
        expect(el.selectedIndex).to.equal(0);
        expect(Array.from(el.selectedOptions)).to.deep.equal([el.options[0]]);
    
        value.set(['foo', 'baz']);
        requestAnimationFrame(() => {
            expect(Array.from(el.selectedOptions)).to.deep.equal([el.options[0], el.options[2]]);
        
            el.addEventListener('input', () => {
                expect(value.get()).to.deep.equal(['bar', 'qux']);
                expect(Array.from(el.selectedOptions)).to.deep.equal([el.options[1], el.options[3]]);
                done();
            });
            
            el.options[0].selected = false;
            el.options[1].selected = true;
            el.options[2].selected = false;
            el.options[3].selected = true;
            el.dispatchEvent(new Event('input'));
        });
    });





















    it('should support two-way binding for checkbox groups', (done) => {
        const foo = store(true);
        const bar = store(false);
        const baz = store(false);
        const qux = store(false);
    
        const el = html`
            <input type="checkbox" name="example" value="foo" checked=${bind(foo)} />
            <input type="checkbox" name="example" value="bar" checked=${bind(bar)} />
            <input type="checkbox" name="example" value="baz" checked=${bind(baz)} />
            <input type="checkbox" name="example" value="qux" checked=${bind(qux)} />
        `;

        const fooInput = el.children[0];
        const barInput = el.children[1];
        const bazInput = el.children[2];
        const quxInput = el.children[3];

        document.body.appendChild(el);
    
        expect(fooInput.checked).to.equal(true);
        expect(barInput.checked).to.equal(false);
        expect(bazInput.checked).to.equal(false);
        expect(quxInput.checked).to.equal(false);
    
        baz.set(true);
        requestAnimationFrame(() => {
            expect(fooInput.checked).to.equal(true);
            expect(barInput.checked).to.equal(false);
            expect(bazInput.checked).to.equal(true);
            expect(quxInput.checked).to.equal(false);
        
            quxInput.addEventListener('change', () => {
                expect(foo.get()).to.deep.equal(false);
                expect(bar.get()).to.deep.equal(true);
                expect(baz.get()).to.deep.equal(false);
                expect(qux.get()).to.deep.equal(true);
                expect(fooInput.checked).to.equal(false);
                expect(barInput.checked).to.equal(true);
                expect(bazInput.checked).to.equal(false);
                expect(quxInput.checked).to.equal(true);

                fooInput.remove();
                barInput.remove();
                bazInput.remove();
                quxInput.remove();
                done();
            });
            
            fooInput.checked = false;
            barInput.checked = true;
            bazInput.checked = false;
            quxInput.checked = true;
            fooInput.dispatchEvent(new Event('change'));
            barInput.dispatchEvent(new Event('change'));
            bazInput.dispatchEvent(new Event('change'));
            quxInput.dispatchEvent(new Event('change'));
        });
    });

    it('should support two-way binding for radio button groups', (done) => {
        const foo = store(false);
        const bar = store(true);
        const baz = store(false);
    
        const el = html`
            <input type="radio" name="example" value="foo" checked=${bind(foo)} />
            <input type="radio" name="example" value="bar" checked=${bind(bar)} />
            <input type="radio" name="example" value="baz" checked=${bind(baz)} />
        `;

        const fooInput = el.children[0];
        const barInput = el.children[1];
        const bazInput = el.children[2];

        document.body.appendChild(el);
    
        expect(fooInput.checked).to.equal(false);
        expect(barInput.checked).to.equal(true);
        expect(bazInput.checked).to.equal(false);
    
        foo.set(true);
        requestAnimationFrame(() => {
            expect(fooInput.checked).to.equal(true);
            expect(barInput.checked).to.equal(false);
            expect(bazInput.checked).to.equal(false);
        
            bazInput.addEventListener('change', () => {
                expect(foo.get()).to.equal(false);
                expect(bar.get()).to.equal(false);
                expect(baz.get()).to.equal(true);
                expect(fooInput.checked).to.equal(false);
                expect(barInput.checked).to.equal(false);
                expect(bazInput.checked).to.equal(true);

                fooInput.remove();
                barInput.remove();
                bazInput.remove();
                done();
            });
            
            bazInput.checked = true;
            fooInput.dispatchEvent(new Event('change'));
            barInput.dispatchEvent(new Event('change'));
            bazInput.dispatchEvent(new Event('change'));
        });
    });
});
