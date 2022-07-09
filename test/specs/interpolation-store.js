import { html, val, derived, tick } from '../../src/reflex';

describe('interpolation-store', () => {
    it('should render a store that as a text node', () => {
        const text = val('foo');
        const el = html`<div>${text}</div>`;

        expect(el.outerHTML).to.equal('<div>foo</div>');
    });

    it('should render a store as an attribute', () => {
        const attr = val('foo');
        const el = html`<div id=${attr}></div>`;

        expect(el.outerHTML).to.equal('<div id="foo"></div>');
    });

    it('should render a store that contains a text node', () => {
        const text = val(document.createTextNode('foo'));
        const el = html`<div>${text}</div>`;

        expect(el.outerHTML).to.equal('<div>foo</div>');
    });

    it('should render a store that contains an element', () => {
        const span = val(document.createElement('span'));
        const el = html`<div>${span}</div>`;

        expect(el.outerHTML).to.equal('<div><span></span></div>');
    });

    it('should render a store that contains a document fragment', () => {
        const frag = val(html`<i></i><em></em>`);

        const el = html`<div>${frag}</div>`;

        expect(el.outerHTML).to.equal('<div><i></i><em></em></div>');
    });

    it('should update a text node', (done) => {
        const text = val();
        const el = html`<div>${text}</div>`;

        expect(el.outerHTML).to.equal('<div></div>');

        text.set('foo');
        
        tick().then(() => {
            expect(el.outerHTML).to.equal('<div>foo</div>');
            
            text.set(123);
        
            tick().then(() => {
                expect(el.outerHTML).to.equal('<div>123</div>');
                
                text.set(false);
        
                tick().then(() => {
                    expect(el.outerHTML).to.equal('<div>false</div>');

                    done();
                });
            });
        });
    });

    it('should update an element', (done) => {
        const child = val();
        const el = html`<div>${child}</div>`;

        expect(el.outerHTML).to.equal('<div></div>');

        child.set(html`<span />`);
        
        tick().then(() => {
            expect(el.outerHTML).to.equal('<div><span></span></div>');
            
            child.set(html`<em />`);
        
            tick().then(() => {
                expect(el.outerHTML).to.equal('<div><em></em></div>');

                done();
            });
        });
    });

    it('should update a text node with a function', (done) => {
        const child = val(() => 'foo');
        const el = html`<div>${child}</div>`;

        expect(el.outerHTML).to.equal('<div>foo</div>');

        child.set(() => 'bar');
        
        tick().then(() => {
            expect(el.outerHTML).to.equal('<div>bar</div>');
            
            child.set(() => html`<em />`);
        
            tick().then(() => {
                expect(el.outerHTML).to.equal('<div><em></em></div>');

                done();
            });
        });
    });

    it('should update multiple nodes', (done) => {
        const nodes = val();
        const el = html`<div>${nodes}</div>`;

        expect(el.outerHTML).to.equal('<div></div>');

        nodes.set(html`foo<span />bar<em />`);
        
        tick().then(() => {
            expect(el.outerHTML).to.equal('<div>foo<span></span>bar<em></em></div>');
            
            nodes.set(html`<i />foo`);
        
            tick().then(() => {
                expect(el.outerHTML).to.equal('<div><i></i>foo</div>');

                done();
            });
        });
    });

    it('should update multiple nodes with a function', (done) => {
        const nodes = val();
        const el = html`<div>${nodes}</div>`;

        expect(el.outerHTML).to.equal('<div></div>');

        nodes.set(() => html`bar<span />baz`);
        
        tick().then(() => {
            expect(el.outerHTML).to.equal('<div>bar<span></span>baz</div>');
            
            nodes.set(() => [html`<i />`, 'qux']);
        
            tick().then(() => {
                expect(el.outerHTML).to.equal('<div><i></i>qux</div>');

                done();
            });
        });
    });

    it('should remove nodes by providing null or undefined', (done) => {
        const node = val('foo');
        const el = html`<div>${node}</div>`;

        expect(el.outerHTML).to.equal('<div>foo</div>');

        node.set(null);
        
        tick().then(() => {
            expect(el.outerHTML).to.equal('<div></div>');

            node.set(html`<span />`);
        
            tick().then(() => {
                expect(el.outerHTML).to.equal('<div><span></span></div>');
                
                node.set(undefined);
        
                tick().then(() => {
                    expect(el.outerHTML).to.equal('<div></div>');
                    
                    node.set(html`<em />foo<i />`);
        
                    tick().then(() => {
                        expect(el.outerHTML).to.equal('<div><em></em>foo<i></i></div>');
                        
                        node.set(null);
        
                        tick().then(() => {
                            expect(el.outerHTML).to.equal('<div></div>');

                            done();
                        });
                    });
                });
            });
        });
    });

    it('should remove nodes if a function returns null or undefined', (done) => {
        const node = val('foo');
        const el = html`<div>${node}</div>`;

        expect(el.outerHTML).to.equal('<div>foo</div>');

        node.set(() => null);
        
        tick().then(() => {
            expect(el.outerHTML).to.equal('<div></div>');

            node.set(html`<span />`);
        
            tick().then(() => {
                expect(el.outerHTML).to.equal('<div><span></span></div>');
                
                node.set(() => undefined);
        
                tick().then(() => {
                    expect(el.outerHTML).to.equal('<div></div>');
                    
                    node.set(html`<em />foo<i />`);
        
                    tick().then(() => {
                        expect(el.outerHTML).to.equal('<div><em></em>foo<i></i></div>');
                        
                        node.set(() => null);
        
                        tick().then(() => {
                            expect(el.outerHTML).to.equal('<div></div>');

                            done();
                        });
                    });
                });
            });
        });
    });

    it('should update an attribute', (done) => {
        const attr = val();
        const el = html`<div foo=${attr}></div>`;

        expect(el.outerHTML).to.equal('<div></div>');

        attr.set('bar');
        
        tick().then(() => {
            expect(el.outerHTML).to.equal('<div foo="bar"></div>');

            done();
        });
    });

    it('should update an attribute with a function', (done) => {
        const attr = val();
        const el = html`<div foo=${attr}></div>`;

        expect(el.outerHTML).to.equal('<div></div>');

        const fn = sinon.spy(() => 'bar');

        attr.set(fn);
        
        tick().then(() => {
            expect(el.outerHTML).to.equal('<div foo="bar"></div>');
            expect(fn.callCount).to.equal(1);
            expect(fn.args[0][0]).to.equal(el);

            done();
        });
    });

    it('should remove attributes by providing null, undefined, or false', (done) => {
        const attr = val('bar');
        const el = html`<div foo=${attr}></div>`;

        expect(el.outerHTML).to.equal('<div foo="bar"></div>');

        attr.set(null);
        
        tick().then(() => {
            expect(el.outerHTML).to.equal('<div></div>');
            
            attr.set('baz');
        
            tick().then(() => {
                expect(el.outerHTML).to.equal('<div foo="baz"></div>');
                
                attr.set(undefined);
        
                tick().then(() => {
                    expect(el.outerHTML).to.equal('<div></div>');
                    
                    attr.set('qux');
        
                    tick().then(() => {
                        expect(el.outerHTML).to.equal('<div foo="qux"></div>');
                        
                        attr.set(false);
        
                        tick().then(() => {
                            expect(el.outerHTML).to.equal('<div></div>');

                            done();
                        });
                    });
                });
            });
        });
    });

    it('should remove attributes if a function returns null, undefined, or false', (done) => {
        const attr = val('bar');
        const el = html`<div foo=${attr}></div>`;

        expect(el.outerHTML).to.equal('<div foo="bar"></div>');

        const nullSpy = sinon.spy(() => null);
        const undefinedSpy = sinon.spy(() => undefined);
        const falseSpy = sinon.spy(() => false);

        attr.set(nullSpy);
        
        tick().then(() => {
            expect(el.outerHTML).to.equal('<div></div>');
            expect(nullSpy.callCount).to.equal(1);
            expect(nullSpy.args[0][0]).to.equal(el);
            
            attr.set('baz');
        
            tick().then(() => {
                expect(el.outerHTML).to.equal('<div foo="baz"></div>');
                
                attr.set(undefinedSpy);
        
                tick().then(() => { 
                    expect(el.outerHTML).to.equal('<div></div>');
                    expect(undefinedSpy.callCount).to.equal(1);
                    expect(undefinedSpy.args[0][0]).to.equal(el);
                    
                    attr.set('qux');
        
                    tick().then(() => {
                        expect(el.outerHTML).to.equal('<div foo="qux"></div>');
                        
                        attr.set(falseSpy);
        
                        tick().then(() => {
                            expect(el.outerHTML).to.equal('<div></div>');
                            expect(falseSpy.callCount).to.equal(1);
                            expect(falseSpy.args[0][0]).to.equal(el);

                            done();
                        });
                    });
                });
            });
        });
    });

    it('should update the class attribute with an array', (done) => {
        const className = val(['foo', 'bar']);
        const el = html`<div class=${className}></div>`;
        
        expect(el.className).to.equal('foo bar');

        className.set(['foo', 'baz', 'qux']);
        
        tick().then(() => {
            expect(el.className).to.equal('foo baz qux');

            done();
        });
    });

    it('should update the class attribute with an object', (done) => {    
        const className = val({foo: true, bar: true, baz: true});
        const el = html`<div class=${className}></div>`;
        
        expect(el.className).to.equal('foo bar baz');

        className.set({foo: false, bar: true, baz: false, qux: true});
        
        tick().then(() => {
            expect(el.className).to.equal('bar qux');

            done();
        });
    });

    it('should update the class attribute with a function', (done) => {
        const className = val();
        const el = html`<div class=${className}></div>`;
        
        expect(el.className).to.equal('');

        const fn1 = sinon.spy(() => ['foo', 'bar']);

        className.set(fn1);
        
        tick().then(() => {
            expect(el.className).to.equal('foo bar');
            expect(fn1.callCount).to.equal(1);
            expect(fn1.args[0][0]).to.equal(el);

            const fn2 = sinon.spy(() => ({foo: true, bar: false, baz: true, qux: true}));
            
            className.set(fn2);
        
            tick().then(() => {
                expect(el.className).to.equal('foo baz qux');
                expect(fn2.callCount).to.equal(1);
                expect(fn2.args[0][0]).to.equal(el);

                done();
            });
        });
    });

    it('should update CSS styles with a string', (done) => {
        const style = val('width: 100px; height: 200px');
        const el = html`<div style=${style}></div>`;

        expect(el.outerHTML).to.equal('<div style="width: 100px; height: 200px;"></div>');

        style.set('width: 150px; background-color: rgb(20, 20, 20);');
        
        tick().then(() => {
            expect(el.outerHTML).to.equal('<div style="width: 150px; background-color: rgb(20, 20, 20);"></div>');

            done();
        });
    });

    it('should update CSS styles with a key/value map', (done) => {
        const style = val({'padding-bottom': '10px', paddingTop: '5px'});
        const el = html`<div style=${style}></div>`;

        expect(el.outerHTML).to.equal('<div style="padding-bottom: 10px; padding-top: 5px;"></div>');

        style.set({paddingTop: '7px', 'padding-left': '12px'});
        
        tick().then(() => {
            expect(el.outerHTML).to.equal('<div style="padding-top: 7px; padding-left: 12px;"></div>');

            done();
        });
    });

    it('should update CSS styles with a function', (done) => {
        const style = val();
        const el = html`<div style=${style}></div>`;

        expect(el.outerHTML).to.equal('<div></div>');

        const fn1 = sinon.spy(() => 'width: 43px; height: 86px');

        style.set(fn1);
        
        tick().then(() => {
            expect(el.outerHTML).to.equal('<div style="width: 43px; height: 86px;"></div>');
            expect(fn1.callCount).to.equal(1);
            expect(fn1.args[0][0]).to.equal(el);

            const fn2 = sinon.spy(() => ({width: '68px', paddingTop: '12px'}));
            
            style.set(fn2);
        
            tick().then(() => {
                expect(el.outerHTML).to.equal('<div style="width: 68px; height: 86px; padding-top: 12px;"></div>');
                expect(fn2.callCount).to.equal(1);
                expect(fn2.args[0][0]).to.equal(el);

                done();
            });
        });
    });

    it('should remove a CSS style', (done) => {
        const style = val({width: '100px'});
        const el = html`<div style=${style}></div>`;

        expect(el.outerHTML).to.equal('<div style="width: 100px;"></div>');

        style.set({width: null});
        
        tick().then(() => {
            expect(el.outerHTML).to.equal('<div style=""></div>');

            done();
        });
    });

    it('should remove a CSS style with a function', (done) => {
        const style = val({width: '100px'});
        const el = html`<div style=${style}></div>`;

        expect(el.outerHTML).to.equal('<div style="width: 100px;"></div>');

        const fn = sinon.spy(() => ({width: null}));

        style.set(fn);
        
        tick().then(() => {
            expect(el.outerHTML).to.equal('<div style=""></div>');
            expect(fn.callCount).to.equal(1);
            expect(fn.args[0][0]).to.equal(el);

            done();
        });
    });

    it('should update CSS variables', (done) => {
        const style = val({color: 'var(--color)', '--color': 'red'});
        const el = html`<div style=${style}></div>`;

        document.body.appendChild(el);

        expect(el.style.color).to.equal('var(--color)');
        expect(window.getComputedStyle(el).getPropertyValue('color')).to.equal('rgb(255, 0, 0)');
        expect(window.getComputedStyle(el).getPropertyValue('--color')).to.equal('red');
        
        style.set({color: 'var(--color)', '--color': 'blue'});
        
        tick().then(() => {
            expect(el.style.color).to.equal('var(--color)');
            expect(window.getComputedStyle(el).getPropertyValue('color')).to.equal('rgb(0, 0, 255)');
            expect(window.getComputedStyle(el).getPropertyValue('--color')).to.equal('blue');

            document.body.removeChild(el);
            done();
        });
    });

    it('should update a boolean attribute', (done) => {
        const checked = val(true);
        const el = html`<input type="radio" checked=${checked} />`;

        expect(el.outerHTML).to.equal('<input type="radio">');
        expect(el.checked).to.equal(true);

        checked.set(false);
        
        tick().then(() => {
            expect(el.checked).to.equal(false);

            checked.set(true);
        
            tick().then(() => {
                expect(el.checked).to.equal(true);

                done();
            });
        });
    });

    it('should update a boolean attribute with a function', (done) => {
        const checked = val(true);
        const el = html`<input type="radio" checked=${checked} />`;

        expect(el.checked).to.equal(true);

        const fn = sinon.spy(() => false);

        checked.set(fn);
        
        tick().then(() => {
            expect(el.checked).to.equal(false);
            expect(fn.callCount).to.equal(1);
            expect(fn.args[0][0]).to.equal(el);

            done();
        });
    });

    it('should update a DOM property', (done) => {
        const value = val('foo');
        const el = html`<input type="text" value=${value} />`;

        expect(el.outerHTML).to.equal('<input type="text">');
        expect(el.value).to.equal('foo');

        value.set('bar');
        
        tick().then(() => {
            expect(el.value).to.equal('bar');

            value.set('baz');
        
            tick().then(() => {
                expect(el.value).to.equal('baz');

                done();
            });
        });
    });

    it('should update a DOM property with a function', (done) => {
        const value = val();
        const el = html`<input type="text" value=${value} />`;

        expect(el.value).to.equal('');

        const fn = sinon.spy(() => 'foo');

        value.set(fn);
        
        tick().then(() => {
            expect(el.value).to.equal('foo');
            expect(fn.callCount).to.equal(1);
            expect(fn.args[0][0]).to.equal(el);

            done();
        });
    });

    it('should add an event listener', (done) => {
        const clickHandler = val();
        const el = html`<div onclick=${clickHandler} />`;

        const addEventSpy = sinon.spy(el, 'addEventListener');

        const fn = sinon.spy();
        clickHandler.set(fn);
        
        tick().then(() => {
            expect(addEventSpy.callCount).to.equal(1);
            expect(addEventSpy.args[0][0]).to.equal('click');
            expect(addEventSpy.args[0][1]).to.equal(fn);

            done();
        });
    });

    it('should remove an event listener', (done) => {
        const fn = sinon.spy();
        const clickHandler = val(fn);
        const el = html`<div onclick=${clickHandler} />`;

        const removeEventSpy = sinon.spy(el, 'removeEventListener');

        clickHandler.set(null);
        
        tick().then(() => {
            expect(removeEventSpy.callCount).to.equal(1);
            expect(removeEventSpy.args[0][0]).to.equal('click');
            expect(removeEventSpy.args[0][1]).to.equal(fn);

            done();
        });
    });

    it('should add and remove event listeners', (done) => {
        const clickHandler = val();
        const el = html`<div onclick=${clickHandler} />`;

        const event1 = new CustomEvent('click');
        const onClick1 = sinon.spy();
        const addEventSpy = sinon.spy(el, 'addEventListener');
        const removeEventSpy = sinon.spy(el, 'removeEventListener');

        clickHandler.set(onClick1);
        
        tick().then(() => {
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

            clickHandler.set(onClick2);
        
            tick().then(() => {
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
        const child = val('abc');
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
        
        tick().then(() => {
            expect(el.outerHTML).to.equal('<div>foo<span></span><section></section>baz<em></em><p></p></div>');
            expect(el.childNodes[0]).to.equal(foo);
            expect(el.childNodes[1]).to.equal(span);
            expect(el.childNodes[3]).to.equal(baz);
            expect(el.childNodes[4]).to.equal(em);
            expect(el.childNodes[5]).to.equal(p);

            child.set(html`<h1 /><h2 /><h3 />`);
        
            tick().then(() => {
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
        const text = val('abc');
        const el = html`<div>foo${text}bar</div>`;
        const foo = el.childNodes[0];
        const baz = el.childNodes[2];
    
        expect(el.outerHTML).to.equal('<div>fooabcbar</div>');

        text.set(123);
        
        tick().then(() => {
            expect(el.outerHTML).to.equal('<div>foo123bar</div>');
            expect(el.childNodes[0]).to.equal(foo);
            expect(el.childNodes[2]).to.equal(baz);

            done();
        });
    });

    it('should update a text node of an SVG element', (done) => {
        const text = val();
        const el = html`<svg><circle cx="50" cy="50" r="40">${text}</circle></svg>`;
    
        expect(el.outerHTML).to.equal('<svg><circle cx="50" cy="50" r="40"></circle></svg>');
    
        text.set('foo');
        
        tick().then(() => {
            expect(el.outerHTML).to.equal('<svg><circle cx="50" cy="50" r="40">foo</circle></svg>');
            
            text.set('bar');
        
            tick().then(() => {
                expect(el.outerHTML).to.equal('<svg><circle cx="50" cy="50" r="40">bar</circle></svg>');

                done();
            });
        });
    });
    
    it('should update an SVG element', (done) => {
        const child = val();
        const el = html`<svg>${child}</svg>`;
    
        expect(el.outerHTML).to.equal('<svg></svg>');
    
        child.set(html`<circle cx="50" cy="50" r="40" />`);
        
        tick().then(() => {
            expect(el.outerHTML).to.equal('<svg><circle cx="50" cy="50" r="40"></circle></svg>');
            
            child.set(html`<rect width="100" height="100" />`);
        
            tick().then(() => {
                expect(el.outerHTML).to.equal('<svg><rect width="100" height="100"></rect></svg>');

                done();
            });
        });
    });
    
    it('should update an attribute of an SVG element', (done) => {
        const radius = val(50);
        const el = html`<svg><circle cx="50" cy="50" r=${radius}></circle></svg>`;
    
        expect(el.outerHTML).to.equal('<svg><circle cx="50" cy="50" r="50"></circle></svg>');
    
        radius.set(70);
        
        tick().then(() => {
            expect(el.outerHTML).to.equal('<svg><circle cx="50" cy="50" r="70"></circle></svg>');

            done();
        });
    });
    
    it('should not update a property of an SVG element', (done) => {
        const textContent = val('foo');
        const el = html`<svg><circle cx="50" cy="50" r="40" fill="red" textContent=${textContent}></circle></svg>`;
        const circle = el.querySelector('circle');
    
        expect(el.outerHTML).to.equal('<svg><circle cx="50" cy="50" r="40" fill="red" textContent="foo"></circle></svg>');
        expect(circle.getAttribute('textContent')).to.equal('foo');
        expect(circle.textContent).to.equal('');
    
        textContent.set('bar');
        
        tick().then(() => {
            expect(el.outerHTML).to.equal('<svg><circle cx="50" cy="50" r="40" fill="red" textContent="bar"></circle></svg>');
            expect(circle.getAttribute('textContent')).to.equal('bar');
            expect(circle.textContent).to.equal('');

            done();
        });
    });

    it('should support a store interpolated into multiple elements', (done) => {
        const text = val('foo');
        const div = html`<div>${text}</div>`;
        const span = html`<span>${text}</span>`;

        expect(div.outerHTML).to.equal('<div>foo</div>');
        expect(span.outerHTML).to.equal('<span>foo</span>');

        text.set('bar');
        
        tick().then(() => {
            expect(div.outerHTML).to.equal('<div>bar</div>');
            expect(span.outerHTML).to.equal('<span>bar</span>');

            text.set('baz');
        
            tick().then(() => {
                expect(div.outerHTML).to.equal('<div>baz</div>');
                expect(span.outerHTML).to.equal('<span>baz</span>');

                done();
            }); 
        });
    });

    it('should escape HTML strings', (done) => {
        /* eslint-disable quotes */
        const text = val();
        const el = html`<div>${text}</div>`;

        expect(el.outerHTML).to.equal('<div></div>');

        text.set(`<span id="foo"></span>`);
        
        tick().then(() => {
            expect(el.outerHTML).to.equal('<div>&lt;span id="foo"&gt;&lt;/span&gt;</div>');
            
            text.set(`<em class="bar">this & that</em>`);
        
            tick().then(() => {
                expect(el.outerHTML).to.equal('<div>&lt;em class="bar"&gt;this &amp; that&lt;/em&gt;</div>');

                done();
            });
        });
        /* eslint-enable quotes */
    });

    it('should defer updates to use the latest value', (done) => {
        const text = val('foo');
        const el = html`<div>${text}</div>`;

        expect(el.outerHTML).to.equal('<div>foo</div>');

        text.set('bar');
        text.set('baz');
        text.set('qux');
        
        tick().then(() => {
            expect(el.outerHTML).to.equal('<div>qux</div>');

            done();
        });
    });

    it('should support derived stores', (done) => {
        const title = val('foo');
        const className = val('bar');
        const h1 = derived(title, (title) => html`<h1>${title}</h1>`);
        const section = derived(h1, (h1) => html`<section>${h1}</section>`);
        const el = html`<div class=${derived(className, (cls) => `foo ${cls}`)}>${section}</div>`;

        expect(el.outerHTML).to.equal('<div class="foo bar"><section><h1>foo</h1></section></div>');

        title.set('bar');
        
        tick().then(() => {
            expect(el.outerHTML).to.equal('<div class="foo bar"><section><h1>bar</h1></section></div>');

            className.set('baz');
        
            tick().then(() => {
                expect(el.outerHTML).to.equal('<div class="foo baz"><section><h1>bar</h1></section></div>');

                title.set('baz');
        
                tick().then(() => {
                    expect(el.outerHTML).to.equal('<div class="foo baz"><section><h1>baz</h1></section></div>');
                    
                    className.set('qux');
        
                    tick().then(() => {
                        expect(el.outerHTML).to.equal('<div class="foo qux"><section><h1>baz</h1></section></div>');

                        done();
                    });
                });
            });
        });
    });

    it('should support custom stores that have a subscribe method', (done) => {
        const customStore = (value) => {
            const subscribers = [];
            const callback = (val) => {
                if (val === undefined) {
                    return value;
                }
                value = val;
                subscribers.slice().forEach((subscriber) => subscriber(value));
            };
            callback.subscribe = (callback) => {
                if (!subscribers.includes(callback)) {
                    subscribers.push(callback);
                    callback(value);
                    return () => {
                        const index = subscribers.indexOf(callback);
                        if (index !== -1) {
                            subscribers.splice(index, 1);
                        }
                    };
                }
            };
            return callback;
        };

        const value = customStore('foo');
        const div = html`<div id=${value}></div>`;
        const span = html`<span>${value}</span>`;

        expect(div.outerHTML).to.equal('<div id="foo"></div>');
        expect(span.outerHTML).to.equal('<span>foo</span>');

        value('bar');

        tick().then(() => {
            expect(div.outerHTML).to.equal('<div id="bar"></div>');
            expect(span.outerHTML).to.equal('<span>bar</span>');

            value('baz');

            tick().then(() => {
                expect(div.outerHTML).to.equal('<div id="baz"></div>');
                expect(span.outerHTML).to.equal('<span>baz</span>');

                done();
            }); 
        });
    });

    it('should update a text node with nested functions', (done) => {
        const child = val();
        const el = html`<div>${child}</div>`;

        expect(el.outerHTML).to.equal('<div></div>');

        child.set(() => () => () => 'foo');
        
        tick().then(() => {
            expect(el.outerHTML).to.equal('<div>foo</div>');

            done();
        });
    });

    it('should update an attribute with nested functions', (done) => {
        const attr = val();
        const el = html`<div foo=${attr}></div>`;

        expect(el.outerHTML).to.equal('<div></div>');

        const fn1 = sinon.spy(() => 'bar');
        const fn2 = sinon.spy(fn1);
        const fn3 = sinon.spy(fn2);

        attr.set(fn3);
        
        tick().then(() => {
            expect(el.outerHTML).to.equal('<div foo="bar"></div>');
            expect(fn1.callCount).to.equal(1);
            expect(fn1.args[0][0]).to.equal(el);
            expect(fn2.callCount).to.equal(1);
            expect(fn2.args[0][0]).to.equal(el);
            expect(fn3.callCount).to.equal(1);
            expect(fn3.args[0][0]).to.equal(el);

            done();
        });
    });

    it('should render a text node for a store that contains a promise', (done) => {
        const promise = Promise.resolve('foo');
        const store = val(promise);
        const el = html`<div>${store}</div>`;
    
        expect(el.outerHTML).to.equal('<div></div>');
    
        promise.then(tick).then(() => {
            expect(el.outerHTML).to.equal('<div>foo</div>');
    
            done();
        });
    });

    it('should render an element for a store that contains a promise', (done) => {
        const promise = Promise.resolve(html`<i />`);
        const store = val(promise);
        const el = html`<div>${store}</div>`;

        expect(el.outerHTML).to.equal('<div></div>');

        promise.then(tick).then(() => {
            expect(el.outerHTML).to.equal('<div><i></i></div>');

            done();
        });
    });

    it('should render a document fragment for a store that contains a promise', (done) => {
        const promise = Promise.resolve(html`foo<span />bar<em />`);
        const store = val(promise);
        const el = html`<div>${store}</div>`;

        expect(el.outerHTML).to.equal('<div></div>');

        promise.then(tick).then(() => {
            expect(el.outerHTML).to.equal('<div>foo<span></span>bar<em></em></div>');

            done();
        });
    });

    it('should render an attribute for a store that contains a promise', (done) => {
        const promise = Promise.resolve('foo');
        const store = val(promise);
        const el = html`<div id=${store}></div>`;
    
        expect(el.outerHTML).to.equal('<div></div>');
    
        promise.then(tick).then(() => {
            expect(el.outerHTML).to.equal('<div id="foo"></div>');
    
            done();
        });
    });

    it('should update an element for a store that contains a promise', (done) => {
        const store = val(Promise.resolve('foo'));
        const el = html`<div>${store}</div>`;
    
        expect(el.outerHTML).to.equal('<div></div>');
    
        store.get().then(tick).then(() => {
            expect(el.outerHTML).to.equal('<div>foo</div>');

            store.set(Promise.resolve(html`<span />bar<em />`));

            expect(el.outerHTML).to.equal('<div>foo</div>');
    
            store.get().then(tick).then(() => {
                expect(el.outerHTML).to.equal('<div><span></span>bar<em></em></div>');
        
                done();
            });
        });
    });

    it('should update an attribute for a store that contains a promise', (done) => {
        const className = val(Promise.resolve('foo'));
        const el = html`<div class=${className}></div>`;
    
        expect(el.outerHTML).to.equal('<div></div>');
    
        className.get().then(tick).then(() => {
            expect(el.outerHTML).to.equal('<div class="foo"></div>');

            className.set(Promise.resolve('bar'));

            expect(el.outerHTML).to.equal('<div class="foo"></div>');
    
            className.get().then(tick).then(() => {
                expect(el.outerHTML).to.equal('<div class="bar"></div>');
        
                done();
            });
        });
    });

    it('should update multiple interpolations of the same store that contains a promise', (done) => {
        const value = val(Promise.resolve('foo'));
        const el = html`<div id=${value}>${value}</div>`;
    
        expect(el.outerHTML).to.equal('<div></div>');
    
        value.get().then(tick).then(() => {
            expect(el.outerHTML).to.equal('<div id="foo">foo</div>');

            value.set(Promise.resolve('bar'));

            expect(el.outerHTML).to.equal('<div id="foo">foo</div>');
    
            value.get().then(tick).then(() => {
                expect(el.outerHTML).to.equal('<div id="bar">bar</div>');
        
                done();
            });
        });
    });

    it('should not render an element if a store contains a rejected promise', (done) => {
        const promise = Promise.reject();
        const store = val(promise);
        const el = html`<div>${store}</div>`;
    
        expect(el.outerHTML).to.equal('<div></div>');
    
        promise.catch(tick).then(() => {
            expect(el.outerHTML).to.equal('<div></div>');
    
            done();
        });
    });

    it('should not set an attribute if a store contains a rejected promise', (done) => {
        const promise = Promise.reject();
        const id = val(promise);
        const el = html`<div id=${id}></div>`;
    
        expect(el.outerHTML).to.equal('<div></div>');
    
        promise.catch(tick).then(() => {
            expect(el.outerHTML).to.equal('<div></div>');
    
            done();
        });
    });

    it('should not render an element if a store that contains a promise that resolves with a value of null or undefined', (done) => {
        const nullPromise = Promise.resolve(null);
        const undefinedPromise = Promise.resolve(undefined);
        const nullStore = val(nullPromise);
        const undefinedStore = val(undefinedPromise);
        const el = html`<div>${nullStore}${undefinedStore}</div>`;
    
        expect(el.outerHTML).to.equal('<div></div>');
    
        Promise.all([nullPromise, undefinedPromise]).then(tick).then(() => {
            expect(el.outerHTML).to.equal('<div></div>');
    
            done();
        });
    });

    it('should not set an attribute if a store that contains a promise that resolves with a value of null, undefined, or false', (done) => {
        const nullPromise = Promise.resolve(null);
        const undefinedPromise = Promise.resolve(undefined);
        const falsePromise = Promise.resolve(false);
        const foo = val(nullPromise);
        const bar = val(undefinedPromise);
        const baz = val(falsePromise);
        const el = html`<div foo=${foo} bar=${bar} baz=${baz}></div>`;
    
        expect(el.outerHTML).to.equal('<div></div>');
    
        Promise.all([nullPromise, undefinedPromise, falsePromise]).then(tick).then(() => {
            expect(el.outerHTML).to.equal('<div></div>');
    
            done();
        });
    });

    it('should remove nodes if a store that contains a promise resolves with a value of null or undefined', (done) => {
        const store = val('foo');
        const el = html`<div>${store}</div>`;
    
        expect(el.outerHTML).to.equal('<div>foo</div>');

        const nullPromise = Promise.resolve(null);
        store.set(nullPromise);
    
        nullPromise.then(tick).then(() => {
            expect(el.outerHTML).to.equal('<div></div>');

            store.set('bar');
    
            tick().then(() => {
                expect(el.outerHTML).to.equal('<div>bar</div>');
                
                const undefinedPromise = Promise.resolve(undefined);
                store.set(undefinedPromise);

                expect(el.outerHTML).to.equal('<div>bar</div>');

                undefinedPromise.then(tick).then(() => {
                    expect(el.outerHTML).to.equal('<div></div>');

                    done();
                });
            });
        });
    });

    it('should remove an attribute if a store that contains a promise resolves with a value of null, undefined, or false', (done) => {
        const store = val('bar');
        const el = html`<div foo=${store}></div>`;
    
        expect(el.hasAttribute('foo')).to.equal(true);
        expect(el.getAttribute('foo')).to.equal('bar');

        const nullPromise = Promise.resolve(null);
        store.set(nullPromise);
    
        nullPromise.then(tick).then(() => {
            expect(el.hasAttribute('foo')).to.equal(false);

            store.set('baz');
    
            tick().then(() => {
                expect(el.hasAttribute('foo')).to.equal(true);
                expect(el.getAttribute('foo')).to.equal('baz');
                
                const undefinedPromise = Promise.resolve(undefined);
                store.set(undefinedPromise);

                expect(el.hasAttribute('foo')).to.equal(true);
                expect(el.getAttribute('foo')).to.equal('baz');

                undefinedPromise.then(tick).then(() => {
                    expect(el.hasAttribute('foo')).to.equal(false);

                    store.set('qux');
    
                    tick().then(() => {
                        expect(el.hasAttribute('foo')).to.equal(true);
                        expect(el.getAttribute('foo')).to.equal('qux');
                
                        const falsePromise = Promise.resolve(false);
                        store.set(falsePromise);

                        expect(el.hasAttribute('foo')).to.equal(true);
                        expect(el.getAttribute('foo')).to.equal('qux');

                        falsePromise.then(tick).then(() => {
                            expect(el.hasAttribute('foo')).to.equal(false);

                            done();
                        });
                    });
                });
            });
        });
    });

    it('should render a text node for a store that contains a function that returns a promise', (done) => {
        const promise = Promise.resolve('foo');
        const store = val(() => promise);
        const el = html`<div>${store}</div>`;
    
        expect(el.outerHTML).to.equal('<div></div>');
    
        promise.then(tick).then(() => {
            expect(el.outerHTML).to.equal('<div>foo</div>');
            
            done();
        });
    });
    
    it('should set an attribute for store that contains a function that returns a promise', (done) => {
        const promise = Promise.resolve('foo');
        const store = val(() => promise);
        const el = html`<div id=${store}></div>`;
    
        expect(el.outerHTML).to.equal('<div></div>');
    
        promise.then(tick).then(() => {
            expect(el.outerHTML).to.equal('<div id="foo"></div>');
            
            done();
        });
    });

    it('should render a text node for a store that contains a promise that resolves with a function', (done) => {
        const promise = Promise.resolve(() => 'foo');
        const store = val(promise);
        const el = html`<div>${store}</div>`;
    
        expect(el.outerHTML).to.equal('<div></div>');
    
        promise.then(tick).then(() => {
            expect(el.outerHTML).to.equal('<div>foo</div>');
            
            done();
        });
    });

    it('should set an attribute for a store that contains a promise that resolves with a function', (done) => {
        const promise = Promise.resolve(() => 'foo');
        const store = val(promise);
        const el = html`<div id=${store}></div>`;
    
        expect(el.outerHTML).to.equal('<div></div>');
    
        promise.then(tick).then(() => {
            expect(el.outerHTML).to.equal('<div id="foo"></div>');
            
            done();
        });
    });
});