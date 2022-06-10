import { html, val, bind, dispose, tick } from '../../src/reflex';

describe('disposal-bind', () => {
    it('should dispose a two-way input binding', (done) => {
        const value = val('foo');
        const input = html`<input type="text" value=${bind(value)} />`;

        expect(input.value).to.equal('foo');

        value.set('bar');
        
        tick().then(() => {
            expect(input.value).to.equal('bar');
            
            dispose(input);

            value.set('baz');
        
            tick().then(() => {
                expect(input.value).to.equal('bar');
                
                input.addEventListener('input', () => {
                    expect(value.get()).to.equal('baz');
                    done();
                });
                
                input.value = 'qux';
                input.dispatchEvent(new Event('input'));
            });
        });
    });

    it('should dispose a two-way numeric input binding', (done) => {
        const value = val();
        const input = html`<input type="number" value=${bind(value)} />`;

        expect(input.value).to.equal('0');

        value.set(3);
        
        tick().then(() => {
            expect(input.value).to.equal('3');
            
            dispose(input);
                
            value.set(5);
        
            tick().then(() => {
                expect(input.value).to.equal('3');
                
                input.addEventListener('input', () => {
                    expect(value.get()).to.equal(5);
                    done();
                });
                
                input.value = '6';
                input.dispatchEvent(new Event('input'));
            });
        });
    });

    it('should dispose a two-way checkbox binding', (done) => {
        const checked = val(true);
        const input = html`<input type="checkbox" checked=${bind(checked)} />`;

        expect(input.checked).to.equal(true);

        checked.set(false);
        
        tick().then(() => {
            expect(input.checked).to.equal(false);
            
            dispose(input);

            checked.set(true);
        
            tick().then(() => {
                expect(input.checked).to.equal(false);
                
                input.addEventListener('change', () => {
                    expect(checked.get()).to.equal(true);
                    done();
                });
                
                input.checked = false;
                input.dispatchEvent(new Event('change'));
            });
        });
    });

    it('should dispose a two-way radio button binding', (done) => {
        const checked = val(true);
        const input = html`<input type="radio" checked=${bind(checked)} />`;

        expect(input.checked).to.equal(true);

        checked.set(false);
        
        tick().then(() => {
            expect(input.checked).to.equal(false);
            
            dispose(input);
                
            checked.set(true);
        
            tick().then(() => {
                expect(input.checked).to.equal(false);
                
                input.addEventListener('change', () => {
                    expect(checked.get()).to.equal(true);
                    done();
                });
                
                input.checked = false;
                input.dispatchEvent(new Event('change'));
            });
        });
    });

    it('should dispose a two-way textarea binding', (done) => {
        const value = val('foo');
        const textarea = html`<textarea value=${bind(value)}></textarea>`;

        expect(textarea.value).to.equal('foo');

        value.set('bar');
        
        tick().then(() => {
            expect(textarea.value).to.equal('bar');
            
            dispose(textarea);
                
            value.set('baz');
        
            tick().then(() => {
                expect(textarea.value).to.equal('bar');
                
                textarea.addEventListener('input', () => {
                    expect(value.get()).to.equal('baz');
                    done();
                });
                
                textarea.value = 'qux';
                textarea.dispatchEvent(new Event('input'));
            });
        });
    });

    it('should dispose a two-way select binding', (done) => {
        const value = val('foo');
        const select = html`
            <select value=${bind(value)}>
                <option value="foo">foo</option>
                <option value="bar">bar</option>
                <option value="baz">baz</option>
            </select>
        `;

        expect(select.value).to.equal('foo');
        expect(select.selectedIndex).to.equal(0);

        value.set('bar');
        
        tick().then(() => {
            expect(select.value).to.equal('bar');
            expect(select.selectedIndex).to.equal(1);
            
            dispose(select);
                
            value.set('baz');
        
            tick().then(() => {
                expect(select.value).to.equal('bar');
                expect(select.selectedIndex).to.equal(1);
                
                select.addEventListener('input', () => {
                    expect(value.get()).to.equal('baz');
                    done();
                });
                
                select.value = 'foo';
                select.dispatchEvent(new Event('input'));
            });
        });
    });

    it('should dispose a two-way select multiple binding', (done) => {
        const value = val(['foo']);
        const select = html`
            <select multiple value=${bind(value)}>
                <option value="foo">foo</option>
                <option value="bar">bar</option>
                <option value="baz">baz</option>
            </select>
        `;

        expect(select.value).to.equal('foo');
        expect(Array.from(select.selectedOptions)).to.deep.equal([select.options[0]]);

        value.set(['foo', 'baz']);
        
        tick().then(() => {
            expect(Array.from(select.selectedOptions)).to.deep.equal([select.options[0], select.options[2]]);
            
            dispose(select);

            value.set(['bar']);
        
            tick().then(() => {
                expect(Array.from(select.selectedOptions)).to.deep.equal([select.options[0], select.options[2]]);
                
                select.addEventListener('input', () => {
                    expect(value.get()).to.deep.equal(['bar']);
                    done();
                });
                
                select.options[0].selected = true;
                select.options[1].selected = false;
                select.options[2].selected = false;
                select.dispatchEvent(new Event('input'));
            });
        });
    });

    it('should dispose an event listener binding', (done) => {
        const clicked = val();
        const el = html`<div onclick=${bind(clicked)} />`;

        const spy = sinon.spy();
        clicked.subscribe(spy);

        expect(spy.callCount).to.equal(1);

        const event = new Event('click');
        el.dispatchEvent(event);

        tick().then(() => {
            expect(spy.callCount).to.equal(2);
            expect(clicked.get()).to.equal(event);

            const removeEventSpy = sinon.spy(el, 'removeEventListener');

            expect(removeEventSpy.callCount).to.equal(0);

            dispose(el);

            expect(removeEventSpy.callCount).to.equal(1);

            el.dispatchEvent(new Event('click'));

            tick().then(() => {
                expect(spy.callCount).to.equal(2);
                expect(clicked.get()).to.equal(event);
    
                done();
            });
        });
    });
});
