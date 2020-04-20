import { html, val } from '../../src/reflex';

describe('reflex', () => {
    it('should create a DOM element', () => {
        const el = html`<div></div>`;

        expect(el.nodeType).to.equal(1);
        expect(el.outerHTML).to.equal('<div></div>');
        expect(el.ownerDocument).to.equal(document);
    });

    it('should update a text node', (done) => {
        const text = val();
        const el = html`<div>${text}</div>`;

        expect(el.outerHTML).to.equal('<div></div>');

        text('foo');
        requestAnimationFrame(() => {
            expect(el.outerHTML).to.equal('<div>foo</div>');
            done();
        });
    });

    it('should update an element', (done) => {
        const child = val();
        const el = html`<div>${child}</div>`;

        expect(el.innerHTML).to.equal('');

        child(html`<span />`);
        requestAnimationFrame(() => {
            expect(el.outerHTML).to.equal('<div><span></span></div>');
            done();
        });
    });

    it('should update an attribute', (done) => {
        const attr = val();
        const el = html`<div id=${attr}></div>`;

        expect(el.outerHTML).to.equal('<div></div>');

        attr('foo');
        requestAnimationFrame(() => {
            expect(el.outerHTML).to.equal('<div id="foo"></div>');
            done();
        });
    });
});
