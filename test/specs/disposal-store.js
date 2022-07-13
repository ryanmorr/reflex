import { html, val, dispose, tick } from '../../src/reflex';

describe('disposal-store', () => {
    it('should dispose a node binding', (done) => {
        const text = val('foo');
        const el = html`<div>${text}</div>`;
        
        expect(el.outerHTML).to.equal('<div>foo</div>');

        text.set('bar');
        
        tick().then(() => {
            expect(el.outerHTML).to.equal('<div>bar</div>');
            
            dispose(el);

            text.set('baz');
        
            tick().then(() => {
                expect(el.outerHTML).to.equal('<div>bar</div>');

                done();
            });
        });
    });

    it('should dispose an attribute binding', (done) => {
        const attr = val('foo');
        const el = html`<div id=${attr}></div>`;
        
        expect(el.outerHTML).to.equal('<div id="foo"></div>');

        attr.set('bar');
        
        tick().then(() => {
            expect(el.outerHTML).to.equal('<div id="bar"></div>');
            
            dispose(el);

            attr.set('baz');
        
            tick().then(() => {
                expect(el.outerHTML).to.equal('<div id="bar"></div>');

                done();
            });
        });
    });

    it('should dispose all node bindings', (done) => {
        const attr = val('foo');
        const text = val('bar');
        const el = html`<div id=${attr}>${text}</div>`;
        
        expect(el.outerHTML).to.equal('<div id="foo">bar</div>');

        attr.set('baz');
        text.set('qux');
        
        tick().then(() => {
            expect(el.outerHTML).to.equal('<div id="baz">qux</div>');
            
            dispose(el);
            
            attr.set('abc');
            text.set('xyz');
        
            tick().then(() => {
                expect(el.outerHTML).to.equal('<div id="baz">qux</div>');

                done();
            });
        });
    });

    it('should dispose child bindings', (done) => {
        const text = val('foo');
        const el = html`<div><section><span>${text}</span><em>${text}</em></section></div>`;
        
        expect(el.outerHTML).to.equal('<div><section><span>foo</span><em>foo</em></section></div>');

        text.set('bar');
        
        tick().then(() => {
            expect(el.outerHTML).to.equal('<div><section><span>bar</span><em>bar</em></section></div>');
            
            dispose(el);

            text.set('baz');
        
            tick().then(() => {
                expect(el.outerHTML).to.equal('<div><section><span>bar</span><em>bar</em></section></div>');

                done();
            });
        });
    });

    it('should dispose nested store bindings', (done) => {
        const text = val('foo');
        const span = html`<span>${text}</span>`;
        const content = val(span);
        const el = html`<div>${content}</div>`;

        expect(el.outerHTML).to.equal('<div><span>foo</span></div>');

        text.set('bar');
        
        tick().then(() => {
            expect(el.outerHTML).to.equal('<div><span>bar</span></div>');
            
            dispose(el);
                
            text.set('baz');
        
            tick().then(() => {
                expect(span.outerHTML).to.equal('<span>bar</span>');
                expect(el.outerHTML).to.equal('<div><span>bar</span></div>');

                done();
            });
        });
    });

    it('should not dispose parent bindings', (done) => {
        const text = val('foo');
        const span = html`<span>${text}</span>`;
        const content = val(span);

        const attr = val('bar');
        const el = html`<div id=${attr}>${content}</div>`;

        expect(el.outerHTML).to.equal('<div id="bar"><span>foo</span></div>');

        text.set('baz');
        
        tick().then(() => {
            expect(el.outerHTML).to.equal('<div id="bar"><span>baz</span></div>');
            
            dispose(span);
                
            text.set('qux');
        
            tick().then(() => {
                expect(span.outerHTML).to.equal('<span>baz</span>');
                expect(el.outerHTML).to.equal('<div id="bar"><span>baz</span></div>');
                
                attr.set('qux');
        
                tick().then(() => {
                    expect(el.outerHTML).to.equal('<div id="qux"><span>baz</span></div>');

                    done();
                });
            });
        });
    });

    it('should not dispose sibling bindings', (done) => {
        const text = val('foo');
        const frag = html`<div>${text}</div><span>${text}</span><em>${text}</em>`;

        const div = frag.children[0];
        const span = frag.children[1];
        const em = frag.children[2];

        expect(div.outerHTML).to.equal('<div>foo</div>');
        expect(span.outerHTML).to.equal('<span>foo</span>');
        expect(em.outerHTML).to.equal('<em>foo</em>');

        text.set('bar');
        
        tick().then(() => {
            expect(div.outerHTML).to.equal('<div>bar</div>');
            expect(span.outerHTML).to.equal('<span>bar</span>');
            expect(em.outerHTML).to.equal('<em>bar</em>');
            
            dispose(span);
                
            text.set('baz');
        
            tick().then(() => {
                expect(div.outerHTML).to.equal('<div>baz</div>');
                expect(span.outerHTML).to.equal('<span>bar</span>');
                expect(em.outerHTML).to.equal('<em>baz</em>');

                done();
            });
        });
    });
});