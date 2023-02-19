import { html, store, when } from '../../src/reflex';
import { createPromise, wait } from '../util';

describe('when', () => {
    it('should not render anything initially for promises', () => {
        const promise = createPromise();

        const element = html`
            <div>
                ${when(promise, {
                    fulfilled() {
                        return html`<span></span>`;
                    }
                })}
            </div>
        `;

        expect(element.innerHTML).to.equal('');
    });

    it('should render the fulfilled state for promises', async () => {
        const promise = createPromise('done');
        const fulfilled = sinon.spy((value) => html`<span>${value}</span>`);

        const element = html`<div>${when(promise, {fulfilled})}</div>`;

        await wait(promise);
        expect(fulfilled.callCount).to.equal(1);
        expect(fulfilled.args[0][0]).to.equal('done');
        expect(fulfilled.args[0][1]).to.equal(promise);
        expect(element.innerHTML).to.equal('<span>done</span>');
    });

    it('should render the rejected state for promises', async () => {
        const promise = createPromise((resolve, reject) => reject('error'));
        const rejected = sinon.spy((value) => html`<span>${value}</span>`);

        const element = html`<div>${when(promise, {rejected})}</div>`;

        try {
            await wait(promise);
        } catch {
            expect(rejected.callCount).to.equal(1);
            expect(rejected.args[0][0]).to.equal('error');
            expect(rejected.args[0][1]).to.equal(promise);
            expect(element.innerHTML).to.equal('<span>error</span>');
        }
    });

    it('should render the pending state before the fulfilled state for promises', async () => {
        const promise = createPromise('done');
        const pending = sinon.spy(() => html`<span>loading</span>`);

        const element = html`
            <div>
                ${when(promise, {
                    pending,
                    fulfilled(value) {
                        return html`<span>${value}</span>`;
                    }
                })}
            </div>
        `;

        await wait();
        expect(pending.callCount).to.equal(1);
        expect(pending.args[0][0]).to.equal(promise);
        expect(element.innerHTML).to.equal('<span>loading</span>');

        await wait(promise);
        expect(pending.callCount).to.equal(1);
        expect(element.innerHTML).to.equal('<span>done</span>');
    });

    it('should render the pending state before the rejected state for promises', async () => {
        const promise = createPromise((resolve, reject) => reject('error'));
        const pending = sinon.spy(() => html`<span>loading</span>`);

        const element = html`
            <div>
                ${when(promise, {
                    pending,
                    rejected(value) {
                        return html`<span>${value}</span>`;
                    }
                })}
            </div>
        `;

        await wait();
        expect(pending.callCount).to.equal(1);
        expect(pending.args[0][0]).to.equal(promise);
        expect(element.innerHTML).to.equal('<span>loading</span>');

        try {
            await wait(promise);
        } catch {
            expect(pending.callCount).to.equal(1);
            expect(element.innerHTML).to.equal('<span>error</span>');
        }
    });

    it('should not render anything initially for stores that contain promises', () => {
        const foo = store(createPromise());

        const element = html`
            <div>
                ${when(foo, {
                    fulfilled() {
                        return html`<span></span>`;
                    }
                })}
            </div>
        `;

        expect(element.innerHTML).to.equal('');
    });

    it('should render the idle state when a store does not contain a promise', () => {
        const foo = store('foo');
        const idle = sinon.spy((value) => html`<span>${value}</span>`);

        const element = html`<div>${when(foo, {idle})}</div>`;

        expect(idle.callCount).to.equal(1);
        expect(idle.args[0][0]).to.equal('foo');
        expect(element.innerHTML).to.equal('<span>foo</span>');
    });

    it('should render the fulfilled state for stores that contain promises', async () => {
        const promise = createPromise('done');
        const foo = store(promise);
        const fulfilled = sinon.spy((value) => html`<span>${value}</span>`);

        const element = html`<div>${when(foo, {fulfilled})}</div>`;

        await wait(foo);
        expect(fulfilled.callCount).to.equal(1);
        expect(fulfilled.args[0][0]).to.equal('done');
        expect(fulfilled.args[0][1]).to.equal(promise);
        expect(element.innerHTML).to.equal('<span>done</span>');
    });

    it('should render the rejected state for stores that contain promises', async () => {
        const promise = createPromise((resolve, reject) => reject('error'));
        const foo = store(promise);
        const rejected = sinon.spy((value) => html`<span>${value}</span>`);

        const element = html`<div>${when(foo, {rejected})}</div>`;

        try {
            await wait(foo);
        } catch {
            expect(rejected.callCount).to.equal(1);
            expect(rejected.args[0][0]).to.equal('error');
            expect(rejected.args[0][1]).to.equal(promise);
            expect(element.innerHTML).to.equal('<span>error</span>');
        }
    });

    it('should render the pending state before the fulfilled state for stores that contain promises', async () => {
        const promise = createPromise('done');
        const foo = store(promise);
        const pending = sinon.spy(() => html`<span>loading</span>`);

        const element = html`
            <div>
                ${when(foo, {
                    pending,
                    fulfilled(value) {
                        return html`<span>${value}</span>`;
                    }
                })}
            </div>
        `;

        await wait();
        expect(pending.callCount).to.equal(1);
        expect(pending.args[0][0]).to.equal(promise);
        expect(element.innerHTML).to.equal('<span>loading</span>');

        await wait(foo);
        expect(pending.callCount).to.equal(1);
        expect(element.innerHTML).to.equal('<span>done</span>');
    });

    it('should render the pending state before the rejected state for stores that contain promises', async () => {
        const promise = createPromise((resolve, reject) => reject('error'));
        const foo = store(promise);
        const pending = sinon.spy(() => html`<span>loading</span>`);

        const element = html`
            <div>
                ${when(foo, {
                    pending,
                    rejected(value) {
                        return html`<span>${value}</span>`;
                    }
                })}
            </div>
        `;

        await wait();
        expect(pending.callCount).to.equal(1);
        expect(pending.args[0][0]).to.equal(promise);
        expect(element.innerHTML).to.equal('<span>loading</span>');

        try {
            await wait(foo);
        } catch {
            expect(pending.callCount).to.equal(1);
            expect(element.innerHTML).to.equal('<span>error</span>');
        }
    });

    it('should update properly when a store is updated with a new promise', async () => {
        const foo = store();

        const element = html`
            <div>
                ${when(foo, {
                    idle() {
                        return html`<span></span>`;
                    },
                    pending() {
                        return html`<span>loading</span>`;
                    },
                    fulfilled(value) {
                        return html`<span>${value}</span>`;
                    },
                    rejected(error) {
                        return html`<span>${error}</span>`;
                    }
                })}
            </div>
        `;

        await wait();
        expect(element.innerHTML).to.equal('<span></span>');

        foo.set(createPromise('done'));

        await wait();
        expect(element.innerHTML).to.equal('<span>loading</span>');

        await wait(foo);
        expect(element.innerHTML).to.equal('<span>done</span>');

        foo.set(null);

        await wait();
        expect(element.innerHTML).to.equal('<span></span>');

        foo.set(createPromise((resolve, reject) => reject('error')));

        await wait();
        expect(element.innerHTML).to.equal('<span>loading</span>');

        try {
            await wait(foo);
        } catch {
            expect(element.innerHTML).to.equal('<span>error</span>');
        }
    });
});
