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
        const el = html`<div>${'foo'}</div>`;

        expect(el.outerHTML).to.equal('<div>foo</div>');
    });

    it('should render a number as a text node', () => {
        const el = html`<div>${100}</div>`;

        expect(el.outerHTML).to.equal('<div>100</div>');
    });

    it('should render zero as a text node', () => {
        const el = html`<div>${0}</div>`;

        expect(el.outerHTML).to.equal('<div>0</div>');
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

    it('should not render falsy attributes', () => {
        const el = html` 
            <div
                a=${null}
                b=${undefined}
                c=${false}
                d=${NaN}
                e=${0}
			/>
        `;

        expect(el.outerHTML).to.equal('<div d="NaN" e="0"></div>');
    });

    it('should set CSS styles with an object', () => {
        const styles = {
            width: '2em',
            gridRowStart: 1,
            'padding-top': 5,
            'padding-bottom': '0.7ex',
            top: 100,
            left: '100%'
        };

        const el = html`<div style=${styles}></div>`;

        expect(el.style.cssText).to.equal('width: 2em; grid-row-start: 1; padding-top: 5px; padding-bottom: 0.7ex; top: 100px; left: 100%;');
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

    it('should not add "px" suffix for custom properties', () => {
        const el = html`<div style=${{'--foo': '100px', width: 'var(--foo)'}}>test</div>`;
        document.body.appendChild(el);

        expect(el.style.width).to.equal('var(--foo)');
        expect(window.getComputedStyle(el).getPropertyValue('--foo')).to.equal('100px');
        document.body.removeChild(el);
    });

    it('should support DOM properties', () => {
        const el = html`<input type="text" value="foo" />`;

        expect(el.value).to.equal('foo');
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

    it('should support the form attribute', () => {
		const el = html`
			<div>
				<form id="foo" />
				<button form="foo">test</button>
				<input form="foo" />
			</div>
        `;

        document.body.appendChild(el);

		const form = el.childNodes[0];
		const button = el.childNodes[1];
		const input = el.childNodes[2];

		expect(button).to.have.property('form', form);
		expect(input).to.have.property('form', form);

        document.body.removeChild(el);
	});

    it('should set an enumerable boolean attribute', () => {
		const el = html`<input spellcheck=${false} />`;

		expect(el.spellcheck).to.equal(false);
	});

	it('should set the download attribute', () => {
		const el1 = html`<a download=""></a>`;

		expect(el1.getAttribute('download')).to.equal('');

		const el2 = html`<a download=${null}></a>`;

		expect(el2.getAttribute('download')).to.equal(null);
	});

    it('should support false string aria attributes', () => {
		const el = html`<div aria-checked="false"></div>`;

		expect(el.getAttribute('aria-checked')).to.equal('false');
	});

	it('should support false aria attributes', () => {
		const el = html`<div aria-checked=${false}></div>`;

		expect(el.getAttribute('aria-checked')).to.equal('false');
	});

	it('should support false data attributes', () => {
		const el = html`<div data-checked=${false}></div>`;

		expect(el.getAttribute('data-checked')).to.equal('false');
	});

	it('should set checked attribute on custom elements without checked property', () => {
		const el = html`<o-checkbox checked />`;

		expect(el.outerHTML).to.equal('<o-checkbox checked="true"></o-checkbox>');
	});

	it('should set value attribute on custom elements without value property', () => {
		const el = html`<o-input value="test" />`;

		expect(el.outerHTML).to.equal('<o-input value="test"></o-input>');
	});

	it('should mask value on password input elements', () => {
		const el = html`<input value="xyz" type="password" />`;

		expect(el.outerHTML).to.equal('<input type="password">');
	});

	it('should unset href if null or undefined', () => {
		const el = html`
			<div>
				<a href="#">href="#"</a>
				<a href=${undefined}>href="undefined"</a>
				<a href=${null}>href="null"</a>
				<a href=${''}>href="''"</a>
			</div>
        `;

		const links = el.querySelectorAll('a');
		expect(links[0].hasAttribute('href')).to.equal(true);
		expect(links[1].hasAttribute('href')).to.equal(false);
		expect(links[2].hasAttribute('href')).to.equal(false);
		expect(links[3].hasAttribute('href')).to.equal(true);
	});

    it('should clear falsy input values', () => {
		const el = html`
			<div>
				<input value=${0} />
				<input value=${false} />
				<input value=${null} />
				<input value=${undefined} />
			</div>
		`;

		expect(el.children[0]).to.have.property('value', '0');
		expect(el.children[1]).to.have.property('value', 'false');
		expect(el.children[2]).to.have.property('value', '');
		expect(el.children[3]).to.have.property('value', '');
	});

    it('should support falsy DOM properties', () => {
        const el1 = html`
            <div>
                <input value=${false} />
                <table border=${false} />
            </div>
        `;

        expect(el1.innerHTML).to.equal('<input><table border="false"></table>');

        const el2 = html`
            <div>
                <input value=${null} />
                <table border=${null} />
            </div>
        `;

        expect(el2.innerHTML).to.equal('<input><table border=""></table>');

        const el3 = html`
            <div>
                <input value=${undefined} />
                <table border=${undefined} />
            </div>
        `;

        expect(el3.innerHTML).to.equal('<input><table border=""></table>');
    });

    it('should not set tagName', () => {
		expect(() => html`<input tagName="div" />`).not.to.throw();
	});

    it('should not throw when setting size to an invalid value', () => {
		expect(() => html`<input size=${undefined} />`).to.not.throw();
		expect(() => html`<input size=${null} />`).to.not.throw();
		expect(() => html`<input size=${0} />`).to.not.throw();
	});
});
