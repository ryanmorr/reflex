import { html, store, when, dispose, cleanup } from '../../src/reflex';
import { createPromise, wait } from '../util';

describe('disposal-when', () => {
    it('should dispose the pending state for promises', async () => {
        const promise = createPromise();
        const spy = sinon.spy();

        const element = html`
            <div>
                ${when(promise, {
                    pending() {
                        const span = html`<span>loading</span>`;
                        cleanup(span, spy);
                        return span;
                    },
                    fulfilled() {
                        return html`<span>done</span>`;
                    }
                })}
            </div>
        `;
        
        await wait();
        expect(spy.callCount).to.equal(0);
        expect(element.innerHTML).to.equal('<span>loading</span>');

        await wait(promise);
        expect(spy.callCount).to.equal(1);
        expect(element.innerHTML).to.equal('<span>done</span>');
    });

    it('should dispose the pending state if the parent node is disposed for promises', async () => {
        const promise = createPromise();
        const spy = sinon.spy();

        const element = html`
            <div>
                ${when(promise, {
                    pending() {
                        const span = html`<span>loading</span>`;
                        cleanup(span, spy);
                        return span;
                    }
                })}
            </div>
        `;
        
        await wait();

        expect(spy.callCount).to.equal(0);

        dispose(element);

        expect(spy.callCount).to.equal(1);
    }); 
    
    it('should dispose the fulfilled state if the parent node is disposed for promises', async () => {
        const promise = createPromise();
        const spy = sinon.spy();

        const element = html`
            <div>
                ${when(promise, {
                    fulfilled() {
                        const span = html`<span>done</span>`;
                        cleanup(span, spy);
                        return span;
                    }
                })}
            </div>
        `;

        await wait(promise);

        expect(spy.callCount).to.equal(0);
        
        dispose(element);

        expect(spy.callCount).to.equal(1);
    }); 
    
    it('should dispose the rejected state if the parent node is disposed for promises', async () => {
        const promise = createPromise((resolve, reject) => reject('error'));
        const spy = sinon.spy();

        const element = html`
            <div>
                ${when(promise, {
                    rejected() {
                        const span = html`<span>error</span>`;
                        cleanup(span, spy);
                        return span;
                    }
                })}
            </div>
        `;
        
        try {
            await wait(promise);
        } catch {
            expect(spy.callCount).to.equal(0);
            
            dispose(element);

            expect(spy.callCount).to.equal(1);
        }
    });

    it('should dispose the idle state for stores that contain promises', async () => {
        const foo = store();
        const spy = sinon.spy();

        const element = html`
            <div>
                ${when(foo, {
                    idle() {
                        const span = html`<span></span>`;
                        cleanup(span, spy);
                        return span;
                    },
                    fulfilled() {
                        return html`<span>done</span>`;
                    }
                })}
            </div>
        `;

        expect(spy.callCount).to.equal(0);
        
        foo.set(createPromise());

        await wait(foo);
        expect(spy.callCount).to.equal(1);
        expect(element.innerHTML).to.equal('<span>done</span>');
    });

    it('should dispose the pending state for stores that contain promises', async () => {
        const foo = store(createPromise());
        const spy = sinon.spy();

        const element = html`
            <div>
                ${when(foo, {
                    pending() {
                        const span = html`<span>loading</span>`;
                        cleanup(span, spy);
                        return span;
                    },
                    fulfilled() {
                        return html`<span>done</span>`;
                    }
                })}
            </div>
        `;
        
        await wait();
        expect(spy.callCount).to.equal(0);
        expect(element.innerHTML).to.equal('<span>loading</span>');

        await wait(foo);
        expect(spy.callCount).to.equal(1);
        expect(element.innerHTML).to.equal('<span>done</span>');
    });

    it('should dispose the fulfilled state for stores that contain promises', async () => {
        const foo = store(createPromise());
        const spy = sinon.spy();

        const element = html`
            <div>
                ${when(foo, {
                    fulfilled() {
                        const span = html`<span>done</span>`;
                        cleanup(span, spy);
                        return span;
                    }
                })}
            </div>
        `;

        await wait(foo);
        expect(spy.callCount).to.equal(0);
        expect(element.innerHTML).to.equal('<span>done</span>');

        foo.set(createPromise());

        await wait(foo);
        expect(spy.callCount).to.equal(1);
        expect(element.innerHTML).to.equal('<span>done</span>');
    });

    it('should dispose the rejected state for stores that contain promises', async () => {
        const foo = store(createPromise((resolve, reject) => reject('error')));
        const spy = sinon.spy();

        const element = html`
            <div>
                ${when(foo, {
                    rejected() {
                        const span = html`<span>error</span>`;
                        cleanup(span, spy);
                        return span;
                    }
                })}
            </div>
        `;

        try {
            await wait(foo);
        } catch {
            expect(spy.callCount).to.equal(0);
            expect(element.innerHTML).to.equal('<span>error</span>');
            
            foo.set(createPromise((resolve, reject) => reject('error')));

            try {
                await wait(foo);
            } catch {
                expect(spy.callCount).to.equal(1);
                expect(element.innerHTML).to.equal('<span>error</span>');
            }
        }
    }); 

    it('should dispose the idle state if the parent node is disposed for stores that contain promises', () => {
        const foo = store();
        const spy = sinon.spy();

        const element = html`
            <div>
                ${when(foo, {
                    idle() {
                        const span = html`<span></span>`;
                        cleanup(span, spy);
                        return span;
                    }
                })}
            </div>
        `;

        expect(spy.callCount).to.equal(0);
        
        dispose(element);

        expect(spy.callCount).to.equal(1);
    }); 

    it('should dispose the pending state if the parent node is disposed for stores that contain promises', async () => {
        const foo = store(createPromise());
        const spy = sinon.spy();

        const element = html`
            <div>
                ${when(foo, {
                    pending() {
                        const span = html`<span>loading</span>`;
                        cleanup(span, spy);
                        return span;
                    }
                })}
            </div>
        `;
        
        await wait();

        expect(spy.callCount).to.equal(0);

        dispose(element);

        expect(spy.callCount).to.equal(1);
    }); 
    
    it('should dispose the fulfilled state if the parent node is disposed for stores that contain promises', async () => {
        const foo = store(createPromise());
        const spy = sinon.spy();

        const element = html`
            <div>
                ${when(foo, {
                    fulfilled() {
                        const span = html`<span>done</span>`;
                        cleanup(span, spy);
                        return span;
                    }
                })}
            </div>
        `;

        await wait(foo);

        expect(spy.callCount).to.equal(0);
        
        dispose(element);

        expect(spy.callCount).to.equal(1);
    }); 
    
    it('should dispose the rejected state if the parent node is disposed for stores that contain promises', async () => {
        const foo = store(createPromise((resolve, reject) => reject('error')));
        const spy = sinon.spy();

        const element = html`
            <div>
                ${when(foo, {
                    rejected() {
                        const span = html`<span>error</span>`;
                        cleanup(span, spy);
                        return span;
                    }
                })}
            </div>
        `;

        try {
            await wait(foo);
        } catch {
            expect(spy.callCount).to.equal(0);
            
            dispose(element);

            expect(spy.callCount).to.equal(1);
        }
    });
});
