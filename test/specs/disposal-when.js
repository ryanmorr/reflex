import { html, val, when, dispose, cleanup } from '../../src/reflex';
import { createPromise, wait } from '../util';

describe('disposal-when', () => {
    it('should dispose the pending state for promises', (done) => {
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
        
        wait().then(() => {
            expect(spy.callCount).to.equal(0);
            expect(element.innerHTML).to.equal('<span>loading</span>');

            wait(promise).then(() => {
                expect(spy.callCount).to.equal(1);
                expect(element.innerHTML).to.equal('<span>done</span>');
                
                done();
            });
        });
    });

    it('should dispose the pending state if the parent node is disposed for promises', (done) => {
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
        
        wait().then(() => {
            expect(spy.callCount).to.equal(0);

            dispose(element);

            expect(spy.callCount).to.equal(1);

            done();
        });
    }); 
    
    it('should dispose the fulfilled state if the parent node is disposed for promises', (done) => {
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

        wait(promise).then(() => {
            expect(spy.callCount).to.equal(0);
            
            dispose(element);

            expect(spy.callCount).to.equal(1);

            done();
        });
    }); 
    
    it('should dispose the rejected state if the parent node is disposed for promises', (done) => {
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

        wait(promise).catch(() => {
            expect(spy.callCount).to.equal(0);
            
            dispose(element);

            expect(spy.callCount).to.equal(1);

            done();
        });
    });

    it('should dispose the idle state for stores that contain promises', (done) => {
        const store = val();
        const spy = sinon.spy();

        const element = html`
            <div>
                ${when(store, {
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
        
        store.set(createPromise());

        wait(store).then(() => {
            expect(spy.callCount).to.equal(1);
            expect(element.innerHTML).to.equal('<span>done</span>');
            
            done();
        });
    });

    it('should dispose the pending state for stores that contain promises', (done) => {
        const store = val(createPromise());
        const spy = sinon.spy();

        const element = html`
            <div>
                ${when(store, {
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
        
        wait().then(() => {
            expect(spy.callCount).to.equal(0);
            expect(element.innerHTML).to.equal('<span>loading</span>');

            wait(store).then(() => {
                expect(spy.callCount).to.equal(1);
                expect(element.innerHTML).to.equal('<span>done</span>');
                
                done();
            });
        });
    });

    it('should dispose the fulfilled state for stores that contain promises', (done) => {
        const store = val(createPromise());
        const spy = sinon.spy();

        const element = html`
            <div>
                ${when(store, {
                    fulfilled() {
                        const span = html`<span>done</span>`;
                        cleanup(span, spy);
                        return span;
                    }
                })}
            </div>
        `;

        wait(store).then(() => {
            expect(spy.callCount).to.equal(0);
            expect(element.innerHTML).to.equal('<span>done</span>');
            
            store.set(createPromise());
            
            wait(store).then(() => {
                expect(spy.callCount).to.equal(1);
                expect(element.innerHTML).to.equal('<span>done</span>');
                
                done();
            });
        });
    });

    it('should dispose the rejected state for stores that contain promises', (done) => {
        const store = val(createPromise((resolve, reject) => reject('error')));
        const spy = sinon.spy();

        const element = html`
            <div>
                ${when(store, {
                    rejected() {
                        const span = html`<span>error</span>`;
                        cleanup(span, spy);
                        return span;
                    }
                })}
            </div>
        `;

        wait(store).catch(() => {
            expect(spy.callCount).to.equal(0);
            expect(element.innerHTML).to.equal('<span>error</span>');
            
            store.set(createPromise((resolve, reject) => reject('error')));
            
            wait(store).catch(() => {
                expect(spy.callCount).to.equal(1);
                expect(element.innerHTML).to.equal('<span>error</span>');
                
                done();
            });
        });
    }); 

    it('should dispose the idle state if the parent node is disposed for stores that contain promises', () => {
        const store = val();
        const spy = sinon.spy();

        const element = html`
            <div>
                ${when(store, {
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

    it('should dispose the pending state if the parent node is disposed for stores that contain promises', (done) => {
        const store = val(createPromise());
        const spy = sinon.spy();

        const element = html`
            <div>
                ${when(store, {
                    pending() {
                        const span = html`<span>loading</span>`;
                        cleanup(span, spy);
                        return span;
                    }
                })}
            </div>
        `;
        
        wait().then(() => {
            expect(spy.callCount).to.equal(0);

            dispose(element);

            expect(spy.callCount).to.equal(1);

            done();
        });
    }); 
    
    it('should dispose the fulfilled state if the parent node is disposed for stores that contain promises', (done) => {
        const store = val(createPromise());
        const spy = sinon.spy();

        const element = html`
            <div>
                ${when(store, {
                    fulfilled() {
                        const span = html`<span>done</span>`;
                        cleanup(span, spy);
                        return span;
                    }
                })}
            </div>
        `;

        wait(store).then(() => {
            expect(spy.callCount).to.equal(0);
            
            dispose(element);

            expect(spy.callCount).to.equal(1);

            done();
        });
    }); 
    
    it('should dispose the rejected state if the parent node is disposed for stores that contain promises', (done) => {
        const store = val(createPromise((resolve, reject) => reject('error')));
        const spy = sinon.spy();

        const element = html`
            <div>
                ${when(store, {
                    rejected() {
                        const span = html`<span>error</span>`;
                        cleanup(span, spy);
                        return span;
                    }
                })}
            </div>
        `;

        wait(store).catch(() => {
            expect(spy.callCount).to.equal(0);
            
            dispose(element);

            expect(spy.callCount).to.equal(1);

            done();
        });
    });
});
