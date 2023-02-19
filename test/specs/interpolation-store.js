import { html, store, derived, tick } from '../../src/reflex';

describe('interpolation-store', () => {
    it('should render a store that as a text node', () => {
        const text = store('foo');
        const el = html`<div>${text}</div>`;

        expect(el.outerHTML).to.equal('<div>foo</div>');
    });

    it('should render a store as an attribute', () => {
        const attr = store('foo');
        const el = html`<div id=${attr}></div>`;

        expect(el.outerHTML).to.equal('<div id="foo"></div>');
    });

    it('should render a store that contains a text node', () => {
        const text = store(document.createTextNode('foo'));
        const el = html`<div>${text}</div>`;

        expect(el.outerHTML).to.equal('<div>foo</div>');
    });

    it('should render a store that contains an element', () => {
        const span = store(document.createElement('span'));
        const el = html`<div>${span}</div>`;

        expect(el.outerHTML).to.equal('<div><span></span></div>');
    });

    it('should render a store that contains a document fragment', () => {
        const frag = store(html`<i></i><em></em>`);

        const el = html`<div>${frag}</div>`;

        expect(el.outerHTML).to.equal('<div><i></i><em></em></div>');
    });

    it('should update a text node', async () => {
        const text = store();
        const el = html`<div>${text}</div>`;

        expect(el.outerHTML).to.equal('<div></div>');

        text.set('foo');

        await tick();
        expect(el.outerHTML).to.equal('<div>foo</div>');
            
        text.set(123);

        await tick();
        expect(el.outerHTML).to.equal('<div>123</div>');
                
        text.set(false);

        await tick();
        expect(el.outerHTML).to.equal('<div>false</div>');

    });

    it('should update an element', async () => {
        const child = store();
        const el = html`<div>${child}</div>`;

        expect(el.outerHTML).to.equal('<div></div>');

        child.set(html`<span />`);
        
        await tick();
        expect(el.outerHTML).to.equal('<div><span></span></div>');
            
        child.set(html`<em />`);
        
        await tick();
        expect(el.outerHTML).to.equal('<div><em></em></div>');
    });

    it('should update a text node with a function', async () => {
        const child = store(() => 'foo');
        const el = html`<div>${child}</div>`;

        expect(el.outerHTML).to.equal('<div>foo</div>');

        child.set(() => 'bar');
        
        await tick();
        expect(el.outerHTML).to.equal('<div>bar</div>');
            
        child.set(() => html`<em />`);
        
        await tick();
        expect(el.outerHTML).to.equal('<div><em></em></div>');
    });

    it('should update multiple nodes', async () => {
        const nodes = store();
        const el = html`<div>${nodes}</div>`;

        expect(el.outerHTML).to.equal('<div></div>');

        nodes.set(html`foo<span />bar<em />`);
        
        await tick();
        expect(el.outerHTML).to.equal('<div>foo<span></span>bar<em></em></div>');
            
        nodes.set(html`<i />foo`);
        
        await tick();
        expect(el.outerHTML).to.equal('<div><i></i>foo</div>');
    });

    it('should update multiple nodes with a function', async () => {
        const nodes = store();
        const el = html`<div>${nodes}</div>`;

        expect(el.outerHTML).to.equal('<div></div>');

        nodes.set(() => html`bar<span />baz`);
        
        await tick();
        expect(el.outerHTML).to.equal('<div>bar<span></span>baz</div>');
            
        nodes.set(() => [html`<i />`, 'qux']);
        
        await tick();
        expect(el.outerHTML).to.equal('<div><i></i>qux</div>');
    });

    it('should remove nodes by providing null or undefined', async () => {
        const node = store('foo');
        const el = html`<div>${node}</div>`;

        expect(el.outerHTML).to.equal('<div>foo</div>');

        node.set(null);
        
        await tick();
        expect(el.outerHTML).to.equal('<div></div>');

        node.set(html`<span />`);
        
        await tick();
        expect(el.outerHTML).to.equal('<div><span></span></div>');
                
        node.set(undefined);
        
        await tick();
        expect(el.outerHTML).to.equal('<div></div>');
                    
        node.set(html`<em />foo<i />`);
        
        await tick();
        expect(el.outerHTML).to.equal('<div><em></em>foo<i></i></div>');
                        
        node.set(null);
        
        await tick();
        expect(el.outerHTML).to.equal('<div></div>');
    });

    it('should remove nodes if a function returns null or undefined', async () => {
        const node = store('foo');
        const el = html`<div>${node}</div>`;

        expect(el.outerHTML).to.equal('<div>foo</div>');

        node.set(() => null);
        
        await tick();
        expect(el.outerHTML).to.equal('<div></div>');

        node.set(html`<span />`);

        await tick();
        expect(el.outerHTML).to.equal('<div><span></span></div>');

        node.set(() => undefined);

        await tick();
        expect(el.outerHTML).to.equal('<div></div>');

        node.set(html`<em />foo<i />`);

        await tick();
        expect(el.outerHTML).to.equal('<div><em></em>foo<i></i></div>');

        node.set(() => null);

        await tick();
        expect(el.outerHTML).to.equal('<div></div>');
    });

    it('should update an attribute', async () => {
        const attr = store();
        const el = html`<div foo=${attr}></div>`;

        expect(el.outerHTML).to.equal('<div></div>');

        attr.set('bar');
        
        await tick();
        expect(el.outerHTML).to.equal('<div foo="bar"></div>');
    });

    it('should update an attribute with a function', async () => {
        const attr = store();
        const el = html`<div foo=${attr}></div>`;

        expect(el.outerHTML).to.equal('<div></div>');

        const fn = sinon.spy(() => 'bar');

        attr.set(fn);
        
        await tick();
        expect(el.outerHTML).to.equal('<div foo="bar"></div>');
        expect(fn.callCount).to.equal(1);
        expect(fn.args[0][0]).to.equal(el);
    });

    it('should remove attributes by providing null, undefined, or false', async () => {
        const attr = store('bar');
        const el = html`<div foo=${attr}></div>`;

        expect(el.outerHTML).to.equal('<div foo="bar"></div>');

        attr.set(null);
        
        await tick();
        expect(el.outerHTML).to.equal('<div></div>');

        attr.set('baz');

        await tick();
        expect(el.outerHTML).to.equal('<div foo="baz"></div>');

        attr.set(undefined);

        await tick();
        expect(el.outerHTML).to.equal('<div></div>');

        attr.set('qux');

        await tick();
        expect(el.outerHTML).to.equal('<div foo="qux"></div>');

        attr.set(false);

        await tick();
        expect(el.outerHTML).to.equal('<div></div>');
    });

    it('should remove attributes if a function returns null, undefined, or false', async () => {
        const attr = store('bar');
        const el = html`<div foo=${attr}></div>`;

        expect(el.outerHTML).to.equal('<div foo="bar"></div>');

        const nullSpy = sinon.spy(() => null);
        const undefinedSpy = sinon.spy(() => undefined);
        const falseSpy = sinon.spy(() => false);

        attr.set(nullSpy);
        
        await tick();
        expect(el.outerHTML).to.equal('<div></div>');
        expect(nullSpy.callCount).to.equal(1);
        expect(nullSpy.args[0][0]).to.equal(el);

        attr.set('baz');

        await tick();
        expect(el.outerHTML).to.equal('<div foo="baz"></div>');

        attr.set(undefinedSpy);

        await tick(); 
        expect(el.outerHTML).to.equal('<div></div>');
        expect(undefinedSpy.callCount).to.equal(1);
        expect(undefinedSpy.args[0][0]).to.equal(el);

        attr.set('qux');

        await tick();
        expect(el.outerHTML).to.equal('<div foo="qux"></div>');

        attr.set(falseSpy);

        await tick();
        expect(el.outerHTML).to.equal('<div></div>');
        expect(falseSpy.callCount).to.equal(1);
        expect(falseSpy.args[0][0]).to.equal(el);
    });

    it('should update the class attribute with an array', async () => {
        const className = store(['foo', 'bar']);
        const el = html`<div class=${className}></div>`;
        
        expect(el.className).to.equal('foo bar');

        className.set(['foo', 'baz', 'qux']);
        
        await tick();
        expect(el.className).to.equal('foo baz qux');
    });

    it('should update the class attribute with an object', async () => {    
        const className = store({foo: true, bar: true, baz: true});
        const el = html`<div class=${className}></div>`;
        
        expect(el.className).to.equal('foo bar baz');

        className.set({foo: false, bar: true, baz: false, qux: true});
        
        await tick();
        expect(el.className).to.equal('bar qux');
    });

    it('should update the class attribute with a function', async () => {
        const className = store();
        const el = html`<div class=${className}></div>`;
        
        expect(el.className).to.equal('');

        const fn1 = sinon.spy(() => ['foo', 'bar']);

        className.set(fn1);
        
        await tick();
        expect(el.className).to.equal('foo bar');
        expect(fn1.callCount).to.equal(1);
        expect(fn1.args[0][0]).to.equal(el);

        const fn2 = sinon.spy(() => ({foo: true, bar: false, baz: true, qux: true}));

        className.set(fn2);

        await tick();
        expect(el.className).to.equal('foo baz qux');
        expect(fn2.callCount).to.equal(1);
        expect(fn2.args[0][0]).to.equal(el);
    });

    it('should update CSS styles with a string', async () => {
        const style = store('width: 100px; height: 200px');
        const el = html`<div style=${style}></div>`;

        expect(el.outerHTML).to.equal('<div style="width: 100px; height: 200px;"></div>');

        style.set('width: 150px; background-color: rgb(20, 20, 20);');
        
        await tick();
        expect(el.outerHTML).to.equal('<div style="width: 150px; background-color: rgb(20, 20, 20);"></div>');
    });

    it('should update CSS styles with a key/value map', async () => {
        const style = store({'padding-bottom': '10px', paddingTop: '5px'});
        const el = html`<div style=${style}></div>`;

        expect(el.outerHTML).to.equal('<div style="padding-bottom: 10px; padding-top: 5px;"></div>');

        style.set({paddingTop: '7px', 'padding-left': '12px'});
        
        await tick();
        expect(el.outerHTML).to.equal('<div style="padding-top: 7px; padding-left: 12px;"></div>');
    });

    it('should update CSS styles with a function', async () => {
        const style = store();
        const el = html`<div style=${style}></div>`;

        expect(el.outerHTML).to.equal('<div></div>');

        const fn1 = sinon.spy(() => 'width: 43px; height: 86px');

        style.set(fn1);
        
        await tick();
        expect(el.outerHTML).to.equal('<div style="width: 43px; height: 86px;"></div>');
        expect(fn1.callCount).to.equal(1);
        expect(fn1.args[0][0]).to.equal(el);

        const fn2 = sinon.spy(() => ({width: '68px', paddingTop: '12px'}));

        style.set(fn2);

        await tick();
        expect(el.outerHTML).to.equal('<div style="width: 68px; height: 86px; padding-top: 12px;"></div>');
        expect(fn2.callCount).to.equal(1);
        expect(fn2.args[0][0]).to.equal(el);
    });

    it('should remove a CSS style', async () => {
        const style = store({width: '100px'});
        const el = html`<div style=${style}></div>`;

        expect(el.outerHTML).to.equal('<div style="width: 100px;"></div>');

        style.set({width: null});
        
        await tick();
        expect(el.outerHTML).to.equal('<div style=""></div>');
    });

    it('should remove a CSS style with a function', async () => {
        const style = store({width: '100px'});
        const el = html`<div style=${style}></div>`;

        expect(el.outerHTML).to.equal('<div style="width: 100px;"></div>');

        const fn = sinon.spy(() => ({width: null}));

        style.set(fn);
        
        await tick();
        expect(el.outerHTML).to.equal('<div style=""></div>');
        expect(fn.callCount).to.equal(1);
        expect(fn.args[0][0]).to.equal(el);
    });

    it('should update CSS variables', async () => {
        const style = store({color: 'var(--color)', '--color': 'red'});
        const el = html`<div style=${style}></div>`;

        document.body.appendChild(el);

        expect(el.style.color).to.equal('var(--color)');
        expect(window.getComputedStyle(el).getPropertyValue('color')).to.equal('rgb(255, 0, 0)');
        expect(window.getComputedStyle(el).getPropertyValue('--color')).to.equal('red');
        
        style.set({color: 'var(--color)', '--color': 'blue'});
        
        await tick();
        expect(el.style.color).to.equal('var(--color)');
        expect(window.getComputedStyle(el).getPropertyValue('color')).to.equal('rgb(0, 0, 255)');
        expect(window.getComputedStyle(el).getPropertyValue('--color')).to.equal('blue');

        document.body.removeChild(el);
    });

    it('should update a boolean attribute', async () => {
        const checked = store(true);
        const el = html`<input type="radio" checked=${checked} />`;

        expect(el.outerHTML).to.equal('<input type="radio">');
        expect(el.checked).to.equal(true);

        checked.set(false);
        
        await tick();
        expect(el.checked).to.equal(false);

        checked.set(true);

        await tick();
        expect(el.checked).to.equal(true);
    });

    it('should update a boolean attribute with a function', async () => {
        const checked = store(true);
        const el = html`<input type="radio" checked=${checked} />`;

        expect(el.checked).to.equal(true);

        const fn = sinon.spy(() => false);

        checked.set(fn);
        
        await tick();
        expect(el.checked).to.equal(false);
        expect(fn.callCount).to.equal(1);
        expect(fn.args[0][0]).to.equal(el);
    });

    it('should update a DOM property', async () => {
        const value = store('foo');
        const el = html`<input type="text" value=${value} />`;

        expect(el.outerHTML).to.equal('<input type="text">');
        expect(el.value).to.equal('foo');

        value.set('bar');
        
        await tick();
        expect(el.value).to.equal('bar');

        value.set('baz');

        await tick();
        expect(el.value).to.equal('baz');
    });

    it('should update a DOM property with a function', async () => {
        const value = store();
        const el = html`<input type="text" value=${value} />`;

        expect(el.value).to.equal('');

        const fn = sinon.spy(() => 'foo');

        value.set(fn);
        
        await tick();
        expect(el.value).to.equal('foo');
        expect(fn.callCount).to.equal(1);
        expect(fn.args[0][0]).to.equal(el);
    });

    it('should add an event listener', async () => {
        const clickHandler = store();
        const el = html`<div onclick=${clickHandler} />`;

        const addEventSpy = sinon.spy(el, 'addEventListener');

        const fn = sinon.spy();
        clickHandler.set(fn);
        
        await tick();
        expect(addEventSpy.callCount).to.equal(1);
        expect(addEventSpy.args[0][0]).to.equal('click');
        expect(addEventSpy.args[0][1]).to.equal(fn);
    });

    it('should remove an event listener', async () => {
        const fn = sinon.spy();
        const clickHandler = store(fn);
        const el = html`<div onclick=${clickHandler} />`;

        const removeEventSpy = sinon.spy(el, 'removeEventListener');

        clickHandler.set(null);
        
        await tick();
        expect(removeEventSpy.callCount).to.equal(1);
        expect(removeEventSpy.args[0][0]).to.equal('click');
        expect(removeEventSpy.args[0][1]).to.equal(fn);
    });

    it('should add and remove event listeners', async () => {
        const clickHandler = store();
        const el = html`<div onclick=${clickHandler} />`;

        const event1 = new CustomEvent('click');
        const onClick1 = sinon.spy();
        const addEventSpy = sinon.spy(el, 'addEventListener');
        const removeEventSpy = sinon.spy(el, 'removeEventListener');

        clickHandler.set(onClick1);
        
        await tick();
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

        await tick();
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
    });

    it('should update around sibling nodes without inference', async () => {
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
        
        await tick();
        expect(el.outerHTML).to.equal('<div>foo<span></span><section></section>baz<em></em><p></p></div>');
        expect(el.childNodes[0]).to.equal(foo);
        expect(el.childNodes[1]).to.equal(span);
        expect(el.childNodes[3]).to.equal(baz);
        expect(el.childNodes[4]).to.equal(em);
        expect(el.childNodes[5]).to.equal(p);

        child.set(html`<h1 /><h2 /><h3 />`);

        await tick();
        expect(el.outerHTML).to.equal('<div>foo<span></span><h1></h1><h2></h2><h3></h3>baz<em></em><p></p></div>');
        expect(el.childNodes[0]).to.equal(foo);
        expect(el.childNodes[1]).to.equal(span);
        expect(el.childNodes[5]).to.equal(baz);
        expect(el.childNodes[6]).to.equal(em);
        expect(el.childNodes[7]).to.equal(p);
    });

    it('should update a text node around sibling text nodes', async () => {
        const text = store('abc');
        const el = html`<div>foo${text}bar</div>`;
        const foo = el.childNodes[0];
        const baz = el.childNodes[2];
    
        expect(el.outerHTML).to.equal('<div>fooabcbar</div>');

        text.set(123);
        
        await tick();
        expect(el.outerHTML).to.equal('<div>foo123bar</div>');
        expect(el.childNodes[0]).to.equal(foo);
        expect(el.childNodes[2]).to.equal(baz);
    });

    it('should update a text node of an SVG element', async () => {
        const text = store();
        const el = html`<svg><circle cx="50" cy="50" r="40">${text}</circle></svg>`;
    
        expect(el.outerHTML).to.equal('<svg><circle cx="50" cy="50" r="40"></circle></svg>');
    
        text.set('foo');
        
        await tick();
        expect(el.outerHTML).to.equal('<svg><circle cx="50" cy="50" r="40">foo</circle></svg>');

        text.set('bar');

        await tick();
        expect(el.outerHTML).to.equal('<svg><circle cx="50" cy="50" r="40">bar</circle></svg>');
    });
    
    it('should update an SVG element', async () => {
        const child = store();
        const el = html`<svg>${child}</svg>`;
    
        expect(el.outerHTML).to.equal('<svg></svg>');
    
        child.set(html`<circle cx="50" cy="50" r="40" />`);
        
        await tick();
        expect(el.outerHTML).to.equal('<svg><circle cx="50" cy="50" r="40"></circle></svg>');

        child.set(html`<rect width="100" height="100" />`);

        await tick();
        expect(el.outerHTML).to.equal('<svg><rect width="100" height="100"></rect></svg>');
    });
    
    it('should update an attribute of an SVG element', async () => {
        const radius = store(50);
        const el = html`<svg><circle cx="50" cy="50" r=${radius}></circle></svg>`;
    
        expect(el.outerHTML).to.equal('<svg><circle cx="50" cy="50" r="50"></circle></svg>');
    
        radius.set(70);
        
        await tick();
        expect(el.outerHTML).to.equal('<svg><circle cx="50" cy="50" r="70"></circle></svg>');
    });
    
    it('should not update a property of an SVG element', async () => {
        const textContent = store('foo');
        const el = html`<svg><circle cx="50" cy="50" r="40" fill="red" textContent=${textContent}></circle></svg>`;
        const circle = el.querySelector('circle');
    
        expect(el.outerHTML).to.equal('<svg><circle cx="50" cy="50" r="40" fill="red" textContent="foo"></circle></svg>');
        expect(circle.getAttribute('textContent')).to.equal('foo');
        expect(circle.textContent).to.equal('');
    
        textContent.set('bar');
        
        await tick();
        expect(el.outerHTML).to.equal('<svg><circle cx="50" cy="50" r="40" fill="red" textContent="bar"></circle></svg>');
        expect(circle.getAttribute('textContent')).to.equal('bar');
        expect(circle.textContent).to.equal('');
    });

    it('should support a store interpolated into multiple elements', async () => {
        const text = store('foo');
        const div = html`<div>${text}</div>`;
        const span = html`<span>${text}</span>`;

        expect(div.outerHTML).to.equal('<div>foo</div>');
        expect(span.outerHTML).to.equal('<span>foo</span>');

        text.set('bar');
        
        await tick();
        expect(div.outerHTML).to.equal('<div>bar</div>');
        expect(span.outerHTML).to.equal('<span>bar</span>');

        text.set('baz');

        await tick();
        expect(div.outerHTML).to.equal('<div>baz</div>');
        expect(span.outerHTML).to.equal('<span>baz</span>');
    });

    it('should escape HTML strings', async () => {
        /* eslint-disable quotes */
        const text = store();
        const el = html`<div>${text}</div>`;

        expect(el.outerHTML).to.equal('<div></div>');

        text.set(`<span id="foo"></span>`);
        
        await tick();
        expect(el.outerHTML).to.equal('<div>&lt;span id="foo"&gt;&lt;/span&gt;</div>');

        text.set(`<em class="bar">this & that</em>`);

        await tick();
        expect(el.outerHTML).to.equal('<div>&lt;em class="bar"&gt;this &amp; that&lt;/em&gt;</div>');
        /* eslint-enable quotes */
    });

    it('should defer updates to use the latest value', async () => {
        const text = store('foo');
        const el = html`<div>${text}</div>`;

        expect(el.outerHTML).to.equal('<div>foo</div>');

        text.set('bar');
        text.set('baz');
        text.set('qux');
        
        await tick();
        expect(el.outerHTML).to.equal('<div>qux</div>');
    });

    it('should support derived stores', async () => {
        const title = store('foo');
        const className = store('bar');
        const h1 = derived(title, (title) => html`<h1>${title}</h1>`);
        const section = derived(h1, (h1) => html`<section>${h1}</section>`);
        const el = html`<div class=${derived(className, (cls) => `foo ${cls}`)}>${section}</div>`;

        expect(el.outerHTML).to.equal('<div class="foo bar"><section><h1>foo</h1></section></div>');

        title.set('bar');
        
        await tick();
        expect(el.outerHTML).to.equal('<div class="foo bar"><section><h1>bar</h1></section></div>');

        className.set('baz');

        await tick();
        expect(el.outerHTML).to.equal('<div class="foo baz"><section><h1>bar</h1></section></div>');

        title.set('baz');

        await tick();
        expect(el.outerHTML).to.equal('<div class="foo baz"><section><h1>baz</h1></section></div>');

        className.set('qux');

        await tick();
        expect(el.outerHTML).to.equal('<div class="foo qux"><section><h1>baz</h1></section></div>');
    });

    it('should support custom stores that have a subscribe method', async () => {
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

        await tick();
        expect(div.outerHTML).to.equal('<div id="bar"></div>');
        expect(span.outerHTML).to.equal('<span>bar</span>');

        value('baz');

        await tick();
        expect(div.outerHTML).to.equal('<div id="baz"></div>');
        expect(span.outerHTML).to.equal('<span>baz</span>');
    });

    it('should update a text node with nested functions', async () => {
        const child = store();
        const el = html`<div>${child}</div>`;

        expect(el.outerHTML).to.equal('<div></div>');

        child.set(() => () => () => 'foo');
        
        await tick();
        expect(el.outerHTML).to.equal('<div>foo</div>');
    });

    it('should update an attribute with nested functions', async () => {
        const attr = store();
        const el = html`<div foo=${attr}></div>`;

        expect(el.outerHTML).to.equal('<div></div>');

        const fn1 = sinon.spy(() => 'bar');
        const fn2 = sinon.spy(fn1);
        const fn3 = sinon.spy(fn2);

        attr.set(fn3);
        
        await tick();
        expect(el.outerHTML).to.equal('<div foo="bar"></div>');
        expect(fn1.callCount).to.equal(1);
        expect(fn1.args[0][0]).to.equal(el);
        expect(fn2.callCount).to.equal(1);
        expect(fn2.args[0][0]).to.equal(el);
        expect(fn3.callCount).to.equal(1);
        expect(fn3.args[0][0]).to.equal(el);
    });

    it('should render a text node for a store that contains a promise', async () => {
        const promise = Promise.resolve('foo');
        const foo = store(promise);
        const el = html`<div>${foo}</div>`;
    
        expect(el.outerHTML).to.equal('<div></div>');
    
        await promise;
        await tick();
        expect(el.outerHTML).to.equal('<div>foo</div>');
    });

    it('should render an element for a store that contains a promise', async () => {
        const promise = Promise.resolve(html`<i />`);
        const foo = store(promise);
        const el = html`<div>${foo}</div>`;

        expect(el.outerHTML).to.equal('<div></div>');

        await promise;
        await tick();
        expect(el.outerHTML).to.equal('<div><i></i></div>');
    });

    it('should render a document fragment for a store that contains a promise', async () => {
        const promise = Promise.resolve(html`foo<span />bar<em />`);
        const foo = store(promise);
        const el = html`<div>${foo}</div>`;

        expect(el.outerHTML).to.equal('<div></div>');

        await promise;
        await tick();
        expect(el.outerHTML).to.equal('<div>foo<span></span>bar<em></em></div>');
    });

    it('should render an attribute for a store that contains a promise', async () => {
        const promise = Promise.resolve('foo');
        const foo = store(promise);
        const el = html`<div id=${foo}></div>`;
    
        expect(el.outerHTML).to.equal('<div></div>');
    
        await promise;
        await tick();
        expect(el.outerHTML).to.equal('<div id="foo"></div>');
    });

    it('should update an element for a store that contains a promise', async () => {
        const foo = store(Promise.resolve('foo'));
        const el = html`<div>${foo}</div>`;
    
        expect(el.outerHTML).to.equal('<div></div>');
    
        await foo.value();
        await tick();
        expect(el.outerHTML).to.equal('<div>foo</div>');

        foo.set(Promise.resolve(html`<span />bar<em />`));

        expect(el.outerHTML).to.equal('<div>foo</div>');

        await foo.value();
        await tick();
        expect(el.outerHTML).to.equal('<div><span></span>bar<em></em></div>');
    });

    it('should update an attribute for a store that contains a promise', async () => {
        const className = store(Promise.resolve('foo'));
        const el = html`<div class=${className}></div>`;
    
        expect(el.outerHTML).to.equal('<div></div>');
    
        await className.value();
        await tick();
        expect(el.outerHTML).to.equal('<div class="foo"></div>');

        className.set(Promise.resolve('bar'));

        expect(el.outerHTML).to.equal('<div class="foo"></div>');

        await className.value();
        await tick();
        expect(el.outerHTML).to.equal('<div class="bar"></div>');
    });

    it('should update multiple interpolations of the same store that contains a promise', async () => {
        const value = store(Promise.resolve('foo'));
        const el = html`<div id=${value}>${value}</div>`;
    
        expect(el.outerHTML).to.equal('<div></div>');
    
        await value.value();
        await tick();
        expect(el.outerHTML).to.equal('<div id="foo">foo</div>');

        value.set(Promise.resolve('bar'));

        expect(el.outerHTML).to.equal('<div id="foo">foo</div>');

        await value.value();
        await tick();
        expect(el.outerHTML).to.equal('<div id="bar">bar</div>');
    });

    it('should not render an element if a store contains a rejected promise', async () => {
        const promise = Promise.reject();
        const foo = store(promise);
        const el = html`<div>${foo}</div>`;
    
        expect(el.outerHTML).to.equal('<div></div>');
        
        try {
            await promise;
        } catch {
            await tick();
            expect(el.outerHTML).to.equal('<div></div>');
        }
    });

    it('should not set an attribute if a store contains a rejected promise', async () => {
        const promise = Promise.reject();
        const id = store(promise);
        const el = html`<div id=${id}></div>`;
    
        expect(el.outerHTML).to.equal('<div></div>');
    
        try {
            await promise;
        } catch {
            await tick();
            expect(el.outerHTML).to.equal('<div></div>');
        }
    });

    it('should not render an element if a store that contains a promise that resolves with a value of null or undefined', async () => {
        const nullPromise = Promise.resolve(null);
        const undefinedPromise = Promise.resolve(undefined);
        const nullStore = store(nullPromise);
        const undefinedStore = store(undefinedPromise);
        const el = html`<div>${nullStore}${undefinedStore}</div>`;
    
        expect(el.outerHTML).to.equal('<div></div>');
    
        await Promise.all([nullPromise, undefinedPromise]);
        await tick();
        expect(el.outerHTML).to.equal('<div></div>');
    });

    it('should not set an attribute if a store that contains a promise that resolves with a value of null, undefined, or false', async () => {
        const nullPromise = Promise.resolve(null);
        const undefinedPromise = Promise.resolve(undefined);
        const falsePromise = Promise.resolve(false);
        const foo = store(nullPromise);
        const bar = store(undefinedPromise);
        const baz = store(falsePromise);
        const el = html`<div foo=${foo} bar=${bar} baz=${baz}></div>`;
    
        expect(el.outerHTML).to.equal('<div></div>');
    
        await Promise.all([nullPromise, undefinedPromise, falsePromise]);
        await tick();
        expect(el.outerHTML).to.equal('<div></div>');
    });

    it('should remove nodes if a store that contains a promise that resolves with a value of null or undefined', async () => {
        const foo = store('foo');
        const el = html`<div>${foo}</div>`;
    
        expect(el.outerHTML).to.equal('<div>foo</div>');

        const nullPromise = Promise.resolve(null);
        foo.set(nullPromise);
    
        await nullPromise;
        await tick();
        expect(el.outerHTML).to.equal('<div></div>');

        foo.set('bar');

        await tick();
        expect(el.outerHTML).to.equal('<div>bar</div>');

        const undefinedPromise = Promise.resolve(undefined);
        foo.set(undefinedPromise);

        expect(el.outerHTML).to.equal('<div>bar</div>');

        await undefinedPromise;
        await tick();
        expect(el.outerHTML).to.equal('<div></div>');
    });

    it('should remove an attribute if a store that contains a promise that resolves with a value of null, undefined, or false', async () => {
        const foo = store('bar');
        const el = html`<div foo=${foo}></div>`;
    
        expect(el.hasAttribute('foo')).to.equal(true);
        expect(el.getAttribute('foo')).to.equal('bar');

        const nullPromise = Promise.resolve(null);
        foo.set(nullPromise);
    
        await nullPromise;
        await tick();
        expect(el.hasAttribute('foo')).to.equal(false);

        foo.set('baz');

        await tick();
        expect(el.hasAttribute('foo')).to.equal(true);
        expect(el.getAttribute('foo')).to.equal('baz');

        const undefinedPromise = Promise.resolve(undefined);
        foo.set(undefinedPromise);

        expect(el.hasAttribute('foo')).to.equal(true);
        expect(el.getAttribute('foo')).to.equal('baz');

        await undefinedPromise;
        await tick();
        expect(el.hasAttribute('foo')).to.equal(false);

        foo.set('qux');

        await tick();
        expect(el.hasAttribute('foo')).to.equal(true);
        expect(el.getAttribute('foo')).to.equal('qux');

        const falsePromise = Promise.resolve(false);
        foo.set(falsePromise);

        expect(el.hasAttribute('foo')).to.equal(true);
        expect(el.getAttribute('foo')).to.equal('qux');

        await falsePromise;
        await tick();
        expect(el.hasAttribute('foo')).to.equal(false);
    });

    it('should render a text node for a store that contains a function that returns a promise', async () => {
        const promise = Promise.resolve('foo');
        const foo = store(() => promise);
        const el = html`<div>${foo}</div>`;
    
        expect(el.outerHTML).to.equal('<div></div>');
    
        await promise;
        await tick();
        expect(el.outerHTML).to.equal('<div>foo</div>');
    });
    
    it('should set an attribute for store that contains a function that returns a promise', async () => {
        const promise = Promise.resolve('foo');
        const foo = store(() => promise);
        const el = html`<div id=${foo}></div>`;
    
        expect(el.outerHTML).to.equal('<div></div>');
    
        await promise;
        await tick();
        expect(el.outerHTML).to.equal('<div id="foo"></div>');
    });

    it('should render a text node for a store that contains a promise that resolves with a function', async () => {
        const promise = Promise.resolve(() => 'foo');
        const foo = store(promise);
        const el = html`<div>${foo}</div>`;
    
        expect(el.outerHTML).to.equal('<div></div>');
    
        await promise;
        await tick();
        expect(el.outerHTML).to.equal('<div>foo</div>');
    });

    it('should set an attribute for a store that contains a promise that resolves with a function', async () => {
        const promise = Promise.resolve(() => 'foo');
        const foo = store(promise);
        const el = html`<div id=${foo}></div>`;
    
        expect(el.outerHTML).to.equal('<div></div>');
    
        await promise;
        await tick();
        expect(el.outerHTML).to.equal('<div id="foo"></div>');
    });
});
