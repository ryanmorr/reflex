import { html, tick, val, each } from '../../src/reflex';

describe('tick', () => {
    it('should return a promise', (done) => {
        const promise = tick();
        expect(promise).to.be.a('promise');
        
        promise.then(done);
    });

    it('should return the same promise instance from multiple calls', (done) => {
        const promise = tick();
        expect(promise).to.equal(tick());
        expect(promise).to.equal(tick());
        
        promise.then(done);
    });

    it('should resolve after a previously queued update has been rendered', (done) => {
        const text = val();
        const el = html`<div>${text}</div>`;

        expect(el.outerHTML).to.equal('<div></div>');

        text.set('foo');
        
        tick().then(() => {
            expect(el.outerHTML).to.equal('<div>foo</div>');

            done();
        });
    });

    it('should resolve after multiple previously queued updates have been rendered', (done) => {
        const text = val();
        const attr = val();
        const list = val();

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
});
