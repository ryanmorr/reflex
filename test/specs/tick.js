import { html, tick, store, each } from '../../src/reflex';

describe('tick', () => {
    it('should resolve after a previously queued update has been rendered', (done) => {
        const text = store();
        const el = html`<div>${text}</div>`;

        expect(el.outerHTML).to.equal('<div></div>');

        const promise = text.set('foo');
        
        expect(promise).to.equal(tick());

        expect(promise).to.be.a('promise');
        
        promise.then(() => {
            expect(el.outerHTML).to.equal('<div>foo</div>');
            done();
        });
    });

    it('should resolve after multiple previously queued updates have been rendered', (done) => {
        const text = store();
        const attr = store();
        const list = store();

        const div = html`<div>${text}</div>`;
        const span = html`<span class=${attr}></span>`;
        const ul = html`<ul>${each(list, (item) => html`<li>${item}</li>`)}</ul>`;

        expect(div.outerHTML).to.equal('<div></div>');
        expect(span.outerHTML).to.equal('<span class=""></span>');
        expect(ul.outerHTML).to.equal('<ul></ul>');

        text.set('foo');
        attr.set('bar');
        list.set([1, 2, 3]);

        tick().then(() => {
            expect(div.outerHTML).to.equal('<div>foo</div>');
            expect(span.outerHTML).to.equal('<span class="bar"></span>');
            expect(ul.outerHTML).to.equal('<ul><li>1</li><li>2</li><li>3</li></ul>');
            done();
        });
    });

    it('should support adding multiple thenables via spread arguments', (done) => {
        const text = store();
        const el = html`<div>${text}</div>`;

        const spy1 = sinon.spy();
        const spy2 = sinon.spy();
        
        text.set('foo');
        tick(spy1, spy2, () => {
            expect(spy1.callCount).to.equal(1);
            expect(spy2.callCount).to.equal(1);
            expect(el.outerHTML).to.equal('<div>foo</div>');
            done();
        });
    });
});
