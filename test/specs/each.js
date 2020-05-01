import { waitForRender } from '../setup';
import { store } from '../../src/store';
import { html, each } from '../../src/reflex';

describe('each', () => {
    it('should render a list', () => {
        const list = store([1, 2, 3, 4, 5]);

        const el = html`
            <ul>
                ${each(list, (item) => html`<li>${item}</li>`)}
            </ul>
        `;

        expect(el.outerHTML).to.equal('<ul><li>1</li><li>2</li><li>3</li><li>4</li><li>5</li></ul>');
    });

    it('should update a list', (done) => {
        const list = store([1, 2, 3, 4, 5]);

        const el = html`
            <ul>
                ${each(list, (item) => html`<li>${item}</li>`)}
            </ul>
        `;

        expect(el.outerHTML).to.equal('<ul><li>1</li><li>2</li><li>3</li><li>4</li><li>5</li></ul>');

        list.set(['foo', 'bar', 'baz']);

        waitForRender(() => {
            expect(el.outerHTML).to.equal('<ul><li>foo</li><li>bar</li><li>baz</li></ul>');
            done();
        });
    });
});
