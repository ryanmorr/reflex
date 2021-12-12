import { html, val, bind, each, dispose, tick } from '../../src/reflex';

describe('dispose', () => {
    it('should dispose a node binding', (done) => {
        const text = val('foo');
        const el = html`<div>${text}</div>`;
        
        expect(el.outerHTML).to.equal('<div>foo</div>');

        text.set('bar').then(() => {
            expect(el.outerHTML).to.equal('<div>bar</div>');
            
            dispose(el);

            text.set('baz').then(() => {
                expect(el.outerHTML).to.equal('<div>bar</div>');
                done();
            });
        });
    });

    it('should dispose an attribute binding', (done) => {
        const attr = val('foo');
        const el = html`<div id=${attr}></div>`;
        
        expect(el.outerHTML).to.equal('<div id="foo"></div>');

        attr.set('bar').then(() => {
            expect(el.outerHTML).to.equal('<div id="bar"></div>');
            
            dispose(el);

            attr.set('baz').then(() => {
                expect(el.outerHTML).to.equal('<div id="bar"></div>');
                done();
            });
        });
    });

    it('should dispose all node bindings', (done) => {
        const attr = val('foo');
        const text = val('bar');
        const el = html`<div id=${attr}>${text}</div>`;
        
        expect(el.outerHTML).to.equal('<div id="foo">bar</div>');

        attr.set('baz');
        text.set('qux').then(() => {
            expect(el.outerHTML).to.equal('<div id="baz">qux</div>');
            
            dispose(el);
            
            attr.set('abc');
            text.set('xyz').then(() => {
                expect(el.outerHTML).to.equal('<div id="baz">qux</div>');
                done();
            });
        });
    });

    it('should dispose child bindings', (done) => {
        const text = val('foo');
        const el = html`<div><section><span>${text}</span><em>${text}</em></section></div>`;
        
        expect(el.outerHTML).to.equal('<div><section><span>foo</span><em>foo</em></section></div>');

        text.set('bar').then(() => {
            expect(el.outerHTML).to.equal('<div><section><span>bar</span><em>bar</em></section></div>');
            
            dispose(el);

            text.set('baz').then(() => {
                expect(el.outerHTML).to.equal('<div><section><span>bar</span><em>bar</em></section></div>');
                done();
            });
        });
    });

    it('should dispose nested store bindings', (done) => {
        const text = val('foo');
        const span = html`<span>${text}</span>`;
        const content = val(span);
        const el = html`<div>${content}</div>`;

        expect(el.outerHTML).to.equal('<div><span>foo</span></div>');

        text.set('bar').then(() => {
            expect(el.outerHTML).to.equal('<div><span>bar</span></div>');
            
            dispose(el);
                
            text.set('baz').then(() => {
                expect(span.outerHTML).to.equal('<span>bar</span>');
                expect(el.outerHTML).to.equal('<div><span>bar</span></div>');
                done();
            });
        });
    });

    it('should not dispose parent bindings', (done) => {
        const text = val('foo');
        const span = html`<span>${text}</span>`;
        const content = val(span);

        const attr = val('bar');
        const el = html`<div id=${attr}>${content}</div>`;

        expect(el.outerHTML).to.equal('<div id="bar"><span>foo</span></div>');

        text.set('baz').then(() => {
            expect(el.outerHTML).to.equal('<div id="bar"><span>baz</span></div>');
            
            dispose(span);
                
            text.set('qux').then(() => {
                expect(span.outerHTML).to.equal('<span>baz</span>');
                expect(el.outerHTML).to.equal('<div id="bar"><span>baz</span></div>');
                
                attr.set('qux').then(() => {
                    expect(el.outerHTML).to.equal('<div id="qux"><span>baz</span></div>');
                    done();
                });
            });
        });
    });

    it('should not dispose sibling bindings', (done) => {
        const text = val('foo');
        const frag = html`<div>${text}</div><span>${text}</span><em>${text}</em>`;

        const div = frag.children[0];
        const span = frag.children[1];
        const em = frag.children[2];

        expect(div.outerHTML).to.equal('<div>foo</div>');
        expect(span.outerHTML).to.equal('<span>foo</span>');
        expect(em.outerHTML).to.equal('<em>foo</em>');

        text.set('bar').then(() => {
            expect(div.outerHTML).to.equal('<div>bar</div>');
            expect(span.outerHTML).to.equal('<span>bar</span>');
            expect(em.outerHTML).to.equal('<em>bar</em>');
            
            dispose(span);
                
            text.set('baz').then(() => {
                expect(div.outerHTML).to.equal('<div>baz</div>');
                expect(span.outerHTML).to.equal('<span>bar</span>');
                expect(em.outerHTML).to.equal('<em>baz</em>');
                done();
            });
        });
    });

    it('should dispose a two-way input binding when removed', (done) => {
        const value = val('foo');
        const input = html`<input type="text" value=${bind(value)} />`;

        expect(input.value).to.equal('foo');

        value.set('bar').then(() => {
            expect(input.value).to.equal('bar');
            
            dispose(input);

            value.set('baz').then(() => {
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
        const value = val();
        const input = html`<input type="number" value=${bind(value)} />`;

        expect(input.value).to.equal('0');

        value.set(3).then(() => {
            expect(input.value).to.equal('3');
            
            dispose(input);
                
            value.set(5).then(() => {
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
        const checked = val(true);
        const input = html`<input type="checkbox" checked=${bind(checked)} />`;

        expect(input.checked).to.equal(true);

        checked.set(false).then(() => {
            expect(input.checked).to.equal(false);
            
            dispose(input);

            checked.set(true).then(() => {
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
        const checked = val(true);
        const input = html`<input type="radio" checked=${bind(checked)} />`;

        expect(input.checked).to.equal(true);

        checked.set(false).then(() => {
            expect(input.checked).to.equal(false);
            
            dispose(input);
                
            checked.set(true).then(() => {
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
        const value = val('foo');
        const textarea = html`<textarea value=${bind(value)}></textarea>`;

        expect(textarea.value).to.equal('foo');

        value.set('bar').then(() => {
            expect(textarea.value).to.equal('bar');
            
            dispose(textarea);
                
            value.set('baz').then(() => {
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

        value.set('bar').then(() => {
            expect(select.value).to.equal('bar');
            expect(select.selectedIndex).to.equal(1);
            
            dispose(select);
                
            value.set('baz').then(() => {
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

        value.set(['foo', 'baz']).then(() => {
            expect(Array.from(select.selectedOptions)).to.deep.equal([select.options[0], select.options[2]]);
            
            dispose(select);

            value.set(['bar']).then(() => {
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

    it('should dispose a binding between an event listener and a store', (done) => {
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

    it('should dispose bindings from nodes removed after an each reconciliation', (done) => {
        const value = val('foo');
        const list = val([1, 2, 3]);

        const el = html`
            <ul>
                ${each(list, (n) => html`<li>${n} ${value}</li>`)}
            </ul>
        `;

        expect(el.innerHTML).to.equal('<li>1 foo</li><li>2 foo</li><li>3 foo</li>');

        const li1 = el.children[0];
        const li2 = el.children[1];
        const li3 = el.children[2];

        value.set('bar').then(() => {
            expect(li1.textContent).to.equal('1 bar');
            expect(li2.textContent).to.equal('2 bar');
            expect(li3.textContent).to.equal('3 bar');
            
            list.set([4, 5, 6]).then(() => {
                expect(el.innerHTML).to.equal('<li>4 bar</li><li>5 bar</li><li>6 bar</li>');

                value.set('baz').then(() => {
                    expect(el.innerHTML).to.equal('<li>4 baz</li><li>5 baz</li><li>6 baz</li>');
                    expect(li1.textContent).to.equal('1 bar');
                    expect(li2.textContent).to.equal('2 bar');
                    expect(li3.textContent).to.equal('3 bar');
                    done();
                });
            });
        });
    });

    it('should dispose bindings from nodes removed from the beginning after an each reconciliation', (done) => {
        const value = val('foo');
        const list = val([1, 2, 3, 4]);

        const el = html`
            <ul>
                ${each(list, (n) => html`<li>${n} ${value}</li>`)}
            </ul>
        `;

        expect(el.innerHTML).to.equal('<li>1 foo</li><li>2 foo</li><li>3 foo</li><li>4 foo</li>');

        const li1 = el.children[0];
        const li2 = el.children[1];
        const li3 = el.children[2];
        const li4 = el.children[3];

        value.set('bar').then(() => {
            expect(li1.textContent).to.equal('1 bar');
            expect(li2.textContent).to.equal('2 bar');
            expect(li3.textContent).to.equal('3 bar');
            expect(li4.textContent).to.equal('4 bar');
            
            list.set([3, 4]).then(() => {
                expect(el.innerHTML).to.equal('<li>3 bar</li><li>4 bar</li>');

                value.set('baz').then(() => {
                    expect(el.innerHTML).to.equal('<li>3 baz</li><li>4 baz</li>');
                    expect(li1.textContent).to.equal('1 bar');
                    expect(li2.textContent).to.equal('2 bar');
                    expect(li3.textContent).to.equal('3 baz');
                    expect(li4.textContent).to.equal('4 baz');
                    done();
                });
            });
        });
    });

    it('should dispose bindings from nodes removed from the middle after an each reconciliation', (done) => {
        const value = val('foo');
        const list = val([1, 2, 3, 4]);

        const el = html`
            <ul>
                ${each(list, (n) => html`<li>${n} ${value}</li>`)}
            </ul>
        `;

        expect(el.innerHTML).to.equal('<li>1 foo</li><li>2 foo</li><li>3 foo</li><li>4 foo</li>');

        const li1 = el.children[0];
        const li2 = el.children[1];
        const li3 = el.children[2];
        const li4 = el.children[3];

        value.set('bar').then(() => {
            expect(li1.textContent).to.equal('1 bar');
            expect(li2.textContent).to.equal('2 bar');
            expect(li3.textContent).to.equal('3 bar');
            expect(li4.textContent).to.equal('4 bar');
            
            list.set([2, 3]).then(() => {
                expect(el.innerHTML).to.equal('<li>2 bar</li><li>3 bar</li>');

                value.set('baz').then(() => {
                    expect(el.innerHTML).to.equal('<li>2 baz</li><li>3 baz</li>');
                    expect(li1.textContent).to.equal('1 bar');
                    expect(li2.textContent).to.equal('2 baz');
                    expect(li3.textContent).to.equal('3 baz');
                    expect(li4.textContent).to.equal('4 bar');
                    done();
                });
            });
        });
    });

    it('should dispose bindings from nodes removed from the end after an each reconciliation', (done) => {
        const value = val('foo');
        const list = val([1, 2, 3, 4]);

        const el = html`
            <ul>
                ${each(list, (n) => html`<li>${n} ${value}</li>`)}
            </ul>
        `;

        expect(el.innerHTML).to.equal('<li>1 foo</li><li>2 foo</li><li>3 foo</li><li>4 foo</li>');

        const li1 = el.children[0];
        const li2 = el.children[1];
        const li3 = el.children[2];
        const li4 = el.children[3];

        value.set('bar').then(() => {
            expect(li1.textContent).to.equal('1 bar');
            expect(li2.textContent).to.equal('2 bar');
            expect(li3.textContent).to.equal('3 bar');
            expect(li4.textContent).to.equal('4 bar');
            
            list.set([1, 2]).then(() => {
                expect(el.innerHTML).to.equal('<li>1 bar</li><li>2 bar</li>');

                value.set('baz').then(() => {
                    expect(el.innerHTML).to.equal('<li>1 baz</li><li>2 baz</li>');
                    expect(li1.textContent).to.equal('1 baz');
                    expect(li2.textContent).to.equal('2 baz');
                    expect(li3.textContent).to.equal('3 bar');
                    expect(li4.textContent).to.equal('4 bar');
                    done();
                });
            });
        });
    });
});
