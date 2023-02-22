import { html, dispose } from '../../src/reflex';
import { wait } from '../util';

describe('component', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    afterEach(() => {
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
    });

    it('should render functional components', () => {
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

    it('should call the mount callback function when the component is appended to the DOM', async () => {
        const spy = sinon.spy();

        const Component = (props, mount) => {
            mount(spy);
            return html`<div></div>`;
        };

        const element = html`<${Component} />`;

        expect(spy.callCount).to.equal(0);

        container.appendChild(element);

        await wait();

        expect(spy.callCount).to.equal(1);
        expect(spy.args[0][0]).to.equal(element);
    });

    it('should call the cleanup callback function when the component is disposed', () => {
        const spy = sinon.spy();

        const Component = (props, mount, cleanup) => {
            cleanup(spy);
            return html`<div></div>`;
        };

        const element = html`<${Component} />`;

        expect(spy.callCount).to.equal(0);

        dispose(element);

        expect(spy.callCount).to.equal(1);
        expect(spy.args[0][0]).to.equal(element);
    });

    it('should support multiple mount calls', async () => {
        const spy1 = sinon.spy();
        const spy2 = sinon.spy();

        const Component = (props, mount) => {
            mount(spy1);
            mount(spy2);
            return html`<div></div>`;
        };

        const element = html`<${Component} />`;

        expect(spy1.callCount).to.equal(0);
        expect(spy2.callCount).to.equal(0);

        container.appendChild(element);

        await wait();

        expect(spy1.callCount).to.equal(1);
        expect(spy1.args[0][0]).to.equal(element);
        expect(spy2.callCount).to.equal(1);
        expect(spy2.args[0][0]).to.equal(element);
    });

    it('should support multiple cleanup calls', () => {
        const spy1 = sinon.spy();
        const spy2 = sinon.spy();

        const Component = (props, mount, cleanup) => {
            cleanup(spy1);
            cleanup(spy2);
            return html`<div></div>`;
        };

        const element = html`<${Component} />`;

        expect(spy1.callCount).to.equal(0);
        expect(spy2.callCount).to.equal(0);

        dispose(element);

        expect(spy1.callCount).to.equal(1);
        expect(spy1.args[0][0]).to.equal(element);
        expect(spy2.callCount).to.equal(1);
        expect(spy2.args[0][0]).to.equal(element);
    });

    it('should support a mount callback function for document fragments', async () => {
        const spy = sinon.spy();

        const Component = (props, mount) => {
            mount(spy);
            return html`<div></div><span></span>`;
        };

        const frag = html`<${Component} />`;
        const elements = Array.from(frag.childNodes);

        expect(spy.callCount).to.equal(0);

        container.appendChild(frag);

        await wait();

        expect(spy.callCount).to.equal(1);
        expect(spy.args[0][0]).to.deep.equal(elements);
    });

    it('should support a cleanup callback function for document fragments', () => {
        const spy = sinon.spy();

        const Component = (props, mount, cleanup) => {
            cleanup(spy);
            return html`<div></div><span></span>`;
        };

        const frag = html`<${Component} />`;
        const elements = Array.from(frag.childNodes);

        expect(spy.callCount).to.equal(0);

        dispose(frag);

        expect(spy.callCount).to.equal(1);
        expect(spy.args[0][0]).to.deep.equal(elements);
    });

    it('should call cleanup once for all nodes in a document fragment', () => {
        const spy = sinon.spy();

        const Component = (props, mount, cleanup) => {
            cleanup(spy);
            return html`<div></div><span></span>`;
        };

        const frag1 = html`<${Component} />`;
        const elements1 = Array.from(frag1.childNodes);

        expect(spy.callCount).to.equal(0);

        dispose(elements1[0]);

        expect(spy.callCount).to.equal(1);
        expect(spy.args[0][0]).to.deep.equal(elements1);

        dispose(elements1[1]);

        expect(spy.callCount).to.equal(1);

        const frag2 = html`<${Component} />`;
        const elements2 = Array.from(frag2.childNodes);

        expect(spy.callCount).to.equal(1);

        dispose(elements2[1]);

        expect(spy.callCount).to.equal(2);
        expect(spy.args[0][0]).to.deep.equal(elements2);

        dispose(elements2[0]);

        expect(spy.callCount).to.equal(2);
    });

    it('should disconnect the MutationObserver when there are no more mount listeners', async () => {
        const observeSpy = sinon.spy(MutationObserver.prototype, 'observe');
        const disconnectSpy = sinon.spy(MutationObserver.prototype, 'disconnect');
        const mountSpy = sinon.spy();

        const Component = (props, mount) => {
            mount(mountSpy);
            return html`<div></div>`;
        };

        const element1 = html`<${Component} />`;
        const element2 = html`<${Component} />`;

        expect(mountSpy.callCount).to.equal(0);
        expect(observeSpy.callCount).to.equal(1);

        container.appendChild(element1);

        await wait();

        expect(mountSpy.callCount).to.equal(1);
        expect(disconnectSpy.callCount).to.equal(0);

        container.appendChild(element2);

        await wait();

        expect(mountSpy.callCount).to.equal(2);
        expect(disconnectSpy.callCount).to.equal(1);

        observeSpy.restore();
        disconnectSpy.restore();
    });

    it('should not start a MutationObserver if the mount parameter is not defined', async () => {
        const observeSpy = sinon.spy(MutationObserver.prototype, 'observe');

        const Component = () => html`<div></div>`;

        const element = html`<${Component} />`;

        expect(observeSpy.callCount).to.equal(0);

        container.appendChild(element);

        await wait();

        expect(observeSpy.callCount).to.equal(0);

        observeSpy.restore();
    });

    it('should reconnect the MutationObserver when more mount listeners are added', async () => {
        const observeSpy = sinon.spy(MutationObserver.prototype, 'observe');
        const disconnectSpy = sinon.spy(MutationObserver.prototype, 'disconnect');
        const mountSpy = sinon.spy();

        const Component = (props, mount) => {
            mount(mountSpy);
            return html`<div></div>`;
        };

        const element1 = html`<${Component} />`;

        expect(mountSpy.callCount).to.equal(0);
        expect(observeSpy.callCount).to.equal(1);

        container.appendChild(element1);

        await wait();

        expect(mountSpy.callCount).to.equal(1);
        expect(disconnectSpy.callCount).to.equal(1);

        const element2 = html`<${Component} />`;

        expect(mountSpy.callCount).to.equal(1);
        expect(observeSpy.callCount).to.equal(2);

        container.appendChild(element2);

        await wait();

        expect(mountSpy.callCount).to.equal(2);
        expect(disconnectSpy.callCount).to.equal(2);

        observeSpy.restore();
        disconnectSpy.restore();
    });

    it('should call the mount callback function for nested components', async () => {
        const fooSpy = sinon.spy();
        const barSpy = sinon.spy();

        const Foo = (props, mount) => {
            mount(fooSpy);
            return html`<section><${Bar} /></section>`;
        };

        const Bar = (props, mount) => {
            mount(barSpy);
            return html`<div></div>`;
        };

        const section = html`<${Foo} />`;
        const div = section.querySelector('div');

        expect(fooSpy.callCount).to.equal(0);
        expect(barSpy.callCount).to.equal(0);

        container.appendChild(section);

        await wait();

        expect(fooSpy.callCount).to.equal(1);
        expect(fooSpy.args[0][0]).to.equal(section);
        expect(barSpy.callCount).to.equal(1);
        expect(barSpy.args[0][0]).to.equal(div);
    });

    it('should call the mount callback function for nested components inside a document fragment', async () => {
        const fooSpy = sinon.spy();
        const barSpy = sinon.spy();

        const Foo = (props, mount) => {
            mount(fooSpy);
            return html`<section></section><div><${Bar} /></div>`;
        };

        const Bar = (props, mount) => {
            mount(barSpy);
            return html`<span></span>`;
        };

        const frag = html`<${Foo} />`;
        const elements = Array.from(frag.childNodes);
        const span = elements[1].querySelector('span');

        expect(fooSpy.callCount).to.equal(0);
        expect(barSpy.callCount).to.equal(0);

        container.appendChild(frag);

        await wait();

        expect(fooSpy.callCount).to.equal(1);
        expect(fooSpy.args[0][0]).to.deep.equal(elements);
        expect(barSpy.callCount).to.equal(1);
        expect(barSpy.args[0][0]).to.equal(span);
    });
});
