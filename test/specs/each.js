import { html, val, each, tick } from '../../src/reflex';

describe('each', () => {
    it('should not render an undefined list', () => {
        const list = val();

        const el = html`
            <ul>
                ${each(list, (item) => html`<li>${item}</li>`)}
            </ul>
        `;

        expect(el.innerHTML).to.equal('');
    });

    it('should render a list', () => {
        const array = [1, 2, 3];
        const list = val(array);

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

    it('should append nodes', async () => {
        const list = val([1, 2]);

        const el = html`
            <ul>
                ${each(list, (item) => html`<li>${item}</li>`)}
            </ul>
        `;

        expect(el.innerHTML).to.equal('<li>1</li><li>2</li>');

        const li1 = el.children[0];
        const li2 = el.children[1];

        list.set([1, 2, 3, 4, 5]);
        
        await tick();
        expect(el.innerHTML).to.equal('<li>1</li><li>2</li><li>3</li><li>4</li><li>5</li>');
        expect(el.children[0]).to.equal(li1);
        expect(el.children[1]).to.equal(li2);
    });

    it('should prepend nodes', async () => {
        const list = val([3, 4, 5]);

        const el = html`
            <ul>
                ${each(list, (item) => html`<li>${item}</li>`)}
            </ul>
        `;

        expect(el.innerHTML).to.equal('<li>3</li><li>4</li><li>5</li>');

        const li1 = el.children[0];
        const li2 = el.children[1];
        const li3 = el.children[2];

        list.set([1, 2, 3, 4, 5]);
        
        await tick();
        expect(el.innerHTML).to.equal('<li>1</li><li>2</li><li>3</li><li>4</li><li>5</li>');
        expect(el.children[2]).to.equal(li1);
        expect(el.children[3]).to.equal(li2);
        expect(el.children[4]).to.equal(li3);
    });

    it('should add nodes in the middle', async () => {
        const list = val([1, 2, 5]);

        const el = html`
            <ul>
                ${each(list, (item) => html`<li>${item}</li>`)}
            </ul>
        `;

        expect(el.innerHTML).to.equal('<li>1</li><li>2</li><li>5</li>');

        const li1 = el.children[0];
        const li2 = el.children[1];
        const li3 = el.children[2];

        list.set([1, 2, 3, 4, 5]);
        
        await tick();
        expect(el.innerHTML).to.equal('<li>1</li><li>2</li><li>3</li><li>4</li><li>5</li>');
        expect(el.children[0]).to.equal(li1);
        expect(el.children[1]).to.equal(li2);
        expect(el.children[4]).to.equal(li3);
    });

    it('should add nodes at both ends', async () => {
        const list = val([2, 3, 4]);

        const el = html`
            <ul>
                ${each(list, (item) => html`<li>${item}</li>`)}
            </ul>
        `;

        expect(el.innerHTML).to.equal('<li>2</li><li>3</li><li>4</li>');

        const li1 = el.children[0];
        const li2 = el.children[1];
        const li3 = el.children[2];

        list.set([1, 2, 3, 4, 5]);
        
        await tick();
        expect(el.innerHTML).to.equal('<li>1</li><li>2</li><li>3</li><li>4</li><li>5</li>');
        expect(el.children[1]).to.equal(li1);
        expect(el.children[2]).to.equal(li2);
        expect(el.children[3]).to.equal(li3);
    });

    it('should remove nodes', async () => {
        const list = val([1, 2, 3, 4, 5]);

        const el = html`
            <ul>
                ${each(list, (item) => html`<li>${item}</li>`)}
            </ul>
        `;

        expect(el.innerHTML).to.equal('<li>1</li><li>2</li><li>3</li><li>4</li><li>5</li>');

        list.set([]);
        
        await tick();
        expect(el.innerHTML).to.equal('');
    });

    it('should remove nodes from the beginning', async () => {
        const list = val([1, 2, 3, 4, 5]);

        const el = html`
            <ul>
                ${each(list, (item) => html`<li>${item}</li>`)}
            </ul>
        `;

        expect(el.innerHTML).to.equal('<li>1</li><li>2</li><li>3</li><li>4</li><li>5</li>');

        const li1 = el.children[2];
        const li2 = el.children[3];
        const li3 = el.children[4];

        list.set([3, 4, 5]);
        
        await tick();
        expect(el.innerHTML).to.equal('<li>3</li><li>4</li><li>5</li>');
        expect(el.children[0]).to.equal(li1);
        expect(el.children[1]).to.equal(li2);
        expect(el.children[2]).to.equal(li3);
    });

    it('should remove nodes from the middle', async () => {
        const list = val([1, 2, 3, 4, 5]);

        const el = html`
            <ul>
                ${each(list, (item) => html`<li>${item}</li>`)}
            </ul>
        `;

        expect(el.innerHTML).to.equal('<li>1</li><li>2</li><li>3</li><li>4</li><li>5</li>');

        const li1 = el.children[0];
        const li2 = el.children[3];
        const li3 = el.children[4];

        list.set([1, 4, 5]);
        
        await tick();
        expect(el.innerHTML).to.equal('<li>1</li><li>4</li><li>5</li>');
        expect(el.children[0]).to.equal(li1);
        expect(el.children[1]).to.equal(li2);
        expect(el.children[2]).to.equal(li3);
    });

    it('should remove nodes at both ends', async () => {
        const list = val([1, 2, 3, 4, 5]);

        const el = html`
            <ul>
                ${each(list, (item) => html`<li>${item}</li>`)}
            </ul>
        `;

        expect(el.innerHTML).to.equal('<li>1</li><li>2</li><li>3</li><li>4</li><li>5</li>');

        const li1 = el.children[2];
        const li2 = el.children[3];

        list.set([3, 4]);
        
        await tick();
        expect(el.innerHTML).to.equal('<li>3</li><li>4</li>');
        expect(el.children[0]).to.equal(li1);
        expect(el.children[1]).to.equal(li2);
    });

    it('should move nodes forward', async () => {
        const list = val([1, 2, 3, 4, 5]);

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

        list.set([2, 3, 4, 1, 5]);
        
        await tick();
        expect(el.innerHTML).to.equal('<li>2</li><li>3</li><li>4</li><li>1</li><li>5</li>');
        expect(el.children[0]).to.equal(li2);
        expect(el.children[1]).to.equal(li3);
        expect(el.children[2]).to.equal(li4);
        expect(el.children[3]).to.equal(li1);
        expect(el.children[4]).to.equal(li5);
    });

    it('should move nodes to the end', async () => {
        const list = val([1, 2, 3, 4, 5]);

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

        list.set([2, 3, 4, 5, 1]);
        
        await tick();
        expect(el.innerHTML).to.equal('<li>2</li><li>3</li><li>4</li><li>5</li><li>1</li>');
        expect(el.children[0]).to.equal(li2);
        expect(el.children[1]).to.equal(li3);
        expect(el.children[2]).to.equal(li4);
        expect(el.children[3]).to.equal(li5);
        expect(el.children[4]).to.equal(li1);
    });

    it('should move nodes backwards', async () => {
        const list = val([1, 2, 3, 4, 5]);

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

        list.set([1, 5, 4, 2, 3]);
        
        await tick();
        expect(el.innerHTML).to.equal('<li>1</li><li>5</li><li>4</li><li>2</li><li>3</li>');
        expect(el.children[0]).to.equal(li1);
        expect(el.children[1]).to.equal(li5);
        expect(el.children[2]).to.equal(li4);
        expect(el.children[3]).to.equal(li2);
        expect(el.children[4]).to.equal(li3);
    });

    it('should move nodes to the beginning', async () => {
        const list = val([1, 2, 3, 4, 5]);

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

        list.set([5, 1, 2, 3, 4]);
        
        await tick();
        expect(el.innerHTML).to.equal('<li>5</li><li>1</li><li>2</li><li>3</li><li>4</li>');
        expect(el.children[0]).to.equal(li5);
        expect(el.children[1]).to.equal(li1);
        expect(el.children[2]).to.equal(li2);
        expect(el.children[3]).to.equal(li3);
        expect(el.children[4]).to.equal(li4);
    });

    it('should swap the first and last nodes', async () => {
        const list = val([1, 2, 3, 4, 5]);

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

        list.set([5, 2, 3, 4, 1]);
        
        await tick();
        expect(el.innerHTML).to.equal('<li>5</li><li>2</li><li>3</li><li>4</li><li>1</li>');
        expect(el.children[0]).to.equal(li5);
        expect(el.children[1]).to.equal(li2);
        expect(el.children[2]).to.equal(li3);
        expect(el.children[3]).to.equal(li4);
        expect(el.children[4]).to.equal(li1);
    });

    it('should reverse the order of nodes', async () => {
        const list = val([1, 2, 3, 4, 5]);

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

        list.set([5, 4, 3, 2, 1]);
        
        await tick();
        expect(el.innerHTML).to.equal('<li>5</li><li>4</li><li>3</li><li>2</li><li>1</li>');
        expect(el.children[0]).to.equal(li5);
        expect(el.children[1]).to.equal(li4);
        expect(el.children[2]).to.equal(li3);
        expect(el.children[3]).to.equal(li2);
        expect(el.children[4]).to.equal(li1);
    });

    it('should reorder, add, and remove nodes', async () => {
        const list = val([1, 2, 3, 4, 5, 6, 7]);

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

        list.set([3, 5, 1, 7, 2, 9, 8]);
        
        await tick();
        expect(el.innerHTML).to.equal('<li>3</li><li>5</li><li>1</li><li>7</li><li>2</li><li>9</li><li>8</li>');
        expect(el.children[0]).to.equal(li3);
        expect(el.children[1]).to.equal(li4);
        expect(el.children[2]).to.equal(li1);
        expect(el.children[3]).to.equal(li5);
        expect(el.children[4]).to.equal(li2);
    });

    it('should reorder, add, and remove components', async () => {
        const list = val([
            {name: 'a', num: 1},
            {name: 'b', num: 2},
            {name: 'c', num: 3},
            {name: 'd', num: 4},
            {name: 'e', num: 5},
            {name: 'f', num: 6}
        ]);
    
        const Component = ({name, num}) => {
            return html`<li>${name} ${num}</li>`;
        };
    
        const el = html`
            <ul>
                ${each(list, (data) => html`<${Component} ...${data} />`)}
            </ul>
        `;
    
        expect(el.innerHTML).to.equal('<li>a 1</li><li>b 2</li><li>c 3</li><li>d 4</li><li>e 5</li><li>f 6</li>');
    
        const li1 = el.children[0];
        const li2 = el.children[1];
        const li4 = el.children[3];
        const li6 = el.children[5];
    
        list.update((values) => {
            return [
                values[3],
                values[5],
                values[1],
                values[0]
            ];
        });
        
        await tick();
        expect(el.innerHTML).to.equal('<li>d 4</li><li>f 6</li><li>b 2</li><li>a 1</li>');
        expect(el.children[0]).to.equal(li4);
        expect(el.children[1]).to.equal(li6);
        expect(el.children[2]).to.equal(li2);
        expect(el.children[3]).to.equal(li1);
    });

    it('should render a list between sibling nodes', async () => {
        const list = val([1, 2, 3]);

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

        list.set([1, 4, 3, 5]);
        
        await tick();
        expect(el.innerHTML).to.equal('<span></span><div>1</div><div>4</div><div>3</div><div>5</div>foo');
        expect(el.children[1]).to.equal(div1);
        expect(el.children[3]).to.equal(div3);
    });

    it('should render a list of text nodes', async () => {
        const list = val([1, 2, 3]);

        const el = html`<div>${each(list, (item) => html`${item}`)}</div>`;

        expect(el.innerHTML).to.equal('123');

        const text1 = el.childNodes[1];
        const text2 = el.childNodes[2];
        const text3 = el.childNodes[3];

        expect(text1.nodeValue).to.equal('1');
        expect(text2.nodeValue).to.equal('2');
        expect(text3.nodeValue).to.equal('3');

        list.set([3, 1, 5, 2, 4]);
        
        await tick();
        expect(el.innerHTML).to.equal('31524');
        expect(el.childNodes[1]).to.equal(text3);
        expect(el.childNodes[2]).to.equal(text1);
        expect(el.childNodes[4]).to.equal(text2);
    });

    it('should render a list of mixed text and element nodes', async () => {
        const list = val([1, 2, 3, 4, 5]);

        const el = html`<div>${each(list, (n) => n % 2 === 0 ? html`<span>${n}</span>` : html`${n}`)}</div>`;

        expect(el.innerHTML).to.equal('1<span>2</span>3<span>4</span>5');

        const text1 = el.childNodes[1];
        const span1 = el.childNodes[2];
        const text2 = el.childNodes[3];
        const span2 = el.childNodes[4];
        const text3 = el.childNodes[5];

        list.set([1, 5, 2, 6, 3, 7, 4]);
        
        await tick();
        expect(el.innerHTML).to.equal('15<span>2</span><span>6</span>37<span>4</span>');
        expect(el.childNodes[1]).to.equal(text1);
        expect(el.childNodes[2]).to.equal(text3);
        expect(el.childNodes[3]).to.equal(span1);
        expect(el.childNodes[5]).to.equal(text2);
        expect(el.childNodes[7]).to.equal(span2);
    });

    it('should support iterable collections', async () => {
        const set = new Set([1, 2, 3, 4]);
        const list = val(set);

        const callback = sinon.spy((item) => html`<li>${item}</li>`);

        const el = html`
            <ul>
                ${each(list, callback)}
            </ul>
        `;

        expect(el.innerHTML).to.equal('<li>1</li><li>2</li><li>3</li><li>4</li>');
        
        expect(callback.callCount).to.equal(4);

        expect(callback.args[0][0]).to.equal(1);
        expect(callback.args[0][1]).to.equal(0);
        expect(callback.args[0][2]).to.equal(set);

        expect(callback.args[1][0]).to.equal(2);
        expect(callback.args[1][1]).to.equal(1);
        expect(callback.args[1][2]).to.equal(set);

        expect(callback.args[2][0]).to.equal(3);
        expect(callback.args[2][1]).to.equal(2);
        expect(callback.args[2][2]).to.equal(set);

        expect(callback.args[3][0]).to.equal(4);
        expect(callback.args[3][1]).to.equal(3);
        expect(callback.args[3][2]).to.equal(set);

        function makeIterator() {
            let i = 0;
            const chars = ['a', 'b', 'c'];
            return {
                [Symbol.iterator]() {
                    return {
                        next: () => i < chars.length ? {value: chars[i++], done: false} : {done: true}
                    };
                }
            };
        }

        const iterator = makeIterator();
        list.set(iterator);
        
        await tick();

        expect(el.innerHTML).to.equal('<li>a</li><li>b</li><li>c</li>');
    
        expect(callback.callCount).to.equal(7);

        expect(callback.args[4][0]).to.equal('a');
        expect(callback.args[4][1]).to.equal(0);
        expect(callback.args[4][2]).to.equal(iterator);

        expect(callback.args[5][0]).to.equal('b');
        expect(callback.args[5][1]).to.equal(1);
        expect(callback.args[5][2]).to.equal(iterator);

        expect(callback.args[6][0]).to.equal('c');
        expect(callback.args[6][1]).to.equal(2);
        expect(callback.args[6][2]).to.equal(iterator);
    });
    
    it('should not render strings', () => {
        const list = val('foo');

        const el = html`
            <ul>
                ${each(list, (item) => html`<li>${item}</li>`)}
            </ul>
        `;

        expect(el.innerHTML).to.equal('');
    });

    it('should replace a list with nothing', async () => {
        const list = val([1, 2, 3]);

        const el = html`
            <ul>
                ${each(list, (item) => html`<li>${item}</li>`)}
            </ul>
        `;

        expect(el.innerHTML).to.equal('<li>1</li><li>2</li><li>3</li>');

        list.set(null);
        
        await tick();
        expect(el.innerHTML).to.equal('');
    });

    it('should render the empty content when the iterable is empty', () => {
        const array = [];
        const list = val(array);

        const callback = sinon.spy();
        const onEmpty = sinon.spy(() => html`<li>Empty</li>`);

        const el = html`
            <ul>
                ${each(list, callback, onEmpty)}
            </ul>
        `;

        expect(el.innerHTML).to.equal('<li>Empty</li>');
        
        expect(callback.callCount).to.equal(0);
        expect(onEmpty.callCount).to.equal(1);
        expect(onEmpty.args[0][0]).to.equal(array);
    });

    it('should render the empty content if the store value is not iterable', () => {
        const list = val(123);

        const callback = sinon.spy();
        const onEmpty = sinon.spy(() => html`<li>Empty</li>`);

        const el = html`
            <ul>
                ${each(list, callback, onEmpty)}
            </ul>
        `;

        expect(el.innerHTML).to.equal('<li>Empty</li>');
        
        expect(callback.callCount).to.equal(0);
        expect(onEmpty.callCount).to.equal(1);
        expect(onEmpty.args[0][0]).to.equal(123);
    });

    it('should render the empty content if the store value is a string', () => {
        const list = val('foo');

        const callback = sinon.spy();
        const onEmpty = sinon.spy(() => html`<li>Empty</li>`);

        const el = html`
            <ul>
                ${each(list, callback, onEmpty)}
            </ul>
        `;

        expect(el.innerHTML).to.equal('<li>Empty</li>');
        
        expect(callback.callCount).to.equal(0);
        expect(onEmpty.callCount).to.equal(1);
        expect(onEmpty.args[0][0]).to.equal('foo');
    });

    it('should replace the empty content with a list', async () => {
        const array = [];
        const list = val(array);

        const callback = sinon.spy((item) => html`<li>${item}</li>`);
        const onEmpty = sinon.spy(() => html`<li>Empty</li>`);

        const el = html`
            <ul>
                ${each(list, callback, onEmpty)}
            </ul>
        `;

        expect(el.innerHTML).to.equal('<li>Empty</li>');
        expect(callback.callCount).to.equal(0);
        expect(onEmpty.callCount).to.equal(1);
        expect(onEmpty.args[0][0]).to.equal(array);

        list.set([1, 2, 3]);
        
        await tick();
        expect(el.innerHTML).to.equal('<li>1</li><li>2</li><li>3</li>');
        expect(callback.callCount).to.equal(3);
        expect(onEmpty.callCount).to.equal(1);
    });

    it('should replace a list with empty content', async () => {
        const list = val([1, 2, 3, 4]);

        const callback = sinon.spy((item) => html`<li>${item}</li>`);
        const onEmpty = sinon.spy(() => html`<li>Empty</li>`);

        const el = html`
            <ul>
                ${each(list, callback, onEmpty)}
            </ul>
        `;

        expect(el.innerHTML).to.equal('<li>1</li><li>2</li><li>3</li><li>4</li>');
        expect(callback.callCount).to.equal(4);
        expect(onEmpty.callCount).to.equal(0);

        list.set('foo');
        
        await tick();
        expect(el.innerHTML).to.equal('<li>Empty</li>');
        expect(callback.callCount).to.equal(4);
        expect(onEmpty.callCount).to.equal(1);
        expect(onEmpty.args[0][0]).to.equal('foo');
    });

    it('should not replace empty content with the same empty content', async () => {
        const array = [];
        const list = val(array);

        const callback = sinon.spy();
        const onEmpty = sinon.spy(() => html`<li>Empty</li>`);

        const el = html`
            <ul>
                ${each(list, callback, onEmpty)}
            </ul>
        `;

        expect(el.innerHTML).to.equal('<li>Empty</li>');
        expect(callback.callCount).to.equal(0);
        expect(onEmpty.callCount).to.equal(1);
        expect(onEmpty.args[0][0]).to.equal(array);

        const li = el.firstChild;

        list.set(null);
        
        await tick();
        expect(el.innerHTML).to.equal('<li>Empty</li>');
        expect(el.firstChild).to.equal(li);
        expect(callback.callCount).to.equal(0);
        expect(onEmpty.callCount).to.equal(1);
    });

    it('should replace a list with empty content and then replace empty content with a list', async () => {
        const list = val([1, 2, 3, 4]);

        const callback = sinon.spy((item) => html`<li>${item}</li>`);
        const onEmpty = sinon.spy(() => html`<li>Empty</li>`);

        const el = html`
            <ul>
                ${each(list, callback, onEmpty)}
            </ul>
        `;

        expect(el.innerHTML).to.equal('<li>1</li><li>2</li><li>3</li><li>4</li>');
        expect(callback.callCount).to.equal(4);
        expect(onEmpty.callCount).to.equal(0);

        list.set('foo');
        
        await tick();
        expect(el.innerHTML).to.equal('<li>Empty</li>');
        expect(callback.callCount).to.equal(4);
        expect(onEmpty.callCount).to.equal(1);
        expect(onEmpty.args[0][0]).to.equal('foo');

        list.set(['a', 'b', 'c']);

        await tick();
        expect(el.innerHTML).to.equal('<li>a</li><li>b</li><li>c</li>');
        expect(callback.callCount).to.equal(7);
        expect(onEmpty.callCount).to.equal(1);
    });

    it('should replace empty content with a list and then replace the list with empty content', async () => {
        const list = val();

        const callback = sinon.spy((item) => html`<li>${item}</li>`);
        const onEmpty = sinon.spy(() => html`<li>Empty</li>`);

        const el = html`
            <ul>
                ${each(list, callback, onEmpty)}
            </ul>
        `;

        expect(el.innerHTML).to.equal('<li>Empty</li>');
        expect(callback.callCount).to.equal(0);
        expect(onEmpty.callCount).to.equal(1);
        expect(onEmpty.args[0][0]).to.equal(undefined);

        list.set([1, 2]);
        
        await tick();
        expect(el.innerHTML).to.equal('<li>1</li><li>2</li>');
        expect(callback.callCount).to.equal(2);
        expect(onEmpty.callCount).to.equal(1);

        const array = [];
        list.set(array);

        await tick();
        expect(el.innerHTML).to.equal('<li>Empty</li>');
        expect(callback.callCount).to.equal(2);
        expect(onEmpty.callCount).to.equal(2);
        expect(onEmpty.args[1][0]).to.equal(array);
    });
});
