import { html } from '../../src/reflex';

describe('html', () => {
    it('should create an element', () => {
        const el = html`<div></div>`;

        expect(el.nodeType).to.equal(1);
        expect(el.outerHTML).to.equal('<div></div>');
        expect(el.ownerDocument).to.equal(document);
    });

    it('should create a text node', () => {
        const node = html`foo`;

        expect(node.nodeType).to.equal(3);
        expect(node.nodeName.toLowerCase()).to.equal('#text');
        expect(node.nodeValue).to.equal('foo');
        expect(node.ownerDocument).to.equal(document);
    });

    it('should create a document fragment', () => {
        const frag = html`<div></div>foo<span></span>bar`;

        expect(frag.nodeType).to.equal(11);
        expect(frag.childNodes.length).to.equal(4);
        expect(frag.childNodes[0].outerHTML).to.equal('<div></div>');
        expect(frag.childNodes[1].nodeValue).to.equal('foo');
        expect(frag.childNodes[2].outerHTML).to.equal('<span></span>');
        expect(frag.childNodes[3].nodeValue).to.equal('bar');
    });

    it('should create an element with attributes', () => {
        const el = html`<div id="foo" class="bar"></div>`;

        expect(el.outerHTML).to.equal('<div id="foo" class="bar"></div>');
    });

    it('should set an attribute value with a function', () => {
        const callback = sinon.spy(() => 'bar');
        const el = html`<div foo=${callback}></div>`;

        expect(el.outerHTML).to.equal('<div foo="bar"></div>');
        expect(callback.callCount).to.equal(1);
        expect(callback.args[0][0]).to.equal(el);
    });

    it('should unpack deeply nested functions', () => {
        const callback = () => () => () => () => 'baz';
        const el = html`<div foo=${callback}></div>`;

        expect(el.outerHTML).to.equal('<div foo="baz"></div>');
    });

    it('should not set an attribute if a callback function returns null, undefined, or false', () => {
        const el = html`<div foo=${() => null} bar=${() => undefined} baz=${() => false}></div>`;

        expect(el.outerHTML).to.equal('<div></div>');
    });

    it('should support the class attribute as an array', () => {
        const el = html`<div class=${['foo', 'bar', 'baz']}></div>`;
        
        expect(el.className).to.equal('foo bar baz');
    });

    it('should support the class attribute as an object', () => {        
        const el = html`<div class=${{foo: true, bar: true, baz: true}}></div>`;
        
        expect(el.className).to.equal('foo bar baz');
    });

    it('should set the class attribute with a function that returns an array', () => {
        const callback = sinon.spy(() => ['foo', 'bar', 'baz', 'qux']);
        const el = html`<div class=${callback}></div>`;
        
        expect(el.className).to.equal('foo bar baz qux');
        expect(callback.callCount).to.equal(1);
        expect(callback.args[0][0]).to.equal(el);
    });

    it('should set the class attribute with a function that returns an object', () => {  
        const callback = sinon.spy(() => ({foo: true, bar: false, baz: true}));
        const el = html`<div class=${callback}></div>`;
        
        expect(el.className).to.equal('foo baz');
        expect(callback.callCount).to.equal(1);
        expect(callback.args[0][0]).to.equal(el);
    });

    it('should alias className to class', () => {
        const el = html`<div className="foo"></div>`;
        
        expect(el.className).to.equal('foo');
    });

    it('should support boolean attributes', () => {
        const el = html`<input disabled />`;

        expect(el.disabled).to.equal(true);
        expect(el.outerHTML).to.equal('<input disabled="">');
    });

    it('should support CSS styles as a key/value map', () => {
        const el = html`<div style=${{width: '100px', height: '100px'}}></div>`;

        expect(el.outerHTML).to.equal('<div style="width: 100px; height: 100px;"></div>');
    });

    it('should support CSS styles as a string', () => {
        const el = html`<div style=${'background-color: rgb(20, 20, 20); position: static;'}></div>`;

        expect(el.outerHTML).to.equal('<div style="background-color: rgb(20, 20, 20); position: static;"></div>');
    });

    it('should set CSS styles with a function that returns a key/value map', () => {
        const callback = sinon.spy(() => ({width: '60px', height: '60px'}));
        const el = html`<div style=${callback}></div>`;

        expect(el.outerHTML).to.equal('<div style="width: 60px; height: 60px;"></div>');
        expect(callback.callCount).to.equal(1);
        expect(callback.args[0][0]).to.equal(el);
    });

    it('should set CSS styles with a function that returns styles as a string', () => {
        const callback = sinon.spy(() => 'color: rgb(90, 20, 70); position: relative;');
        const el = html`<div style=${callback}></div>`;

        expect(el.outerHTML).to.equal('<div style="color: rgb(90, 20, 70); position: relative;"></div>');
        expect(callback.callCount).to.equal(1);
        expect(callback.args[0][0]).to.equal(el);
    });

    it('should support CSS variables', () => {
        const el = html`<div style=${{color: 'var(--color)', '--color': 'red'}}></div>`;
        document.body.appendChild(el);

        expect(el.style.color).to.equal('var(--color)');
        expect(window.getComputedStyle(el).getPropertyValue('color')).to.equal('rgb(255, 0, 0)');
        expect(window.getComputedStyle(el).getPropertyValue('--color')).to.equal('red');
        expect(el.outerHTML).to.equal('<div style="color: var(--color); --color:red;"></div>');
        document.body.removeChild(el);
    });

    it('should support DOM properties', () => {
        const el = html`<input type="text" value="foo" />`;

        expect(el.value).to.equal('foo');
    });

    it('should set a DOM property with a function', () => {
        const callback = sinon.spy(() => 'foo');
        const el = html`<input type="text" value=${callback} />`;

        expect(el.value).to.equal('foo');
        expect(callback.callCount).to.equal(1);
        expect(callback.args[0][0]).to.equal(el);
    });

    it('should support the input list attribute', () => {
        const el = html`<input list="foo" />`;

        expect(el.outerHTML).to.equal('<input list="foo">');
    });

    it('should support the input form attribute', () => {
        const el = html`<input form="foo" />`;

        expect(el.outerHTML).to.equal('<input form="foo">');
    });

    it('should support event listeners', (done) => {
        const event = new MouseEvent('click');

        const onClick = (e) => {
            expect(e).to.equal(event);
            document.body.removeChild(el);
            done();
        };

        const el = html`<div onclick=${onClick}></div>`;
        document.body.appendChild(el);
        el.dispatchEvent(event);
    });

    it('should support custom events', (done) => {
        const event = new CustomEvent('foo');

        const callback = sinon.spy((e) => {
            expect(e).to.equal(event);
            document.body.removeChild(el);
            done();
        });

        const el = html`<div onfoo=${callback}></div>`;
        document.body.appendChild(el);
        el.dispatchEvent(event);
    });

    it('should support camel-cased event names', (done) => {
        const event = new MouseEvent('mouseover');

        const onMouseOver = (e) => {
            expect(e).to.equal(event);
            done();
        };

        const el = html`<div onMouseOver=${onMouseOver}></div>`;

        el.dispatchEvent(event);
    });

    it('should create child nodes', () => {
        const el = html`<div>foo<span a="1">bar<em b="2" c="3">baz</em></span>qux</div>`;

        expect(el.outerHTML).to.equal('<div>foo<span a="1">bar<em b="2" c="3">baz</em></span>qux</div>');
    });

    it('should convert numbers to text nodes', () => {
        const el = html`<div>${123}</div>`;

        expect(el.outerHTML).to.equal('<div>123</div>');
    });

    it('should support a dynamic element', () => {
        const el = html`<div>${html`<span></span>`}</div>`;

        expect(el.outerHTML).to.equal('<div><span></span></div>');
    });

    it('should create child nodes with a function that returns a string', () => {
        const callback = sinon.spy(() => 'foo');
        const el = html`<div>${callback}</div>`;

        expect(el.outerHTML).to.equal('<div>foo</div>');
        expect(callback.callCount).to.equal(1);
    });
    
    it('should create child nodes with a function that returns a DOM node', () => {
        const callback = sinon.spy(() => html`<span />`);
        const el = html`<div>${callback}</div>`;

        expect(el.outerHTML).to.equal('<div><span></span></div>');
        expect(callback.callCount).to.equal(1);
    });

    it('should unpack deeply nested functions', () => {
        const callback = () => () => () => () => 'bar';
        const el = html`<div>${callback}</div>`;

        expect(el.outerHTML).to.equal('<div>bar</div>');
    });

    it('should escape HTML characters', () => {
        const el = html`<div>${'<i id="foo" class=\'bar\'>bar</i>'}</div>`;

        expect(el.outerHTML).to.equal('<div>&lt;i id="foo" class=\'bar\'&gt;bar&lt;/i&gt;</div>');
    });

    it('should support an array of children', () => {
        const children = [
            'foo',
            null,
            html`<div>bar</div>`,
            undefined,
            document.createElement('span'),
        ];

        const el = html`<div>${children}</div>`;
        expect(el.outerHTML).to.equal('<div>foo<div>bar</div><span></span></div>');
    });

    it('should support a multi-dimensional array of children', () => {
        const children = [
            html`<div />`,
            [
                html`<span />`,
                html`<em />`,
                [
                    html`<i />`,
                ]
            ],
            html`<section />`,
            html`<p />`,
        ];

        const el = html`<div>${children}</div>`;
        expect(el.outerHTML).to.equal('<div><div></div><span></span><em></em><i></i><section></section><p></p></div>');
    });

    it('should create child nodes with a function that returns an array', () => {
        const callback = sinon.spy(() => [
            html`<em />`,
            'bar',
            null,
            document.createElement('span'),
            50
        ]);

        const el = html`<div>${callback}</div>`;
        expect(el.outerHTML).to.equal('<div><em></em>bar<span></span>50</div>');
        expect(callback.callCount).to.equal(1);
    });

    it('should not create nodes if a callback function returns null or undefined', () => {
        const el = html`<div>${() => null} ${() => undefined}</div>`;

        expect(el.outerHTML).to.equal('<div> </div>');
    });

    it('should execute scripts', () => {
        const el = html`<script>window.foo = "foo";</script>`;
        expect(window.foo).to.not.exist;
        document.body.appendChild(el);
        expect(window.foo).to.exist;
        delete window.foo;
    });

    it('should ignore leading/trailing line breaks', () => {
        const el = html`
            <div></div>
        `;

        expect(el.nodeType).to.equal(1);
        expect(el.outerHTML).to.equal('<div></div>');
    });

    it('should support custom elements', () => {
        const customElementSpy = sinon.spy();

        customElements.define('foo-bar', class FooBar extends HTMLElement {
            constructor() {
                super();
                customElementSpy();
            }
        });

        const el = html`
            <foo-bar></foo-bar>
        `;

        expect(el.nodeType).to.equal(1);
        expect(el.nodeName).to.equal('FOO-BAR');
        expect(el.outerHTML).to.equal('<foo-bar></foo-bar>');
        expect(customElementSpy.callCount).to.equal(1);
    });

    it('should support SVG', () => {
        const svg = html`<svg><circle cx="50" cy="50" r="40" fill="red" textContent="foo"></circle></svg>`;
    
        expect(svg.outerHTML).to.equal('<svg><circle cx="50" cy="50" r="40" fill="red" textContent="foo"></circle></svg>');
    
        expect(svg.nodeType).to.equal(1);
        expect(svg.namespaceURI).to.equal('http://www.w3.org/2000/svg');
        expect(svg).to.be.instanceof(SVGElement);
    
        const circle = svg.querySelector('circle');
        expect(circle.nodeType).to.equal(1);
        expect(circle.namespaceURI).to.equal('http://www.w3.org/2000/svg');
        expect(circle).to.be.instanceof(SVGElement);
        expect(circle.getAttribute('textContent')).to.equal('foo');
        expect(circle.textContent).to.equal('');
    });

    it('should support stateless functional components', () => {
        const Component = sinon.spy(({foo, bar, children}) => html`<div foo=${foo} bar=${bar}>${children}</div>`);

        const el = html`
            <${Component} foo="abc" bar=${123}>
                <span>baz</span>
            <//>
        `;

        expect(Component.callCount).to.equal(1);
        expect(Component.args[0][0]).to.be.a('object');
        expect(Component.args[0][0].foo).to.equal('abc');
        expect(Component.args[0][0].bar).to.equal(123);
        expect(Component.args[0][0].children).to.be.an('array');
        expect(Component.args[0][0].children).to.have.length(1);
        expect(Component.args[0][0].children[0].outerHTML).to.equal('<span>baz</span>');
        expect(el.outerHTML).to.equal('<div foo="abc" bar="123"><span>baz</span></div>');
    });

    it('should not cache elements with identical markup', () => {
        const text = () => html`foo`;
        const element = () => html`<div></div>`;
        const frag = () => html`<div></div><span></span>`;

        expect(html`foo`).to.not.equal(html`foo`);
        expect(html`<div></div>`).to.not.equal(html`<div></div>`);
        expect(html`<div></div><span></span>`).to.not.equal(html`<div></div><span></span>`);
        expect(text()).to.not.equal(text());
        expect(element()).to.not.equal(element());
        expect(frag()).to.not.equal(frag());
    });
});
