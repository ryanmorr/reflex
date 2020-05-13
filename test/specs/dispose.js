import { waitForRender } from '../setup';
import { html, store, bind, dispose } from '../../src/reflex';

describe('dispose', () => {
    it('should dispose a node binding', (done) => {
        const text = store('foo');
        const el = html`<div>${text}</div>`;
        
        expect(el.outerHTML).to.equal('<div>foo</div>');

        text.set('bar');
        waitForRender(() => {
            expect(el.outerHTML).to.equal('<div>bar</div>');
            
            dispose(el);

            text.set('baz');
            waitForRender(() => {
                expect(el.outerHTML).to.equal('<div>bar</div>');
                done();
            });
        });
    });

    it('should dispose an attribute binding', (done) => {
        const attr = store('foo');
        const el = html`<div id=${attr}></div>`;
        
        expect(el.outerHTML).to.equal('<div id="foo"></div>');

        attr.set('bar');
        waitForRender(() => {
            expect(el.outerHTML).to.equal('<div id="bar"></div>');
            
            dispose(el);

            attr.set('baz');
            waitForRender(() => {
                expect(el.outerHTML).to.equal('<div id="bar"></div>');
                done();
            });
        });
    });

    it('should dispose all node bindings', (done) => {
        const attr = store('foo');
        const text = store('bar');
        const el = html`<div id=${attr}>${text}</div>`;
        
        expect(el.outerHTML).to.equal('<div id="foo">bar</div>');

        attr.set('baz');
        text.set('qux');
        waitForRender(() => {
            expect(el.outerHTML).to.equal('<div id="baz">qux</div>');
            
            dispose(el);
            
            attr.set('abc');
            text.set('xyz');
            waitForRender(() => {
                expect(el.outerHTML).to.equal('<div id="baz">qux</div>');
                done();
            });
        });
    });

    it('should dispose child bindings', (done) => {
        const text = store('foo');
        const el = html`<div><section><span>${text}</span><em>${text}</em></section></div>`;
        
        expect(el.outerHTML).to.equal('<div><section><span>foo</span><em>foo</em></section></div>');

        text.set('bar');
        waitForRender(() => {
            expect(el.outerHTML).to.equal('<div><section><span>bar</span><em>bar</em></section></div>');
            
            dispose(el);

            text.set('baz');
            waitForRender(() => {
                expect(el.outerHTML).to.equal('<div><section><span>bar</span><em>bar</em></section></div>');
                done();
            });
        });
    });

    it('should dispose multiple bindings', (done) => {
        const attr = store('foo');
        const el1 = html`<div id=${attr}></div>`;

        const text = store('bar');
        const el2 = html`<div>${text}</div>`;
        
        expect(el1.outerHTML).to.equal('<div id="foo"></div>');
        expect(el2.outerHTML).to.equal('<div>bar</div>');

        attr.set('baz');
        text.set('qux');
        waitForRender(() => {
            expect(el1.outerHTML).to.equal('<div id="baz"></div>');
            expect(el2.outerHTML).to.equal('<div>qux</div>');
            
            dispose(el1, el2);
            
            attr.set('abc');
            text.set('xyz');
            waitForRender(() => {
                expect(el1.outerHTML).to.equal('<div id="baz"></div>');
                expect(el2.outerHTML).to.equal('<div>qux</div>');
                done();
            });
        });
    });

    it('should dispose nested store bindings', (done) => {
        const text = store('foo');
        const span = html`<span>${text}</span>`;
        const content = store(span);
        const el = html`<div>${content}</div>`;

        expect(el.outerHTML).to.equal('<div><span>foo</span></div>');

        text.set('bar');
        waitForRender(() => {
            expect(el.outerHTML).to.equal('<div><span>bar</span></div>');
            
            dispose(el);
                
            text.set('baz');
            waitForRender(() => {
                expect(span.outerHTML).to.equal('<span>bar</span>');
                expect(el.outerHTML).to.equal('<div><span>bar</span></div>');
                done();
            });
        });
    });

    it('should not dispose parent bindings', (done) => {
        const text = store('foo');
        const span = html`<span>${text}</span>`;
        const content = store(span);

        const attr = store('bar');
        const el = html`<div id=${attr}>${content}</div>`;

        expect(el.outerHTML).to.equal('<div id="bar"><span>foo</span></div>');

        text.set('baz');
        waitForRender(() => {
            expect(el.outerHTML).to.equal('<div id="bar"><span>baz</span></div>');
            
            dispose(span);
                
            text.set('qux');
            waitForRender(() => {
                expect(span.outerHTML).to.equal('<span>baz</span>');
                expect(el.outerHTML).to.equal('<div id="bar"><span>baz</span></div>');
                
                attr.set('qux');
                waitForRender(() => {
                    expect(el.outerHTML).to.equal('<div id="qux"><span>baz</span></div>');
                    done();
                });
            });
        });
    });

    it('should not dispose sibling bindings', (done) => {
        const text = store('foo');
        const frag = html`<div>${text}</div><span>${text}</span><em>${text}</em>`;

        const div = frag.children[0];
        const span = frag.children[1];
        const em = frag.children[2];

        expect(div.outerHTML).to.equal('<div>foo</div>');
        expect(span.outerHTML).to.equal('<span>foo</span>');
        expect(em.outerHTML).to.equal('<em>foo</em>');

        text.set('bar');
        waitForRender(() => {
            expect(div.outerHTML).to.equal('<div>bar</div>');
            expect(span.outerHTML).to.equal('<span>bar</span>');
            expect(em.outerHTML).to.equal('<em>bar</em>');
            
            dispose(span);
                
            text.set('baz');
            waitForRender(() => {
                expect(div.outerHTML).to.equal('<div>baz</div>');
                expect(span.outerHTML).to.equal('<span>bar</span>');
                expect(em.outerHTML).to.equal('<em>baz</em>');
                done();
            });
        });
    });
});
