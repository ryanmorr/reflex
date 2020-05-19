import { waitForRender } from '../setup';
import { html, ref, store, each, dispose } from '../../src/reflex';

describe('ref', () => {
    it('should add an element to a ref store', () => {
        const foo = ref();

        expect(foo.get()).to.be.an('array');
        expect(foo.get()).to.have.lengthOf(0);

        const div = html`<div ref=${foo}></div>`;

        expect(foo.get()).to.have.lengthOf(1);
        expect(foo.get()).to.deep.equal([div]);
        expect(foo.get(0)).to.equal(div);
    });

    it('should add multiple elements to a ref store', () => {
        const foo = ref();
        const frag = html`<div ref=${foo}></div><span ref=${foo}></span>`;
        const div = frag.children[0];
        const span = frag.children[1];

        expect(foo.get()).to.have.lengthOf(2);
        expect(foo.get()).to.deep.equal([div, span]);
        expect(foo.get(0)).to.equal(div);
        expect(foo.get(1)).to.equal(span);

        const em = html`<em ref=${foo}></em>`;

        expect(foo.get()).to.have.lengthOf(3);
        expect(foo.get()).to.deep.equal([div, span, em]);
        expect(foo.get(2)).to.equal(em);
    });

    it('should allow explicitly adding elements to a ref store', () => {
        const foo = ref();

        expect(foo.get()).to.have.lengthOf(0);
        expect(foo.get()).to.deep.equal([]);

        const div = html`<div></div>`;

        foo.add(div);

        expect(foo.get()).to.have.lengthOf(1);
        expect(foo.get()).to.deep.equal([div]);

        const span = html`<span></span>`;
        const em = html`<em></em>`;
        const p = html`<p></p>`;

        foo.add(span, em, p);

        expect(foo.get()).to.have.lengthOf(4);
        expect(foo.get()).to.deep.equal([div, span, em, p]);
    });

    it('should remove an element from a ref store', () => {
        const foo = ref();
        const frag = html`<div ref=${foo}></div><span ref=${foo}></span>`;
        const div = frag.children[0];
        const span = frag.children[1];

        expect(foo.get()).to.have.lengthOf(2);

        foo.remove(div);

        expect(foo.get()).to.have.lengthOf(1);
        expect(foo.get()).to.deep.equal([span]);
        expect(foo.get(0)).to.equal(span);

        foo.remove(span);

        expect(foo.get()).to.have.lengthOf(0);
        expect(foo.get()).to.deep.equal([]);
    });

    it('should call subscribers when an element is added to a ref store', () => {
        const foo = ref();
        const spy = sinon.spy();
        foo.subscribe(spy);

        expect(spy.callCount).to.equal(1);

        expect(spy.args[0][0]).to.deep.equal([]);
        expect(spy.args[0][1]).to.equal(undefined);
        expect(spy.args[0][2]).to.equal(undefined);
        expect(spy.args[0][3]).to.equal(undefined);

        const div = html`<div ref=${foo}></div>`;

        expect(spy.callCount).to.equal(2);

        expect(spy.args[1][0]).to.deep.equal([div]);
        expect(spy.args[1][1]).to.deep.equal([]);
        expect(spy.args[1][0]).to.not.equal(spy.args[1][1]);
        expect(spy.args[1][2]).to.equal(div);
        expect(spy.args[1][3]).to.equal(1);

        const frag = html`<span ref=${foo}></span><em ref=${foo}></em>`;
        const span = frag.children[0];
        const em = frag.children[1];

        expect(spy.callCount).to.equal(4);

        expect(spy.args[2][0]).to.deep.equal([div, span]);
        expect(spy.args[2][1]).to.deep.equal([div]);
        expect(spy.args[2][0]).to.not.equal(spy.args[2][1]);
        expect(spy.args[2][2]).to.equal(span);
        expect(spy.args[2][3]).to.equal(1);

        expect(spy.args[3][0]).to.deep.equal([div, span, em]);
        expect(spy.args[3][1]).to.deep.equal([div, span]);
        expect(spy.args[3][0]).to.not.equal(spy.args[3][1]);
        expect(spy.args[3][2]).to.equal(em);
        expect(spy.args[3][3]).to.equal(1);

        const p = html`<p></p>`;
        const i = html`<i></i>`;

        foo.add(p, i);

        expect(spy.callCount).to.equal(6);

        expect(spy.args[4][0]).to.deep.equal([div, span, em, p]);
        expect(spy.args[4][1]).to.deep.equal([div, span, em]);
        expect(spy.args[4][0]).to.not.equal(spy.args[4][1]);
        expect(spy.args[4][2]).to.equal(p);
        expect(spy.args[4][3]).to.equal(1);

        expect(spy.args[5][0]).to.deep.equal([div, span, em, p, i]);
        expect(spy.args[5][1]).to.deep.equal([div, span, em, p]);
        expect(spy.args[5][0]).to.not.equal(spy.args[5][1]);
        expect(spy.args[5][2]).to.equal(i);
        expect(spy.args[5][3]).to.equal(1);
    });

    it('should call subscribers when an element is removed from a ref store', () => {
        const foo = ref();
        const frag = html`
            <div ref=${foo}></div>
            <span ref=${foo}></span>
            <em ref=${foo}></em>
        `;
        const div = frag.children[0];
        const span = frag.children[1];
        const em = frag.children[2];

        const spy = sinon.spy();
        foo.subscribe(spy);

        expect(spy.callCount).to.equal(1);

        expect(spy.args[0][0]).to.deep.equal([div, span, em]);
        expect(spy.args[0][1]).to.equal(undefined);

        foo.remove(span);

        expect(spy.callCount).to.equal(2);

        expect(spy.args[1][0]).to.deep.equal([div, em]);
        expect(spy.args[1][1]).to.deep.equal([div, span, em]);
        expect(spy.args[1][0]).to.not.equal(spy.args[1][1]);
        expect(spy.args[1][2]).to.equal(span);
        expect(spy.args[1][3]).to.equal(-1);

        foo.remove(div, em);

        expect(spy.callCount).to.equal(4);

        expect(spy.args[2][0]).to.deep.equal([em]);
        expect(spy.args[2][1]).to.deep.equal([div, em]);
        expect(spy.args[2][0]).to.not.equal(spy.args[2][1]);
        expect(spy.args[2][2]).to.equal(div);
        expect(spy.args[2][3]).to.equal(-1);

        expect(spy.args[3][0]).to.deep.equal([]);
        expect(spy.args[3][1]).to.deep.equal([em]);
        expect(spy.args[3][0]).to.not.equal(spy.args[3][1]);
        expect(spy.args[3][2]).to.equal(em);
        expect(spy.args[3][3]).to.equal(-1);
    });

    it('should not allow an element to be added to the same ref store multiple times', () => {
        const foo = ref();
        const div = html`<div ref=${foo}></div>`;

        expect(foo.get()).to.have.lengthOf(1);
        expect(foo.get()).to.deep.equal([div]);
        
        foo.add(div);

        expect(foo.get()).to.have.lengthOf(1);
        expect(foo.get()).to.deep.equal([div]);
    });

    it('should remove an element from a ref store when the element is disposed', () => {
        const foo = ref();
        const div = html`<div ref=${foo}></div>`;

        expect(foo.get()).to.have.lengthOf(1);
        
        dispose(div);

        expect(foo.get()).to.have.lengthOf(0);
    });
    
    it('should remove an element from a ref store after an each reconciliation', (done) => {
        const foo = ref();
        const spy = sinon.spy();
        foo.subscribe(spy);

        expect(spy.callCount).to.equal(1);

        expect(spy.args[0][0]).to.deep.equal([]);
        expect(spy.args[0][1]).to.equal(undefined);
        expect(spy.args[0][2]).to.equal(undefined);
        expect(spy.args[0][3]).to.equal(undefined);

        const list = store([1, 2, 3]);
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
        expect(spy.args[1][1]).to.deep.equal([]);
        expect(spy.args[1][2]).to.equal(li1);
        expect(spy.args[1][3]).to.equal(1);

        expect(spy.args[2][0]).to.deep.equal([li1, li2]);
        expect(spy.args[2][1]).to.deep.equal([li1]);
        expect(spy.args[2][2]).to.equal(li2);
        expect(spy.args[2][3]).to.equal(1);  

        expect(spy.args[3][0]).to.deep.equal([li1, li2, li3]);
        expect(spy.args[3][1]).to.deep.equal([li1, li2]);
        expect(spy.args[3][2]).to.equal(li3);
        expect(spy.args[3][3]).to.equal(1);  
            
        list.set([3, 4, 5]);
        waitForRender(() => {
            const li4 = el.children[1];
            const li5 = el.children[2];

            expect(foo.get()).to.deep.equal([li3, li5, li4]);
            expect(spy.callCount).to.equal(8);

            expect(spy.args[4][0]).to.deep.equal([li2, li3]);
            expect(spy.args[4][1]).to.deep.equal([li1, li2, li3]);
            expect(spy.args[4][2]).to.equal(li1);
            expect(spy.args[4][3]).to.equal(-1);

            expect(spy.args[5][0]).to.deep.equal([li3]);
            expect(spy.args[5][1]).to.deep.equal([li2, li3]);
            expect(spy.args[5][2]).to.equal(li2);
            expect(spy.args[5][3]).to.equal(-1);

            expect(spy.args[6][0]).to.deep.equal([li3, li5]);
            expect(spy.args[6][1]).to.deep.equal([li3]);
            expect(spy.args[6][2]).to.equal(li5);
            expect(spy.args[6][3]).to.equal(1);

            expect(spy.args[7][0]).to.deep.equal([li3, li5, li4]);
            expect(spy.args[7][1]).to.deep.equal([li3, li5]);
            expect(spy.args[7][2]).to.equal(li4);
            expect(spy.args[7][3]).to.equal(1);

            done();
        });
    });
});
