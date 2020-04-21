import { html, store } from '../../src/reflex';

describe('reflex', () => {
    it('should create a DOM element', () => {
        const el = html`<div></div>`;

        expect(el.nodeType).to.equal(1);
        expect(el.outerHTML).to.equal('<div></div>');
        expect(el.ownerDocument).to.equal(document);
    });

    it('should update a text node', (done) => {
        const text = store();
        const el = html`<div>${text}</div>`;

        expect(el.outerHTML).to.equal('<div></div>');

        text.set('foo');
        requestAnimationFrame(() => {
            expect(el.outerHTML).to.equal('<div>foo</div>');
            done();
        });
    });

    it('should update an element', (done) => {
        const child = store();
        const el = html`<div>${child}</div>`;

        expect(el.innerHTML).to.equal('');

        child.set(html`<span />`);
        requestAnimationFrame(() => {
            expect(el.outerHTML).to.equal('<div><span></span></div>');
            done();
        });
    });

    it('should update an attribute', (done) => {
        const attr = store();
        const el = html`<div id=${attr}></div>`;

        expect(el.outerHTML).to.equal('<div></div>');

        attr.set('foo');
        requestAnimationFrame(() => {
            expect(el.outerHTML).to.equal('<div id="foo"></div>');
            done();
        });
    });
});
