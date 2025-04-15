import type { Visitor } from './interfaces/Visitor';
import Node from './abstracts/Node';
/**
 * A link with a destination and an optional title; the link text is in child nodes.
 * <p>
 * Example for an inline link in a CommonMark document:
 * <pre><code>
 * [link](/uri "title")
 * </code></pre>
 * <p>
 * The corresponding Link node would look like this:
 * <ul>
 * <li>{@link #getDestination()} returns {@code "/uri"}
 * <li>{@link #getTitle()} returns {@code "title"}
 * <li>A {@link Text} child node with {@link Text#getLiteral() getLiteral} that returns {@code "link"}</li>
 * </ul>
 * <p>
 * Note that the text in the link can contain inline formatting, so it could also contain an {@link Image} or
 * {@link Emphasis}, etc.
 *
 * @see <a href="http://spec.commonmark.org/0.31.2/#links">CommonMark Spec for links</a>
 */
declare class Link extends Node {
    private destination;
    private title;
    constructor(destination?: string, title?: string);
    accept(visitor: Visitor): void;
    getDestination(): string;
    setDestination(destination: string): void;
    getTitle(): string | undefined;
    setTitle(title?: string): void;
    protected toStringAttributes(): string;
}
export default Link;
