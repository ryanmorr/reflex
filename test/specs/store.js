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

        expect(value.set('bar')).to.equal('bar');
        expect(value.get()).to.equal('bar');

        expect(value.set('baz')).to.equal('baz');
        expect(value.get()).to.equal('baz');
    });

    it('should update the internal value with a callback function', () => {
        const value = store(1);
        
        expect(value.get()).to.equal(1);

        expect(value.update((val) => val + 10)).to.equal(11);
        expect(value.get()).to.equal(11);

        expect(value.update((val) => val + 100)).to.equal(111);
        expect(value.get()).to.equal(111);
    });

    it('should call subscribers immediately and when the internal value changes', () => {
        const value = store(10);
        
        const spy = sinon.spy();
        value.subscribe(spy);

        expect(spy.callCount).to.equal(1);
        expect(spy.args[0][0]).to.equal(10);
        expect(spy.args[0][1]).to.equal(undefined);

        value.set(20);
        expect(spy.callCount).to.equal(2);
        expect(spy.args[1][0]).to.equal(20);
        expect(spy.args[1][1]).to.equal(10);

        value.update((val) => val + 100);
        expect(spy.callCount).to.equal(3);
        expect(spy.args[2][0]).to.equal(120);
        expect(spy.args[2][1]).to.equal(20);
    });

    it('should update a text node', (done) => {
        const text = store();
        const el = html`<div>${text}</div>`;

        expect(el.outerHTML).to.equal('<div></div>');

        text.set('foo');
        requestAnimationFrame(() => {
            expect(el.outerHTML).to.equal('<div>foo</div>');
            
            text.set('bar');
            requestAnimationFrame(() => {
                expect(el.outerHTML).to.equal('<div>bar</div>');
                done();
            });
        });
    });

    it('should update an element', (done) => {
        const child = store();
        const el = html`<div>${child}</div>`;

        expect(el.outerHTML).to.equal('<div></div>');

        child.set(html`<span />`);
        requestAnimationFrame(() => {
            expect(el.outerHTML).to.equal('<div><span></span></div>');
            
            child.set(html`<em />`);
            requestAnimationFrame(() => {
                expect(el.outerHTML).to.equal('<div><em></em></div>');
                done();
            });
        });
    });

    it('should update multiple nodes', (done) => {
        const nodes = store();
        const el = html`<div>${nodes}</div>`;

        expect(el.outerHTML).to.equal('<div></div>');

        nodes.set(html`foo<span />bar<em />`);
        requestAnimationFrame(() => {
            expect(el.outerHTML).to.equal('<div>foo<span></span>bar<em></em></div>');
            
            nodes.set(html`<i />foo`);
            requestAnimationFrame(() => {
                expect(el.outerHTML).to.equal('<div><i></i>foo</div>');
                done();
            });
        });
    });

    it('should remove nodes by providing null or undefined', (done) => {
        const node = store('foo');
        const el = html`<div>${node}</div>`;

        expect(el.outerHTML).to.equal('<div>foo</div>');

        node.set(null);
        requestAnimationFrame(() => {
            expect(el.outerHTML).to.equal('<div></div>');

            node.set(html`<span />`);
            requestAnimationFrame(() => {
                expect(el.outerHTML).to.equal('<div><span></span></div>');
                
                node.set(undefined);
                requestAnimationFrame(() => {
                    expect(el.outerHTML).to.equal('<div></div>');
                    
                    node.set(html`<em />foo<i />`);
                    requestAnimationFrame(() => {
                        expect(el.outerHTML).to.equal('<div><em></em>foo<i></i></div>');
                        
                        node.set(null);
                        requestAnimationFrame(() => {
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

        attr.set('bar');
        requestAnimationFrame(() => {
            expect(el.outerHTML).to.equal('<div foo="bar"></div>');
            done();
        });
    });

    it('should remove attributes by providing null, undefined, or false', (done) => {
        const attr = store('bar');
        const el = html`<div foo=${attr}></div>`;

        expect(el.outerHTML).to.equal('<div foo="bar"></div>');

        attr.set(null);
        requestAnimationFrame(() => {
            expect(el.outerHTML).to.equal('<div></div>');
            
            attr.set('baz');
            requestAnimationFrame(() => {
                expect(el.outerHTML).to.equal('<div foo="baz"></div>');
                
                attr.set(undefined);
                requestAnimationFrame(() => {
                    expect(el.outerHTML).to.equal('<div></div>');
                    
                    attr.set('qux');
                    requestAnimationFrame(() => {
                        expect(el.outerHTML).to.equal('<div foo="qux"></div>');
                        
                        attr.set(false);
                        requestAnimationFrame(() => {
                            expect(el.outerHTML).to.equal('<div></div>');
                            done();
                        });
                    });
                });
            });
        });
    });

    it('should update CSS styles as a string', (done) => {
        const style = store('width: 100px; height: 200px');
        const el = html`<div style=${style}></div>`;

        expect(el.outerHTML).to.equal('<div style="width: 100px; height: 200px;"></div>');

        style.set('width: 150px; background-color: rgb(20, 20, 20);');
        requestAnimationFrame(() => {
            expect(el.outerHTML).to.equal('<div style="width: 150px; background-color: rgb(20, 20, 20);"></div>');
            done();
        });
    });

    it('should update CSS styles as a key/value map', (done) => {
        const style = store({'padding-bottom': '10px', paddingTop: '5px'});
        const el = html`<div style=${style}></div>`;

        expect(el.outerHTML).to.equal('<div style="padding-bottom: 10px; padding-top: 5px;"></div>');

        style.set({paddingTop: '7px', width: '100px'});
        requestAnimationFrame(() => {
            expect(el.outerHTML).to.equal('<div style="padding-bottom: 10px; padding-top: 7px; width: 100px;"></div>');
            done();
        });
    });

    it('should remove a CSS style', (done) => {
        const style = store({width: '100px'});
        const el = html`<div style=${style}></div>`;

        expect(el.outerHTML).to.equal('<div style="width: 100px;"></div>');

        style.set({width: null});
        requestAnimationFrame(() => {
            expect(el.outerHTML).to.equal('<div style=""></div>');
            done();
        });
    });

    it('should update CSS variables', (done) => {
        const style = store({color: 'var(--color)', '--color': 'red'});
        const el = html`<div style=${style}></div>`;

        document.body.appendChild(el);
        requestAnimationFrame(() => {
            expect(el.style.color).to.equal('var(--color)');
            expect(window.getComputedStyle(el).getPropertyValue('color')).to.equal('rgb(255, 0, 0)');
            expect(window.getComputedStyle(el).getPropertyValue('--color')).to.equal('red');
            
            style.set({'--color': 'blue'});
            requestAnimationFrame(() => {
                expect(el.style.color).to.equal('var(--color)');
                expect(window.getComputedStyle(el).getPropertyValue('color')).to.equal('rgb(0, 0, 255)');
                expect(window.getComputedStyle(el).getPropertyValue('--color')).to.equal('blue');

                document.body.removeChild(el);
                done();
            });
        });
    });

    it('should update boolean attributes', (done) => {
        const checked = store(true);
        const el = html`<input type="radio" checked=${checked} />`;

        expect(el.outerHTML).to.equal('<input type="radio">');
        expect(el.checked).to.equal(true);

        checked.set(false);
        requestAnimationFrame(() => {
            expect(el.checked).to.equal(false);

            checked.set(true);
            requestAnimationFrame(() => {
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

        value.set('bar');
        requestAnimationFrame(() => {
            expect(el.value).to.equal('bar');

            value.set('baz');
            requestAnimationFrame(() => {
                expect(el.value).to.equal('baz');
                done();
            });
        });
    });

    it('should update an event listener', (done) => {
        const onClick = store();
        const el = html`<div onclick=${onClick} />`;

        const addEventListenerSpy = sinon.spy(el, 'addEventListener');

        const callback = sinon.spy();
        onClick.set(callback);

        requestAnimationFrame(() => {
            expect(addEventListenerSpy.callCount).to.equal(1);
            expect(addEventListenerSpy.args[0][0]).to.equal('click');
            expect(addEventListenerSpy.args[0][1]).to.equal(callback);
            done();
        });
    });

    it('should remove an event listener', (done) => {
        const callback = sinon.spy();
        const onClick = store(callback);
        const el = html`<div onclick=${onClick} />`;

        const removeEventListenerSpy = sinon.spy(el, 'removeEventListener');

        onClick.set(null);

        requestAnimationFrame(() => {
            expect(removeEventListenerSpy.callCount).to.equal(1);
            expect(removeEventListenerSpy.args[0][0]).to.equal('click');
            expect(removeEventListenerSpy.args[0][1]).to.equal(callback);
            done();
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

        child.set(html`<section />`);
        requestAnimationFrame(() => {
            expect(el.outerHTML).to.equal('<div>foo<span></span><section></section>baz<em></em><p></p></div>');
            expect(el.childNodes[0]).to.equal(foo);
            expect(el.childNodes[1]).to.equal(span);
            expect(el.childNodes[3]).to.equal(baz);
            expect(el.childNodes[4]).to.equal(em);
            expect(el.childNodes[5]).to.equal(p);

            child.set(html`<h1 /><h2 /><h3 />`);
            requestAnimationFrame(() => {
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

        text.set(123);
        requestAnimationFrame(() => {
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

        text.set('bar');
        requestAnimationFrame(() => {
            expect(div.outerHTML).to.equal('<div>bar</div>');
            expect(span.outerHTML).to.equal('<span>bar</span>');

            text.set('baz');
            requestAnimationFrame(() => {
                expect(div.outerHTML).to.equal('<div>baz</div>');
                expect(span.outerHTML).to.equal('<span>baz</span>');
                done();
            }); 
        });
    });
});
