import { store } from '../../src/store';
import { html, each } from '../../src/reflex';

describe('each', () => {
    it('should render a list', () => {
        const array = [1, 2, 3];
        const list = store(array);

        const callback = sinon.spy((item) => html`<li>${item}</li>`);

        const el = html`
            <ul>
                ${each(list, callback)}
            </ul>
        `;

        expect(el.innerHTML).to.equal('<li>1</li><li>2</li><li>3</li>');
        
        expect(callback.callCount).to.equal(3);

        expect(callback.args[0][0]).to.equal(1);
        expect(callback.args[0][1]).to.equal(0);
        expect(callback.args[0][2]).to.equal(array);

        expect(callback.args[1][0]).to.equal(2);
        expect(callback.args[1][1]).to.equal(1);
        expect(callback.args[1][2]).to.equal(array);

        expect(callback.args[2][0]).to.equal(3);
        expect(callback.args[2][1]).to.equal(2);
        expect(callback.args[2][2]).to.equal(array);
    });

    it('should not render an undefined list', () => {
        const list = store();

        const el = html`
            <ul>
                ${each(list, (item) => html`<li>${item}</li>`)}
            </ul>
        `;

        expect(el.innerHTML).to.equal('');
    });

    it('should append nodes', (done) => {
        const list = store([1, 2]);

        const el = html`
            <ul>
                ${each(list, (item) => html`<li>${item}</li>`)}
            </ul>
        `;

        expect(el.innerHTML).to.equal('<li>1</li><li>2</li>');

        const li1 = el.children[0];
        const li2 = el.children[1];

        list.set([1, 2, 3, 4, 5]).then(() => {
            expect(el.innerHTML).to.equal('<li>1</li><li>2</li><li>3</li><li>4</li><li>5</li>');
            expect(el.children[0]).to.equal(li1);
            expect(el.children[1]).to.equal(li2);
            done();
        });
    });

    it('should prepend nodes', (done) => {
        const list = store([3, 4, 5]);

        const el = html`
            <ul>
                ${each(list, (item) => html`<li>${item}</li>`)}
            </ul>
        `;

        expect(el.innerHTML).to.equal('<li>3</li><li>4</li><li>5</li>');

        const li1 = el.children[0];
        const li2 = el.children[1];
        const li3 = el.children[2];

        list.set([1, 2, 3, 4, 5]).then(() => {
            expect(el.innerHTML).to.equal('<li>1</li><li>2</li><li>3</li><li>4</li><li>5</li>');
            expect(el.children[2]).to.equal(li1);
            expect(el.children[3]).to.equal(li2);
            expect(el.children[4]).to.equal(li3);
            done();
        });
    });

    it('should add nodes in the middle', (done) => {
        const list = store([1, 2, 5]);

        const el = html`
            <ul>
                ${each(list, (item) => html`<li>${item}</li>`)}
            </ul>
        `;

        expect(el.innerHTML).to.equal('<li>1</li><li>2</li><li>5</li>');

        const li1 = el.children[0];
        const li2 = el.children[1];
        const li3 = el.children[2];

        list.set([1, 2, 3, 4, 5]).then(() => {
            expect(el.innerHTML).to.equal('<li>1</li><li>2</li><li>3</li><li>4</li><li>5</li>');
            expect(el.children[0]).to.equal(li1);
            expect(el.children[1]).to.equal(li2);
            expect(el.children[4]).to.equal(li3);
            done();
        });
    });

    it('should add nodes at both ends', (done) => {
        const list = store([2, 3, 4]);

        const el = html`
            <ul>
                ${each(list, (item) => html`<li>${item}</li>`)}
            </ul>
        `;

        expect(el.innerHTML).to.equal('<li>2</li><li>3</li><li>4</li>');

        const li1 = el.children[0];
        const li2 = el.children[1];
        const li3 = el.children[2];

        list.set([1, 2, 3, 4, 5]).then(() => {
            expect(el.innerHTML).to.equal('<li>1</li><li>2</li><li>3</li><li>4</li><li>5</li>');
            expect(el.children[1]).to.equal(li1);
            expect(el.children[2]).to.equal(li2);
            expect(el.children[3]).to.equal(li3);
            done();
        });
    });

    it('should remove nodes', (done) => {
        const list = store([1, 2, 3, 4, 5]);

        const el = html`
            <ul>
                ${each(list, (item) => html`<li>${item}</li>`)}
            </ul>
        `;

        expect(el.innerHTML).to.equal('<li>1</li><li>2</li><li>3</li><li>4</li><li>5</li>');

        list.set([]).then(() => {
            expect(el.innerHTML).to.equal('');
            done();
        });
    });

    it('should remove nodes from the beginning', (done) => {
        const list = store([1, 2, 3, 4, 5]);

        const el = html`
            <ul>
                ${each(list, (item) => html`<li>${item}</li>`)}
            </ul>
        `;

        expect(el.innerHTML).to.equal('<li>1</li><li>2</li><li>3</li><li>4</li><li>5</li>');

        const li1 = el.children[2];
        const li2 = el.children[3];
        const li3 = el.children[4];

        list.set([3, 4, 5]).then(() => {
            expect(el.innerHTML).to.equal('<li>3</li><li>4</li><li>5</li>');
            expect(el.children[0]).to.equal(li1);
            expect(el.children[1]).to.equal(li2);
            expect(el.children[2]).to.equal(li3);
            done();
        });
    });

    it('should remove nodes from the middle', (done) => {
        const list = store([1, 2, 3, 4, 5]);

        const el = html`
            <ul>
                ${each(list, (item) => html`<li>${item}</li>`)}
            </ul>
        `;

        expect(el.innerHTML).to.equal('<li>1</li><li>2</li><li>3</li><li>4</li><li>5</li>');

        const li1 = el.children[0];
        const li2 = el.children[3];
        const li3 = el.children[4];

        list.set([1, 4, 5]).then(() => {
            expect(el.innerHTML).to.equal('<li>1</li><li>4</li><li>5</li>');
            expect(el.children[0]).to.equal(li1);
            expect(el.children[1]).to.equal(li2);
            expect(el.children[2]).to.equal(li3);
            done();
        });
    });

    it('should remove nodes at both ends', (done) => {
        const list = store([1, 2, 3, 4, 5]);

        const el = html`
            <ul>
                ${each(list, (item) => html`<li>${item}</li>`)}
            </ul>
        `;

        expect(el.innerHTML).to.equal('<li>1</li><li>2</li><li>3</li><li>4</li><li>5</li>');

        const li1 = el.children[2];
        const li2 = el.children[3];

        list.set([3, 4]).then(() => {
            expect(el.innerHTML).to.equal('<li>3</li><li>4</li>');
            expect(el.children[0]).to.equal(li1);
            expect(el.children[1]).to.equal(li2);
            done();
        });
    });

    it('should move nodes forward', (done) => {
        const list = store([1, 2, 3, 4, 5]);

        const el = html`
            <ul>
                ${each(list, (item) => html`<li>${item}</li>`)}
            </ul>
        `;

        expect(el.innerHTML).to.equal('<li>1</li><li>2</li><li>3</li><li>4</li><li>5</li>');

        const li1 = el.children[0];
        const li2 = el.children[1];
        const li3 = el.children[2];
        const li4 = el.children[3];
        const li5 = el.children[4];

        list.set([2, 3, 4, 1, 5]).then(() => {
            expect(el.innerHTML).to.equal('<li>2</li><li>3</li><li>4</li><li>1</li><li>5</li>');
            expect(el.children[0]).to.equal(li2);
            expect(el.children[1]).to.equal(li3);
            expect(el.children[2]).to.equal(li4);
            expect(el.children[3]).to.equal(li1);
            expect(el.children[4]).to.equal(li5);
            done();
        });
    });

    it('should move nodes to the end', (done) => {
        const list = store([1, 2, 3, 4, 5]);

        const el = html`
            <ul>
                ${each(list, (item) => html`<li>${item}</li>`)}
            </ul>
        `;

        expect(el.innerHTML).to.equal('<li>1</li><li>2</li><li>3</li><li>4</li><li>5</li>');

        const li1 = el.children[0];
        const li2 = el.children[1];
        const li3 = el.children[2];
        const li4 = el.children[3];
        const li5 = el.children[4];

        list.set([2, 3, 4, 5, 1]).then(() => {
            expect(el.innerHTML).to.equal('<li>2</li><li>3</li><li>4</li><li>5</li><li>1</li>');
            expect(el.children[0]).to.equal(li2);
            expect(el.children[1]).to.equal(li3);
            expect(el.children[2]).to.equal(li4);
            expect(el.children[3]).to.equal(li5);
            expect(el.children[4]).to.equal(li1);
            done();
        });
    });

    it('should move nodes backwards', (done) => {
        const list = store([1, 2, 3, 4, 5]);

        const el = html`
            <ul>
                ${each(list, (item) => html`<li>${item}</li>`)}
            </ul>
        `;

        expect(el.innerHTML).to.equal('<li>1</li><li>2</li><li>3</li><li>4</li><li>5</li>');

        const li1 = el.children[0];
        const li2 = el.children[1];
        const li3 = el.children[2];
        const li4 = el.children[3];
        const li5 = el.children[4];

        list.set([1, 5, 4, 2, 3]).then(() => {
            expect(el.innerHTML).to.equal('<li>1</li><li>5</li><li>4</li><li>2</li><li>3</li>');
            expect(el.children[0]).to.equal(li1);
            expect(el.children[1]).to.equal(li5);
            expect(el.children[2]).to.equal(li4);
            expect(el.children[3]).to.equal(li2);
            expect(el.children[4]).to.equal(li3);
            done();
        });
    });

    it('should move nodes to the beginning', (done) => {
        const list = store([1, 2, 3, 4, 5]);

        const el = html`
            <ul>
                ${each(list, (item) => html`<li>${item}</li>`)}
            </ul>
        `;

        expect(el.innerHTML).to.equal('<li>1</li><li>2</li><li>3</li><li>4</li><li>5</li>');

        const li1 = el.children[0];
        const li2 = el.children[1];
        const li3 = el.children[2];
        const li4 = el.children[3];
        const li5 = el.children[4];

        list.set([5, 1, 2, 3, 4]).then(() => {
            expect(el.innerHTML).to.equal('<li>5</li><li>1</li><li>2</li><li>3</li><li>4</li>');
            expect(el.children[0]).to.equal(li5);
            expect(el.children[1]).to.equal(li1);
            expect(el.children[2]).to.equal(li2);
            expect(el.children[3]).to.equal(li3);
            expect(el.children[4]).to.equal(li4);
            done();
        });
    });

    it('should swap the first and last nodes', (done) => {
        const list = store([1, 2, 3, 4, 5]);

        const el = html`
            <ul>
                ${each(list, (item) => html`<li>${item}</li>`)}
            </ul>
        `;

        expect(el.innerHTML).to.equal('<li>1</li><li>2</li><li>3</li><li>4</li><li>5</li>');

        const li1 = el.children[0];
        const li2 = el.children[1];
        const li3 = el.children[2];
        const li4 = el.children[3];
        const li5 = el.children[4];

        list.set([5, 2, 3, 4, 1]).then(() => {
            expect(el.innerHTML).to.equal('<li>5</li><li>2</li><li>3</li><li>4</li><li>1</li>');
            expect(el.children[0]).to.equal(li5);
            expect(el.children[1]).to.equal(li2);
            expect(el.children[2]).to.equal(li3);
            expect(el.children[3]).to.equal(li4);
            expect(el.children[4]).to.equal(li1);
            done();
        });
    });

    it('should reverse the order of nodes', (done) => {
        const list = store([1, 2, 3, 4, 5]);

        const el = html`
            <ul>
                ${each(list, (item) => html`<li>${item}</li>`)}
            </ul>
        `;

        expect(el.innerHTML).to.equal('<li>1</li><li>2</li><li>3</li><li>4</li><li>5</li>');

        const li1 = el.children[0];
        const li2 = el.children[1];
        const li3 = el.children[2];
        const li4 = el.children[3];
        const li5 = el.children[4];

        list.set([5, 4, 3, 2, 1]).then(() => {
            expect(el.innerHTML).to.equal('<li>5</li><li>4</li><li>3</li><li>2</li><li>1</li>');
            expect(el.children[0]).to.equal(li5);
            expect(el.children[1]).to.equal(li4);
            expect(el.children[2]).to.equal(li3);
            expect(el.children[3]).to.equal(li2);
            expect(el.children[4]).to.equal(li1);
            done();
        });
    });

    it('should reorder, add, and remove nodes', (done) => {
        const list = store([1, 2, 3, 4, 5, 6, 7]);

        const el = html`
            <ul>
                ${each(list, (item) => html`<li>${item}</li>`)}
            </ul>
        `;

        expect(el.innerHTML).to.equal('<li>1</li><li>2</li><li>3</li><li>4</li><li>5</li><li>6</li><li>7</li>');

        const li1 = el.children[0];
        const li2 = el.children[1];
        const li3 = el.children[2];
        const li4 = el.children[4];
        const li5 = el.children[6];

        list.set([3, 5, 1, 7, 2, 9, 8]).then(() => {
            expect(el.innerHTML).to.equal('<li>3</li><li>5</li><li>1</li><li>7</li><li>2</li><li>9</li><li>8</li>');
            expect(el.children[0]).to.equal(li3);
            expect(el.children[1]).to.equal(li4);
            expect(el.children[2]).to.equal(li1);
            expect(el.children[3]).to.equal(li5);
            expect(el.children[4]).to.equal(li2);
            done();
        });
    });

    it('should render a list between sibling nodes', (done) => {
        const list = store([1, 2, 3]);

        const el = html`
            <section>
                <span></span>
                ${each(list, (item) => html`<div>${item}</div>`)}
                foo
            </section>
        `;

        expect(el.innerHTML).to.equal('<span></span><div>1</div><div>2</div><div>3</div>foo');

        const div1 = el.children[1];
        const div3 = el.children[3];

        list.set([1, 4, 3, 5]).then(() => {
            expect(el.innerHTML).to.equal('<span></span><div>1</div><div>4</div><div>3</div><div>5</div>foo');
            expect(el.children[1]).to.equal(div1);
            expect(el.children[3]).to.equal(div3);
            done();
        });
    });

    it('should render a list of text nodes', (done) => {
        const list = store([1, 2, 3]);

        const el = html`<div>${each(list, (item) => html`${item}`)}</div>`;

        expect(el.innerHTML).to.equal('123');

        const text1 = el.childNodes[1];
        const text2 = el.childNodes[2];
        const text3 = el.childNodes[3];

        expect(text1.nodeValue).to.equal('1');
        expect(text2.nodeValue).to.equal('2');
        expect(text3.nodeValue).to.equal('3');

        list.set([3, 1, 5, 2, 4]).then(() => {
            expect(el.innerHTML).to.equal('31524');
            expect(el.childNodes[1]).to.equal(text3);
            expect(el.childNodes[2]).to.equal(text1);
            expect(el.childNodes[4]).to.equal(text2);
            done();
        });
    });

    it('should render a list of mixed text and element nodes', (done) => {
        const list = store([1, 2, 3, 4, 5]);

        const el = html`<div>${each(list, (n) => n % 2 === 0 ? html`<span>${n}</span>` : html`${n}`)}</div>`;

        expect(el.innerHTML).to.equal('1<span>2</span>3<span>4</span>5');

        const text1 = el.childNodes[1];
        const span1 = el.childNodes[2];
        const text2 = el.childNodes[3];
        const span2 = el.childNodes[4];
        const text3 = el.childNodes[5];

        list.set([1, 5, 2, 6, 3, 7, 4]).then(() => {
            expect(el.innerHTML).to.equal('15<span>2</span><span>6</span>37<span>4</span>');
            expect(el.childNodes[1]).to.equal(text1);
            expect(el.childNodes[2]).to.equal(text3);
            expect(el.childNodes[3]).to.equal(span1);
            expect(el.childNodes[5]).to.equal(text2);
            expect(el.childNodes[7]).to.equal(span2);
            done();
        });
    });
});
