import { html, val } from '../../src/reflex';

describe('reflex', () => {
    it('should create a DOM element', () => {
        const el = html`<div></div>`;

        expect(el.nodeType).to.equal(1);
        expect(el.outerHTML).to.equal('<div></div>');
        expect(el.ownerDocument).to.equal(document);
    });

    it('should update a text node', () => {
        const text = val();
        const el = html`<div>${text}</div>`;

        expect(el.outerHTML).to.equal('<div></div>');

        text('foo');
        expect(el.outerHTML).to.equal('<div>foo</div>');
    });

    it('should update an element', () => {
        const child = val();
        const el = html`<div>${child}</div>`;

        expect(el.innerHTML).to.equal('');

        child(html`<span />`);
        expect(el.outerHTML).to.equal('<div><span></span></div>');
    });

    it('should update an attribute', () => {
        const attr = val();
        const el = html`<div id=${attr}></div>`;

        expect(el.outerHTML).to.equal('<div></div>');

        attr('foo');
        expect(el.outerHTML).to.equal('<div id="foo"></div>');
    });
});
