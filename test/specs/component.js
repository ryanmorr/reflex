import { waitForRender } from '../setup';
import { store, isStore } from '../../src/store';
import { html, component } from '../../src/reflex';

describe('component', () => {
    it('should support stateless functional components', () => {
        const Component = sinon.spy(({foo, bar, children}) => html`<div foo=${foo} bar=${bar}>${children}</div>`);

        const el = html`
            <${Component} foo="abc" bar=${123}>
                <span>baz</span>
            <//>
        `;

        expect(Component.callCount).to.equal(1);
        expect(Component.args[0][0]).to.be.a('object');
        expect(Component.args[0][0].foo).to.equal('abc');
        expect(Component.args[0][0].bar).to.equal(123);
        expect(Component.args[0][0].children).to.be.an('array');
        expect(Component.args[0][0].children).to.have.length(1);
        expect(Component.args[0][0].children[0].outerHTML).to.equal('<span>baz</span>');
        expect(el.outerHTML).to.equal('<div foo="abc" bar="123"><span>baz</span></div>');
    });

    it('should always define the children property', () => {
        const Component = sinon.spy(() => html`<div></div>`);

        html`<${Component} />`;

        expect(Component.callCount).to.equal(1);
        expect(Component.args[0][0].children).to.exist;
        expect(Component.args[0][0].children).to.deep.equal([]);
    });

    it('should support stateful functional components', (done) => {
        const componentSpy = sinon.spy(({foo, bar, children}) => html`<div foo=${foo} bar=${bar}>${children}</div>`);
        const Component = sinon.spy(component(componentSpy));

        const el = html`
            <${Component} foo="abc" bar=${123}>
                <span>baz</span>
            <//>
        `;

        expect(componentSpy.callCount).to.equal(1);
        expect(componentSpy.args[0][0]).to.be.a('object');

        const foo = componentSpy.args[0][0].foo;
        const bar = componentSpy.args[0][0].bar;
        const children = componentSpy.args[0][0].children;

        expect(isStore(foo)).to.equal(true);
        expect(isStore(bar)).to.equal(true);
        expect(isStore(children)).to.equal(true);

        expect(foo.get()).to.equal('abc');
        expect(bar.get()).to.equal(123);

        const childrenArray = children.get();
        
        expect(childrenArray).to.be.an('array');
        expect(childrenArray).to.have.length(1);
        expect(childrenArray[0].outerHTML).to.equal('<span>baz</span>');

        expect(el.outerHTML).to.equal('<div foo="abc" bar="123"><span>baz</span></div>');

        foo.set('xyz');
        bar.set(789);
        children.set(html`<em>qux</em>`);
        waitForRender(() => {
            expect(el.outerHTML).to.equal('<div foo="xyz" bar="789"><em>qux</em></div>');
            done();
        });
    });

    it('should not convert a store into a store', (done) => {
        const foo = store('foo');
        const componentSpy = sinon.spy(({foo, bar}) => html`<div foo=${foo}>${bar}</div>`);
        const Component = sinon.spy(component(componentSpy));

        const el = html`<${Component} foo=${foo} bar="abc" />`;

        expect(componentSpy.callCount).to.equal(1);
        expect(componentSpy.args[0][0].foo).to.equal(foo);
        expect(el.outerHTML).to.equal('<div foo="foo">abc</div>');

        foo.set('bar');
        waitForRender(() => {
            expect(el.outerHTML).to.equal('<div foo="bar">abc</div>');
            done();
        });
    });
});
