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
class Link extends Node {
  private destination = '';
  private title: string | undefined;

  public constructor(destination = '', title?: string) {
    super('link');

    this.destination = destination;
    this.title = title;
  }

  public override accept(visitor: Visitor) {
    visitor.visit(this);
  }

  public getDestination(): string {
    return this.destination;
  }

  public setDestination(destination: string) {
    this.destination = destination;
  }

  public getTitle(): string | undefined {
    return this.title;
  }

  public setTitle(title: string | undefined) {
    this.title = title;
  }

  protected toStringAttributes(): string {
    return 'destination=' + this.destination + ', title=' + this.title;
  }
}

export default Link;
