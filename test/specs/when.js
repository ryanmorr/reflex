import { html, val, when, dispose, cleanup } from '../../src/reflex';

describe('when', () => {
    function createPromise(callback) {
        if (typeof callback !== 'function') {
            const value = callback;
            callback = (resolve) => resolve(value);
        }
        return new Promise((resolve, reject) => setTimeout(() => callback(resolve, reject), 50));
    }

    function wait(promise) {
        return new Promise((resolve, reject) => {
            if (promise) {
                if (promise.subscribe) {
                    promise = promise.get();
                }
                promise.then(() => setTimeout(resolve, 50));
                promise.catch(() => setTimeout(reject, 50));
            } else {
                setTimeout(resolve, 25);
            }
        });
    }

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

    it('should render the fulfilled state for promises', (done) => {
        const promise = createPromise('done');
        const fulfilled = sinon.spy((value) => html`<span>${value}</span>`);

        const element = html`<div>${when(promise, {fulfilled})}</div>`;

        wait(promise).then(() => {
            expect(fulfilled.callCount).to.equal(1);
            expect(fulfilled.args[0][0]).to.equal('done');
            expect(fulfilled.args[0][1]).to.equal(promise);
            expect(element.innerHTML).to.equal('<span>done</span>');

            done();
        });
    });

    it('should render the rejected state for promises', (done) => {
        const promise = createPromise((resolve, reject) => reject('error'));
        const rejected = sinon.spy((value) => html`<span>${value}</span>`);

        const element = html`<div>${when(promise, {rejected})}</div>`;

        wait(promise).catch(() => {
            expect(rejected.callCount).to.equal(1);
            expect(rejected.args[0][0]).to.equal('error');
            expect(rejected.args[0][1]).to.equal(promise);
            expect(element.innerHTML).to.equal('<span>error</span>');

            done();
        });
    });

    it('should render the pending state before the fulfilled state for promises', (done) => {
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

        wait().then(() => {
            expect(pending.callCount).to.equal(1);
            expect(pending.args[0][0]).to.equal(promise);
            expect(element.innerHTML).to.equal('<span>loading</span>');
            
            wait(promise).then(() => {
                expect(pending.callCount).to.equal(1);
                expect(element.innerHTML).to.equal('<span>done</span>');

                done();
            });
        });
    });

    it('should render the pending state before the rejected state for promises', (done) => {
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

        wait().then(() => {
            expect(pending.callCount).to.equal(1);
            expect(pending.args[0][0]).to.equal(promise);
            expect(element.innerHTML).to.equal('<span>loading</span>');
            
            wait(promise).catch(() => {
                expect(pending.callCount).to.equal(1);
                expect(element.innerHTML).to.equal('<span>error</span>');

                done();
            });
        });
    });

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

    it('should not render anything initially for stores that contain promises', () => {
        const store = val(createPromise());

        const element = html`
            <div>
                ${when(store, {
                    fulfilled() {
                        return html`<span></span>`;
                    }
                })}
            </div>
        `;

        expect(element.innerHTML).to.equal('');
    });

    it('should render the idle state when a store does not contain a promise', () => {
        const store = val('foo');
        const idle = sinon.spy((value) => html`<span>${value}</span>`);

        const element = html`<div>${when(store, {idle})}</div>`;

        expect(idle.callCount).to.equal(1);
        expect(idle.args[0][0]).to.equal('foo');
        expect(element.innerHTML).to.equal('<span>foo</span>');
    });

    it('should render the fulfilled state for stores that contain promises', (done) => {
        const promise = createPromise('done');
        const store = val(promise);
        const fulfilled = sinon.spy((value) => html`<span>${value}</span>`);

        const element = html`<div>${when(store, {fulfilled})}</div>`;

        wait(store).then(() => {
            expect(fulfilled.callCount).to.equal(1);
            expect(fulfilled.args[0][0]).to.equal('done');
            expect(fulfilled.args[0][1]).to.equal(promise);
            expect(element.innerHTML).to.equal('<span>done</span>');

            done();
        });
    });

    it('should render the rejected state for stores that contain promises', (done) => {
        const promise = createPromise((resolve, reject) => reject('error'));
        const store = val(promise);
        const rejected = sinon.spy((value) => html`<span>${value}</span>`);

        const element = html`<div>${when(store, {rejected})}</div>`;

        wait(store).catch(() => {
            expect(rejected.callCount).to.equal(1);
            expect(rejected.args[0][0]).to.equal('error');
            expect(rejected.args[0][1]).to.equal(promise);
            expect(element.innerHTML).to.equal('<span>error</span>');

            done();
        });
    });

    it('should render the pending state before the fulfilled state for stores that contain promises', (done) => {
        const promise = createPromise('done');
        const store = val(promise);
        const pending = sinon.spy(() => html`<span>loading</span>`);

        const element = html`
            <div>
                ${when(store, {
                    pending,
                    fulfilled(value) {
                        return html`<span>${value}</span>`;
                    }
                })}
            </div>
        `;

        wait().then(() => {
            expect(pending.callCount).to.equal(1);
            expect(pending.args[0][0]).to.equal(promise);
            expect(element.innerHTML).to.equal('<span>loading</span>');
            
            wait(store).then(() => {
                expect(pending.callCount).to.equal(1);
                expect(element.innerHTML).to.equal('<span>done</span>');

                done();
            });
        });
    });

    it('should render the pending state before the rejected state for stores that contain promises', (done) => {
        const promise = createPromise((resolve, reject) => reject('error'));
        const store = val(promise);
        const pending = sinon.spy(() => html`<span>loading</span>`);

        const element = html`
            <div>
                ${when(store, {
                    pending,
                    rejected(value) {
                        return html`<span>${value}</span>`;
                    }
                })}
            </div>
        `;

        wait().then(() => {
            expect(pending.callCount).to.equal(1);
            expect(pending.args[0][0]).to.equal(promise);
            expect(element.innerHTML).to.equal('<span>loading</span>');
            
            wait(store).catch(() => {
                expect(pending.callCount).to.equal(1);
                expect(element.innerHTML).to.equal('<span>error</span>');

                done();
            });
        });
    });

    it('should update properly when a store is updated with a new promise', (done) => {
        const store = val();

        const element = html`
            <div>
                ${when(store, {
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

        wait().then(() => {
            expect(element.innerHTML).to.equal('<span></span>');

            store.set(createPromise('done'));

            wait().then(() => {
                expect(element.innerHTML).to.equal('<span>loading</span>');

                wait(store).then(() => {
                    expect(element.innerHTML).to.equal('<span>done</span>');
    
                    store.set(null);

                    wait().then(() => {
                        expect(element.innerHTML).to.equal('<span></span>');
            
                        store.set(createPromise((resolve, reject) => reject('error')));
            
                        wait().then(() => {
                            expect(element.innerHTML).to.equal('<span>loading</span>');
            
                            wait(store).catch(() => {
                                expect(element.innerHTML).to.equal('<span>error</span>');
                
                                done();
                            });
                        });
                    });
                });
            });
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
