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

    it('should render a string as a text node', () => {
        const string = 'foo';
        const el = html`<div>${string}</div>`;

        expect(el.outerHTML).to.equal('<div>foo</div>');
    });

    it('should render a number as a text node', () => {
        const number = 100;
        const el = html`<div>${number}</div>`;

        expect(el.outerHTML).to.equal('<div>100</div>');
    });

    it('should render a string as an attribute', () => {
        const string = 'foo';
        const el = html`<div class=${string}></div>`;

        expect(el.outerHTML).to.equal('<div class="foo"></div>');
    });

    it('should render a text node', () => {
        const text = document.createTextNode('foo');
        const el = html`<div>${text}</div>`;

        expect(el.outerHTML).to.equal('<div>foo</div>');
    });
    
    it('should render an element', () => {
        const span = document.createElement('span');
        const el = html`<div>${span}</div>`;

        expect(el.outerHTML).to.equal('<div><span></span></div>');
    });

    it('should render a document fragment', () => {
        const frag = html`<i></i><em></em>`;

        const el = html`<div>${frag}</div>`;

        expect(el.outerHTML).to.equal('<div><i></i><em></em></div>');
    });

    it('should render child nodes from an array', () => {
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

    it('should render child nodes from a multi-dimensional array', () => {
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

    it('should set the class attribute with an array', () => {
        const el = html`<div class=${['foo', 'bar', 'baz']}></div>`;
        
        expect(el.className).to.equal('foo bar baz');
    });

    it('should set the class attribute with an object', () => {        
        const el = html`<div class=${{foo: true, bar: true, baz: true}}></div>`;
        
        expect(el.className).to.equal('foo bar baz');
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

    it('should set CSS styles with a key/value map', () => {
        const el = html`<div style=${{width: '100px', height: '100px'}}></div>`;

        expect(el.outerHTML).to.equal('<div style="width: 100px; height: 100px;"></div>');
    });

    it('should set CSS styles with a string', () => {
        const el = html`<div style=${'background-color: rgb(20, 20, 20); position: static;'}></div>`;

        expect(el.outerHTML).to.equal('<div style="background-color: rgb(20, 20, 20); position: static;"></div>');
    });

    it('should set CSS variables', () => {
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

    it('should support the input list attribute', () => {
        const el = html`<input list="foo" />`;

        expect(el.outerHTML).to.equal('<input list="foo">');
    });

    it('should support the input form attribute', () => {
        const el = html`<input form="foo" />`;

        expect(el.outerHTML).to.equal('<input form="foo">');
    });

    it('should set an event listener', (done) => {
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

    it('should set an event listener for a custom event', (done) => {
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

    it('should escape an HTML string', () => {
        /* eslint-disable quotes */
        const string = `<span id="foo" class='bar'>this & that</span>`;
        const el = html`<div>${string}</div>`;

        expect(el.outerHTML).to.equal(`<div>&lt;span id="foo" class='bar'&gt;this &amp; that&lt;/span&gt;</div>`);
        /* eslint-enable quotes */
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
        const svg = html`<svg><circle class="foo" cx="50" cy="50" r="40" fill="red" textContent="bar"></circle></svg>`;
    
        expect(svg.outerHTML).to.equal('<svg><circle class="foo" cx="50" cy="50" r="40" fill="red" textContent="bar"></circle></svg>');
    
        expect(svg.nodeType).to.equal(1);
        expect(svg.namespaceURI).to.equal('http://www.w3.org/2000/svg');
        expect(svg).to.be.instanceof(SVGElement);
    
        const circle = svg.querySelector('circle');
        expect(circle.nodeType).to.equal(1);
        expect(circle.namespaceURI).to.equal('http://www.w3.org/2000/svg');
        expect(circle).to.be.instanceof(SVGElement);
        expect(circle.getAttribute('class')).to.equal('foo');
        expect(circle.getAttribute('textContent')).to.equal('bar');
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
