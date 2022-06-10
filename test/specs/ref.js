import { html, val, each, dispose, tick } from '../../src/reflex';

describe('ref', () => {
    it('should support adding elements to a store via the "ref" attribute', () => {
        const store = val();

        const spy = sinon.spy();
        store.subscribe(spy);

        expect(spy.callCount).to.equal(1);
        expect(spy.args[0][0]).to.equal(undefined);
        expect(spy.args[0][1]).to.equal(undefined);

        const div = html`<div><span ref=${store} /><em ref=${store} /><i ref=${store} /></div>`;

        const elements = store.get();
        expect(elements).to.be.an('array');
        expect(elements).to.have.lengthOf(3);

        const [span, em, i] = elements;

        expect(span.nodeType).to.equal(1);
        expect(em.nodeType).to.equal(1);
        expect(i.nodeType).to.equal(1);

        expect(span.nodeName).to.equal('SPAN');
        expect(em.nodeName).to.equal('EM');
        expect(i.nodeName).to.equal('I');

        expect(span.parentNode).to.equal(div);
        expect(em.parentNode).to.equal(div);
        expect(i.parentNode).to.equal(div);

        expect(spy.callCount).to.equal(4);
        
        expect(spy.args[1][0]).to.deep.equal([span]);
        expect(spy.args[1][1]).to.equal(undefined);

        expect(spy.args[2][0]).to.deep.equal([span, em]);
        expect(spy.args[2][1]).to.deep.equal([span]);
        expect(spy.args[2][0]).to.not.equal(spy.args[2][1]);

        expect(spy.args[3][0]).to.deep.equal([span, em, i]);
        expect(spy.args[3][1]).to.deep.equal([span, em]);
        expect(spy.args[3][0]).to.not.equal(spy.args[3][1]);
    });

    it('should support functions via the "ref" attribute', () => {
        const spy = sinon.spy();

        const div = html`<div><span ref=${spy} /></div>`;
        const span = div.firstChild;

        expect(spy.callCount).to.equal(1);
        expect(spy.args[0][0]).to.equal(span);
    });

    it('should support functions that return a store', () => {
        const store = val();
        const spy = sinon.spy(() => store);

        const div = html`<div><span ref=${spy} /></div>`;
        const span = div.firstChild;

        expect(store.get()[0]).to.equal(span);
        expect(spy.callCount).to.equal(1);
        expect(spy.args[0][0]).to.equal(span);
    });

    it('should support deeply nested functions', () => {
        const spy = sinon.spy();

        const div = html`<div><span ref=${() => () => () => spy} /></div>`;
        const span = div.firstChild;

        expect(spy.callCount).to.equal(1);
        expect(spy.args[0][0]).to.equal(span);
    });

    it('should remove an element from a ref store when the element is disposed', () => {
        const foo = val();
        const div = html`<div ref=${foo}></div>`;

        expect(foo.get()).to.have.lengthOf(1);
        
        dispose(div);

        expect(foo.get()).to.have.lengthOf(0);
    });
    
    it('should remove an element from a ref store after an each reconciliation', (done) => {
        const foo = val();
        const spy = sinon.spy();
        foo.subscribe(spy);

        expect(spy.callCount).to.equal(1);

        expect(spy.args[0][0]).to.deep.equal(undefined);
        expect(spy.args[0][1]).to.equal(undefined);

        const list = val([1, 2, 3]);
        const el = html`
            <ul>
                ${each(list, (item) => html`<li ref="${foo}">${item}</li>`)}
            </ul>
        `;

        const li1 = el.children[0];
        const li2 = el.children[1];
        const li3 = el.children[2];

        expect(spy.callCount).to.equal(4);
        
        expect(spy.args[1][0]).to.deep.equal([li1]);
        expect(spy.args[1][1]).to.deep.equal(undefined);

        expect(spy.args[2][0]).to.deep.equal([li1, li2]);
        expect(spy.args[2][1]).to.deep.equal([li1]);
        expect(spy.args[2][0]).to.not.equal(spy.args[2][1]);

        expect(spy.args[3][0]).to.deep.equal([li1, li2, li3]);
        expect(spy.args[3][1]).to.deep.equal([li1, li2]);
        expect(spy.args[3][0]).to.not.equal(spy.args[3][1]);
            
        list.set([3, 4, 5]);
        
        tick().then(() => {
            const li4 = el.children[1];
            const li5 = el.children[2];

            expect(foo.get()).to.deep.equal([li3, li5, li4]);
            expect(spy.callCount).to.equal(8);

            expect(spy.args[4][0]).to.deep.equal([li2, li3]);
            expect(spy.args[4][1]).to.deep.equal([li1, li2, li3]);
            expect(spy.args[4][0]).to.not.equal(spy.args[4][1]);

            expect(spy.args[5][0]).to.deep.equal([li3]);
            expect(spy.args[5][1]).to.deep.equal([li2, li3]);
            expect(spy.args[5][0]).to.not.equal(spy.args[5][1]);

            expect(spy.args[6][0]).to.deep.equal([li3, li5]);
            expect(spy.args[6][1]).to.deep.equal([li3]);
            expect(spy.args[6][0]).to.not.equal(spy.args[6][1]);

            expect(spy.args[7][0]).to.deep.equal([li3, li5, li4]);
            expect(spy.args[7][1]).to.deep.equal([li3, li5]);
            expect(spy.args[7][0]).to.not.equal(spy.args[7][1]);

            done();
        });
    });
});
