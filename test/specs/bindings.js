import { html, store, derived } from '../../src/reflex';

describe('bindings', () => {
    it('should render a store as a text node', () => {
        const text = store('foo');
        const el = html`<div>${text}</div>`;

        expect(el.outerHTML).to.equal('<div>foo</div>');
    });

    it('should render a store as an attribute', () => {
        const attr = store('foo');
        const el = html`<div id=${attr}></div>`;

        expect(el.outerHTML).to.equal('<div id="foo"></div>');
    });

    it('should update a text node', (done) => {
        const text = store();
        const el = html`<div>${text}</div>`;

        expect(el.outerHTML).to.equal('<div></div>');

        text.set('foo').then(() => {
            expect(el.outerHTML).to.equal('<div>foo</div>');
            
            text.set('bar').then(() => {
                expect(el.outerHTML).to.equal('<div>bar</div>');
                done();
            });
        });
    });

    it('should update an element', (done) => {
        const child = store();
        const el = html`<div>${child}</div>`;

        expect(el.outerHTML).to.equal('<div></div>');

        child.set(html`<span />`).then(() => {
            expect(el.outerHTML).to.equal('<div><span></span></div>');
            
            child.set(html`<em />`).then(() => {
                expect(el.outerHTML).to.equal('<div><em></em></div>');
                done();
            });
        });
    });

    it('should update multiple nodes', (done) => {
        const nodes = store();
        const el = html`<div>${nodes}</div>`;

        expect(el.outerHTML).to.equal('<div></div>');

        nodes.set(html`foo<span />bar<em />`).then(() => {
            expect(el.outerHTML).to.equal('<div>foo<span></span>bar<em></em></div>');
            
            nodes.set(html`<i />foo`).then(() => {
                expect(el.outerHTML).to.equal('<div><i></i>foo</div>');
                done();
            });
        });
    });

    it('should remove nodes by providing null or undefined', (done) => {
        const node = store('foo');
        const el = html`<div>${node}</div>`;

        expect(el.outerHTML).to.equal('<div>foo</div>');

        node.set(null).then(() => {
            expect(el.outerHTML).to.equal('<div></div>');

            node.set(html`<span />`).then(() => {
                expect(el.outerHTML).to.equal('<div><span></span></div>');
                
                node.set(undefined).then(() => {
                    expect(el.outerHTML).to.equal('<div></div>');
                    
                    node.set(html`<em />foo<i />`).then(() => {
                        expect(el.outerHTML).to.equal('<div><em></em>foo<i></i></div>');
                        
                        node.set(null).then(() => {
                            expect(el.outerHTML).to.equal('<div></div>');
                            done();
                        });
                    });
                });
            });
        });
    });

    it('should update an attribute', (done) => {
        const attr = store();
        const el = html`<div foo=${attr}></div>`;

        expect(el.outerHTML).to.equal('<div></div>');

        attr.set('bar').then(() => {
            expect(el.outerHTML).to.equal('<div foo="bar"></div>');
            done();
        });
    });

    it('should remove attributes by providing null, undefined, or false', (done) => {
        const attr = store('bar');
        const el = html`<div foo=${attr}></div>`;

        expect(el.outerHTML).to.equal('<div foo="bar"></div>');

        attr.set(null).then(() => {
            expect(el.outerHTML).to.equal('<div></div>');
            
            attr.set('baz').then(() => {
                expect(el.outerHTML).to.equal('<div foo="baz"></div>');
                
                attr.set(undefined).then(() => {
                    expect(el.outerHTML).to.equal('<div></div>');
                    
                    attr.set('qux').then(() => {
                        expect(el.outerHTML).to.equal('<div foo="qux"></div>');
                        
                        attr.set(false).then(() => {
                            expect(el.outerHTML).to.equal('<div></div>');
                            done();
                        });
                    });
                });
            });
        });
    });

    it('should update the class attribute as an array', (done) => {
        const className = store(['foo', 'bar']);
        const el = html`<div class=${className}></div>`;
        
        expect(el.className).to.equal('foo bar');

        className.set(['foo', 'baz', 'qux']).then(() => {
            expect(el.className).to.equal('foo baz qux');
            done();
        });
    });

    it('should update the class attribute as an object', (done) => {    
        const className = store({foo: true, bar: true, baz: true});
        const el = html`<div class=${className}></div>`;
        
        expect(el.className).to.equal('foo bar baz');

        className.set({foo: false, bar: true, baz: false, qux: true}).then(() => {
            expect(el.className).to.equal('bar qux');
            done();
        });
    });

    it('should update CSS styles as a string', (done) => {
        const style = store('width: 100px; height: 200px');
        const el = html`<div style=${style}></div>`;

        expect(el.outerHTML).to.equal('<div style="width: 100px; height: 200px;"></div>');

        style.set('width: 150px; background-color: rgb(20, 20, 20);').then(() => {
            expect(el.outerHTML).to.equal('<div style="width: 150px; background-color: rgb(20, 20, 20);"></div>');
            done();
        });
    });

    it('should update CSS styles as a key/value map', (done) => {
        const style = store({'padding-bottom': '10px', paddingTop: '5px'});
        const el = html`<div style=${style}></div>`;

        expect(el.outerHTML).to.equal('<div style="padding-bottom: 10px; padding-top: 5px;"></div>');

        style.set({paddingTop: '7px', 'padding-left': '12px'}).then(() => {
            expect(el.outerHTML).to.equal('<div style="padding-top: 7px; padding-left: 12px;"></div>');
            done();
        });
    });

    it('should remove a CSS style', (done) => {
        const style = store({width: '100px'});
        const el = html`<div style=${style}></div>`;

        expect(el.outerHTML).to.equal('<div style="width: 100px;"></div>');

        style.set({width: null}).then(() => {
            expect(el.outerHTML).to.equal('<div style=""></div>');
            done();
        });
    });

    it('should update CSS variables', (done) => {
        const style = store({color: 'var(--color)', '--color': 'red'});
        const el = html`<div style=${style}></div>`;

        document.body.appendChild(el);

        expect(el.style.color).to.equal('var(--color)');
        expect(window.getComputedStyle(el).getPropertyValue('color')).to.equal('rgb(255, 0, 0)');
        expect(window.getComputedStyle(el).getPropertyValue('--color')).to.equal('red');
        
        style.set({color: 'var(--color)', '--color': 'blue'}).then(() => {
            expect(el.style.color).to.equal('var(--color)');
            expect(window.getComputedStyle(el).getPropertyValue('color')).to.equal('rgb(0, 0, 255)');
            expect(window.getComputedStyle(el).getPropertyValue('--color')).to.equal('blue');

            document.body.removeChild(el);
            done();
        });
    });

    it('should update boolean attributes', (done) => {
        const checked = store(true);
        const el = html`<input type="radio" checked=${checked} />`;

        expect(el.outerHTML).to.equal('<input type="radio">');
        expect(el.checked).to.equal(true);

        checked.set(false).then(() => {
            expect(el.checked).to.equal(false);

            checked.set(true).then(() => {
                expect(el.checked).to.equal(true);
                done();
            });
        });
    });

    it('should update dynamic properties', (done) => {
        const value = store('foo');
        const el = html`<input type="text" value=${value} />`;

        expect(el.outerHTML).to.equal('<input type="text">');
        expect(el.value).to.equal('foo');

        value.set('bar').then(() => {
            expect(el.value).to.equal('bar');

            value.set('baz').then(() => {
                expect(el.value).to.equal('baz');
                done();
            });
        });
    });

    it('should update an event listener', (done) => {
        const clickHandler = store();
        const el = html`<div onclick=${clickHandler} />`;

        const addEventSpy = sinon.spy(el, 'addEventListener');

        const callback = sinon.spy();
        clickHandler.set(callback).then(() => {
            expect(addEventSpy.callCount).to.equal(1);
            expect(addEventSpy.args[0][0]).to.equal('click');
            expect(addEventSpy.args[0][1]).to.equal(callback);
            done();
        });
    });

    it('should remove an event listener', (done) => {
        const callback = sinon.spy();
        const clickHandler = store(callback);
        const el = html`<div onclick=${clickHandler} />`;

        const removeEventSpy = sinon.spy(el, 'removeEventListener');

        clickHandler.set(null).then(() => {
            expect(removeEventSpy.callCount).to.equal(1);
            expect(removeEventSpy.args[0][0]).to.equal('click');
            expect(removeEventSpy.args[0][1]).to.equal(callback);
            done();
        });
    });

    it('should update event listeners', (done) => {
        const clickHandler = store();
        const el = html`<div onclick=${clickHandler} />`;

        const event1 = new CustomEvent('click');
        const onClick1 = sinon.spy();
        const addEventSpy = sinon.spy(el, 'addEventListener');
        const removeEventSpy = sinon.spy(el, 'removeEventListener');

        clickHandler.set(onClick1).then(() => {
            el.dispatchEvent(event1);
            expect(onClick1.callCount).to.equal(1);
            const call1 = onClick1.getCall(0);
            expect(call1.thisValue).to.equal(el);
            expect(call1.args[0]).to.equal(event1);

            expect(addEventSpy.callCount).to.equal(1);
            expect(addEventSpy.args[0][0]).to.equal('click');
            expect(addEventSpy.args[0][1]).to.equal(onClick1);
            expect(removeEventSpy.callCount).to.equal(0);

            const event2 = new CustomEvent('click');
            const onClick2 = sinon.spy();

            clickHandler.set(onClick2).then(() => {
                el.dispatchEvent(event2);
                expect(onClick1.callCount).to.equal(1);
                expect(onClick2.callCount).to.equal(1);
                const call2 = onClick2.getCall(0);
                expect(call2.thisValue).to.equal(el);
                expect(call2.args[0]).to.equal(event2);

                expect(addEventSpy.callCount).to.equal(2);
                expect(addEventSpy.args[1][0]).to.equal('click');
                expect(addEventSpy.args[1][1]).to.equal(onClick2);
                expect(removeEventSpy.callCount).to.equal(1);
                expect(removeEventSpy.args[0][0]).to.equal('click');
                expect(removeEventSpy.args[0][1]).to.equal(onClick1);

                done();
            });
        });
    });

    it('should update around sibling nodes without inference', (done) => {
        const child = store('abc');
        const el = html`<div>foo<span />${child}baz<em /><p /></div>`;
        const foo = el.childNodes[0];
        const span = el.childNodes[1];
        const baz = el.childNodes[3];
        const em = el.childNodes[4];
        const p = el.childNodes[5];

        expect(el.outerHTML).to.equal('<div>foo<span></span>abcbaz<em></em><p></p></div>');
        expect(el.childNodes[0]).to.equal(foo);
        expect(el.childNodes[1]).to.equal(span);
        expect(el.childNodes[3]).to.equal(baz);
        expect(el.childNodes[4]).to.equal(em);
        expect(el.childNodes[5]).to.equal(p);

        child.set(html`<section />`).then(() => {
            expect(el.outerHTML).to.equal('<div>foo<span></span><section></section>baz<em></em><p></p></div>');
            expect(el.childNodes[0]).to.equal(foo);
            expect(el.childNodes[1]).to.equal(span);
            expect(el.childNodes[3]).to.equal(baz);
            expect(el.childNodes[4]).to.equal(em);
            expect(el.childNodes[5]).to.equal(p);

            child.set(html`<h1 /><h2 /><h3 />`).then(() => {
                expect(el.outerHTML).to.equal('<div>foo<span></span><h1></h1><h2></h2><h3></h3>baz<em></em><p></p></div>');
                expect(el.childNodes[0]).to.equal(foo);
                expect(el.childNodes[1]).to.equal(span);
                expect(el.childNodes[5]).to.equal(baz);
                expect(el.childNodes[6]).to.equal(em);
                expect(el.childNodes[7]).to.equal(p);
                done();
            });
        });
    });

    it('should update a text node around sibling text nodes', (done) => {
        const text = store('abc');
        const el = html`<div>foo${text}bar</div>`;
        const foo = el.childNodes[0];
        const baz = el.childNodes[2];
    
        expect(el.outerHTML).to.equal('<div>fooabcbar</div>');

        text.set(123).then(() => {
            expect(el.outerHTML).to.equal('<div>foo123bar</div>');
            expect(el.childNodes[0]).to.equal(foo);
            expect(el.childNodes[2]).to.equal(baz);
            done();
        });
    });

    it('should support stores in multiple nodes', (done) => {
        const text = store('foo');
        const div = html`<div>${text}</div>`;
        const span = html`<span>${text}</span>`;

        expect(div.outerHTML).to.equal('<div>foo</div>');
        expect(span.outerHTML).to.equal('<span>foo</span>');

        text.set('bar').then(() => {
            expect(div.outerHTML).to.equal('<div>bar</div>');
            expect(span.outerHTML).to.equal('<span>bar</span>');

            text.set('baz').then(() => {
                expect(div.outerHTML).to.equal('<div>baz</div>');
                expect(span.outerHTML).to.equal('<span>baz</span>');
                done();
            }); 
        });
    });

    it('should defer updates to use latest value', (done) => {
        const text = store('foo');
        const el = html`<div>${text}</div>`;

        expect(el.outerHTML).to.equal('<div>foo</div>');

        text.set('bar');
        text.set('baz');
        text.set('qux').then(() => {
            expect(el.outerHTML).to.equal('<div>qux</div>');
            done();
        });
    });

    it('should support derived stores', (done) => {
        const title = store('foo');
        const className = store('bar');
        const h1 = derived(title, (title) => html`<h1>${title}</h1>`);
        const section = derived(h1, (h1) => html`<section>${h1}</section>`);
        const el = html`<div class=${derived(className, (cls) => `foo ${cls}`)}>${section}</div>`;

        expect(el.outerHTML).to.equal('<div class="foo bar"><section><h1>foo</h1></section></div>');

        title.set('bar').then(() => {
            expect(el.outerHTML).to.equal('<div class="foo bar"><section><h1>bar</h1></section></div>');

            className.set('baz').then(() => {
                expect(el.outerHTML).to.equal('<div class="foo baz"><section><h1>bar</h1></section></div>');

                title.set('baz').then(() => {
                    expect(el.outerHTML).to.equal('<div class="foo baz"><section><h1>baz</h1></section></div>');
                    
                    className.set('qux').then(() => {
                        expect(el.outerHTML).to.equal('<div class="foo qux"><section><h1>baz</h1></section></div>');
                        done();
                    });
                });
            });
        });
    });
});
