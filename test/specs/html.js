import { html } from '../../src/reflex';

describe('html', () => {
    it('should create a DOM element', () => {
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
});
