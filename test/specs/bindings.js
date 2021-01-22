import { html, val, derived, tick } from '../../src/reflex';

describe('bindings', () => {
    it('should render a val store as a text node', () => {
        const text = val('foo');
        const el = html`<div>${text}</div>`;

        expect(el.outerHTML).to.equal('<div>foo</div>');
    });

    it('should render a val store as an attribute', () => {
        const attr = val('foo');
        const el = html`<div id=${attr}></div>`;

        expect(el.outerHTML).to.equal('<div id="foo"></div>');
    });

    it('should update a text node', (done) => {
        const text = val();
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
        const child = val();
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
        const nodes = val();
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
        const node = val('foo');
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
        const attr = val();
        const el = html`<div foo=${attr}></div>`;

        expect(el.outerHTML).to.equal('<div></div>');

        attr.set('bar').then(() => {
            expect(el.outerHTML).to.equal('<div foo="bar"></div>');
            done();
        });
    });

    it('should remove attributes by providing null, undefined, or false', (done) => {
        const attr = val('bar');
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
        const className = val(['foo', 'bar']);
        const el = html`<div class=${className}></div>`;
        
        expect(el.className).to.equal('foo bar');

        className.set(['foo', 'baz', 'qux']).then(() => {
            expect(el.className).to.equal('foo baz qux');
            done();
        });
    });

    it('should update the class attribute as an object', (done) => {    
        const className = val({foo: true, bar: true, baz: true});
        const el = html`<div class=${className}></div>`;
        
        expect(el.className).to.equal('foo bar baz');

        className.set({foo: false, bar: true, baz: false, qux: true}).then(() => {
            expect(el.className).to.equal('bar qux');
            done();
        });
    });

    it('should update CSS styles as a string', (done) => {
        const style = val('width: 100px; height: 200px');
        const el = html`<div style=${style}></div>`;

        expect(el.outerHTML).to.equal('<div style="width: 100px; height: 200px;"></div>');

        style.set('width: 150px; background-color: rgb(20, 20, 20);').then(() => {
            expect(el.outerHTML).to.equal('<div style="width: 150px; background-color: rgb(20, 20, 20);"></div>');
            done();
        });
    });

    it('should update CSS styles as a key/value map', (done) => {
        const style = val({'padding-bottom': '10px', paddingTop: '5px'});
        const el = html`<div style=${style}></div>`;

        expect(el.outerHTML).to.equal('<div style="padding-bottom: 10px; padding-top: 5px;"></div>');

        style.set({paddingTop: '7px', 'padding-left': '12px'}).then(() => {
            expect(el.outerHTML).to.equal('<div style="padding-top: 7px; padding-left: 12px;"></div>');
            done();
        });
    });

    it('should remove a CSS style', (done) => {
        const style = val({width: '100px'});
        const el = html`<div style=${style}></div>`;

        expect(el.outerHTML).to.equal('<div style="width: 100px;"></div>');

        style.set({width: null}).then(() => {
            expect(el.outerHTML).to.equal('<div style=""></div>');
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
        
        style.set({color: 'var(--color)', '--color': 'blue'}).then(() => {
            expect(el.style.color).to.equal('var(--color)');
            expect(window.getComputedStyle(el).getPropertyValue('color')).to.equal('rgb(0, 0, 255)');
            expect(window.getComputedStyle(el).getPropertyValue('--color')).to.equal('blue');

            document.body.removeChild(el);
            done();
        });
    });

    it('should update boolean attributes', (done) => {
        const checked = val(true);
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
        const value = val('foo');
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
        const clickHandler = val();
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
        const clickHandler = val(callback);
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
        const clickHandler = val();
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
        const text = val('abc');
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

    it('should update a text node of an SVG element', (done) => {
        const text = val();
        const el = html`<svg><circle cx="50" cy="50" r="40">${text}</circle></svg>`;
    
        expect(el.outerHTML).to.equal('<svg><circle cx="50" cy="50" r="40"></circle></svg>');
    
        text.set('foo').then(() => {
            expect(el.outerHTML).to.equal('<svg><circle cx="50" cy="50" r="40">foo</circle></svg>');
            
            text.set('bar').then(() => {
                expect(el.outerHTML).to.equal('<svg><circle cx="50" cy="50" r="40">bar</circle></svg>');
                done();
            });
        });
    });
    
    it('should update an SVG element', (done) => {
        const child = val();
        const el = html`<svg>${child}</svg>`;
    
        expect(el.outerHTML).to.equal('<svg></svg>');
    
        child.set(html`<circle cx="50" cy="50" r="40" />`).then(() => {
            expect(el.outerHTML).to.equal('<svg><circle cx="50" cy="50" r="40"></circle></svg>');
            
            child.set(html`<rect width="100" height="100" />`).then(() => {
                expect(el.outerHTML).to.equal('<svg><rect width="100" height="100"></rect></svg>');
                done();
            });
        });
    });
    
    it('should update an attribute of an SVG element', (done) => {
        const radius = val(50);
        const el = html`<svg><circle cx="50" cy="50" r=${radius}></circle></svg>`;
    
        expect(el.outerHTML).to.equal('<svg><circle cx="50" cy="50" r="50"></circle></svg>');
    
        radius.set(70).then(() => {
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
    
        textContent.set('bar').then(() => {
            expect(el.outerHTML).to.equal('<svg><circle cx="50" cy="50" r="40" fill="red" textContent="bar"></circle></svg>');
            expect(circle.getAttribute('textContent')).to.equal('bar');
            expect(circle.textContent).to.equal('');
            done();
        });
    });

    it('should support stores in multiple nodes', (done) => {
        const text = val('foo');
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
        const text = val('foo');
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
        const title = val('foo');
        const className = val('bar');
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

    it('should render promises for text nodes', (done) => {
        const promise = Promise.resolve('foo');
        const el = html`<div>${promise}</div>`;

        expect(el.outerHTML).to.equal('<div></div>');

        promise.then(() => tick().then(() => {
            expect(el.outerHTML).to.equal('<div>foo</div>');

            done();
        }));
    });

    it('should render promises for elements', (done) => {
        const promise = Promise.resolve(html`<em />`);
        const el = html`<div>${promise}</div>`;

        expect(el.outerHTML).to.equal('<div></div>');

        promise.then(() => tick().then(() => {
            expect(el.outerHTML).to.equal('<div><em></em></div>');

            done();
        }));
    });

    it('should render promises for multiple nodes', (done) => {
        const promise = Promise.resolve(html`<p />foo<i />`);
        const el = html`<div>${promise}</div>`;

        expect(el.outerHTML).to.equal('<div></div>');

        promise.then(() => tick().then(() => {
            expect(el.outerHTML).to.equal('<div><p></p>foo<i></i></div>');

            done();
        }));
    });

    it('should render promises for attributes', (done) => {
        const promise = Promise.resolve('foo');
        const el = html`<div id=${promise}></div>`;

        expect(el.id).to.equal('');

        promise.then(() => tick().then(() => {
            expect(el.id).to.equal('foo');

            done();
        }));
    });

    it('should render multiple interpolations of the same promise', (done) => {
        const promise = Promise.resolve('foo');
        const el = html`<div id=${promise}>${promise}</div>`;

        expect(el.outerHTML).to.equal('<div></div>');

        promise.then(() => tick().then(() => {
            expect(el.outerHTML).to.equal('<div id="foo">foo</div>');

            done();
        }));
    });

    it('should not render a rejected promise', (done) => {
        const promise = Promise.reject();
        const el = html`<div>${promise}</div>`;

        expect(el.outerHTML).to.equal('<div></div>');

        promise.catch(() => tick().then(() => {
            expect(el.outerHTML).to.equal('<div></div>');

            done();
        }));
    });

    it('should not render if the promise resolves with a value of null or undefined', (done) => {
        const promise1 = Promise.resolve(null);
        const promise2 = Promise.resolve(undefined);
        const el = html`<div id=${promise1}>${promise2}</div>`;

        expect(el.outerHTML).to.equal('<div></div>');

        Promise.all([promise1, promise2]).then(() => tick().then(() => {
            expect(el.id).to.equal('');
            expect(el.innerHTML).to.equal('');

            done();
        }));
    });

    it('should render stores that return a promise for text nodes', (done) => {
        const promise = Promise.resolve('foo');
        const content = val(promise);
        const el = html`<div>${content}</div>`;
    
        expect(el.outerHTML).to.equal('<div></div>');
    
        promise.then(() => tick().then(() => {
            expect(el.outerHTML).to.equal('<div>foo</div>');
    
            done();
        }));
    });

    it('should render stores that return a promise for elements', (done) => {
        const promise = Promise.resolve(html`<i />`);
        const content = val(promise);
        const el = html`<div>${content}</div>`;

        expect(el.outerHTML).to.equal('<div></div>');

        promise.then(() => tick().then(() => {
            expect(el.outerHTML).to.equal('<div><i></i></div>');

            done();
        }));
    });

    it('should render stores that return a promise for multiple nodes', (done) => {
        const promise = Promise.resolve(html`foo<span />bar<em />`);
        const content = val(promise);
        const el = html`<div>${content}</div>`;

        expect(el.outerHTML).to.equal('<div></div>');

        promise.then(() => tick().then(() => {
            expect(el.outerHTML).to.equal('<div>foo<span></span>bar<em></em></div>');

            done();
        }));
    });

    it('should render stores that return a promise for attributes', (done) => {
        const promise = Promise.resolve('foo');
        const attribute = val(promise);
        const el = html`<div id=${attribute}></div>`;
    
        expect(el.outerHTML).to.equal('<div></div>');
    
        promise.then(() => tick().then(() => {
            expect(el.outerHTML).to.equal('<div id="foo"></div>');
    
            done();
        }));
    });

    it('should update an element for a store that returns a promise', (done) => {
        const content = val(Promise.resolve('foo'));
        const el = html`<div>${content}</div>`;
    
        expect(el.outerHTML).to.equal('<div></div>');
    
        content.get().then(() => tick().then(() => {
            expect(el.outerHTML).to.equal('<div>foo</div>');

            content.set(Promise.resolve(html`<span />bar<em />`));

            expect(el.outerHTML).to.equal('<div>foo</div>');
    
            content.get().then(() => tick().then(() => {
                expect(el.outerHTML).to.equal('<div><span></span>bar<em></em></div>');
        
                done();
            }));
        }));
    });

    it('should update an attribute for a store that returns a promise', (done) => {
        const className = val(Promise.resolve('foo'));
        const el = html`<div class=${className}></div>`;
    
        expect(el.outerHTML).to.equal('<div></div>');
    
        className.get().then(() => tick().then(() => {
            expect(el.outerHTML).to.equal('<div class="foo"></div>');

            className.set(Promise.resolve('bar'));

            expect(el.outerHTML).to.equal('<div class="foo"></div>');
    
            className.get().then(() => tick().then(() => {
                expect(el.outerHTML).to.equal('<div class="bar"></div>');
        
                done();
            }));
        }));
    });

    it('should render multiple interpolations of the same store that returns a promise', (done) => {
        const value = val(Promise.resolve('foo'));
        const el = html`<div id=${value}>${value}</div>`;
    
        expect(el.outerHTML).to.equal('<div></div>');
    
        value.get().then(() => tick().then(() => {
            expect(el.outerHTML).to.equal('<div id="foo">foo</div>');

            value.set(Promise.resolve('bar'));

            expect(el.outerHTML).to.equal('<div id="foo">foo</div>');
    
            value.get().then(() => tick().then(() => {
                expect(el.outerHTML).to.equal('<div id="bar">bar</div>');
        
                done();
            }));
        }));
    });

    it('should not render a store that returns a rejected promise', (done) => {
        const content = val(Promise.reject());
        const el = html`<div>${content}</div>`;
    
        expect(el.outerHTML).to.equal('<div></div>');
    
        content.get().catch(() => tick().then(() => {
            expect(el.outerHTML).to.equal('<div></div>');
    
            done();
        }));
    });

    it('should not render a store that returns a promise that resolves with a value of null or undefined', (done) => {
        const content = val(Promise.resolve(null));
        const attribute = val(Promise.resolve(undefined));
        const el = html`<div id=${attribute}>${content}</div>`;
        
        expect(el.id).to.equal('');
        expect(el.innerHTML).to.equal('');
    
        Promise.all([content.get(), attribute.get()]).then(() => tick().then(() => {
            expect(el.id).to.equal('');
            expect(el.innerHTML).to.equal('');

            done();
        }));
    });

    it('should remove nodes if a store that returns a promise resolves with a value of null or undefined', (done) => {
        const content = val('foo');
        const el = html`<div>${content}</div>`;
    
        expect(el.outerHTML).to.equal('<div>foo</div>');

        content.set(Promise.resolve(null));
    
        content.get().then(() => tick().then(() => {
            expect(el.outerHTML).to.equal('<div></div>');

            content.set('bar');
    
            tick().then(() => {
                expect(el.outerHTML).to.equal('<div>bar</div>');
        
                content.set(Promise.resolve(undefined));

                expect(el.outerHTML).to.equal('<div>bar</div>');

                content.get().then(() => tick().then(() => {
                    expect(el.outerHTML).to.equal('<div></div>');

                    done();
                }));
            });
        }));
    });

    it('should remove an attribute if a store that returns a promise resolves with a value of null or undefined', (done) => {
        const attribute = val('foo');
        const el = html`<div id=${attribute}></div>`;
    
        expect(el.id).to.equal('foo');

        attribute.set(Promise.resolve(null));
    
        attribute.get().then(() => tick().then(() => {
            expect(el.id).to.equal('');

            attribute.set('bar');
    
            tick().then(() => {
                expect(el.id).to.equal('bar');
        
                attribute.set(Promise.resolve(undefined));

                expect(el.id).to.equal('bar');

                attribute.get().then(() => tick().then(() => {
                    expect(el.id).to.equal('');

                    done();
                }));
            });
        }));
    });

    it('should support updates of varying types', (done) => {
        const content = val('foo');
        const attribute = val('bar');
        const el = html`<div class=${attribute}>${content}</div>`;
        
        expect(el.outerHTML).to.equal('<div class="bar">foo</div>');

        content.set(Promise.resolve(html`<span />`));
        attribute.set({baz: true, qux: false});
    
        content.get().then(() => tick().then(() => {
            expect(el.outerHTML).to.equal('<div class="baz"><span></span></div>');

            content.set(250);
            attribute.set(Promise.resolve('qux'));
    
            attribute.get().then(() => tick().then(() => {
                expect(el.outerHTML).to.equal('<div class="qux">250</div>');
        
                content.set(null);
                attribute.set(['a', 'b']);
    
                tick().then(() => {
                    expect(el.outerHTML).to.equal('<div class="a b"></div>');
            
                    done();
                });
            }));
        }));
    });
});
