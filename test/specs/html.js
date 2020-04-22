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
        let el = html`<input type="text" value="foo" />`;

        expect(el.value).to.equal('foo');
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
});
