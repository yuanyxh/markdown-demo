import type { Visitor } from './interfaces/Visitor';
import Block from './abstracts/Block';
/**
 * A link reference definition, e.g.:
 * <pre><code>
 * [foo]: /url "title"
 * </code></pre>
 * <p>
 * They can be referenced anywhere else in the document to produce a link using <code>[foo]</code>. The definitions
 * themselves are usually not rendered in the final output.
 *
 * @see <a href="https://spec.commonmark.org/0.31.2/#link-reference-definition">Link reference definitions</a>
 */
declare class LinkReferenceDefinition extends Block {
    private label;
    private destination;
    private title;
    constructor(label?: string, destination?: string, title?: string);
    accept(visitor: Visitor): void;
    getLabel(): string | null;
    setLabel(label: string): void;
    getDestination(): string;
    setDestination(destination: string): void;
    getTitle(): string;
    setTitle(title: string): void;
}
export default LinkReferenceDefinition;
