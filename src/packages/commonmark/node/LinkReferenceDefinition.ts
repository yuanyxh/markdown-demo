import type { Visitor } from "./interfaces/Visitor";

import Block from "./abstracts/Block";

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
class LinkReferenceDefinition extends Block {
  private label = "";
  private destination = "";
  private title = "";

  public constructor(label = "", destination = "", title = "") {
    super();
    this.label = label;
    this.destination = destination;
    this.title = title;
  }

  public getLabel(): string | null {
    return this.label;
  }

  public setLabel(label: string) {
    this.label = label;
  }

  public getDestination(): string {
    return this.destination;
  }

  public setDestination(destination: string) {
    this.destination = destination;
  }

  public getTitle(): string {
    return this.title;
  }

  public setTitle(title: string) {
    this.title = title;
  }

  public override accept(visitor: Visitor) {
    visitor.visit(this);
  }
}

export default LinkReferenceDefinition;
