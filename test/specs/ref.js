import { waitForRender } from '../setup';
import { html, ref } from '../../src/reflex';

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

        const div = html`<div ref=${foo}></div>`;

        expect(spy.callCount).to.equal(2);
        expect(spy.args[1][0]).to.deep.equal([div]);
        expect(spy.args[1][1]).to.deep.equal([]);
        expect(spy.args[1][0]).to.not.equal(spy.args[1][1]);

        const span = html`<span ref=${foo}></span>`;

        expect(spy.callCount).to.equal(3);
        expect(spy.args[2][0]).to.deep.equal([div, span]);
        expect(spy.args[2][1]).to.deep.equal([div]);
        expect(spy.args[2][0]).to.not.equal(spy.args[2][1]);

        const frag = html`<em ref=${foo}></em><p ref=${foo}></p><i ref=${foo}></i>`;
        const em = frag.children[0];
        const p = frag.children[1];
        const i = frag.children[2];

        expect(spy.callCount).to.equal(6);

        expect(spy.args[3][0]).to.deep.equal([div, span, em]);
        expect(spy.args[3][1]).to.deep.equal([div, span]);
        expect(spy.args[3][0]).to.not.equal(spy.args[3][1]);

        expect(spy.args[4][0]).to.deep.equal([div, span, em, p]);
        expect(spy.args[4][1]).to.deep.equal([div, span, em]);
        expect(spy.args[4][0]).to.not.equal(spy.args[4][1]);

        expect(spy.args[5][0]).to.deep.equal([div, span, em, p, i]);
        expect(spy.args[5][1]).to.deep.equal([div, span, em, p]);
        expect(spy.args[5][0]).to.not.equal(spy.args[5][1]);
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

        foo.remove(div);

        expect(spy.callCount).to.equal(3);
        expect(spy.args[2][0]).to.deep.equal([em]);
        expect(spy.args[2][1]).to.deep.equal([div, em]);
        expect(spy.args[2][0]).to.not.equal(spy.args[2][1]);
    });
});
