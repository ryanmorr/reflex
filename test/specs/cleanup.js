import { html, val, cleanup, dispose, each, tick } from '../../src/reflex';

describe('cleanup', () => {
    it('should call a cleanup callback when an element is disposed', () => {
        const el = html`<div />`;
        const spy = sinon.spy();

        cleanup(el, spy);

        expect(spy.callCount).to.equal(0);
        
        dispose(el);

        expect(spy.callCount).to.equal(1);
        expect(spy.args[0][0]).to.equal(el);
    });

    it('should call a cleanup callback when a text node is disposed', () => {
        const textNode = html`foo`;
        const spy = sinon.spy();

        cleanup(textNode, spy);

        expect(spy.callCount).to.equal(0);
        
        dispose(textNode);

        expect(spy.callCount).to.equal(1);
        expect(spy.args[0][0]).to.equal(textNode);
    });

    it('should call a cleanup callback when an element\'s parent is disposed', () => {
        const el = html`<div><span /></div>`;
        const span = el.firstChild;
        const spy = sinon.spy();

        cleanup(span, spy);

        expect(spy.callCount).to.equal(0);
        
        dispose(el);

        expect(spy.callCount).to.equal(1);
        expect(spy.args[0][0]).to.equal(span);
    });

    it('should call a cleanup callback when a text node\'s parent is disposed', () => {
        const el = html`<div>foo</div>`;
        const textNode = el.firstChild;
        const spy = sinon.spy();

        cleanup(textNode, spy);

        expect(spy.callCount).to.equal(0);
        
        dispose(el);

        expect(spy.callCount).to.equal(1);
        expect(spy.args[0][0]).to.equal(textNode);
    });

    it('should call a cleanup callback when an element is diffed out after an each reconciliation', (done) => {
        const list = val([1, 2, 3]);
        const spy = sinon.spy();

        const el = html`
            <ul>
                ${each(list, (n) => {
                    const li = html`<li>${n}</li>`;
                    cleanup(li, spy);
                    return li;
                })}
            </ul>
        `;

        const li3 = el.lastElementChild;

        expect(el.innerHTML).to.equal('<li>1</li><li>2</li><li>3</li>');

        list.set([1, 2]);
        
        tick().then(() => {
            expect(spy.callCount).to.equal(1);
            expect(spy.args[0][0]).to.equal(li3);
            
            done();
        });
    });

    it('should support an array of elements', () => {
        const div = html`<div />`;
        const span = html`<span />`;
        const em = html`<em />`;
        const spy = sinon.spy();

        cleanup([div, span, em], spy);

        expect(spy.callCount).to.equal(0);
        
        dispose(div);
        dispose(span);
        dispose(em);

        expect(spy.callCount).to.equal(3);
        expect(spy.args[0][0]).to.equal(div);
        expect(spy.args[1][0]).to.equal(span);
        expect(spy.args[2][0]).to.equal(em);
    });

    it('should support a document fragment', () => {
        const frag = html`<div /><span /><em />`;
        const div = frag.children[0];
        const span = frag.children[1];
        const em = frag.children[2];
        const spy = sinon.spy();

        cleanup(frag, spy);

        expect(spy.callCount).to.equal(0);
        
        dispose(div);
        dispose(span);
        dispose(em);

        expect(spy.callCount).to.equal(3);
        expect(spy.args[0][0]).to.equal(div);
        expect(spy.args[1][0]).to.equal(span);
        expect(spy.args[2][0]).to.equal(em);
    });
});
