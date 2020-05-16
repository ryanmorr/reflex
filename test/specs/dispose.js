import { waitForRender } from '../setup';
import { html, store, bind, dispose } from '../../src/reflex';

describe('dispose', () => {
    it('should dispose a node binding', (done) => {
        const text = store('foo');
        const el = html`<div>${text}</div>`;
        
        expect(el.outerHTML).to.equal('<div>foo</div>');

        text.set('bar');
        waitForRender(() => {
            expect(el.outerHTML).to.equal('<div>bar</div>');
            
            dispose(el);

            text.set('baz');
            waitForRender(() => {
                expect(el.outerHTML).to.equal('<div>bar</div>');
                done();
            });
        });
    });

    it('should dispose an attribute binding', (done) => {
        const attr = store('foo');
        const el = html`<div id=${attr}></div>`;
        
        expect(el.outerHTML).to.equal('<div id="foo"></div>');

        attr.set('bar');
        waitForRender(() => {
            expect(el.outerHTML).to.equal('<div id="bar"></div>');
            
            dispose(el);

            attr.set('baz');
            waitForRender(() => {
                expect(el.outerHTML).to.equal('<div id="bar"></div>');
                done();
            });
        });
    });

    it('should dispose all node bindings', (done) => {
        const attr = store('foo');
        const text = store('bar');
        const el = html`<div id=${attr}>${text}</div>`;
        
        expect(el.outerHTML).to.equal('<div id="foo">bar</div>');

        attr.set('baz');
        text.set('qux');
        waitForRender(() => {
            expect(el.outerHTML).to.equal('<div id="baz">qux</div>');
            
            dispose(el);
            
            attr.set('abc');
            text.set('xyz');
            waitForRender(() => {
                expect(el.outerHTML).to.equal('<div id="baz">qux</div>');
                done();
            });
        });
    });

    it('should dispose child bindings', (done) => {
        const text = store('foo');
        const el = html`<div><section><span>${text}</span><em>${text}</em></section></div>`;
        
        expect(el.outerHTML).to.equal('<div><section><span>foo</span><em>foo</em></section></div>');

        text.set('bar');
        waitForRender(() => {
            expect(el.outerHTML).to.equal('<div><section><span>bar</span><em>bar</em></section></div>');
            
            dispose(el);

            text.set('baz');
            waitForRender(() => {
                expect(el.outerHTML).to.equal('<div><section><span>bar</span><em>bar</em></section></div>');
                done();
            });
        });
    });

    it('should dispose multiple bindings', (done) => {
        const attr = store('foo');
        const el1 = html`<div id=${attr}></div>`;

        const text = store('bar');
        const el2 = html`<div>${text}</div>`;
        
        expect(el1.outerHTML).to.equal('<div id="foo"></div>');
        expect(el2.outerHTML).to.equal('<div>bar</div>');

        attr.set('baz');
        text.set('qux');
        waitForRender(() => {
            expect(el1.outerHTML).to.equal('<div id="baz"></div>');
            expect(el2.outerHTML).to.equal('<div>qux</div>');
            
            dispose(el1, el2);
            
            attr.set('abc');
            text.set('xyz');
            waitForRender(() => {
                expect(el1.outerHTML).to.equal('<div id="baz"></div>');
                expect(el2.outerHTML).to.equal('<div>qux</div>');
                done();
            });
        });
    });

    it('should dispose nested store bindings', (done) => {
        const text = store('foo');
        const span = html`<span>${text}</span>`;
        const content = store(span);
        const el = html`<div>${content}</div>`;

        expect(el.outerHTML).to.equal('<div><span>foo</span></div>');

        text.set('bar');
        waitForRender(() => {
            expect(el.outerHTML).to.equal('<div><span>bar</span></div>');
            
            dispose(el);
                
            text.set('baz');
            waitForRender(() => {
                expect(span.outerHTML).to.equal('<span>bar</span>');
                expect(el.outerHTML).to.equal('<div><span>bar</span></div>');
                done();
            });
        });
    });

    it('should not dispose parent bindings', (done) => {
        const text = store('foo');
        const span = html`<span>${text}</span>`;
        const content = store(span);

        const attr = store('bar');
        const el = html`<div id=${attr}>${content}</div>`;

        expect(el.outerHTML).to.equal('<div id="bar"><span>foo</span></div>');

        text.set('baz');
        waitForRender(() => {
            expect(el.outerHTML).to.equal('<div id="bar"><span>baz</span></div>');
            
            dispose(span);
                
            text.set('qux');
            waitForRender(() => {
                expect(span.outerHTML).to.equal('<span>baz</span>');
                expect(el.outerHTML).to.equal('<div id="bar"><span>baz</span></div>');
                
                attr.set('qux');
                waitForRender(() => {
                    expect(el.outerHTML).to.equal('<div id="qux"><span>baz</span></div>');
                    done();
                });
            });
        });
    });

    it('should not dispose sibling bindings', (done) => {
        const text = store('foo');
        const frag = html`<div>${text}</div><span>${text}</span><em>${text}</em>`;

        const div = frag.children[0];
        const span = frag.children[1];
        const em = frag.children[2];

        expect(div.outerHTML).to.equal('<div>foo</div>');
        expect(span.outerHTML).to.equal('<span>foo</span>');
        expect(em.outerHTML).to.equal('<em>foo</em>');

        text.set('bar');
        waitForRender(() => {
            expect(div.outerHTML).to.equal('<div>bar</div>');
            expect(span.outerHTML).to.equal('<span>bar</span>');
            expect(em.outerHTML).to.equal('<em>bar</em>');
            
            dispose(span);
                
            text.set('baz');
            waitForRender(() => {
                expect(div.outerHTML).to.equal('<div>baz</div>');
                expect(span.outerHTML).to.equal('<span>bar</span>');
                expect(em.outerHTML).to.equal('<em>baz</em>');
                done();
            });
        });
    });

    it('should dispose a two-way input binding when removed', (done) => {
        const value = store('foo');
        const input = html`<input type="text" value=${bind(value)} />`;

        expect(input.value).to.equal('foo');

        value.set('bar');
        waitForRender(() => {
            expect(input.value).to.equal('bar');
            
            dispose(input);

            value.set('baz');
            waitForRender(() => {
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

    it('should dispose a two-way numeric input binding when removed', (done) => {
        const value = store();
        const input = html`<input type="number" value=${bind(value)} />`;

        expect(input.value).to.equal('0');

        value.set(3);
        waitForRender(() => {
            expect(input.value).to.equal('3');
            
            dispose(input);
                
            value.set(5);
            waitForRender(() => {
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

    it('should dispose a two-way checkbox binding when removed', (done) => {
        const checked = store(true);
        const input = html`<input type="checkbox" checked=${bind(checked)} />`;

        expect(input.checked).to.equal(true);

        checked.set(false);
        waitForRender(() => {
            expect(input.checked).to.equal(false);
            
            dispose(input);

            checked.set(true);
            waitForRender(() => {
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

    it('should dispose a two-way radio button binding when removed', (done) => {
        const checked = store(true);
        const input = html`<input type="radio" checked=${bind(checked)} />`;

        expect(input.checked).to.equal(true);

        checked.set(false);
        waitForRender(() => {
            expect(input.checked).to.equal(false);
            
            dispose(input);
                
            checked.set(true);
            waitForRender(() => {
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

    it('should dispose a two-way textarea binding when removed', (done) => {
        const value = store('foo');
        const textarea = html`<textarea value=${bind(value)}></textarea>`;

        expect(textarea.value).to.equal('foo');

        value.set('bar');
        waitForRender(() => {
            expect(textarea.value).to.equal('bar');
            
            dispose(textarea);
                
            value.set('baz');
            waitForRender(() => {
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

    it('should dispose a two-way select binding when removed', (done) => {
        const value = store('foo');
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
        waitForRender(() => {
            expect(select.value).to.equal('bar');
            expect(select.selectedIndex).to.equal(1);
            
            dispose(select);
                
            value.set('baz');
            waitForRender(() => {
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

    it('should dispose a two-way select multiple binding when removed', (done) => {
        const value = store(['foo']);
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
        waitForRender(() => {
            expect(Array.from(select.selectedOptions)).to.deep.equal([select.options[0], select.options[2]]);
            
            dispose(select);

            value.set(['bar']);
            waitForRender(() => {
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
});
