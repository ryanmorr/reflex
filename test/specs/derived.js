import { html, store, derived } from '../../src/reflex';

describe('derived', () => {
    it('should get the internal value derived from a store dependency', () => {
        const foo = store('foo');
        const computed = derived([foo], ([val]) => val + 'bar');

        expect(computed.get()).to.equal('foobar');
    });

    it('should get the internal value derived from multiple store dependencies', () => {
        const foo = store('foo');
        const bar = store('bar');
        const baz = store('baz');
        const computed = derived([foo, bar, baz], ([foo, bar, baz]) => foo + bar + baz);

        expect(computed.get()).to.equal('foobarbaz');
    });

    it('should not be able to explicitly set the internal value', () => {
        const foo = store('foo');
        const bar = store('bar');
        const computed = derived([foo, bar], ([foo, bar]) => foo + bar);

        expect(computed.set).to.equal(undefined);
        expect(computed.update).to.equal(undefined);
    });

    it('should automatically update the internal value if a dependency changes', () => {
        const firstName = store('John');
        const lastName = store('Doe');
        const fullName = derived([firstName, lastName], ([firstName, lastName]) => `${firstName} ${lastName}`);

        expect(fullName.get()).to.equal('John Doe');

        firstName.set('Jane');
        expect(fullName.get()).to.equal('Jane Doe');

        lastName.set('Jones');
        expect(fullName.get()).to.equal('Jane Jones');
    });

    it('should call subscribers immediately and when the internal value changes', () => {
        const foo = store(10);
        const bar = store(20);
        const computed = derived([foo, bar], ([foo, bar]) => foo + bar);
        
        const spy = sinon.spy();
        computed.subscribe(spy);

        expect(spy.callCount).to.equal(1);
        expect(spy.args[0][0]).to.equal(30);
        expect(spy.args[0][1]).to.equal(undefined);

        foo.set(100);
        expect(spy.callCount).to.equal(2);
        expect(spy.args[1][0]).to.equal(120);
        expect(spy.args[1][1]).to.equal(30);

        bar.update((val) => val + 100);
        expect(spy.callCount).to.equal(3);
        expect(spy.args[2][0]).to.equal(220);
        expect(spy.args[2][1]).to.equal(120);
    });

    it('should support derived dependencies', () => {
        const foo = store('a');
        const bar = store('b');
        const baz = store('c');

        const fooBar = derived([foo, bar], ([a, b]) => a + b);
        const value = derived([fooBar, baz], ([a, b]) => a + b);

        const fooBarSpy = sinon.spy();
        const valueSpy = sinon.spy();

        fooBar.subscribe(fooBarSpy);
        value.subscribe(valueSpy);

        expect(fooBarSpy.callCount).to.equal(1);
        expect(valueSpy.callCount).to.equal(1);
        expect(value.get()).to.equal('abc');

        foo.set('x');
        expect(value.get()).to.equal('xbc');
        expect(fooBarSpy.callCount).to.equal(2);
        expect(valueSpy.callCount).to.equal(2);

        bar.set('y');
        expect(value.get()).to.equal('xyc');
        expect(fooBarSpy.callCount).to.equal(3);
        expect(valueSpy.callCount).to.equal(3);

        baz.set('z');
        expect(value.get()).to.equal('xyz');
        expect(fooBarSpy.callCount).to.equal(3);
        expect(valueSpy.callCount).to.equal(4);
    });
});
