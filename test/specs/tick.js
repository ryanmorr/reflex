import { html, tick, val, each } from '../../src/reflex';

describe('tick', () => {
    it('should return a promise', async () => {
        const promise = tick();
        expect(promise).to.be.a('promise');
        
        return promise;
    });

    it('should return the same promise instance from multiple calls', async () => {
        const promise = tick();
        expect(promise).to.equal(tick());
        expect(promise).to.equal(tick());
        
        return promise;
    });

    it('should resolve after a previously queued update has been rendered', async () => {
        const text = val();
        const el = html`<div>${text}</div>`;

        expect(el.outerHTML).to.equal('<div></div>');

        text.set('foo');
        
        await tick();
        expect(el.outerHTML).to.equal('<div>foo</div>');
    });

    it('should resolve after multiple previously queued updates have been rendered', async () => {
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

        await tick();
        expect(div.outerHTML).to.equal('<div>foo</div>');
        expect(span.outerHTML).to.equal('<span class="bar"></span>');
        expect(ul.outerHTML).to.equal('<ul><li>1</li><li>2</li><li>3</li></ul>');
    });
});
