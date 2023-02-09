import { html, val, each, dispose, cleanup, tick } from '../../src/reflex';

describe('disposal-each', () => {
    it('should dispose bindings from nodes removed after an each reconciliation', async () => {
        const value = val('foo');
        const list = val([1, 2, 3]);

        const el = html`
            <ul>
                ${each(list, (n) => html`<li>${n} ${value}</li>`)}
            </ul>
        `;

        expect(el.innerHTML).to.equal('<li>1 foo</li><li>2 foo</li><li>3 foo</li>');

        const li1 = el.children[0];
        const li2 = el.children[1];
        const li3 = el.children[2];

        value.set('bar');
        
        await tick();
        expect(li1.textContent).to.equal('1 bar');
        expect(li2.textContent).to.equal('2 bar');
        expect(li3.textContent).to.equal('3 bar');

        list.set([4, 5, 6]);

        await tick();
        expect(el.innerHTML).to.equal('<li>4 bar</li><li>5 bar</li><li>6 bar</li>');

        value.set('baz');

        await tick();
        expect(el.innerHTML).to.equal('<li>4 baz</li><li>5 baz</li><li>6 baz</li>');
        expect(li1.textContent).to.equal('1 bar');
        expect(li2.textContent).to.equal('2 bar');
        expect(li3.textContent).to.equal('3 bar');
    });

    it('should dispose bindings from nodes removed from the beginning after an each reconciliation', async () => {
        const value = val('foo');
        const list = val([1, 2, 3, 4]);

        const el = html`
            <ul>
                ${each(list, (n) => html`<li>${n} ${value}</li>`)}
            </ul>
        `;

        expect(el.innerHTML).to.equal('<li>1 foo</li><li>2 foo</li><li>3 foo</li><li>4 foo</li>');

        const li1 = el.children[0];
        const li2 = el.children[1];
        const li3 = el.children[2];
        const li4 = el.children[3];

        value.set('bar');
        
        await tick();
        expect(li1.textContent).to.equal('1 bar');
        expect(li2.textContent).to.equal('2 bar');
        expect(li3.textContent).to.equal('3 bar');
        expect(li4.textContent).to.equal('4 bar');

        list.set([3, 4]);

        await tick();
        expect(el.innerHTML).to.equal('<li>3 bar</li><li>4 bar</li>');

        value.set('baz');

        await tick();
        expect(el.innerHTML).to.equal('<li>3 baz</li><li>4 baz</li>');
        expect(li1.textContent).to.equal('1 bar');
        expect(li2.textContent).to.equal('2 bar');
        expect(li3.textContent).to.equal('3 baz');
        expect(li4.textContent).to.equal('4 baz');
    });

    it('should dispose bindings from nodes removed from the middle after an each reconciliation', async () => {
        const value = val('foo');
        const list = val([1, 2, 3, 4]);

        const el = html`
            <ul>
                ${each(list, (n) => html`<li>${n} ${value}</li>`)}
            </ul>
        `;

        expect(el.innerHTML).to.equal('<li>1 foo</li><li>2 foo</li><li>3 foo</li><li>4 foo</li>');

        const li1 = el.children[0];
        const li2 = el.children[1];
        const li3 = el.children[2];
        const li4 = el.children[3];

        value.set('bar');
        
        await tick();
        expect(li1.textContent).to.equal('1 bar');
        expect(li2.textContent).to.equal('2 bar');
        expect(li3.textContent).to.equal('3 bar');
        expect(li4.textContent).to.equal('4 bar');

        list.set([2, 3]);

        await tick();
        expect(el.innerHTML).to.equal('<li>2 bar</li><li>3 bar</li>');

        value.set('baz');

        await tick();
        expect(el.innerHTML).to.equal('<li>2 baz</li><li>3 baz</li>');
        expect(li1.textContent).to.equal('1 bar');
        expect(li2.textContent).to.equal('2 baz');
        expect(li3.textContent).to.equal('3 baz');
        expect(li4.textContent).to.equal('4 bar');
    });

    it('should dispose bindings from nodes removed from the end after an each reconciliation', async () => {
        const value = val('foo');
        const list = val([1, 2, 3, 4]);

        const el = html`
            <ul>
                ${each(list, (n) => html`<li>${n} ${value}</li>`)}
            </ul>
        `;

        expect(el.innerHTML).to.equal('<li>1 foo</li><li>2 foo</li><li>3 foo</li><li>4 foo</li>');

        const li1 = el.children[0];
        const li2 = el.children[1];
        const li3 = el.children[2];
        const li4 = el.children[3];

        value.set('bar');
        
        await tick();
        expect(li1.textContent).to.equal('1 bar');
        expect(li2.textContent).to.equal('2 bar');
        expect(li3.textContent).to.equal('3 bar');
        expect(li4.textContent).to.equal('4 bar');

        list.set([1, 2]);

        await tick();
        expect(el.innerHTML).to.equal('<li>1 bar</li><li>2 bar</li>');

        value.set('baz');

        await tick();
        expect(el.innerHTML).to.equal('<li>1 baz</li><li>2 baz</li>');
        expect(li1.textContent).to.equal('1 baz');
        expect(li2.textContent).to.equal('2 baz');
        expect(li3.textContent).to.equal('3 bar');
        expect(li4.textContent).to.equal('4 bar');
    });

    it('should dispose a list if the parent node is disposed', () => {
        const array = [1, 2, 3];
        const list = val(array);
        const spy = sinon.spy();

        const el = html`
            <ul>
                ${each(list, (item) => {
                    const li = html`<li>${item}</li>`;
                    cleanup(li, spy);
                    return li;
                })}
            </ul>
        `;

        expect(spy.callCount).to.equal(0);
        
        dispose(el);

        expect(spy.callCount).to.equal(3);
    });

    it('should not dispose a list item if it was not removed after an each reconciliation', async () => {
        const array = [1, 2, 3];
        const list = val(array);

        const spies = [
            sinon.spy(),
            sinon.spy(),
            sinon.spy()
        ];

        html`
            <ul>
                ${each(list, (item, i) => {
                    const li = html`<li>${item}</li>`;
                    cleanup(li, spies[i]);
                    return li;
                })}
            </ul>
        `;

        expect(spies[0].callCount).to.equal(0);
        expect(spies[1].callCount).to.equal(0);
        expect(spies[2].callCount).to.equal(0);

        list.set([2]);
        
        await tick();
        expect(spies[0].callCount).to.equal(1);
        expect(spies[1].callCount).to.equal(0);
        expect(spies[2].callCount).to.equal(1);
    });

    it('should dispose the each functionality if an ancestor element is disposed', async () => {
        const list = val([1, 2, 3]);
        const callback = sinon.spy((item) => html`<li>${item}</li>`);

        const el = html`
            <ul>
                ${each(list, callback)}
            </ul>
        `;

        expect(el.innerHTML).to.equal('<li>1</li><li>2</li><li>3</li>');
        expect(callback.callCount).to.equal(3);
        
        dispose(el);

        list.set([4, 5]);
        
        await tick();
        expect(el.innerHTML).to.equal('<li>1</li><li>2</li><li>3</li>');
        expect(callback.callCount).to.equal(3);
    });

    it('should dispose the empty content', async () => {
        const list = val();
        const spy = sinon.spy();

        const onEmpty = () => {
            const li = html`<li>Empty</li>`;
            cleanup(li, spy);
            return li;
        };

        const el = html`
            <ul>
                ${each(list, (item) => html`<li>${item}</li>`, onEmpty)}
            </ul>
        `;

        expect(el.innerHTML).to.equal('<li>Empty</li>');
        expect(spy.callCount).to.equal(0);

        list.set([1, 2, 3]);
        
        await tick();
        expect(el.innerHTML).to.equal('<li>1</li><li>2</li><li>3</li>');
        expect(spy.callCount).to.equal(1);
    });
});
