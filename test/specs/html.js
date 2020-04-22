import { html } from '../../src/reflex';

describe('html', () => {
    it('should create a DOM element', () => {
        const el = html`<div></div>`;

        expect(el.nodeType).to.equal(1);
        expect(el.outerHTML).to.equal('<div></div>');
        expect(el.ownerDocument).to.equal(document);
    });
});
